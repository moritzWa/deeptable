import { expect, test, describe, beforeEach, afterEach, mock, beforeAll } from 'bun:test';
import OpenAI from 'openai';
interface PerplexityResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface GooglePart {
  text: string;
}

interface GoogleResponse {
  candidates: Array<{
    content: {
      parts: GooglePart[];
    };
  }>;
}
// async function doResearch(question: string): Promise<string> {
//   // Initialize OpenAI client
//   const openai = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY,
//   });

//   const SYSTEM_PROMPT = `You are an assitant helping fill out a spreadsheet. You can search the web for information.`;

//   // https://platform.openai.com/docs/guides/tools-web-search?api-mode=chat
//   const completion = await openai.chat.completions.create({
//     model: 'gpt-4o-search-preview',
//     web_search_options: {},
//     messages: [
//       {
//         role: 'system',
//         content: SYSTEM_PROMPT,
//       },
//       {
//         role: 'user',
//         content: question,
//       },
//     ],
//   });
//   return completion.choices[0].message.content || '';
// }

// async function doPerplexity(question: string): Promise<string> {
//   // Initialize Perplexity client
//   const perplexity = new OpenAI({
//     apiKey: process.env.PERPLEXITY_API_KEY,
//   });

//   const SYSTEM_PROMPT = `You are an assitant helping fill out a spreadsheet. You can search the web for information.`;

//   // https://docs.perplexity.ai/reference/post_chat_completions
//   const completion = await fetch('https://api.perplexity.ai/chat/completions', {
//     method: 'POST',
//     headers: {
//       Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       model: 'sonar-pro',
//       messages: [
//         {
//           role: 'system',
//           content: SYSTEM_PROMPT,
//         },
//         {
//           role: 'user',
//           content: question,
//         },
//       ],
//     }),
//   }).then((res) => res.json());
//   return completion.choices[0].message.content;
// }

async function askGoogle(question: string): Promise<string> {
  const completion = (await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' +
      process.env.GOOGLE_API_KEY,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [
            {
              text: 'You are an assitant helping fill out a spreadsheet. You can search the web for information.',
            },
          ],
        },
        contents: [
          {
            parts: [{ text: question }],
          },
        ],
        tools: [
          {
            google_search: {},
          },
        ],
      }),
    }
  ).then((res) => res.json())) as GoogleResponse;

  if (!completion.candidates?.[0]?.content?.parts) {
    throw new Error('Invalid response from Google API');
  }

  console.log('completion', completion);
  return completion.candidates[0].content.parts.map((part: GooglePart) => part.text).join('\n');
}

async function extractThingy(
  query: string,
  row: string,
  col: string,
  outputType: string,
  searchResponses: Array<{ response: string; provider: string }>
) {
  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const SYSTEM_PROMPT = `You are in a data pipeline whose goal is to fill out a spreadsheet for a user's query. You will be given their query, a row, a column, an output type, and multiple search responses from different providers.

Extract the right information from the search responses and return it in the correct format. Consider the quality and credibility of the information sources, the consistency across responses, and the reasoning provided. When sources disagree, make a judgment based on credibility and recency of information.

Respond ONLY in the output format specified with no other text.`;

  // Serialize the responses as JSON
  const searchResponsesJson = JSON.stringify(searchResponses, null, 2);

  const question = `Query: ${query}\nRow: ${row}\nColumn: ${col}\nOutput type: ${outputType}\n\nSearch Responses:\n${searchResponsesJson}`;

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
  });
  const message = completion.choices[0].message.content;
  if (!message) {
    throw new Error('No message');
  }
  return message.trim();
}


// describe("Time tracking app", async () => {
//     const query = "Best time tracking app";
//     const cells = [
//         {row: "toggl", col: "has apple watch app", outputType: "boolean (true/false)", expectedValue: "true"},
//         {row: "rize", col: "has apple watch app", outputType: "boolean (true/false)", expectedValue: "false"},
//         {row: "sunsama", col: "has apple watch app", outputType: "boolean (true/false)", expectedValue: "false"},
//         {row: "rescuetime", col: "has apple watch app", outputType: "boolean (true/false)", expectedValue: "false"},
//         {row: "tick", col: "has apple watch app", outputType: "boolean (true/false)", expectedValue: "true"},
//         {row: "clockify", col: "has apple watch app", outputType: "boolean (true/false)", expectedValue: "false"},
//     ];

//     const results = await Promise.all(
//         cells.map(async (cell) => ({
//             app: cell.row,
//             expected: cell.expectedValue,
//             result: await util(query, cell.row, cell.col, cell.outputType)
//         }))
//     );

//     results.forEach(item => {
//         test(`${item.app} should have correct Apple Watch app availability`, () => {
//             expect(item.result).toBe(item.expected);
//         });
//     });
// });

// describe("Time tracking app", async () => {
//     const query = "Best time tracking app";
//     const cells = [
//         {row: "toggl", col: "has apple watch app", outputType: "boolean (true/false)", expectedValue: "true"},
//         {row: "rize", col: "has apple watch app", outputType: "boolean (true/false)", expectedValue: "false"},
//         {row: "sunsama", col: "has apple watch app", outputType: "boolean (true/false)", expectedValue: "false"},
//         {row: "rescuetime", col: "has apple watch app", outputType: "boolean (true/false)", expectedValue: "false"},
//         {row: "tick", col: "has apple watch app", outputType: "boolean (true/false)", expectedValue: "true"},
//         {row: "clockify", col: "has apple watch app", outputType: "boolean (true/false)", expectedValue: "false"},
//     ];

//     const results = await Promise.all(
//         cells.map(async (cell) => ({
//             app: cell.row,
//             expected: cell.expectedValue,
//             result: await util(query, cell.row, cell.col, cell.outputType)
//         }))
//     );

//     results.forEach(item => {
//         test(`${item.app} should have correct Apple Watch app availability`, () => {
//             expect(item.result).toBe(item.expected);
//         });
//     });
// });

async function getFinalAnswer(
  tableName: string,
  tableDescription: string,
  entityColumnName: string,
  entityColumnDescription: string,
  rawResult: string
) {
  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const SYSTEM_PROMPT = `You are in a data pipeline whose goal is to fill out a spreadsheet for a user's query. You will be given the table name, table description, entity column name, entity column description, and unstructured search results.

Extract the entities from the unstructured search results and return them in the following format: 

[
  "entity1",
  "entity2",
  "entity3"
]


Respond ONLY in the output format specified with no other text.`;

  const question = `Table Name: ${tableName}\nTable Description: ${tableDescription}\nEntity Column Name: ${entityColumnName}\nEntity Column Description: ${entityColumnDescription}\nSearch Results: ${rawResult}`;

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
  });
  const message = completion.choices[0].message.content;
  if (!message) {
    throw new Error('No message');
  }
  return message.trim();
}

export async function generateRows(tableName: string, tableDescription: string, entityColumnName: string, entityColumnDescription: string): Promise<string[]> {

  const question = `Generate a list candidates entities for the users spreadsheet. Table name: ${tableName}. Table description: ${tableDescription}. Entity column name: ${entityColumnName}. Entity column description: ${entityColumnDescription}.`;
  const rawResult = await askGoogle(question);
  const finalAnswerRaw = await getFinalAnswer(tableName, tableDescription, entityColumnName, entityColumnDescription, rawResult);
  console.log('finalAnswerRaw', finalAnswerRaw);
  return JSON.parse(finalAnswerRaw);
}

describe('Best electric scooter', async () => {

  // const question = "Please generate a list of candidates for the users query: best electric scooter for san francisco";

  // const question = "Please generate a list of candidates for the users query: best travel locations for march in the world";
  // const question = "Please generate a list of 30 candidates for the users query: best gym in Canggu bali with Sauna and cold plunge. Table name: Canggu Gyms. Table description: Detailed comparison of gyms in Canggu, Bali that offer sauna and cold plunge facilities. Candidate type: Gym name";
  // const question = "Please generate a list of candidates for the users query: best travel locations for march in the world";
  // const question = "Please generate a list of candidates for the users query: evtol company founders";

  // const result = await generateRows(
  //   'Canggu Gyms',
  //   'Detailed comparison of gyms in Canggu, Bali that offer sauna and cold plunge facilities.',
  //   'Gym Name',
  //   'Name of the gym'
  // );
  const result = await generateRows( // travel
    'March Travel Locations',
    'List of travel locations for the month of March',
    'City',
    'Name of the location'
  );
  console.log('result', result);

});