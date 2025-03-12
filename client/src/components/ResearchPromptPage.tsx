import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import React, { useState } from 'react';

const ResearchPromptPage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [columns, setColumns] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      setError('Please enter a research query');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // In a real implementation, this would call an API endpoint
      // For now, we'll simulate an API call with a timeout
      setTimeout(() => {
        // Example response for "best scooter for SF"
        if (prompt.toLowerCase().includes('scooter') && prompt.toLowerCase().includes('sf')) {
          setColumns([
            "Scooter Model", 
            "Motor Power", 
            "Max Speed", 
            "Range", 
            "Hill Climbing Ability", 
            "Key Features", 
            "Image"
          ]);
        } else {
          // Generic columns for other queries
          setColumns([
            "Product Name",
            "Price",
            "Rating",
            "Key Features",
            "Pros",
            "Cons",
            "Image"
          ]);
        }
        setIsLoading(false);
      }, 1500);
      
      // In a real implementation, you would call an LLM API like this:
      /*
      const response = await fetch('/api/generate-columns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: "based on this search query generate a set of columns the user would care about as part of a research report table: " + prompt,
          example: {
            query: "good scooter for SF",
            columns: "Scooter Model, Motor Power, Max Speed, Range, Hill Climbing Ability, Key Features, image"
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate columns');
      }

      const data = await response.json();
      setColumns(data.columns);
      setIsLoading(false);
      */
    } catch (err) {
      setError('Failed to generate columns. Please try again.');
      setIsLoading(false);
    }
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
              className="min-h-[120px]"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button 
              type="submit" 
              className="w-full bg-[#4169E1] hover:bg-[#3a5ecc]"
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
              <Button className="w-full mt-4">
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