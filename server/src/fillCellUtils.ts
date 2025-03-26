import { ColumnType } from '@shared/types';
import OpenAI from 'openai';

// Type definitions for API responses
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

async function askOpenAI(question: string): Promise<string> {
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

async function askPerplexity(question: string): Promise<string> {
  // Initialize Perplexity client
  const perplexity = new OpenAI({
    apiKey: process.env.PERPLEXITY_API_KEY,
  });

  const SYSTEM_PROMPT = `You are an assitant helping fill out a spreadsheet. You can search the web for information.`;

  // https://docs.perplexity.ai/reference/post_chat_completions
  const completion = (await fetch('https://api.perplexity.ai/chat/completions', {
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
  }).then((res) => res.json())) as PerplexityResponse;

  if (!completion.choices?.[0]?.message?.content) {
    throw new Error('Invalid response from Perplexity API');
  }
  return completion.choices[0].message.content;
}

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

  // console.log('completion', completion);
  return completion.candidates[0].content.parts.map((part: GooglePart) => part.text).join('\n');
}

/**
 * Converts a ColumnType string to a JSON schema for OpenAI API
 * Always creates an object schema with a 'result' field of the requested type
 */
function columnTypeToJsonSchema(columnType: ColumnType): Record<string, unknown> {
  let resultSchema: Record<string, unknown>;
  
  switch (columnType) {
    case 'text':
      resultSchema = { type: 'string' };
      break;
    case 'number':
      resultSchema = { type: 'number' };
      break;
    case 'link':
      resultSchema = { type: 'string', format: 'uri' };
      break;
  }
  
  // Wrap in an object schema with a result field
  return {
    type: 'object',
    properties: {
      result: resultSchema
    },
    additionalProperties: false,
    required: ['result']
  };
}

async function getFinalAnswer(
  tableName: string,
  columnName: string,
  columnDescription: string,
  outputType: Record<string, unknown>,
  searchResponses: Array<{ response: string; provider: string }>
) {
  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const SYSTEM_PROMPT = `You are in a data pipeline whose goal is to fill out a spreadsheet for a user's query. You will be given their query, a column, an output type, and multiple search responses from different providers.

Extract the right information from the search responses and return it in the correct format. Consider the quality and credibility of the information sources, the consistency across responses, and the reasoning provided. When sources disagree, make a judgment based on credibility and recency of information.

Respond ONLY with the actual output value/type specified with no other text.`;

  // Serialize the responses as JSON
  const searchResponsesJson = JSON.stringify(searchResponses, null, 2);

  const serializedOutputType = JSON.stringify(outputType, null, 2);

  const question = `Table: ${tableName}\nColumn: ${columnName}\nColumn Description: ${columnDescription}\nOutput type: ${serializedOutputType}\n \nSearch Responses:\n${searchResponsesJson}`;

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
        schema: outputType,
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

export async function fillCell(
  tableName: string,
  tableDescription: string | null | undefined,
  columnName: string,
  columnDescription: string | null | undefined,
  outputType: ColumnType,
  rows: Array<{ data: Record<string, any> }>
) {
  const question = `The user is making a spreadsheet with the following table: ${tableName}. The table has the following description: ${tableDescription}. The column they are filling out is: ${columnName}. The column has the following description: ${columnDescription} and the type is ${outputType}. The existing rows are: ${rows.map((row) => JSON.stringify(row.data)).join(', ')}. Help them fill in this cell.`;

  const providers = [
    {
      name: 'OpenAI',
      fn: askOpenAI,
    },
    {
      name: 'Perplexity',
      fn: askPerplexity,
    },
    {
      name: 'Google',
      fn: askGoogle,
    },
  ];

  const searchPromises = providers.map((provider) =>
    provider
      .fn(question)
      .then((response) => ({ response, provider: provider.name }))
      .catch((err) => ({
        response: `Error with ${provider.name} search: ${err.message}`,
        provider: provider.name,
      }))
  );
  const searchResponses = await Promise.all(searchPromises);
  console.log('Search results collected from all providers');

  const jsonSchema = columnTypeToJsonSchema(outputType);

  console.log('filling cell with json schema', jsonSchema);
  const extracted = await getFinalAnswer(
    tableName,
    columnName,
    columnDescription || '',
    jsonSchema,
    searchResponses
  );
  return extracted;
}
