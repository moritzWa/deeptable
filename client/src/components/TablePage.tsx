import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/utils/trpc";
import { Table } from "@shared/types";
import { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { AgGridReact } from 'ag-grid-react';
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "./AppLayout";

// Define the Row interface
interface Row {
  id: string;
  tableId: string;
  data: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

const TablePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [table, setTable] = useState<Table | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rowData, setRowData] = useState<any[]>([]);
  const [columnDefs, setColumnDefs] = useState<ColDef[]>([]);
  
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

  // Fetch rows data
  const { data: rowsData, isLoading: rowsLoading } = trpc.rows.getRows.useQuery(
    { token: token || "", tableId: id || "" },
    { 
      enabled: !!token && !!id,
      onError: (err) => {
        console.error("Failed to load rows:", err);
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

  // Set up AG Grid column definitions based on table columns
  useEffect(() => {
    if (table && table.columns) {
      const agGridColumns: ColDef[] = table.columns.map(column => ({
        headerName: column.name,
        field: `data.${column.name}`,
        sortable: true,
        filter: true,
        resizable: true
      }));
      
      // Add ID column
      agGridColumns.unshift({
        headerName: 'ID',
        field: 'id',
        sortable: true,
        filter: true,
        width: 100,
        resizable: true
      });
      
      setColumnDefs(agGridColumns);
    }
  }, [table]);

  // Process row data for AG Grid
  useEffect(() => {
    if (rowsData && rowsData.rows) {
      setRowData(rowsData.rows);
    }
  }, [rowsData]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  // AG Grid default column definition
  const defaultColDef = useMemo(() => ({
    flex: 1,
    minWidth: 100,
    resizable: true,
    sortable: true,
    filter: true,
  }), []);

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
      <div className="max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{table.name}</h1>
          {table.description && (
            <p className="mt-2 text-gray-600">{table.description}</p>
          )}
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

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Table Data</CardTitle>
            <CardDescription>
              {rowsLoading ? "Loading data..." : `${rowData.length} rows found`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="ag-theme-alpine w-full" style={{ height: '500px' }}>
              <AgGridReact
                rowData={rowData}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                pagination={true}
                paginationPageSize={10}
                animateRows={true}
                rowSelection="multiple"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default TablePage; 