import OpenAI from 'openai';
import { z } from 'zod';
import { publicProcedure, router } from '../index';

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
  "columns": ["Column1", "Column2", "Column3", ...]
}`;

// Example for the model to understand the expected output format
const EXAMPLE_PROMPT = `
Example:
Query: "good scooter for SF"
Output: {
  "name": "SF Scooter Comparison",
  "description": "Comprehensive comparison of electric scooters suitable for San Francisco's urban environment",
  "columns": ["Scooter Model", "Motor Power", "Max Speed", "Range", "Hill Climbing Ability", "Key Features", "Image"]
}`;

// Define response types
interface SuccessResponse {
  success: true;
  name: string;
  description: string;
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
    .mutation(async ({ input }) => {
      try {
        // Construct the prompt for the OpenAI API
        const userPrompt = `Based on this search query: "${input.prompt}", generate a table structure that would help organize research data about this topic.`;
        
        // Call the OpenAI API
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: EXAMPLE_PROMPT },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.2,
          max_tokens: 150,
        });

        // Extract the generated response from the API
        const responseText = response.choices[0]?.message?.content?.trim() || "";
        
        try {
          // Parse the JSON response
          const parsedResponse = JSON.parse(responseText);
          
          return {
            success: true as const,
            name: parsedResponse.name,
            description: parsedResponse.description,
            columns: parsedResponse.columns,
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
}); 