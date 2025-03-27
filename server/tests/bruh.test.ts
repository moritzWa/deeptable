import { Table } from '../src/models/table';
import { Row } from '../src/models/row';
import { fillCell } from '../src/fillCellUtils';
import OpenAI from 'openai';
import mongoose from 'mongoose';
import { createRestaurantTable } from 'src/scripts/seeds/germanRestaurants';
import { createReactTableLibrariesTable } from 'src/scripts/seeds/reactTableLibraries';

// Helper function to check similarity between two cell values
async function checkCell(
  tableName: string,
  tableDescription: string,
  row: string,
  columnName: string,
  columnDescription: string,
  groundTruthValue: any,
  llmValue: any
): Promise<number> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const SYSTEM_PROMPT = `You are helping check cells in a generated spreadsheet against the ground truth value. Judge the similarity of the generated cell vs the ground truth value on a scale of 1 to 5.
  
  1 - complete mismatch, useless, garbage result
  2 - wrong, bad, would misguide the user
  3 - directionally correct, still needs substantial improvement
  4 - mostly correct, maybe a little bit off
  5 - basically perfect match`;

  const question = `Table: ${tableName}\n Table description: ${tableDescription}\n Row: ${row}\n Column: ${columnName}\nColumn Description: ${columnDescription}\n Ground truth value: ${groundTruthValue}\n Generated value: ${llmValue}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini-2024-07-18',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: question },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'output',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            result: { type: 'number' },
          },
          additionalProperties: false,
          required: ['result'],
        },
      },
    },
  });

  const message = completion.choices[0].message.content;
  if (!message) {
    throw new Error('No message');
  }

  try {
    const parsed = JSON.parse(message.trim());
    return parsed.result;
  } catch (error) {
    console.error('Error parsing model response:', error, 'message', message);
    throw error;
  }
}

// Helper function to generate test rows using LLM
async function generateTestRows(table: any, entityKey: string, rowEntities: string[]) {
  return Promise.all(
    rowEntities.map(async (entityValue) => {
      const newRow = { [entityKey]: entityValue };
      const filledCells = await Promise.all(
        table.columns.slice(1).map(async (column) => ({
          columnName: column.name,
          value: await fillCell(
            table.name,
            table.description,
            column.name,
            column.description,
            column.type,
            [{ data: entityValue }]
          ),
        }))
      );

      for (const cell of filledCells) {
        newRow[cell.columnName] = cell.value;
      }
      return newRow;
    })
  );
}

// Helper function to analyze cell accuracy
async function analyzeCellAccuracy(
  table: any,
  entityKey: string,
  groundTruthRows: any[],
  testRows: Record<string, any>[],
  rowEntities: string[]
) {
  let totalScore = 0;
  let numCells = 0;
  const cellResults = [];

  for (let r = 0; r < testRows.length; r++) {
    const entityValue = rowEntities[r];
    for (let c = 1; c < table.columns.length; c++) {
      const columnName = table.columns[c].name;
      const groundTruthValue = groundTruthRows[r].data[columnName];
      const llmValue = testRows[r][columnName];

      const score = await checkCell(
        table.name,
        table.description,
        entityValue,
        columnName,
        table.columns[c].description,
        groundTruthValue,
        llmValue
      );

      cellResults.push({ entityValue, columnName, groundTruthValue, llmValue, score });
      totalScore += score;
      numCells++;
    }
  }

  return {
    cellResults: cellResults.sort((a, b) => b.score - a.score),
    totalScore,
    numCells,
    averageScore: totalScore / numCells,
  };
}

// Main analysis function
async function analyzeTableAccuracy(tableId: string, entityKey: string) {
  // 1. Get the ground truth table
  const table = await Table.findById(tableId);
  if (!table) throw new Error('Table not found');

  // 2. Get row entities from ground truth
  const groundTruthRows = await Row.find({ tableId });
  const rowEntities = groundTruthRows.map((row) => row.data[entityKey]);

  // 3. Generate test rows using LLM
  const testRows = await generateTestRows(table, entityKey, rowEntities);

  // 4. Analyze accuracy
  const analysis = await analyzeCellAccuracy(table, entityKey, groundTruthRows, testRows, rowEntities);

  return {
    ...analysis,
    tableInfo: {
      name: table.name,
      description: table.description,
      columnNames: table.columns.map((column) => column.name),
      columnDescriptions: table.columns.map((column) => column.description),
      columnTypes: table.columns.map((column) => column.type),
    },
  };
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || '');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

await connectDB();

const userId = '67e334b701eaff0a0a930020';
// const entityKey = 'Restaurant Name';
// const myTable = await createRestaurantTable(userId);

const entityKey = 'Library';
const myTable = await createReactTableLibrariesTable(userId);

// Example usage:
const analysis = await analyzeTableAccuracy(myTable._id, entityKey);
console.log('Analysis Results:', analysis);
