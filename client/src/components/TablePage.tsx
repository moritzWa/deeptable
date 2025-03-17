import { smartCellRenderer } from "@/components/ui/CustomCellRenderers";
import { useSidebar } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { trpc } from "@/utils/trpc";
import { ColumnState, Table } from "@shared/types";
import { CellValueChangedEvent, ColDef, ColumnMovedEvent, ColumnPinnedEvent, ColumnResizedEvent, ColumnVisibleEvent, GridReadyEvent, SortChangedEvent } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
// Import our custom AG Grid theme
import { CustomColumnHeader } from "@/components/ui/CustomColumnHeader";
import '@/styles/ag-grid-theme.css';
import { AgGridReact } from 'ag-grid-react';
import { Info } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "./AppLayout";
import { TablePageError } from './TablePageError';
import { SidebarTrigger } from './ui/sidebar';

// Debounce function to limit the frequency of calls
const debounce = (func: Function, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return function(...args: any[]) {
    clearTimeout(timeoutId);
    
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

// Type definition for AG Grid column state
interface AgGridColumnState {
  colId: string;
  width?: number;
  hide?: boolean;
  pinned?: 'left' | 'right' | null;
  sort?: 'asc' | 'desc' | null;
  sortIndex?: number | null;
  flex?: number | null;
  rowGroup?: boolean;
  rowGroupIndex?: number;
  pivot?: boolean;
  pivotIndex?: number;
}

// Helper function to convert null to undefined for AG Grid compatibility
function nullToUndefined<T>(value: T | null): T | undefined {
  return value === null ? undefined : value;
}

const TablePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const sidebar = useSidebar();
  const [table, setTable] = useState<Table | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rowData, setRowData] = useState<any[]>([]);
  const [columnDefs, setColumnDefs] = useState<ColDef[]>([]);
  
  // Reference to the AG Grid API
  const gridRef = useRef<AgGridReact>(null);
  
  const token = localStorage.getItem("token");
  const utils = trpc.useContext();
  
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

  // Update row mutation
  const updateRowMutation = trpc.rows.updateRow.useMutation({
    onSuccess: () => {
      // Refetch rows after successful update
      if (token && id) {
        utils.rows.getRows.invalidate({ token, tableId: id });
      }
    },
    onError: (error) => {
      console.error("Failed to update row:", error);
      // You could add a toast notification here
    }
  });

  // Mutation for updating column state
  const updateColumnStateMutation = trpc.tables.updateColumnState.useMutation({
    onSuccess: () => {
      console.log("Column state updated successfully");
      // Force refetch to get updated column state
      refetch();
    },
    onError: (error) => {
      console.error("Failed to update column state:", error);
    }
  });

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
      // Only log the Restaurant Name column state      
      
      const agGridColumns: ColDef[] = table.columns.map(column => {
        // Create state with nulls converted to undefined
        const columnStateProps: any = {};
        
        if (column.columnState) {
          // Add width if defined (takes precedence over flex)
          if (column.columnState.width !== undefined && column.columnState.width !== null) {
            columnStateProps.width = column.columnState.width;
            // When width is set, don't set flex to avoid conflicts
          } else if (column.columnState.flex !== undefined && column.columnState.flex !== null) {
            // Only use flex if width is not defined
            columnStateProps.flex = column.columnState.flex;
          }
          
          // Add other properties
          if (column.columnState.hide !== undefined && column.columnState.hide !== null) {
            columnStateProps.hide = column.columnState.hide;
          }
          
          if (column.columnState.pinned !== null) {
            columnStateProps.pinned = column.columnState.pinned;
          }
          
          if (column.columnState.sort !== null) {
            columnStateProps.sort = column.columnState.sort;
          }
          
          if (column.columnState.sortIndex !== null) {
            columnStateProps.sortIndex = column.columnState.sortIndex;
          }
        }
      
        const colDef: ColDef = {
          headerName: column.name,
          field: `data.${column.name}`,
          sortable: true,
          filter: true,
          resizable: true,
          editable: true, // Enable editing for all columns
          cellRenderer: smartCellRenderer, // Use our smart renderer for all cells
          // Add any column state from saved state
          ...columnStateProps,
          // Store the original column name for mapping back to our data model
          colId: column.name
        };
        
        return colDef;
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

  // Create context object for AG Grid
  const gridContext = useMemo(() => ({
    tableId: id,
    updateColumnState: (columnStates: { name: string; columnState: ColumnState }[]) => {
      if (!token) return;
      updateColumnStateMutation.mutate({
        token,
        tableId: id || "",
        columnStates
      });
    }
  }), [id, token, updateColumnStateMutation]);

  // AG Grid default column definition
  const defaultColDef = useMemo(() => ({
    minWidth: 100,
    resizable: true,
    sortable: true,
    filter: true,
    editable: true,
    headerComponent: CustomColumnHeader
  }), []);

  // Handle cell value changes
  const onCellValueChanged = (event: CellValueChangedEvent) => {
    const { data, colDef } = event;
    if (!data.id || !colDef.field) return;
    
    // Extract the field name from the path (e.g., 'data.name' -> 'name')
    const fieldName = colDef.field.replace('data.', '');
    
    // Create updated data object
    const updatedData = { ...data.data };
    updatedData[fieldName] = event.newValue;
    
    // Call the update mutation
    updateRowMutation.mutate({
      token: token || "",
      id: data.id,
      data: updatedData
    });
  };

  // Handler for grid ready event to store the grid API reference
  const onGridReady = useCallback((params: GridReadyEvent) => {
    console.log("Grid is ready");
    
    // If we have column state stored in the table, apply it after grid initialization
    if (table?.columns && table.columns.some(col => col.columnState)) {
      // Wait for the grid to be fully initialized before attempting to apply column state
      setTimeout(() => {
        if (!gridRef.current?.columnApi) return;

        console.log("Applying saved column state");
        
        // Collect all column states from the table
        const savedColumnStates = table.columns
          .filter(col => col.columnState)
          .map(col => {
            const colState = col.columnState!;
            
            // Only include either width or flex to avoid conflicts
            const stateToApply: any = {
              colId: col.name,
              hide: nullToUndefined(colState.hide),
              pinned: colState.pinned === null ? undefined : colState.pinned,
              sort: colState.sort === null ? undefined : colState.sort,
              sortIndex: nullToUndefined(colState.sortIndex)
            };
            
            // Prioritize width over flex
            if (colState.width !== undefined && colState.width !== null) {
              stateToApply.width = colState.width;
              // Don't include flex when width is present
            } else if (colState.flex !== undefined && colState.flex !== null) {
              stateToApply.flex = colState.flex;
            }
            
            return stateToApply;
          });
        
        // Only log the Restaurant Name column state      
        if (savedColumnStates.length > 0 && gridRef.current?.columnApi) {
          try {
            // Apply the saved column state directly to AG Grid
            gridRef.current.columnApi.applyColumnState({
              state: savedColumnStates,
              applyOrder: true
            });
            
            // Force the grid to refresh after applying column state
            gridRef.current.api.refreshHeader();
            
            // Log the current state of the Restaurant Name column
          } catch (error) { 
            console.error("Error applying column state:", error);
          }
        }
      }, 200);
    }
  }, [table?.columns]);

  // Function to get and process column state changes
  const processColumnStateChange = useCallback(() => {
    if (!gridRef.current?.api || !gridRef.current?.columnApi || !table?.id || !token) return;
    
    // Use columnApi to get column state
    const columnState = gridRef.current.columnApi.getColumnState() as AgGridColumnState[];
    
    // Get the current columns for comparison
    const currentColumns = table.columns;
    
    // Map the column state to our data structure
    const columnStates = columnState.map((state: AgGridColumnState) => {
      // Find the original column to map the colId
      const columnName = state.colId;
      const currentColumn = currentColumns.find(col => col.name === columnName);
      
      // Manage width and flex properly to avoid conflicts
      // If width is set, don't include flex
      const newColumnState: ColumnState = {
        colId: state.colId,
        hide: state.hide,
        pinned: state.pinned,
        sort: state.sort,
        sortIndex: state.sortIndex
      };
      
      // Prioritize width over flex
      if (state.width !== undefined && state.width !== null) {
        newColumnState.width = state.width;
        // Don't set flex when width is present
        // Don't assign flex at all rather than setting to null
      } else if (state.flex !== undefined && state.flex !== null) {
        newColumnState.flex = state.flex;
        // Don't set width when flex is present
        // Don't assign width at all rather than setting to null
      }
      
      // Only log for Restaurant Name column
      if (columnName === 'Restaurant Name' && currentColumn) {
        console.log(`Restaurant Name column state changes:`, {
          before: currentColumn.columnState,
          after: newColumnState,
          width: {
            before: currentColumn.columnState?.width,
            after: newColumnState.width
          }
        });
      }
      
      return {
        name: columnName,
        columnState: newColumnState
      };
    });
    
    // Only log the Restaurant Name column state being sent
    const restaurantNameToSend = columnStates.find(s => s.name === 'Restaurant Name');
    if (restaurantNameToSend) {
      console.log("Sending Restaurant Name column state to server:", restaurantNameToSend);
    }
    
    updateColumnStateMutation.mutate({
      token,
      tableId: table.id,
      columnStates
    });
    
  }, [table?.id, table?.columns, token, updateColumnStateMutation]);
  
  // Create a debounced version of the state change processor
  const debouncedProcessColumnStateChange = useMemo(
    () => debounce(processColumnStateChange, 300),
    [processColumnStateChange]
  );

  // Handler for column resized event
  const onColumnResized = useCallback((event: ColumnResizedEvent) => {
    // Only log for Restaurant Name column
    if (event.column && event.column.getColId() === 'Restaurant Name') {
      console.log("Restaurant Name column resized:", {
        width: event.column.getActualWidth(),
        finished: event.finished
      });
    }
    
    if (event.finished) {
      debouncedProcessColumnStateChange();
    }
  }, [debouncedProcessColumnStateChange]);

  // Handler for column moved event
  const onColumnMoved = useCallback((event: ColumnMovedEvent) => {
    debouncedProcessColumnStateChange();
  }, [debouncedProcessColumnStateChange]);

  // Handler for column visibility change
  const onColumnVisible = useCallback((event: ColumnVisibleEvent) => {
    debouncedProcessColumnStateChange();
  }, [debouncedProcessColumnStateChange]);

  // Handler for column pinned state change
  const onColumnPinned = useCallback((event: ColumnPinnedEvent) => {
    debouncedProcessColumnStateChange();
  }, [debouncedProcessColumnStateChange]);

  // Handler for sort changed event
  const onSortChanged = useCallback((event: SortChangedEvent) => {
    debouncedProcessColumnStateChange();
  }, [debouncedProcessColumnStateChange]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">Loading table data...</div>
      </AppLayout>
    );
  }

  if (error) {
    return (
     <TablePageError error={error} />
    );
  } 
  if (!table) {
    return (
     <TablePageError error="Table not found" />
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
                ref={gridRef}
                rowData={rowData}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                pagination={false}
                animateRows={true}
                rowSelection="multiple"
                onCellValueChanged={onCellValueChanged}
                stopEditingWhenCellsLoseFocus={true}
                onGridReady={onGridReady}
                onColumnResized={onColumnResized}
                onColumnMoved={onColumnMoved}
                onColumnVisible={onColumnVisible}
                onColumnPinned={onColumnPinned}
                onSortChanged={onSortChanged}
                context={gridContext}
              />
            </div>
      </div>
    </AppLayout>
  );
};

export default TablePage; 