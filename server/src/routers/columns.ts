import { Column, ColumnType } from '@shared/types';
import mongoose from 'mongoose';
import OpenAI from 'openai';
import { z } from 'zod';
import { Row } from '../models/row';
import { Table } from '../models/table';
import { publicProcedure, router } from '../trpc';
import { fillCell } from '../utils';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the system prompt for column generation
const SYSTEM_PROMPT = `You are an AI assistant that helps generate research table structures.
Your task is to analyze a search query and generate:
1. A clear, concise table name
2. A brief description of what the table will contain
3. A set of columns that would be useful for the research table

Return the response in the following JSON format:
{
  "name": "Table name here",
  "description": "Brief description here",
  "columns": [
    {
      "name": "Column Name",
      "type": "string", // One of: string, number, boolean, date, array, object
      "description": "Brief description of what this column contains",
      "required": false // Whether this column is required
    },
    // More columns...
  ]
}`;

// Example for the model to understand the expected output format
const EXAMPLE_PROMPT = `
Example:
Query: "good scooter for SF"
Output: {
  "name": "SF Scooter Comparison",
  "description": "Comprehensive comparison of electric scooters suitable for San Francisco's urban environment",
  "columns": [
    {
      "name": "Scooter Model",
      "type": "string",
      "description": "Name and model of the scooter",
      "required": true
    },
    {
      "name": "Motor Power",
      "type": "string",
      "description": "Power rating of the scooter motor",
      "required": false
    },
    {
      "name": "Max Speed",
      "type": "number",
      "description": "Maximum speed in mph",
      "required": false
    },
    {
      "name": "Range",
      "type": "number",
      "description": "Maximum range in miles on a single charge",
      "required": false
    },
    {
      "name": "Hill Climbing Ability",
      "type": "string",
      "description": "How well the scooter handles SF hills",
      "required": false
    },
    {
      "name": "Key Features",
      "type": "array",
      "description": "List of notable features",
      "required": false
    },
    {
      "name": "Image",
      "type": "string",
      "description": "URL to an image of the scooter",
      "required": false
    }
  ]
}`;

// Define response types
interface SuccessResponse {
  success: true;
  name: string;
  description: string;
  columns: Column[];
}

interface ErrorResponse {
  success: false;
  error: string;
}

type GenerateColumnsResponse = SuccessResponse | ErrorResponse;

export const columnsRouter = router({
  generateColumns: publicProcedure
    .input(z.object({ 
      prompt: z.string().min(1).max(500),
    }))
    .mutation(async ({ input }): Promise<GenerateColumnsResponse> => {
      try {
        // Construct the prompt for the OpenAI API
        const userPrompt = `Based on this search query: "${input.prompt}", generate a table structure that would help organize research data about this topic.`;
        
        // Call the OpenAI API
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: EXAMPLE_PROMPT },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.2,
          max_tokens: 500, // Increased to accommodate more detailed column definitions
        });

        // Extract the generated response from the API
        const responseText = response.choices[0]?.message?.content?.trim() || "";
        
        try {
          // Parse the JSON response
          const parsedResponse = JSON.parse(responseText);
          
          // Validate the column structure
          const columns = parsedResponse.columns.map((col: any) => {
            // Ensure each column has the required properties
            return {
              name: col.name || 'Unnamed Column',
              type: (col.type as ColumnType) || 'string',
              description: col.description || '',
              required: col.required || false
            };
          });
          
          return {
            success: true as const,
            name: parsedResponse.name,
            description: parsedResponse.description,
            columns: columns,
          };
        } catch (parseError) {
          console.error('Error parsing OpenAI response:', parseError);
          return {
            success: false as const,
            error: 'Failed to parse the generated response. Please try again.',
          };
        }
      } catch (error) {
        console.error('Error generating table structure:', error);
        return {
          success: false as const,
          error: 'Failed to generate table structure. Please try again.',
        };
      }
    }),

    generateRows: publicProcedure // todo private
    .input(z.object({
      prompt: z.string(),
      columns: z.array(z.string()), // todo maybe add column type
    }))
    .output(z.array(z.string()))
    .mutation(async ({ input}) => {
      const _ = input;
      await new Promise(resolve => setTimeout(resolve, 3000));
      return ["row 1", "row 2", "row 3"]
    }),

    fillCell: publicProcedure
    .input(z.object({
      tableId: z.string(),
      rowIndex: z.number(), // AG Grid's row index
      columnName: z.string(), 
      context: z.string().optional(), // Optional additional context for the AI
    }).strict())
    .output(z.string())
    .mutation(async ({ input }) => {
      try {
        const tableObjectId = new mongoose.Types.ObjectId(input.tableId);

        // First find the row using tableId and rowIndex
        const row = await Row.findOne({ 
          tableId: tableObjectId,
        }).skip(input.rowIndex).limit(1);

        if (!row) {
          console.error('Row not found:', { tableId: input.tableId, rowIndex: input.rowIndex });
          return 'Error: Row not found';
        }

        // Get table and column data
        const table = await Table.findById(tableObjectId);
        if (!table) {
          console.error('Table not found:', input.tableId);
          return 'Error: Table not found';
        }

        const column = table.columns.find(col => col.name === input.columnName);
        if (!column) {
          console.error('Column not found in table:', input.columnName);
          return 'Error: Column not found in table';
        }

        // Call fillCell with all the context
        const result = await fillCell(
          input.context || table.description || table.name, // Use provided context or fall back to table info
          JSON.stringify(row.data), // Pass the entire row data as context
          column.name,
          column.type
        );

        // Log the result
        console.log('FillCell Result:', {
          tableId: input.tableId,
          rowIndex: input.rowIndex,
          rowData: row.data,
          column: column.name,
          columnType: column.type,
          result: result
        });

        return result;
      } catch (error) {
        console.error('Error in fillCell:', error);
        if (error instanceof Error && error.message.includes('ObjectId')) {
          return 'Error: Invalid table ID format';
        }
        return 'Error processing request';
      }
    }),
}); 