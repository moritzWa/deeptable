import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/utils/trpc";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Table } from "../../../server/src/types";
import { AppLayout } from "./AppLayout";

const TablePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [table, setTable] = useState<Table | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const token = localStorage.getItem("token");
  
  const { data: tablesData, refetch } = trpc.tables.getTables.useQuery(
    { token: token || "" },
    { 
      enabled: !!token,
      onSuccess: (data) => {
        const foundTable = data.find(t => t.id === id);
        if (foundTable) {
          setTable(foundTable);
        } else {
          setError("Table not found");
        }
        setLoading(false);
      },
      onError: (err) => {
        setError(err.message || "Failed to load table");
        setLoading(false);
      }
    }
  );

  // This effect will run whenever the id parameter changes
  useEffect(() => {
    setLoading(true);
    setError("");
    
    if (tablesData) {
      const foundTable = tablesData.find(t => t.id === id);
      if (foundTable) {
        setTable(foundTable);
      } else {
        setError("Table not found");
      }
      setLoading(false);
    } else if (token) {
      refetch();
    }
  }, [id, tablesData, token, refetch]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">Loading table data...</div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="max-w-4xl">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-red-500">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{error}</p>
              <Button 
                onClick={() => navigate("/home")} 
                className="mt-4"
              >
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (!table) {
    return (
      <AppLayout>
        <div className="max-w-4xl">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Table Not Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p>The requested table could not be found.</p>
              <Button 
                onClick={() => navigate("/home")} 
                className="mt-4"
              >
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{table.name}</h1>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Table Information</CardTitle>
            <CardDescription>
              {table.description || "No description provided"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Columns</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {table.columns.map((column, index) => (
                    <div key={index} className="bg-muted p-2 rounded text-sm">
                      {column.name}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Created: {new Date(table.createdAt).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Last updated: {new Date(table.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default TablePage; 