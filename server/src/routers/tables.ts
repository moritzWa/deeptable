import { ColumnType, Table } from '@shared/types';
import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { Row } from '../models/row';
import { ITable, Table as TableModel } from '../models/table';
import { publicProcedure, router } from '../trpc';
import { verifyToken } from './auth';

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
  columnId: z.string().default(() => randomUUID()),
  name: z.string(),
  type: z.enum(['text', 'number', 'link', 'select', 'multiSelect']),
  required: z.boolean().optional(),
  defaultValue: z.any().optional(),
  description: z.string(),
  additionalTypeInformation: z
    .object({
      currency: z.boolean().optional(),
      decimals: z.number().int().nonnegative().optional(),
      selectItems: z
        .array(
          z.object({
            id: z.string(),
            name: z.string(),
            color: z.string(),
          })
        )
        .optional(),
    })
    .optional(),
  columnState: columnStateSchema.optional(),
});

// Add this helper function at the top of the file
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

export const tablesRouter = router({
  // Get all tables for the current user
  getTables: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }): Promise<Table[]> => {
      try {
        const decoded = verifyToken(input.token);
        const userId = decoded.userId;
        const tables = await TableModel.find({ userId });

        return tables.map((table: ITable) => ({
          id: table._id.toString(),
          name: table.name,
          description: table.description,
          columns: table.columns.map((col) => ({
            columnId: col.columnId,
            name: col.name,
            type: col.type,
            additionalTypeInformation: col.additionalTypeInformation,
            required: col.required || false,
            defaultValue: col.defaultValue,
            description: col.description,
            columnState: col.columnState,
          })),
          createdAt: table.createdAt.toISOString(),
          updatedAt: table.updatedAt.toISOString(),
          userId: table.userId,
          sharingStatus: table.sharingStatus,
          isOwner: userId === table.userId,
          slug: table.slug,
          beforeTableText: table.beforeTableText,
          afterTableText: table.afterTableText,
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
        const decoded = verifyToken(input.token);
        const userId = decoded.userId;
        const columns = input.columns || [];
        const slug = slugify(input.name); // Generate the slug

        // Create the table with slug
        const table = (await TableModel.create({
          name: input.name,
          description: input.description,
          columns: columns,
          userId: decoded.userId,
          slug: slug,
        })) as ITable;

        // Create 15 empty rows
        const emptyRows = Array(15)
          .fill(null)
          .map((_, index) => {
            const rowData: Record<string, any> = {};
            // Initialize each column with an empty value
            table.columns.forEach((col) => {
              rowData[col.columnId] = '';
            });

            return {
              tableId: table._id,
              userId: decoded.userId,
              index,
              data: rowData,
            };
          });

        // Insert all empty rows
        await Row.insertMany(emptyRows);

        return {
          id: table._id.toString(),
          name: table.name,
          description: table.description,
          columns: table.columns.map((col) => ({
            columnId: col.columnId,
            name: col.name,
            type: col.type,
            additionalTypeInformation: col.additionalTypeInformation,
            required: col.required || false,
            defaultValue: col.defaultValue,
            description: col.description,
            columnState: col.columnState,
          })),
          createdAt: table.createdAt.toISOString(),
          updatedAt: table.updatedAt.toISOString(),
          userId: table.userId,
          sharingStatus: table.sharingStatus,
          isOwner: userId === table.userId,
          slug: table.slug, // Include the slug in the response
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
        const decoded = verifyToken(input.token);
        const userId = decoded.userId;

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
            columnId: col.columnId,
            name: col.name,
            type: col.type,
            required: col.required || false,
            defaultValue: col.defaultValue,
            description: col.description,
            additionalTypeInformation: col.additionalTypeInformation,
            columnState: col.columnState,
          })),
          createdAt: table.createdAt.toISOString(),
          updatedAt: table.updatedAt.toISOString(),
          userId: table.userId,
          sharingStatus: table.sharingStatus,
          isOwner: userId === table.userId,
          slug: table.slug,
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
            columnId: z.string(),
            columnState: columnStateSchema,
          })
        ),
      })
    )
    .mutation(async ({ input }): Promise<{ success: boolean }> => {
      try {
        const decoded = verifyToken(input.token);

        const table = await TableModel.findOne({
          _id: input.tableId,
          userId: decoded.userId,
        });

        if (!table) {
          throw new Error('Table not found');
        }

        // Update column states using columnId instead of name
        const bulkOps = input.columnStates.map((cs) => ({
          updateOne: {
            filter: {
              _id: input.tableId,
              userId: decoded.userId,
              'columns.columnId': cs.columnId,
            },
            update: {
              $set: {
                'columns.$.columnState': cs.columnState,
              },
            },
          },
        }));

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
        const decoded = verifyToken(input.token);

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
        relativeTo: z.string().describe('The columnId of the reference column'),
        description: z.string(),
      })
    )
    .mutation(async ({ input }): Promise<{ success: boolean }> => {
      try {
        const decoded = verifyToken(input.token);

        // Get the table
        const table = (await TableModel.findOne({
          _id: input.tableId,
          userId: decoded.userId,
        })) as ITable | null;

        if (!table) {
          throw new Error('Table not found');
        }

        // Find the index of the reference column using columnId instead of name
        const refColumnIndex = table.columns.findIndex((col) => col.columnId === input.relativeTo);
        if (refColumnIndex === -1) {
          throw new Error('Reference column not found');
        }

        // Get the reference column's sortIndex
        const refColumn = table.columns[refColumnIndex];
        const refSortIndex = refColumn.columnState?.sortIndex ?? refColumnIndex;

        // Create the new column with description
        const newColumn = {
          columnId: randomUUID(),
          name: input.columnName,
          type: 'text' as ColumnType,
          required: false,
          description: input.description,
          additionalTypeInformation: {},
          columnState: {
            colId: randomUUID(),
            sortIndex: input.position === 'left' ? refSortIndex : refSortIndex + 1,
          },
        };

        // Insert the column at the correct position
        const insertIndex = input.position === 'left' ? refColumnIndex : refColumnIndex + 1;
        table.columns.splice(insertIndex, 0, newColumn);

        // Update sortIndexes for all columns after the insertion point
        table.columns.forEach((col, index) => {
          if (!col.columnState) {
            col.columnState = {
              colId: col.columnId,
            };
          }

          // For columns after the insertion point, increment their sortIndex
          if (
            index !== insertIndex &&
            (input.position === 'left' ? index >= refColumnIndex : index > refColumnIndex)
          ) {
            if (col.columnState) {
              col.columnState.sortIndex = (col.columnState.sortIndex ?? index) + 1;
            }
          }
          // For columns before the insertion point, keep their current sortIndex or use their array index
          else if (index !== insertIndex && col.columnState) {
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
        columnId: z.string(),
      })
    )
    .mutation(async ({ input }): Promise<{ success: boolean }> => {
      try {
        const decoded = verifyToken(input.token);

        const table = await TableModel.findOne({
          _id: input.tableId,
          userId: decoded.userId,
        });

        if (!table) {
          throw new Error('Table not found');
        }

        // Find the index of the column to delete using columnId
        const columnIndex = table.columns.findIndex((col) => col.columnId === input.columnId);
        if (columnIndex === -1) {
          throw new Error('Column not found');
        }

        // Remove the column
        table.columns.splice(columnIndex, 1);
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
        columnId: z.string(),
        type: z.enum(['text', 'number', 'link', 'select', 'multiSelect']),
      })
    )
    .mutation(async ({ input }): Promise<{ success: boolean }> => {
      try {
        const decoded = verifyToken(input.token);

        const result = await TableModel.updateOne(
          {
            _id: input.tableId,
            userId: decoded.userId,
            'columns.columnId': input.columnId,
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

        return { success: true };
      } catch (error) {
        console.error('Update column type error:', error);
        throw new Error('Failed to update column type');
      }
    }),

  setColumnCurrency: publicProcedure
    .input(
      z.object({
        token: z.string(),
        tableId: z.string(),
        columnId: z.string(),
        currency: z.boolean(),
      })
    )
    .mutation(async ({ input }): Promise<{ success: boolean }> => {
      try {
        const decoded = verifyToken(input.token);

        const result = await TableModel.updateOne(
          {
            _id: input.tableId,
            userId: decoded.userId,
            'columns.columnId': input.columnId,
          },
          {
            $set: {
              'columns.$.additionalTypeInformation.currency': input.currency,
            },
          }
        );

        if (result.matchedCount === 0) {
          throw new Error('Table or column not found');
        }

        return { success: true };
      } catch (error) {
        console.error('Set column currency error:', error);
        throw new Error('Failed to set column currency');
      }
    }),

  updateColumnDescription: publicProcedure
    .input(
      z.object({
        token: z.string(),
        tableId: z.string(),
        columnId: z.string(),
        description: z.string(),
      })
    )
    .mutation(async ({ input }): Promise<{ success: boolean }> => {
      try {
        const decoded = verifyToken(input.token);

        const result = await TableModel.updateOne(
          {
            _id: input.tableId,
            userId: decoded.userId,
            'columns.columnId': input.columnId,
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

  updateColumnName: publicProcedure
    .input(
      z.object({
        token: z.string(),
        tableId: z.string(),
        columnId: z.string(),
        name: z.string(),
      })
    )
    .mutation(async ({ input }): Promise<{ success: boolean }> => {
      try {
        const decoded = verifyToken(input.token);

        const result = await TableModel.updateOne(
          {
            _id: input.tableId,
            userId: decoded.userId,
            'columns.columnId': input.columnId,
          },
          {
            $set: {
              'columns.$.name': input.name,
            },
          }
        );

        if (result.matchedCount === 0) {
          throw new Error('Table or column not found');
        }

        return { success: true };
      } catch (error) {
        console.error('Update column name error:', error);
        throw new Error('Failed to update column name');
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

      // Create the table with slug
      const slug = slugify(name);
      const table = await TableModel.create({
        name,
        description,
        columns,
        userId: decoded.userId,
        slug,
      });

      try {
        // Create rows with data using columnId
        await Row.insertMany(
          rows.map((rowData, index) => ({
            tableId: table._id,
            userId: decoded.userId,
            index,
            data: Object.fromEntries(
              table.columns.map((col) => [col.columnId, rowData[col.columnId] || ''])
            ),
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
          columnId: col.columnId,
          name: col.name,
          type: col.type,
          required: col.required || false,
          defaultValue: col.defaultValue,
          description: col.description,
          additionalTypeInformation: col.additionalTypeInformation,
          columnState: col.columnState,
        })),
        createdAt: table.createdAt.toISOString(),
        updatedAt: table.updatedAt.toISOString(),
        userId: table.userId,
        sharingStatus: table.sharingStatus,
        isOwner: true,
        slug: table.slug,
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
        const decoded = verifyToken(input.token);

        const userId = decoded.userId;

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
            columnId: col.columnId,
            name: col.name,
            type: col.type,
            additionalTypeInformation: col.additionalTypeInformation,
            required: col.required || false,
            defaultValue: col.defaultValue,
            description: col.description,
            columnState: col.columnState,
          })),
          createdAt: table.createdAt.toISOString(),
          updatedAt: table.updatedAt.toISOString(),
          userId: table.userId,
          sharingStatus: table.sharingStatus,
          isOwner: userId === table.userId,
          slug: table.slug,
        };
      } catch (error) {
        console.error('Update sharing status error:', error);
        throw new Error('Failed to update sharing status');
      }
    }),

  // Update the getTable procedure to handle both ID and slug
  getTable: publicProcedure
    .input(
      z
        .object({
          id: z.string().optional(),
          slug: z.string().optional(),
          token: z.string().optional(),
        })
        .refine((data) => data.id || data.slug, {
          message: 'Either id or slug must be provided',
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

        // Build the query based on whether we have an ID or slug
        const query: any = {
          $or: [
            { userId }, // Match if user owns the table
            { sharingStatus: 'public' }, // Match if table is public
          ].filter(Boolean), // Remove userId condition if not provided
        };

        // Add either ID or slug to the query
        if (input.id) {
          query._id = input.id;
        } else if (input.slug) {
          query.slug = input.slug;
        } else {
          throw new Error('Either id or slug must be provided');
        }

        const table = await TableModel.findOne(query);

        if (!table) {
          throw new Error('Table not found - Are you sure this table is public?');
        }

        return {
          id: table._id.toString(),
          name: table.name,
          description: table.description,
          columns: table.columns.map((col) => ({
            columnId: col.columnId,
            name: col.name,
            type: col.type,
            additionalTypeInformation: col.additionalTypeInformation,
            required: col.required || false,
            defaultValue: col.defaultValue,
            description: col.description,
            columnState: col.columnState,
          })),
          createdAt: table.createdAt.toISOString(),
          updatedAt: table.updatedAt.toISOString(),
          userId: table.userId,
          sharingStatus: table.sharingStatus,
          isOwner: userId === table.userId,
          slug: table.slug,
          beforeTableText: table.beforeTableText,
          afterTableText: table.afterTableText,
        };
      } catch (error) {
        console.error('Get table error:', error);
        throw new Error('Failed to get table - Are you sure you have access to this table?');
      }
    }),

  createTableFromJSON: publicProcedure
    .input(
      z.object({
        token: z.string(),
        jsonData: z.object({
          name: z.string(),
          description: z.string(),
          columns: z.array(columnSchema),
          rows: z
            .array(
              z.object({
                data: z.record(z.any()),
                index: z.number(),
              })
            )
            .optional(),
          sharingStatus: z.enum(['private', 'public']).optional(),
        }),
      })
    )
    .mutation(async ({ input }): Promise<Table> => {
      try {
        const decoded = verifyToken(input.token);

        const slug = slugify(input.jsonData.name);
        const table = await TableModel.create({
          name: input.jsonData.name,
          description: input.jsonData.description,
          columns: input.jsonData.columns,
          userId: decoded.userId,
          slug,
          sharingStatus: input.jsonData.sharingStatus || 'private',
        });

        // Create rows if they exist in the JSON
        if (input.jsonData.rows?.length) {
          await Row.insertMany(
            input.jsonData.rows.map((row) => ({
              tableId: table._id,
              userId: decoded.userId,
              index: row.index,
              data: Object.fromEntries(
                table.columns.map((col) => [col.columnId, row.data[col.columnId] || ''])
              ),
            }))
          );
        }

        return {
          id: table._id.toString(),
          name: table.name,
          description: table.description,
          columns: table.columns.map((col) => ({
            columnId: col.columnId,
            name: col.name,
            type: col.type,
            additionalTypeInformation: col.additionalTypeInformation,
            required: col.required || false,
            defaultValue: col.defaultValue,
            description: col.description,
            columnState: col.columnState,
          })),
          createdAt: table.createdAt.toISOString(),
          updatedAt: table.updatedAt.toISOString(),
          userId: table.userId,
          sharingStatus: table.sharingStatus,
          isOwner: true,
          slug: table.slug,
        };
      } catch (error) {
        console.error('Create table error:', error);
        throw new Error('Failed to create table');
      }
    }),

  getPublicTables: publicProcedure.query(async (): Promise<Table[]> => {
    try {
      const tables = await TableModel.find({ sharingStatus: 'public' });

      return tables.map((table) => ({
        id: table._id.toString(),
        name: table.name,
        description: table.description,
        columns: table.columns.map((col) => ({
          columnId: col.columnId,
          name: col.name,
          type: col.type,
          required: col.required || false,
          defaultValue: col.defaultValue,
          description: col.description,
          columnState: col.columnState,
          additionalTypeInformation: col.additionalTypeInformation,
        })),
        createdAt: table.createdAt.toISOString(),
        updatedAt: table.updatedAt.toISOString(),
        userId: table.userId,
        sharingStatus: table.sharingStatus,
        isOwner: false,
        slug: table.slug,
        beforeTableText: table.beforeTableText,
        afterTableText: table.afterTableText,
      }));
    } catch (error) {
      console.error('Get public tables error:', error);
      throw new Error('Failed to get public tables');
    }
  }),

  updateTableText: publicProcedure
    .input(
      z.object({
        token: z.string(),
        tableId: z.string(),
        beforeTableText: z.string().optional(),
        afterTableText: z.string().optional(),
      })
    )
    .mutation(async ({ input }): Promise<Table> => {
      try {
        const decoded = verifyToken(input.token);

        const updateData: any = {};
        if (input.beforeTableText !== undefined) {
          updateData.beforeTableText = input.beforeTableText;
        }
        if (input.afterTableText !== undefined) {
          updateData.afterTableText = input.afterTableText;
        }

        const table = await TableModel.findOneAndUpdate(
          { _id: input.tableId, userId: decoded.userId },
          updateData,
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
            columnId: col.columnId,
            name: col.name,
            type: col.type,
            required: col.required || false,
            defaultValue: col.defaultValue,
            description: col.description,
            columnState: col.columnState,
            additionalTypeInformation: col.additionalTypeInformation,
          })),
          createdAt: table.createdAt.toISOString(),
          updatedAt: table.updatedAt.toISOString(),
          userId: table.userId,
          sharingStatus: table.sharingStatus,
          isOwner: true,
          slug: table.slug,
          beforeTableText: table.beforeTableText,
          afterTableText: table.afterTableText,
        };
      } catch (error) {
        console.error('Update table text error:', error);
        throw new Error('Failed to update table text');
      }
    }),

  // Add a new procedure to update select items
  updateSelectItems: publicProcedure
    .input(
      z.object({
        token: z.string(),
        tableId: z.string(),
        columnId: z.string(),
        selectItems: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            color: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ input }): Promise<{ success: boolean }> => {
      try {
        const decoded = verifyToken(input.token);

        const result = await TableModel.updateOne(
          {
            _id: input.tableId,
            userId: decoded.userId,
            'columns.columnId': input.columnId,
          },
          {
            $set: {
              'columns.$.additionalTypeInformation.selectItems': input.selectItems,
            },
          }
        );

        if (result.matchedCount === 0) {
          throw new Error('Table or column not found');
        }

        return { success: true };
      } catch (error) {
        console.error('Update select items error:', error);
        throw new Error('Failed to update select items');
      }
    }),
});
