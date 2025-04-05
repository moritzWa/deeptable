import { Table } from '@shared/types';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { trpc } from '../utils/trpc';
import { AppLayout } from './AppLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';

export default function HomePage() {
  const navigate = useNavigate();
  const [tables, setTables] = useState<Table[]>([]);
  const token = localStorage.getItem('accessToken');

  const { data: tablesData } = trpc.tables.getTables.useQuery(
    { token: token || '' },
    { enabled: !!token }
  );

  useEffect(() => {
    if (tablesData) {
      setTables(tablesData);
    }
  }, [tablesData]);

  return (
    <AppLayout>
      <div className="space-y-6 m-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome to Deep Table</h1>
          <p className="mt-2 text-gray-600">
            Select a table below or create a new one to get started.
          </p>
        </div>

        {tables.length === 0 ? (
          <div className="mt-8 p-6 border rounded-lg bg-muted/50">
            <h2 className="text-xl font-semibold mb-2">No tables yet</h2>
            <p className="mb-4">Create your first research table to get started.</p>
            <button
              onClick={() => navigate('/new')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Create a Table
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tables.map((table) => (
              <Card
                key={table.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/tables/${table.id}`)}
              >
                <CardHeader>
                  <CardTitle>{table.name}</CardTitle>
                  <CardDescription>
                    {table.description || 'No description provided'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{table.columns.length} columns</p>
                </CardContent>
                <CardFooter>
                  <p className="text-xs text-muted-foreground">
                    Created: {new Date(table.createdAt).toLocaleDateString()}
                  </p>
                  {table.sharingStatus === 'public' && (
                    <a
                      href={`/t/${table.slug}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs text-blue-500 hover:text-blue-700 ml-auto"
                    >
                      Public Link ↗
                    </a>
                  )}
                </CardFooter>
              </Card>
            ))}

            <Card
              className="cursor-pointer hover:shadow-md transition-shadow border-dashed flex flex-col items-center justify-center p-6"
              onClick={() => navigate('/new')}
            >
              <div className="rounded-full bg-muted p-3 mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <path d="M5 12h14"></path>
                  <path d="M12 5v14"></path>
                </svg>
              </div>
              <p className="font-medium">Create New Table</p>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
