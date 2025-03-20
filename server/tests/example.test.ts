import { expect, test, describe, beforeEach, afterEach, mock, beforeAll } from 'bun:test';
import OpenAI from 'openai';

async function doResearch(question: string): Promise<string> {
  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const SYSTEM_PROMPT = `You are an assitant helping fill out a spreadsheet. You can search the web for information.`;

  // https://platform.openai.com/docs/guides/tools-web-search?api-mode=chat
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-search-preview',
    web_search_options: {},
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
  return completion.choices[0].message.content || '';
}

async function doPerplexity(question: string): Promise<string> {
  // Initialize Perplexity client
  const perplexity = new OpenAI({
    apiKey: process.env.PERPLEXITY_API_KEY,
  });

  const SYSTEM_PROMPT = `You are an assitant helping fill out a spreadsheet. You can search the web for information.`;

  // https://docs.perplexity.ai/reference/post_chat_completions
  const completion = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'sonar-pro',
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
    }),
  }).then((res) => res.json());
  return completion.choices[0].message.content;
}

async function doGoogle(question: string): Promise<string> {
  const completion = await fetch(
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
  ).then((res) => res.json());
  console.log('completion', completion);
  return completion.candidates[0].content.parts.map((part) => part.text).join('\n');
}

describe('Best electric scooter', async () => {
  const query = 'Best electric scooter';
  const cells = [
    {
      row: 'Segway Ninebot Max G2',
      col: 'weight (kg)',
      outputType: 'number',
      expectedValue: '24.3',
    },
    {
      row: 'Segway Ninebot Max G2',
      col: 'maximum range (km)',
      outputType: 'number',
      expectedValue: '70',
    },
    {
      row: 'Segway Ninebot Max G2',
      col: 'maximum speed (km/h)',
      outputType: 'number',
      expectedValue: '35',
    },
  ];

  const results = await Promise.all(
    cells.map(async (cell) => ({
      spec: cell.col,
      expected: cell.expectedValue,
      result: await util(query, cell.row, cell.col, cell.outputType),
    }))
  );

  results.forEach((item) => {
    test(`${item.spec} should be ${item.expected}`, () => {
      expect(item.result).toBe(item.expected);
    });
  });
});

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

async function util(query: string, row: string, col: string, outputType: string) {
  const question = `The user is making a spreadsheet for "${query}". Help them fill in this cell. Row: ${row}, Column: ${col}, Output type: ${outputType}`;

  // Run all three search providers in parallel with a more structured response format
  const searchPromises = [
    doResearch(question)
      .then((response) => ({ response, provider: 'OpenAI' }))
      .catch((err) => ({
        response: `Error with OpenAI search: ${err.message}`,
        provider: 'OpenAI',
      })),
    doPerplexity(question)
      .then((response) => ({ response, provider: 'Perplexity' }))
      .catch((err) => ({
        response: `Error with Perplexity search: ${err.message}`,
        provider: 'Perplexity',
      })),
    doGoogle(question)
      .then((response) => ({ response, provider: 'Google' }))
      .catch((err) => ({
        response: `Error with Google search: ${err.message}`,
        provider: 'Google',
      })),
  ];

  const searchResponses = await Promise.all(searchPromises);
  console.log('Search results collected from all providers');

  const extracted = await extractThingy(query, row, col, outputType, searchResponses);
  return extracted;
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
