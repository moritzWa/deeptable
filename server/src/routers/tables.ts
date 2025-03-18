import { Table } from '@shared/types';
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
  orderIndex: z.number().optional()
});

// Define a Zod schema for column validation
const columnSchema = z.object({
  name: z.string(),
  type: z.enum(['string', 'number', 'boolean', 'date', 'array', 'object']),
  required: z.boolean().optional(),
  defaultValue: z.any().optional(),
  description: z.string().optional(),
  columnState: columnStateSchema.optional()
});

export const tablesRouter = router({
  // Get all tables for the current user
  getTables: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }): Promise<Table[]> => {
      try {
        const decoded = jwt.verify(input.token, process.env.AUTH_SECRET || 'fallback-secret') as { userId: string };
        const tables = await TableModel.find({ userId: decoded.userId });
        
        return tables.map((table: ITable) => ({
          id: table._id.toString(),
          name: table.name,
          description: table.description || null,
          columns: table.columns.map(col => ({
            name: col.name,
            type: col.type,
            required: col.required || false,
            defaultValue: col.defaultValue,
            description: col.description,
            columnState: col.columnState
          })),
          createdAt: table.createdAt.toISOString(),
          updatedAt: table.updatedAt.toISOString(),
          userId: table.userId
        }));
      } catch (error) {
        console.error('Get tables error:', error);
        throw new Error('Failed to get tables');
      }
    }),

  // Create a new table
  createTable: publicProcedure
    .input(z.object({
      token: z.string(),
      name: z.string(),
      description: z.string().optional(),
      columns: z.array(columnSchema).optional()
    }))
    .mutation(async ({ input }): Promise<Table> => {
      try {
        const decoded = jwt.verify(input.token, process.env.AUTH_SECRET || 'fallback-secret') as { userId: string };
        
        // Convert string columns to proper column objects if needed
        const columns = input.columns || [];
        
        const table = await TableModel.create({
          name: input.name,
          description: input.description,
          columns: columns,
          userId: decoded.userId
        }) as ITable;

        return {
          id: table._id.toString(),
          name: table.name,
          description: table.description || null,
          columns: table.columns.map(col => ({
            name: col.name,
            type: col.type,
            required: col.required || false,
            defaultValue: col.defaultValue,
            description: col.description,
            columnState: col.columnState
          })),
          createdAt: table.createdAt.toISOString(),
          updatedAt: table.updatedAt.toISOString(),
          userId: table.userId
        };
      } catch (error) {
        console.error('Create table error:', error);
        throw new Error('Failed to create table');
      }
    }),

  // Update a table
  updateTable: publicProcedure
    .input(z.object({
      token: z.string(),
      id: z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
      columns: z.array(columnSchema).optional()
    }))
    .mutation(async ({ input }): Promise<Table> => {
      try {
        const decoded = jwt.verify(input.token, process.env.AUTH_SECRET || 'fallback-secret') as { userId: string };
        
        const table = await TableModel.findOneAndUpdate(
          { _id: input.id, userId: decoded.userId },
          { 
            ...(input.name && { name: input.name }),
            ...(input.description && { description: input.description }),
            ...(input.columns && { columns: input.columns })
          },
          { new: true }
        ) as ITable | null;

        if (!table) {
          throw new Error('Table not found');
        }

        return {
          id: table._id.toString(),
          name: table.name,
          description: table.description || null,
          columns: table.columns.map(col => ({
            name: col.name,
            type: col.type,
            required: col.required || false,
            defaultValue: col.defaultValue,
            description: col.description,
            columnState: col.columnState
          })),
          createdAt: table.createdAt.toISOString(),
          updatedAt: table.updatedAt.toISOString(),
          userId: table.userId
        };
      } catch (error) {
        console.error('Update table error:', error);
        throw new Error('Failed to update table');
      }
    }),

  // Update column state
  updateColumnState: publicProcedure
    .input(z.object({
      token: z.string(),
      tableId: z.string(),
      columnStates: z.array(z.object({
        name: z.string(),
        columnState: columnStateSchema
      }))
    }))
    .mutation(async ({ input }): Promise<{ success: boolean }> => {
      try {
        const decoded = jwt.verify(input.token, process.env.AUTH_SECRET || 'fallback-secret') as { userId: string };
        
        // Get the table
        const table = await TableModel.findOne({ _id: input.tableId, userId: decoded.userId }) as ITable | null;
        
        if (!table) {
          throw new Error('Table not found');
        }

        // Process each column state update
        for (const cs of input.columnStates) {
          const column = table.columns.find(col => col.name === cs.name);
          if (!column) continue;

          // Check if the column name is being changed
          const isNameChange = cs.columnState.colId && cs.columnState.colId !== cs.name;
          
          if (isNameChange) {
            // Update the column name in the table
            await TableModel.updateOne(
              { 
                _id: input.tableId, 
                userId: decoded.userId,
                "columns.name": cs.name
              },
              { 
                $set: { 
                  "columns.$.name": cs.columnState.colId,
                  "columns.$.columnState": cs.columnState
                }
              }
            );

            // Update all rows to rename the field in the data object
            await Row.updateMany(
              { tableId: input.tableId },
              [
                {
                  $set: {
                    data: {
                      $mergeObjects: [
                        "$$REMOVE",
                        {
                          $arrayToObject: {
                            $map: {
                              input: { $objectToArray: "$data" },
                              in: {
                                k: {
                                  $cond: [
                                    { $eq: ["$$this.k", cs.name] },
                                    cs.columnState.colId,
                                    "$$this.k"
                                  ]
                                },
                                v: "$$this.v"
                              }
                            }
                          }
                        }
                      ]
                    }
                  }
                }
              ]
            );
          } else {
            // Just update the column state without changing the name
            await TableModel.updateOne(
              { 
                _id: input.tableId, 
                userId: decoded.userId,
                "columns.name": cs.name
              },
              { 
                $set: { 
                  "columns.$.columnState": cs.columnState
                }
              }
            );
          }
        }
        
        return { success: true };
      } catch (error) {
        console.error('Update column state error:', error);
        throw new Error('Failed to update column state');
      }
    }),

  // Delete a table
  deleteTable: publicProcedure
    .input(z.object({
      token: z.string(),
      id: z.string()
    }))
    .mutation(async ({ input }): Promise<{ success: boolean }> => {
      try {
        const decoded = jwt.verify(input.token, process.env.AUTH_SECRET || 'fallback-secret') as { userId: string };
        
        const result = await TableModel.deleteOne({ _id: input.id, userId: decoded.userId });
        
        if (result.deletedCount === 0) {
          throw new Error('Table not found');
        }

        return { success: true };
      } catch (error) {
        console.error('Delete table error:', error);
        throw new Error('Failed to delete table');
      }
    })
}); 