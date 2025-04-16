import { ColumnType } from '@shared/types';
import { randomUUID } from 'crypto';
import fs from 'fs';
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

interface SelectItem {
  id: string;
  name: string;
  color: string;
}

interface ProcessSelectValueResult {
  finalValues: string | string[];
  updatedSelectItems?: SelectItem[];
}

// Add a new interface for the enriched response
interface EnrichedResponse {
  result: any;
  metadata: {
    reasoningSteps: string[];
    sources: string[];
  };
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
  }).then(async (res) => {
    const txt = await res.text();
    // console.log('txt', txt);
    return JSON.parse(txt) as PerplexityResponse;
  });

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
    console.error('bad completion', completion);
    throw new Error('Invalid response from Google API');
  }

  // console.log('completion', completion);
  return completion.candidates[0].content.parts.map((part: GooglePart) => part.text).join('\n');
}

/**
 * Converts a ColumnType string to a JSON schema for OpenAI API
 * Always creates an object schema with a 'result' field of the requested type
 */
function columnTypeToJsonSchema(
  columnType: ColumnType,
  additionalTypeInformation?: { selectItems?: Array<{ id: string; name: string; color: string }> }
): Record<string, unknown> {
  let resultSchema: Record<string, unknown>;

  switch (columnType) {
    case 'text':
      resultSchema = { type: 'string' };
      break;
    case 'number':
      resultSchema = { type: 'number' };
      break;
    case 'link':
      resultSchema = { type: 'string' }; // TODO: add format: 'uri'
      break;
    case 'select':
      resultSchema = {
        type: 'string',
        description: additionalTypeInformation?.selectItems
          ? `Choose from existing options: ${additionalTypeInformation.selectItems
              .map((item) => item.name)
              .join(', ')}. If none match, suggest a new one.`
          : 'Suggest a category',
      };
      break;
    case 'multiSelect':
      resultSchema = {
        type: 'array',
        items: { type: 'string' },
        description: additionalTypeInformation?.selectItems
          ? `Choose from existing options: ${additionalTypeInformation.selectItems
              .map((item) => item.name)
              .join(', ')}. If none match, suggest new ones.`
          : 'Suggest one or more categories',
      };
      break;
  }

  // Wrap in an object schema with a result field
  return {
    type: 'object',
    properties: {
      result: resultSchema,
    },
    additionalProperties: false,
    required: ['result'],
  };
}

async function getFinalAnswer(
  tableName: string,
  columnName: string,
  columnDescription: string,
  outputType: Record<string, unknown>,
  searchResponses: Array<{ response: string; provider: string }>
): Promise<EnrichedResponse> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const SYSTEM_PROMPT = `You are in a data pipeline whose goal is to fill out a spreadsheet for a user's query. You will be given their query, a column, an output type, and multiple search responses from different providers.

Extract the right information from the search responses and return it in the correct format. Consider the quality and credibility of the information sources, the consistency across responses, and the reasoning provided. When sources disagree, make a judgment based on credibility and recency of information.

Your response should include:
1. The final result in the specified format
2. The reasoning steps taken to arrive at this result
3. The sources used to derive this information - IMPORTANT: Extract any URLs/links from the responses and include them as sources. If a response contains multiple links, include all of them.

Format your response as a JSON object with these fields.`;

  // Serialize the responses as JSON
  const searchResponsesJson = JSON.stringify(searchResponses, null, 2);
  const serializedOutputType = JSON.stringify(outputType, null, 2);

  const question = `Table: ${tableName}\nColumn: ${columnName}\nColumn Description: ${columnDescription}\nOutput type: ${serializedOutputType}\n \nSearch Responses:\n${searchResponsesJson}`;

  // log col type
  console.log('columnName', columnName);

  const completion = await openai.responses.create({
    model: 'gpt-4o-2024-08-06',
    input: [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: question,
      },
    ],
    text: {
      format: {
        type: 'json_schema',
        name: 'output',
        schema: {
          type: 'object',
          properties: {
            result: outputType,
            metadata: {
              type: 'object',
              properties: {
                reasoningSteps: {
                  type: 'array',
                  items: { type: 'string' },
                },
                sources: {
                  type: 'array',
                  items: {
                    type: 'string',
                    description: 'URLs or links from the search responses',
                  },
                },
              },
              required: ['reasoningSteps', 'sources'],
              additionalProperties: false,
            },
          },
          required: ['result', 'metadata'],
          additionalProperties: false,
        },
        strict: true,
      },
    },
  });

  const message = completion.output_text;
  if (!message) {
    throw new Error('No message');
  }

  try {
    const parsed = JSON.parse(message.trim());
    return {
      result: parsed.result.result,
      metadata: parsed.metadata,
    };
  } catch (error) {
    console.error('Error parsing model response:', error, 'message', message);
    throw error;
  }
}

// Function to append data to test.txt
function appendToTestFile(data: string) {
  fs.appendFileSync('test.txt', data + '\n\n', 'utf8');
}

export async function processSelectTypeValue(
  llmResults: string | string[],
  columnType: 'select' | 'multiSelect',
  existingSelectItems: SelectItem[] = []
): Promise<ProcessSelectValueResult> {
  // Convert single value to array for consistent handling
  const llmSuggestedValues = Array.isArray(llmResults) ? llmResults : [llmResults];

  // Find which values from LLM don't exist in our current options
  const valuesToAddAsNewSelectOptions = llmSuggestedValues.filter(
    (suggestedValue) =>
      !existingSelectItems.some(
        (existingOption) => existingOption.name.toLowerCase() === suggestedValue.toLowerCase()
      )
  );

  if (valuesToAddAsNewSelectOptions.length > 0) {
    // Create updated select options list with both old and new items
    const updatedSelectItems = [
      ...existingSelectItems,
      ...valuesToAddAsNewSelectOptions.map((newOptionName) => ({
        id: randomUUID(), // You'll need to import randomUUID from 'crypto'
        name: newOptionName,
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      })),
    ];

    // For each LLM suggested value, find its exact match in our select options
    const cellValuesWithCorrectCasing = llmSuggestedValues.map(
      (suggestedValue) =>
        updatedSelectItems.find(
          (option) => option.name.toLowerCase() === suggestedValue.toLowerCase()
        )?.name || suggestedValue
    );

    return {
      finalValues:
        columnType === 'select' ? cellValuesWithCorrectCasing[0] : cellValuesWithCorrectCasing,
      updatedSelectItems,
    };
  }

  // If no new items needed, just return the existing values with correct casing
  const cellValuesWithCorrectCasing = llmSuggestedValues.map(
    (suggestedValue) =>
      existingSelectItems.find(
        (option) => option.name.toLowerCase() === suggestedValue.toLowerCase()
      )?.name || suggestedValue
  );

  return {
    finalValues:
      columnType === 'select' ? cellValuesWithCorrectCasing[0] : cellValuesWithCorrectCasing,
  };
}

export async function fillCell(
  tableName: string,
  tableDescription: string,
  columnName: string,
  columnDescription: string,
  outputType: ColumnType,
  rows: Array<{ data: Record<string, any> }>,
  additionalTypeInformation?: {
    selectItems?: Array<{ id: string; name: string; color: string }>;
  }
) {
  const question = `The user is making a spreadsheet called "${tableName}". ${
    tableDescription ? `Purpose of the table: ${tableDescription}. ` : ''
  }They want to fill out the "${columnName}" column${
    columnDescription ? ` (${columnDescription})` : ''
  }. The column type is ${outputType}.
  
  ${
    (outputType === 'select' || outputType === 'multiSelect') &&
    additionalTypeInformation?.selectItems
      ? `Available options are: ${additionalTypeInformation.selectItems
          .map((item) => item.name)
          .join(
            ', '
          )}. Consider these existing options (your desired output might already exist). If none match, output a new option.`
      : ''
  }
  
  Here is the existing row data: ${rows.map((row) => JSON.stringify(row.data)).join('\n')}
  
  Help fill in this cell based on the existing row data.`;

  const providers = [
    {
      name: 'OpenAI',
      fn: askOpenAI,
    },
    // {
    //   name: 'Perplexity',
    //   fn: askPerplexity,
    // },
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
  console.log(
    'Search results collected from all providers',
    JSON.stringify(searchResponses, null, 2)
  );

  // Append search results to test.txt
  const logData = `
Table: ${tableName}
Column: ${columnName}
Description: ${columnDescription}
Type: ${outputType}
Row Data: ${JSON.stringify(rows, null, 2)}
Search Responses: ${JSON.stringify(searchResponses, null, 2)}
---------------------------------------------
`;
  appendToTestFile(logData);

  const jsonSchema = columnTypeToJsonSchema(outputType);

  const extracted = await getFinalAnswer(
    tableName,
    columnName,
    columnDescription,
    jsonSchema,
    searchResponses
  );
  return extracted;
}
