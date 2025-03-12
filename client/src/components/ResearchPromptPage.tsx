import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/utils/trpc";
import React, { KeyboardEvent, useState } from 'react';

// Define the expected response types to match the server
interface SuccessResponse {
  success: true;
  columns: string[];
}

interface ErrorResponse {
  success: false;
  error: string;
}

type GenerateColumnsResponse = SuccessResponse | ErrorResponse;

const ResearchPromptPage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [columns, setColumns] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Use the tRPC mutation
  const generateColumnsMutation = trpc.research.generateColumns.useMutation({
    onSuccess: (data: GenerateColumnsResponse) => {
      if (data.success && 'columns' in data) {
        setColumns(data.columns);
      } else {
        setError('error' in data ? data.error : 'Failed to generate columns');
      }
      setIsLoading(false);
    },
    onError: (error) => {
      setError(error.message || 'Failed to generate columns. Please try again.');
      setIsLoading(false);
    }
  });

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit form when Enter is pressed without Shift key
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      setError('Please enter a research query');
      return;
    }

    setIsLoading(true);
    setError('');
    
    // Call the tRPC mutation
    generateColumnsMutation.mutate({ prompt: prompt.trim() });
  };

  const handleCreateTable = () => {
    // Future implementation for creating the research table
    console.log('Creating research table with columns:', columns);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Research Table Generator</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Enter Your Research Query</CardTitle>
          <CardDescription>
            Describe what you want to research, and we'll generate relevant columns for your data table.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="Example: best scooter for SF"
              value={prompt}
              onChange={handlePromptChange}
              onKeyDown={handleKeyDown}
              className="min-h-[120px]"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button 
              type="submit" 
              variant={columns.length > 0 ? "outline" : "default"}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Generating Columns...' : 'Generate Table Columns'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {columns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Table Columns</CardTitle>
            <CardDescription>
              These columns have been generated based on your research query. You can edit them below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                value={columns.join(', ')}
                onChange={(e) => setColumns(e.target.value.split(',').map(col => col.trim()))}
                className="w-full"
              />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {columns.map((column, index) => (
                  <div key={index} className="bg-muted p-2 rounded text-sm">
                    {column}
                  </div>
                ))}
              </div>
              <Button 
                variant="default"
                className="w-full mt-4"
                onClick={handleCreateTable}
              >
                Create Research Table
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ResearchPromptPage; 