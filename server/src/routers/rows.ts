import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { z } from 'zod';
import { publicProcedure, router } from '../index';
import { IRow, Row as RowModel } from '../models/row';
import { Table as TableModel } from '../models/table';

// Define the Row type for client-side use
export interface Row {
  id: string;
  tableId: string;
  data: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export const rowsRouter = router({
  // Get rows for a specific table
  getRows: publicProcedure
    .input(z.object({ 
      token: z.string(),
      tableId: z.string(),
      limit: z.number().optional(),
      offset: z.number().optional()
    }))
    .query(async ({ input }): Promise<{ rows: Row[], total: number }> => {
      try {
        const decoded = jwt.verify(input.token, process.env.AUTH_SECRET || 'fallback-secret') as { userId: string };
        
        // Verify table exists and belongs to user
        const table = await TableModel.findOne({ 
          _id: input.tableId, 
          userId: decoded.userId 
        });
        
        if (!table) {
          throw new Error('Table not found');
        }
        
        // Get total count for pagination
        const total = await RowModel.countDocuments({ 
          tableId: input.tableId,
          userId: decoded.userId
        });
        
        // Get rows with pagination
        const rows = await RowModel.find({ 
          tableId: input.tableId,
          userId: decoded.userId
        })
        .sort({ createdAt: -1 })
        .skip(input.offset || 0)
        .limit(input.limit || 50);
        
        return {
          rows: rows.map((row: IRow) => ({
            id: row._id.toString(),
            tableId: row.tableId.toString(),
            data: row.data,
            createdAt: row.createdAt.toISOString(),
            updatedAt: row.updatedAt.toISOString(),
            userId: row.userId
          })),
          total
        };
      } catch (error) {
        console.error('Get rows error:', error);
        throw new Error('Failed to get rows');
      }
    }),

  // Create a new row
  createRow: publicProcedure
    .input(z.object({
      token: z.string(),
      tableId: z.string(),
      data: z.record(z.any())
    }))
    .mutation(async ({ input }): Promise<Row> => {
      try {
        const decoded = jwt.verify(input.token, process.env.AUTH_SECRET || 'fallback-secret') as { userId: string };
        
        // Verify table exists and belongs to user
        const table = await TableModel.findOne({ 
          _id: input.tableId, 
          userId: decoded.userId 
        });
        
        if (!table) {
          throw new Error('Table not found');
        }
        
        // Validate data against column definitions
        const validatedData: Record<string, any> = {};
        
        // Only include data for columns that exist in the table
        table.columns.forEach(column => {
          const columnName = typeof column === 'string' ? column : column.name;
          if (input.data.hasOwnProperty(columnName)) {
            validatedData[columnName] = input.data[columnName];
          }
        });
        
        const row = await RowModel.create({
          tableId: new mongoose.Types.ObjectId(input.tableId),
          data: validatedData,
          userId: decoded.userId
        }) as IRow;

        return {
          id: row._id.toString(),
          tableId: row.tableId.toString(),
          data: row.data,
          createdAt: row.createdAt.toISOString(),
          updatedAt: row.updatedAt.toISOString(),
          userId: row.userId
        };
      } catch (error) {
        console.error('Create row error:', error);
        throw new Error('Failed to create row');
      }
    }),

  // Update a row
  updateRow: publicProcedure
    .input(z.object({
      token: z.string(),
      id: z.string(),
      data: z.record(z.any())
    }))
    .mutation(async ({ input }): Promise<Row> => {
      try {
        const decoded = jwt.verify(input.token, process.env.AUTH_SECRET || 'fallback-secret') as { userId: string };
        
        const row = await RowModel.findOneAndUpdate(
          { _id: input.id, userId: decoded.userId },
          { data: input.data },
          { new: true }
        ) as IRow | null;

        if (!row) {
          throw new Error('Row not found');
        }

        return {
          id: row._id.toString(),
          tableId: row.tableId.toString(),
          data: row.data,
          createdAt: row.createdAt.toISOString(),
          updatedAt: row.updatedAt.toISOString(),
          userId: row.userId
        };
      } catch (error) {
        console.error('Update row error:', error);
        throw new Error('Failed to update row');
      }
    }),

  // Delete a row
  deleteRow: publicProcedure
    .input(z.object({
      token: z.string(),
      id: z.string()
    }))
    .mutation(async ({ input }): Promise<{ success: boolean }> => {
      try {
        const decoded = jwt.verify(input.token, process.env.AUTH_SECRET || 'fallback-secret') as { userId: string };
        
        const result = await RowModel.deleteOne({ 
          _id: input.id, 
          userId: decoded.userId 
        });
        
        if (result.deletedCount === 0) {
          throw new Error('Row not found');
        }

        return { success: true };
      } catch (error) {
        console.error('Delete row error:', error);
        throw new Error('Failed to delete row');
      }
    })
}); 