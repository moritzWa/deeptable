import { Column } from '@shared/types';
import Papa, { ParseResult } from 'papaparse';

export interface CSVParseResult {
  columns: Column[];
  rows: Record<string, any>[];
  name: string;
  description: string;
}

export const parseCSVFile = (file: File): Promise<CSVParseResult> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results: ParseResult<Record<string, any>>) => {
        // Generate columns from headers
        const columns: Column[] = Object.keys(results.data[0] || {}).map((header) => ({
          columnId: crypto.randomUUID(), // Use browser's crypto
          name: header,
          type: 'text', // Default to text, can be enhanced with type detection
          description: `Data from column: ${header}`,
          required: false,
        }));

        // Generate name and description
        const name = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
        const description = `Table generated from CSV file: ${file.name}`;

        resolve({
          columns,
          rows: results.data,
          name,
          description,
        });
      },
      error: (error: Error) => {
        reject(error);
      },
    });
  });
};
