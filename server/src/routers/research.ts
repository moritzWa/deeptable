import OpenAI from 'openai';
import { z } from 'zod';
import { publicProcedure, router } from '../index';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the system prompt for column generation
const SYSTEM_PROMPT = `You are an AI assistant that helps generate relevant columns for research tables.
Your task is to analyze a search query and generate a set of columns that would be useful for a research report table.
The columns should be relevant to the query and help users make informed decisions.
Return only the column names as a comma-separated list without any additional text or explanation.`;

// Example for the model to understand the expected output format
const EXAMPLE_PROMPT = `
Example:
Query: "good scooter for SF"
Output: Scooter Model, Motor Power, Max Speed, Range, Hill Climbing Ability, Key Features, Image
`;

// Define response types
interface SuccessResponse {
  success: true;
  columns: string[];
}

interface ErrorResponse {
  success: false;
  error: string;
}

type GenerateColumnsResponse = SuccessResponse | ErrorResponse;

export const researchRouter = router({
  generateColumns: publicProcedure
    .input(z.object({ 
      prompt: z.string().min(1).max(500),
    }))
    .mutation(async ({ input }): Promise<GenerateColumnsResponse> => {
      try {
        // Construct the prompt for the OpenAI API
        const userPrompt = `Based on this search query: "${input.prompt}", generate a set of columns the user would care about as part of a research report table.`;
        
        // Call the OpenAI API
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo", // You can use "gpt-4" for better results if available
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: EXAMPLE_PROMPT },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 150,
        });

        // Extract the generated columns from the response
        const columnsText = response.choices[0]?.message?.content?.trim() || "";
        
        // Split the comma-separated list into an array
        const columns = columnsText.split(',').map((col: string) => col.trim());
        
        return {
          success: true,
          columns: columns,
        };
      } catch (error) {
        console.error('Error generating columns:', error);
        return {
          success: false,
          error: 'Failed to generate columns. Please try again.',
        };
      }
    }),
}); 