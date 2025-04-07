import { TableStructureEditor } from '@/components/TableStructureEditor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { parseCSVFile } from '@/utils/csvParser';
import { trpc } from '@/utils/trpc';
import { Column, Table } from '@shared/types';
import React, { KeyboardEvent, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { TableImport } from './TableImport';

// Define the expected response types to match the server
interface SuccessResponse {
  success: true;
  name: string;
  description: string;
  columns: Column[];
}

interface ErrorResponse {
  success: false;
  error: string;
}

type GenerateColumnsResponse = SuccessResponse | ErrorResponse;

const ResearchPromptPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [prompt, setPrompt] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [columns, setColumns] = useState<Column[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFromUrl, setIsFromUrl] = useState(false);
  const token = localStorage.getItem('accessToken');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedImage, setPastedImage] = useState<string | null>(null);

  // Use the tRPC mutations
  const generateColumnsMutation = trpc.columns.generateColumns.useMutation({
    onSuccess: (data: GenerateColumnsResponse) => {
      if (data.success) {
        setName(data.name);
        setDescription(data.description);
        setColumns(data.columns);
      } else {
        setError(data.error);
      }
      setIsLoading(false);
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to generate table structure. Please try again.');
      setIsLoading(false);
    },
  });

  const createTableMutation = trpc.tables.createTable.useMutation({
    onSuccess: (newTable) => {
      // Navigate to the new table's page
      navigate(`/tables/${newTable.id}`);
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to create table. Please try again.');
    },
  });

  const createTableFromCSVMutation = trpc.tables.createTableFromCSV.useMutation({
    onSuccess: (data: Table) => {
      navigate(`/tables/${data.id}`);
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to create table from CSV. Please try again.');
    },
  });

  const createTableFromJSONMutation = trpc.tables.createTableFromJSON.useMutation({
    onSuccess: (data: Table) => {
      navigate(`/tables/${data.id}`);
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to create table from JSON. Please try again.');
    },
  });

  // Parse query parameter and set prompt
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const queryParam = queryParams.get('q');

    if (queryParam) {
      setPrompt(queryParam);
      setIsFromUrl(true);
    }
  }, [location.search]);

  // Auto-submit only when prompt comes from URL
  useEffect(() => {
    if (prompt.trim() && isFromUrl && !isLoading) {
      const timer = setTimeout(() => {
        generateColumnsMutation.mutate({ prompt: prompt.trim() });
        setIsLoading(true);
        setIsFromUrl(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [prompt, isFromUrl, isLoading, generateColumnsMutation]);

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    if (isFromUrl) {
      setIsFromUrl(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
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

    generateColumnsMutation.mutate({ prompt: prompt.trim() });
  };

  const handleCreateTable = async () => {
    if (!token) {
      setError('Please log in to create a table');
      return;
    }

    if (!name.trim()) {
      setError('Please enter a table name');
      return;
    }

    if (!description.trim()) {
      setError('Please enter a table description');
      return;
    }

    try {
      await createTableMutation.mutateAsync({
        token,
        name,
        description,
        columns,
      });
    } catch (error) {
      console.error('Failed to create table:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['.csv', '.xlsx', '.xls'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

      if (!validTypes.includes(fileExtension)) {
        setError('Please upload a CSV or Excel file');
        return;
      }

      if (fileExtension === '.csv') {
        try {
          setIsLoading(true);
          const { columns, rows, name, description } = await parseCSVFile(file);

          await createTableFromCSVMutation.mutateAsync({
            token: token!,
            name,
            description,
            columns,
            rows,
          });
        } catch (error) {
          setError('Failed to process CSV file. Please try again.');
          console.error('CSV processing error:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setError('Excel file support coming soon!');
      }
    }
  };

  const handlePasteImage = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;

    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = () => {
              setPastedImage(reader.result as string);
              // TODO: Implement actual image processing
            };
            reader.readAsDataURL(blob);
          }
        }
      }
    }
  };

  const handleJSONUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    try {
      const jsonContent = await file.text();
      const jsonData = JSON.parse(jsonContent);

      // Add index to each row based on its position in the array
      if (jsonData.rows) {
        jsonData.rows = jsonData.rows.map((row: any, index: number) => ({
          ...row,
          index,
        }));
      }

      await createTableFromJSONMutation.mutateAsync({
        token,
        jsonData,
      });
    } catch (error) {
      setError("Failed to process JSON file. Please ensure it's a valid DeepTable export.");
      console.error('JSON processing error:', error);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Research Table Generator</h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Enter Your Research Query</CardTitle>
            <CardDescription>
              Describe what you want to research, and we'll generate a table structure to organize
              your data.
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
                variant={columns.length > 0 ? 'outline' : 'default'}
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Generating Structure...' : 'Generate Table Structure'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {!prompt && (
          <TableImport
            onFileUpload={handleFileUpload}
            onPasteImage={handlePasteImage}
            onJSONUpload={handleJSONUpload}
            selectedFile={selectedFile}
            pastedImage={pastedImage}
          />
        )}

        {columns.length > 0 && (
          <TableStructureEditor
            name={name}
            description={description}
            columns={columns}
            onNameChange={setName}
            onDescriptionChange={setDescription}
            onColumnsChange={setColumns}
            onCreateTable={handleCreateTable}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default ResearchPromptPage;
