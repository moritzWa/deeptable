import { ColumnType, Table } from '@shared/types';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { Row } from '../models/row';
import { ITable, Table as TableModel } from '../models/table';
import { publicProcedure, router } from '../trpc';

// Define a Zod schema for column state validation
const columnStateSchema = z.object({
  colId: z.string().optional(),
  width: z.number().optional(),
  hide: z.boolean().optional(),
  pinned: z.union([z.literal('left'), z.literal('right'), z.null()]).optional(),
  sort: z.union([z.literal('asc'), z.literal('desc'), z.null()]).optional(),
  sortIndex: z.union([z.number(), z.null(), z.undefined()]).optional(),
  aggFunc: z.union([z.string(), z.null()]).optional(),
  rowGroup: z.boolean().optional(),
  rowGroupIndex: z.number().optional(),
  pivot: z.boolean().optional(),
  pivotIndex: z.number().optional(),
  flex: z.union([z.number(), z.null(), z.undefined()]).optional(),
  orderIndex: z.number().optional(),
});

// Define a Zod schema for column validation
const columnSchema = z.object({
  name: z.string(),
  type: z.enum(['text', 'number', 'link', 'string', 'boolean', 'date', 'array', 'object']),
  required: z.boolean().optional(),
  defaultValue: z.any().optional(),
  description: z.string(),
  columnState: columnStateSchema.optional(),
});

export const tablesRouter = router({
  // Get all tables for the current user
  getTables: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }): Promise<Table[]> => {
      try {
        const decoded = jwt.verify(input.token, process.env.AUTH_SECRET || 'fallback-secret') as {
          userId: string;
        };
        const tables = await TableModel.find({ userId: decoded.userId });

        return tables.map((table: ITable) => ({
          id: table._id.toString(),
          name: table.name,
          description: table.description,
          columns: table.columns.map((col) => ({
            name: col.name,
            type: col.type,
            required: col.required || false,
            defaultValue: col.defaultValue,
            description: col.description,
            columnState: col.columnState,
          })),
          createdAt: table.createdAt.toISOString(),
          updatedAt: table.updatedAt.toISOString(),
          userId: table.userId,
          sharingStatus: table.sharingStatus,
        }));
      } catch (error) {
        console.error('Get tables error:', error);
        throw new Error('Failed to get tables');
      }
    }),

  // Create a new table
  createTable: publicProcedure
    .input(
      z.object({
        token: z.string(),
        name: z.string(),
        description: z.string(),
        columns: z.array(columnSchema).optional(),
      })
    )
    .mutation(async ({ input }): Promise<Table> => {
      try {
        const decoded = jwt.verify(input.token, process.env.AUTH_SECRET || 'fallback-secret') as {
          userId: string;
        };

        // Convert string columns to proper column objects if needed
        const columns = input.columns || [];

        const table = (await TableModel.create({
          name: input.name,
          description: input.description,
          columns: columns,
          userId: decoded.userId,
        })) as ITable;

        return {
          id: table._id.toString(),
          name: table.name,
          description: table.description,
          columns: table.columns.map((col) => ({
            name: col.name,
            type: col.type,
            required: col.required || false,
            defaultValue: col.defaultValue,
            description: col.description,
            columnState: col.columnState,
          })),
          createdAt: table.createdAt.toISOString(),
          updatedAt: table.updatedAt.toISOString(),
          userId: table.userId,
          sharingStatus: table.sharingStatus,
        };
      } catch (error) {
        console.error('Create table error:', error);
        throw new Error('Failed to create table');
      }
    }),

  // Update a table
  updateTable: publicProcedure
    .input(
      z.object({
        token: z.string(),
        id: z.string(),
        name: z.string().optional(),
        description: z.string(),
        columns: z.array(columnSchema).optional(),
      })
    )
    .mutation(async ({ input }): Promise<Table> => {
      try {
        const decoded = jwt.verify(input.token, process.env.AUTH_SECRET || 'fallback-secret') as {
          userId: string;
        };

        const table = (await TableModel.findOneAndUpdate(
          { _id: input.id, userId: decoded.userId },
          {
            ...(input.name && { name: input.name }),
            description: input.description,
            ...(input.columns && { columns: input.columns }),
          },
          { new: true }
        )) as ITable | null;

        if (!table) {
          throw new Error('Table not found');
        }

        return {
          id: table._id.toString(),
          name: table.name,
          description: table.description,
          columns: table.columns.map((col) => ({
            name: col.name,
            type: col.type,
            required: col.required || false,
            defaultValue: col.defaultValue,
            description: col.description,
            columnState: col.columnState,
          })),
          createdAt: table.createdAt.toISOString(),
          updatedAt: table.updatedAt.toISOString(),
          userId: table.userId,
          sharingStatus: table.sharingStatus,
        };
      } catch (error) {
        console.error('Update table error:', error);
        throw new Error('Failed to update table');
      }
    }),

  // Update column state
  updateColumnState: publicProcedure
    .input(
      z.object({
        token: z.string(),
        tableId: z.string(),
        columnStates: z.array(
          z.object({
            name: z.string(),
            columnState: columnStateSchema,
          })
        ),
      })
    )
    .mutation(async ({ input }): Promise<{ success: boolean }> => {
      try {
        const decoded = jwt.verify(input.token, process.env.AUTH_SECRET || 'fallback-secret') as {
          userId: string;
        };

        // Get the table
        const table = (await TableModel.findOne({
          _id: input.tableId,
          userId: decoded.userId,
        })) as ITable | null;

        if (!table) {
          throw new Error('Table not found');
        }

        // First, handle any column name changes in the row data
        const nameChanges = input.columnStates.filter(
          (cs) => cs.columnState.colId && cs.columnState.colId !== cs.name
        );
        if (nameChanges.length > 0) {
          for (const change of nameChanges) {
            await Row.updateMany({ tableId: input.tableId }, [
              {
                $set: {
                  data: {
                    $mergeObjects: [
                      '$$REMOVE',
                      {
                        $arrayToObject: {
                          $map: {
                            input: { $objectToArray: '$data' },
                            in: {
                              k: {
                                $cond: [
                                  { $eq: ['$$this.k', change.name] },
                                  change.columnState.colId,
                                  '$$this.k',
                                ],
                              },
                              v: '$$this.v',
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            ]);
          }
        }

        // Build update operations for all columns at once
        const bulkOps = input.columnStates.map((cs) => {
          const isNameChange = cs.columnState.colId && cs.columnState.colId !== cs.name;

          if (isNameChange) {
            return {
              updateOne: {
                filter: {
                  _id: input.tableId,
                  userId: decoded.userId,
                  'columns.name': cs.name,
                },
                update: {
                  $set: {
                    'columns.$.name': cs.columnState.colId,
                    'columns.$.columnState': cs.columnState,
                  },
                },
              },
            };
          } else {
            return {
              updateOne: {
                filter: {
                  _id: input.tableId,
                  userId: decoded.userId,
                  'columns.name': cs.name,
                },
                update: {
                  $set: {
                    'columns.$.columnState': cs.columnState,
                  },
                },
              },
            };
          }
        });

        // Execute all updates in a single operation
        await TableModel.bulkWrite(bulkOps);

        return { success: true };
      } catch (error) {
        console.error('Update column state error:', error);
        throw new Error('Failed to update column state');
      }
    }),

  // Delete a table
  deleteTable: publicProcedure
    .input(
      z.object({
        token: z.string(),
        id: z.string(),
      })
    )
    .mutation(async ({ input }): Promise<{ success: boolean }> => {
      try {
        const decoded = jwt.verify(input.token, process.env.AUTH_SECRET || 'fallback-secret') as {
          userId: string;
        };

        // Delete the table
        const tableResult = await TableModel.deleteOne({ _id: input.id, userId: decoded.userId });

        if (tableResult.deletedCount === 0) {
          throw new Error('Table not found');
        }

        // Delete all rows associated with this table
        await Row.deleteMany({ tableId: input.id });

        return { success: true };
      } catch (error) {
        console.error('Delete table error:', error);
        throw new Error('Failed to delete table');
      }
    }),

  // Add a new column
  addColumn: publicProcedure
    .input(
      z.object({
        token: z.string(),
        tableId: z.string(),
        columnName: z.string(),
        position: z.enum(['left', 'right']),
        relativeTo: z.string(),
      })
    )
    .mutation(async ({ input }): Promise<{ success: boolean }> => {
      try {
        const decoded = jwt.verify(input.token, process.env.AUTH_SECRET || 'fallback-secret') as {
          userId: string;
        };

        // Get the table
        const table = (await TableModel.findOne({
          _id: input.tableId,
          userId: decoded.userId,
        })) as ITable | null;

        if (!table) {
          throw new Error('Table not found');
        }

        // Find the index of the reference column
        const refColumnIndex = table.columns.findIndex((col) => col.name === input.relativeTo);
        if (refColumnIndex === -1) {
          throw new Error('Reference column not found');
        }

        // Get the reference column's sortIndex
        const refColumn = table.columns[refColumnIndex];
        const refSortIndex = refColumn.columnState?.sortIndex ?? refColumnIndex;

        // Create the new column with the appropriate sortIndex
        const newColumn = {
          name: input.columnName,
          type: 'text' as ColumnType,
          required: false,
          description: '',
          columnState: {
            sortIndex: input.position === 'left' ? refSortIndex : refSortIndex + 1,
          },
        };

        // Insert the column at the correct position
        const insertIndex = input.position === 'left' ? refColumnIndex : refColumnIndex + 1;
        table.columns.splice(insertIndex, 0, newColumn);

        // Update sortIndexes for all columns after the insertion point
        table.columns.forEach((col, index) => {
          if (!col.columnState) {
            col.columnState = {};
          }

          // For columns after the insertion point, increment their sortIndex
          if (
            index !== insertIndex &&
            (input.position === 'left' ? index >= refColumnIndex : index > refColumnIndex)
          ) {
            col.columnState.sortIndex = (col.columnState.sortIndex ?? index) + 1;
          }
          // For columns before the insertion point, keep their current sortIndex or use their array index
          else if (index !== insertIndex) {
            col.columnState.sortIndex = col.columnState.sortIndex ?? index;
          }
        });

        // Save the updated table
        await table.save();

        return { success: true };
      } catch (error) {
        console.error('Add column error:', error);
        throw new Error('Failed to add column');
      }
    }),

  // Delete a column
  deleteColumn: publicProcedure
    .input(
      z.object({
        token: z.string(),
        tableId: z.string(),
        columnName: z.string(),
      })
    )
    .mutation(async ({ input }): Promise<{ success: boolean }> => {
      try {
        const decoded = jwt.verify(input.token, process.env.AUTH_SECRET || 'fallback-secret') as {
          userId: string;
        };

        // Get the table
        const table = (await TableModel.findOne({
          _id: input.tableId,
          userId: decoded.userId,
        })) as ITable | null;

        if (!table) {
          throw new Error('Table not found');
        }

        // Find the index of the column to delete
        const columnIndex = table.columns.findIndex((col) => col.name === input.columnName);
        if (columnIndex === -1) {
          throw new Error('Column not found');
        }

        // Get the column's current sortIndex
        const deletedColumnSortIndex =
          table.columns[columnIndex].columnState?.sortIndex ?? columnIndex;

        // Remove the column
        table.columns.splice(columnIndex, 1);

        // Update sortIndexes for remaining columns
        table.columns.forEach((col, index) => {
          if (!col.columnState) {
            col.columnState = {};
          }

          // For columns that were after the deleted column, decrement their sortIndex
          if (col.columnState.sortIndex && col.columnState.sortIndex > deletedColumnSortIndex) {
            col.columnState.sortIndex -= 1;
          }
          // For columns that were before, keep their current sortIndex or use array index
          else {
            col.columnState.sortIndex = col.columnState.sortIndex ?? index;
          }
        });

        // Save the updated table
        await table.save();

        return { success: true };
      } catch (error) {
        console.error('Delete column error:', error);
        throw new Error('Failed to delete column');
      }
    }),

  // Add the new updateColumnType route
  updateColumnType: publicProcedure
    .input(
      z.object({
        token: z.string(),
        tableId: z.string(),
        columnName: z.string(),
        type: z.enum(['text', 'number', 'link']),
      })
    )
    .mutation(async ({ input }): Promise<{ success: boolean }> => {
      try {
        const decoded = jwt.verify(input.token, process.env.AUTH_SECRET || 'fallback-secret') as {
          userId: string;
        };

        // Update the column type in the table
        const result = await TableModel.updateOne(
          {
            _id: input.tableId,
            userId: decoded.userId,
            'columns.name': input.columnName,
          },
          {
            $set: {
              'columns.$.type': input.type,
            },
          }
        );

        if (result.matchedCount === 0) {
          throw new Error('Table or column not found');
        }

        // Convert existing data to the new type
        await Row.updateMany({ tableId: input.tableId }, [
          {
            $set: {
              [`data.${input.columnName}`]: {
                $cond: {
                  if: { $eq: [input.type, 'number'] },
                  then: {
                    $convert: { input: `$data.${input.columnName}`, to: 'double', onError: null },
                  },
                  else: { $toString: `$data.${input.columnName}` }, // Convert to string for 'text' and 'link'
                },
              },
            },
          },
        ]);

        return { success: true };
      } catch (error) {
        console.error('Update column type error:', error);
        throw new Error('Failed to update column type');
      }
    }),

  updateColumnDescription: publicProcedure
    .input(
      z.object({
        token: z.string(),
        tableId: z.string(),
        columnName: z.string(),
        description: z.string(),
      })
    )
    .mutation(async ({ input }): Promise<{ success: boolean }> => {
      try {
        const decoded = jwt.verify(input.token, process.env.AUTH_SECRET || 'fallback-secret') as {
          userId: string;
        };

        // Update the column description in the table
        const result = await TableModel.updateOne(
          {
            _id: input.tableId,
            userId: decoded.userId,
            'columns.name': input.columnName,
          },
          {
            $set: {
              'columns.$.description': input.description,
            },
          }
        );

        if (result.matchedCount === 0) {
          throw new Error('Table or column not found');
        }

        return { success: true };
      } catch (error) {
        console.error('Update column description error:', error);
        throw new Error('Failed to update column description');
      }
    }),

  createTableFromCSV: publicProcedure
    .input(
      z.object({
        token: z.string(),
        name: z.string(),
        description: z.string(),
        columns: z.array(columnSchema),
        rows: z.array(z.record(z.any())),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { name, description, columns, rows } = input;

      const decoded = jwt.verify(input.token, process.env.AUTH_SECRET || 'fallback-secret') as {
        userId: string;
      };

      // Create the table
      const table = await TableModel.create({
        name,
        description,
        columns,
        userId: decoded.userId,
      });

      try {
        // Create all rows
        await Row.insertMany(
          rows.map((row) => ({
            tableId: table._id,
            userId: decoded.userId,
            data: row,
          }))
        );
      } catch (error) {
        console.error('Error creating rows:', error);
        throw new Error('Failed to create rows');
      }

      return {
        id: table._id.toString(),
        name: table.name,
        description: table.description,
        columns: table.columns.map((col) => ({
          name: col.name,
          type: col.type,
          required: col.required || false,
          defaultValue: col.defaultValue,
          description: col.description,
          columnState: col.columnState,
        })),
        createdAt: table.createdAt.toISOString(),
        updatedAt: table.updatedAt.toISOString(),
        userId: table.userId,
        sharingStatus: table.sharingStatus,
      };
    }),

  updateSharingStatus: publicProcedure
    .input(
      z.object({
        token: z.string(),
        tableId: z.string(),
        sharingStatus: z.enum(['private', 'public']),
      })
    )
    .mutation(async ({ input }): Promise<Table> => {
      try {
        const decoded = jwt.verify(input.token, process.env.AUTH_SECRET || 'fallback-secret') as {
          userId: string;
        };

        const table = await TableModel.findOneAndUpdate(
          { _id: input.tableId, userId: decoded.userId },
          { sharingStatus: input.sharingStatus },
          { new: true }
        );

        if (!table) {
          throw new Error('Table not found');
        }

        return {
          id: table._id.toString(),
          name: table.name,
          description: table.description,
          columns: table.columns.map((col) => ({
            name: col.name,
            type: col.type,
            required: col.required || false,
            defaultValue: col.defaultValue,
            description: col.description,
            columnState: col.columnState,
          })),
          createdAt: table.createdAt.toISOString(),
          updatedAt: table.updatedAt.toISOString(),
          userId: table.userId,
          sharingStatus: table.sharingStatus,
        };
      } catch (error) {
        console.error('Update sharing status error:', error);
        throw new Error('Failed to update sharing status');
      }
    }),

  // Also update the getTable query to allow public access
  getTable: publicProcedure
    .input(
      z.object({
        id: z.string(),
        token: z.string().optional(), // Token is optional for public tables
      })
    )
    .query(async ({ input }): Promise<Table> => {
      try {
        let userId: string | undefined;

        if (input.token) {
          const decoded = jwt.verify(input.token, process.env.AUTH_SECRET || 'fallback-secret') as {
            userId: string;
          };
          userId = decoded.userId;
        }

        const table = await TableModel.findOne({
          _id: input.id,
          $or: [
            { userId }, // Match if user owns the table
            { sharingStatus: 'public' }, // Match if table is public
          ].filter(Boolean), // Remove userId condition if not provided
        });

        if (!table) {
          throw new Error('Table not found - Are you sure this table is public?');
        }

        return {
          id: table._id.toString(),
          name: table.name,
          description: table.description,
          columns: table.columns.map((col) => ({
            name: col.name,
            type: col.type,
            required: col.required || false,
            defaultValue: col.defaultValue,
            description: col.description,
            columnState: col.columnState,
          })),
          createdAt: table.createdAt.toISOString(),
          updatedAt: table.updatedAt.toISOString(),
          userId: table.userId,
          sharingStatus: table.sharingStatus,
        };
      } catch (error) {
        console.error('Get table error:', error);
        throw new Error('Failed to get table - Are you sure you have access to this table?');
      }
    }),
});
