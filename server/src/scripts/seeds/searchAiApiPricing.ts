import { Column } from '@shared/types';
import { randomUUID } from 'crypto';
import slugify from 'slugify';
import { Row } from '../../models/row';
import { Table } from '../../models/table';

export const apiPricingColumns: Column[] = [
  {
    columnId: randomUUID(),
    name: 'company',
    type: 'text',
    description: 'Company providing the API service',
  },
  {
    columnId: randomUUID(),
    name: 'product name',
    type: 'text',
    description: 'Name of the specific API product',
  },
  {
    columnId: randomUUID(),
    name: 'pricing info link',
    type: 'link',
    description: 'Link to official pricing information',
  },
  {
    columnId: randomUUID(),
    name: 'api docs',
    type: 'link',
    description: 'Link to API documentation',
  },
  {
    columnId: randomUUID(),
    name: 'USD price per 1k request',
    type: 'number',
    description: 'Cost in USD per 1,000 API requests',
  },
  {
    columnId: randomUUID(),
    name: 'Note',
    type: 'text',
    description: 'Additional information or special conditions',
  },
];

// Create a mapping of column names to column IDs for data transformation
const columnNameToId = Object.fromEntries(apiPricingColumns.map((col) => [col.name, col.columnId]));

// Transform the API pricing data to use column IDs instead of names
export const apiPricingData = [
  {
    [columnNameToId['company']]: 'Exa.AI',
    [columnNameToId['product name']]: 'Exa AI API',
    [columnNameToId['pricing info link']]: 'https://exa.ai/pricing?tab=api',
    [columnNameToId['api docs']]: 'https://docs.exa.ai/reference/getting-started',
    [columnNameToId['USD price per 1k request']]: 2.5,
    [columnNameToId['Note']]:
      'AI auto decides search type, higher latency. Get started with $10 in free credits. Discounts for startups and education are available - contact them.',
  },
  {
    [columnNameToId['company']]: 'Google',
    [columnNameToId['product name']]: 'Google Gemini API',
    [columnNameToId['pricing info link']]: 'https://ai.google.dev/gemini-api/docs/pricing',
    [columnNameToId['api docs']]: 'https://ai.google.dev/gemini-api/docs',
    [columnNameToId['USD price per 1k request']]: 35,
    [columnNameToId['Note']]: 'For "Grounding with Google Search" functionality.',
  },
  {
    [columnNameToId['company']]: 'Google',
    [columnNameToId['product name']]: 'Google Vertex AI Search (Standard)',
    [columnNameToId['pricing info link']]:
      'https://cloud.google.com/generative-ai-app-builder/pricing#enterprise_pricing',
    [columnNameToId['api docs']]: 'Google Vertex AI Docs',
    [columnNameToId['USD price per 1k request']]: 2,
    [columnNameToId['Note']]: '$4 per 1k with LLM Add-On and $10 per 1k with Advanced',
  },
  {
    [columnNameToId['company']]: 'Perplexity',
    [columnNameToId['product name']]: 'Sonar',
    [columnNameToId['pricing info link']]: 'https://docs.perplexity.ai/guides/pricing',
    [columnNameToId['api docs']]: 'Perplexity API Docs',
    [columnNameToId['USD price per 1k request']]: 8,
    [columnNameToId['Note']]: '',
  },
  {
    [columnNameToId['company']]: 'Perplexity',
    [columnNameToId['product name']]: 'Sonar Pro',
    [columnNameToId['pricing info link']]: 'https://docs.perplexity.ai/guides/pricing',
    [columnNameToId['api docs']]: 'Perplexity API Docs',
    [columnNameToId['USD price per 1k request']]: 10,
    [columnNameToId['Note']]: '',
  },
  {
    [columnNameToId['company']]: 'Perplexity',
    [columnNameToId['product name']]: 'Sonar Reasoning',
    [columnNameToId['pricing info link']]: 'https://docs.perplexity.ai/guides/pricing',
    [columnNameToId['api docs']]: 'Perplexity API Docs',
    [columnNameToId['USD price per 1k request']]: 8,
    [columnNameToId['Note']]: '',
  },
  {
    [columnNameToId['company']]: 'Perplexity',
    [columnNameToId['product name']]: 'Sonar Reasoning Pro',
    [columnNameToId['pricing info link']]: 'https://docs.perplexity.ai/guides/pricing',
    [columnNameToId['api docs']]: 'Perplexity API Docs',
    [columnNameToId['USD price per 1k request']]: 10,
    [columnNameToId['Note']]: '',
  },
  {
    [columnNameToId['company']]: 'OpenAI',
    [columnNameToId['product name']]: 'Open AI Agents',
    [columnNameToId['pricing info link']]: 'https://platform.openai.com/docs/pricing',
    [columnNameToId['api docs']]: 'OpenAI API Docs',
    [columnNameToId['USD price per 1k request']]: 2.5,
    [columnNameToId['Note']]: '$2.50 per million tokens, each query + response is ~1k tokens',
  },
  {
    [columnNameToId['company']]: 'Bing Search',
    [columnNameToId['product name']]: 'Bing Search API',
    [columnNameToId['pricing info link']]: 'https://www.microsoft.com/en-us/bing/apis/pricing',
    [columnNameToId['api docs']]:
      'https://learn.microsoft.com/en-us/bing/search-apis/bing-web-search/',
    [columnNameToId['USD price per 1k request']]: 1,
    [columnNameToId['Note']]: 'not ai answering engine',
  },
];

export async function createApiPricingTable(userId: string) {
  const name = 'Search AI API Pricing';
  // Create the table with columns
  const apiPricingTable = await Table.create({
    name,
    description: 'Comparison of pricing for various Search AI APIs',
    columns: apiPricingColumns,
    userId,
    slug: slugify(name).toLowerCase(),
  });

  const rowPromises = apiPricingData.map((data, index) => {
    return Row.create({
      tableId: apiPricingTable._id,
      data,
      userId,
      index,
    });
  });

  await Promise.all(rowPromises);

  return apiPricingTable;
}
