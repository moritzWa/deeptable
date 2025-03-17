import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSidebar } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { trpc } from "@/utils/trpc";
import { Table } from "@shared/types";
import { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
// Import our custom AG Grid theme
import '@/styles/ag-grid-theme.css';
import { AgGridReact } from 'ag-grid-react';
import { Info } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "./AppLayout";
import { SidebarTrigger } from './ui/sidebar';

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
  const sidebar = useSidebar();
  const { theme } = useTheme();
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
      <div className="w-full">
        <div className="mb-3 p-2 flex items-center justify-start gap-2">
          {!sidebar.open && (
            <SidebarTrigger className="h-8 w-8" />
          )}
          <div className="font-semibold flex items-center gap-2">
            {table.name}
            {table.description && !sidebar.open && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-gray-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{table.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
            <div 
              className="ag-theme-alpine" 
              style={{ height: '500px', width: '100%' }}
            >
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
      </div>
    </AppLayout>
  );
};

export default TablePage; 