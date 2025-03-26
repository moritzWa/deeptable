import { Column, ColumnType } from '@shared/types';
import mongoose from 'mongoose';
import OpenAI from 'openai';
import { z } from 'zod';
import { fillCell } from '../fillCellUtils';
import { Row } from '../models/row';
import { Table } from '../models/table';
import { publicProcedure, router } from '../trpc';

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
      "type": "text", // One of: "text", "number", "link"
      "description": "Brief description of what this column contains",
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
      "type": "text",
      "description": "Name and model of the scooter",
    },
    {
      "name": "Product Link",
      "type": "link",
      "description": "URL to the product page",
    },
    {
      "name": "Motor Power in Watts",
      "type": "number",
      "description": "Power rating of the scooter motor",
    },
    {
      "name": "Max Speed in mph",
      "type": "number",
      "description": "Maximum speed in mph",
    },
    {
      "name": "Range in Miles",
      "type": "number",
      "description": "Maximum range in miles on a single charge",
    },
    {
      "name": "Hill Climbing Ability",
      "type": "text",
      "description": "How well the scooter handles SF hills",
    },
    {
      "name": "Key Features",
      "type": "text",
      "description": "List of notable features",
    },
    {
      "name": "Image",
      "type": "link",
      "description": "URL to an image of the scooter",
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
    .input(
      z.object({
        prompt: z.string().min(1).max(500),
      })
    )
    .mutation(async ({ input }): Promise<GenerateColumnsResponse> => {
      try {
        // Construct the prompt for the OpenAI API
        const userPrompt = `Based on this search query: "${input.prompt}", generate a table structure that would help organize research data about this topic.`;

        // Call the OpenAI API
        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: EXAMPLE_PROMPT },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.2,
          max_tokens: 500, // Increased to accommodate more detailed column definitions
        });

        // Extract the generated response from the API
        const responseText = response.choices[0]?.message?.content?.trim() || '';

        console.log('responseText for generateColumns', responseText);

        try {
          // Parse the JSON response
          const parsedResponse = JSON.parse(responseText);

          // Validate the column structure
          const columns = parsedResponse.columns.map((col: any) => {
            // Ensure each column has the required properties
            return {
              name: col.name || 'Unnamed Column',
              type: (col.type as ColumnType) || 'text',
              description: col.description || '',
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
    .input(
      z.object({
        prompt: z.string(),
        columns: z.array(z.string()), // todo maybe add column type
      })
    )
    .output(z.array(z.string()))
    .mutation(async ({ input }) => {
      const _ = input;
      await new Promise((resolve) => setTimeout(resolve, 3000));
      return ['row 1', 'row 2', 'row 3'];
    }),

  fillCellBatched: publicProcedure
    .input(
      z
        .object({
          tableId: z.string(),
          columnNames: z.array(z.string()),
          startRowId: z.string(),
          endRowId: z.string(),
        })
        .strict()
    )
    .output(z.string())
    .mutation(async ({ input }) => {
      try {
        // get table
        const tableObjectId = new mongoose.Types.ObjectId(input.tableId);
        const table = await Table.findById(tableObjectId);
        if (!table) {
          throw new Error('Table not found');
        }

        // get table name and description
        const tableName = table.name;
        const tableDescription = table.description;
        console.log('tableName', tableName);
        console.log('tableDescription', tableDescription);

        // Find rows by IDs
        const rowIds = [input.startRowId];
        if (input.endRowId !== input.startRowId) {
          rowIds.push(input.endRowId);
        }

        const rows = await Row.find({
          _id: { $in: rowIds.map((id) => new mongoose.Types.ObjectId(id)) },
          tableId: tableObjectId,
        });

        if (!rows || rows.length === 0) {
          throw new Error('No rows found with the provided IDs');
        }

        // log row data
        console.log('rows', rows);

        // Process each row
        for (const row of rows) {
          // Start with the existing row data
          const updatedData = { ...row.data };

          // Process each selected column for this row
          for (const columnName of input.columnNames) {
            const column = table.columns.find((col) => col.name === columnName);
            if (!column) {
              console.warn(`Column ${columnName} not found, skipping`);
              continue;
            }

            const firstColumnValue = Object.values(row.data)[0];
            console.log(`Processing cell: Row "${firstColumnValue}", Column ${column.name}`);

            const llmResults = await fillCell(
              tableName,
              tableDescription,
              column.name,
              column.description,
              column.type,
              [{ data: row.data }] // Pass only the current row's data
            );
            console.log(
              `llmResults for Row "${firstColumnValue}", Column ${column.name}:`,
              llmResults
            );

            // Update the cell value in our data object
            updatedData[column.name] = llmResults;
          }

          // Update the entire row data object at once
          await Row.findByIdAndUpdate(row._id, {
            $set: { data: updatedData },
          });
        }

        return 'All cells updated successfully';
      } catch (error) {
        console.error('Error in fillCell:', error);
        if (error instanceof Error && error.message.includes('ObjectId')) {
          return 'Error: Invalid table ID format';
        }
        return 'Error processing request';
      }
    }),
  fillSingleCell: publicProcedure
    .input(
      z.object({
        tableId: z.string(),
        columnName: z.string(),
        rowId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Get table
        const tableObjectId = new mongoose.Types.ObjectId(input.tableId);
        const table = await Table.findById(tableObjectId);
        if (!table) {
          throw new Error('Table not found');
        }

        // Find the column
        const column = table.columns.find((col) => col.name === input.columnName);
        if (!column) {
          throw new Error('Column not found');
        }

        // Find the row
        const row = await Row.findOne({
          _id: new mongoose.Types.ObjectId(input.rowId),
          tableId: tableObjectId,
        });
        if (!row) {
          throw new Error('Row not found');
        }

        // Fill the single cell
        const llmResults = await fillCell(
          table.name,
          table.description,
          column.name,
          column.description,
          column.type,
          [{ data: row.data }]
        );

        // Get the first property value from row.data object
        const firstPropertyValue = Object.values(row.data)[0];
        console.log(
          `llmResults for Row "${firstPropertyValue}", Column ${column.name}:`,
          llmResults
        );

        // Update just this cell in the row
        await Row.findByIdAndUpdate(row._id, {
          $set: { [`data.${column.name}`]: llmResults },
        });

        return llmResults;
      } catch (error) {
        console.error('Error in fillSingleCell:', error);
        throw error;
      }
    }),
});
