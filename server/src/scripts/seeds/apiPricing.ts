import { Column } from '@shared/types';
import { Row } from '../../models/row';
import { Table } from '../../models/table';

export const apiPricingColumns: Column[] = [
  { name: 'company', type: 'text', required: true },
  { name: 'product name', type: 'text', required: false },
  { name: 'pricing info link', type: 'link', required: false },
  { name: 'api docs', type: 'link', required: false },
  { name: 'USD price per 1k request', type: 'number', required: true },
  { name: 'Note', type: 'text', required: false },
];

export const apiPricingData = [
  {
    company: 'Exa.AI',
    'product name': 'Exa AI API',
    'pricing info link': 'https://exa.ai/pricing?tab=api',
    'api docs': 'https://docs.exa.ai/reference/getting-started',
    'USD price per 1k request': 2.5,
    Note: 'AI auto decides search type, higher latency. Get started with $10 in free credits. Discounts for startups and education are available - contact them.',
  },
  {
    company: 'Google',
    'product name': 'Google Gemini API',
    'pricing info link': 'https://ai.google.dev/gemini-api/docs/pricing',
    'api docs': 'https://ai.google.dev/gemini-api/docs',
    'USD price per 1k request': 35,
    Note: 'For "Grounding with Google Search" functionality.',
  },
  {
    company: 'Google',
    'product name': 'Google Vertex AI Search (Standard)',
    'pricing info link':
      'https://cloud.google.com/generative-ai-app-builder/pricing#enterprise_pricing',
    'api docs': 'Google Vertex AI Docs',
    'USD price per 1k request': 2,
    Note: '$4 per 1k with LLM Add-On and $10 per 1k with Advanced',
  },
  {
    company: 'Perplexity',
    'product name': 'Sonar',
    'pricing info link': 'https://docs.perplexity.ai/guides/pricing',
    'api docs': 'Perplexity API Docs',
    'USD price per 1k request': 8,
    Note: '',
  },
  {
    company: 'Perplexity',
    'product name': 'Sonar Pro',
    'pricing info link': 'https://docs.perplexity.ai/guides/pricing',
    'api docs': 'Perplexity API Docs',
    'USD price per 1k request': 10,
    Note: '',
  },
  {
    company: 'Perplexity',
    'product name': 'Sonar Reasoning',
    'pricing info link': 'https://docs.perplexity.ai/guides/pricing',
    'api docs': 'Perplexity API Docs',
    'USD price per 1k request': 8,
    Note: '',
  },
  {
    company: 'Perplexity',
    'product name': 'Sonar Reasoning Pro',
    'pricing info link': 'https://docs.perplexity.ai/guides/pricing',
    'api docs': 'Perplexity API Docs',
    'USD price per 1k request': 10,
    Note: '',
  },
  {
    company: 'OpenAI',
    'product name': 'Open AI Agents',
    'pricing info link': 'https://platform.openai.com/docs/pricing',
    'api docs': 'OpenAI API Docs',
    'USD price per 1k request': 2.5,
    Note: '$2.50 per million tokens, each query + response is ~1k tokens',
  },
  {
    company: 'Bing Search',
    'product name': 'Bing Search API',
    'pricing info link': 'https://www.microsoft.com/en-us/bing/apis/pricing',
    'api docs': 'https://learn.microsoft.com/en-us/bing/search-apis/bing-web-search/',
    'USD price per 1k request': 1,
    Note: 'not ai answering engine',
  },
];

export async function createApiPricingTable(userId: string) {
  // Create the table with columns
  const apiPricingTable = await Table.create({
    name: 'Search AI API Pricing',
    description: 'Comparison of pricing for various Search AI APIs',
    columns: apiPricingColumns,
    userId,
  });

  // Create rows
  const rowPromises = apiPricingData.map((data) => {
    return Row.create({
      tableId: apiPricingTable._id,
      data,
      userId,
    });
  });

  await Promise.all(rowPromises);

  return apiPricingTable;
}
