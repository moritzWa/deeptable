import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { publicProcedure, router } from '../index';
import { ITable, Table as TableModel } from '../models/table';
import { Table } from '../types';

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
          columns: table.columns,
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
      columns: z.array(z.string()).optional()
    }))
    .mutation(async ({ input }): Promise<Table> => {
      try {
        const decoded = jwt.verify(input.token, process.env.AUTH_SECRET || 'fallback-secret') as { userId: string };
        
        const table = await TableModel.create({
          name: input.name,
          description: input.description,
          columns: input.columns || [],
          userId: decoded.userId
        }) as ITable;

        return {
          id: table._id.toString(),
          name: table.name,
          description: table.description || null,
          columns: table.columns,
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
      columns: z.array(z.string()).optional()
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
          columns: table.columns,
          createdAt: table.createdAt.toISOString(),
          updatedAt: table.updatedAt.toISOString(),
          userId: table.userId
        };
      } catch (error) {
        console.error('Update table error:', error);
        throw new Error('Failed to update table');
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