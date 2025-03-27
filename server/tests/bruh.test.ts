import { createRestaurantTable } from '../src/scripts/seeds/germanRestaurants';
import mongoose from 'mongoose';
import { Row } from '../src/models/row';
import { Table } from '../src/models/table';
import { fillCell } from '../src/fillCellUtils';
import OpenAI from 'openai';
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

// 1. run seeder script to get ground truth table

const userId = '67e334b701eaff0a0a930020';
const entityKey = 'Restaurant Name';
const restaurantTable = await createRestaurantTable(userId);

// 2. get column names, column descriptions, column types
const columnNames = restaurantTable.columns.map((column) => column.name);
const columnDescriptions = restaurantTable.columns.map((column) => column.description);
const columnTypes = restaurantTable.columns.map((column) => column.type);

console.log(columnNames);
console.log(columnDescriptions);
console.log(columnTypes);

// 3. get row entities
const rows = await Row.find({ tableId: restaurantTable._id });
const rowEntities = rows.map((row) => row.data[entityKey]);

console.log(rowEntities);
// 4. fill cells with llm data

// const testTable = await Table.create({
//   name: restaurantTable.name + '(Test)',
//   description: restaurantTable.description,
//   columns: restaurantTable.columns,
//   userId,
// });

const testRows: Record<string, any>[] = await Promise.all(
  rowEntities.map(
    async (entityValue) => {
      const newRow = { [entityKey]: entityValue };
      const filledCells = await Promise.all(
        restaurantTable.columns.slice(1).map(async (column) => 
          ({columnName: column.name, value: await fillCell(restaurantTable.name, restaurantTable.description, column.name, column.description, column.type, [{ data: entityValue }])})
        )
      )
      for (const cell of filledCells) {
        newRow[cell.columnName] = cell.value;
      }
      return newRow;
    }
  )
);

console.log('testRows', testRows);

// 5. compare llm data with ground truth data

// check test rows and rows are the same size
if (testRows.length !== rows.length) {
  console.log('testRows and rows are not the same size');
}

// return a number between 0 and 100 based on how similar the two values are
async function checkCell(tableName: string, tableDescription: string, row: string, columnName: string, columnDescription: string, groundTruthValue: any, llmValue: any): Promise<number> {
  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const SYSTEM_PROMPT = `You are helping check cells in a generated spreadsheet against the ground truth value. Judge the similarity of the generated cell vs the ground truth value on a scale of 0 to 100.`;

  const question = `Table: ${tableName}\n Table description: ${tableDescription}\n Row: ${row}\n Column: ${columnName}\nColumn Description: ${columnDescription}\n Ground truth value: ${groundTruthValue}\n Generated value: ${llmValue}`;


  // log existing row content

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini-2024-07-18',
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: question,
      },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'output',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            result: {
              type: 'number',
            },
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

  // Parse the message and extract the result field
  try {
    const parsed = JSON.parse(message.trim());
    return parsed.result;
  } catch (error) {
    console.error('Error parsing model response:', error, 'message', message);
    throw error;
  }
}

// iterate through test rows and rows and check if they are the same
let totalScore = 0;
let numCells = 0;
const cellResults = [];
for (let r = 0; r < testRows.length; r++) {
  const entityValue = rowEntities[r];
  for (let c = 1; c < restaurantTable.columns.length; c++) {
    const columnName = restaurantTable.columns[c].name;
    const groundTruthValue = rows[r].data[columnName];
    const llmValue = testRows[r][columnName];

    const score = await checkCell(groundTruthValue, llmValue);
    cellResults.push({ entityValue, columnName, groundTruthValue, llmValue, score });
    // if (score < 50) {
    //   console.log(`${entityValue} ${columnName} groundTruth: ${groundTruthValue} llm: ${llmValue} score: ${score}`);
    // }

    totalScore += score;
    numCells++;
    // break; // TODO: remove
  }
}
const averageScore = totalScore / numCells;
console.log('averageScore', averageScore);
// sort cellResults by score
cellResults.sort((a, b) => b.score - a.score);
console.log('cellResults', cellResults);

console.log('totalScore', totalScore);
console.log('numCells', numCells);
console.log('averageScore', totalScore / numCells);
