import { smartCellRenderer } from "@/components/ui/CustomCellRenderers";
import { useSidebar } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { trpc } from "@/utils/trpc";
import { ColumnState, Table } from "@shared/types";
import { AllCommunityModule, CellValueChangedEvent, ColDef, ColumnMovedEvent, ColumnPinnedEvent, ColumnResizedEvent, ColumnVisibleEvent, GridReadyEvent, ModuleRegistry, SortChangedEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

// Finally our custom overrides
import '@/styles/ag-grid-theme.css';
import { Info } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "./AppLayout";
import { TablePageError } from './TablePageError';
import { CustomColumnHeader } from './ui/CustomColumnHeader';
import { SidebarTrigger } from './ui/sidebar';

// Register required modules
ModuleRegistry.registerModules([AllCommunityModule]);

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
  const { data: rowsData } = trpc.rows.getRows.useQuery(
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

  // Add mutation for adding columns
  const addColumnMutation = trpc.tables.addColumn.useMutation({
    onSuccess: () => {
      // Refetch table data after successful column addition
      refetch();
    },
    onError: (error) => {
      console.error("Failed to add column:", error.message);
    }
  });

  // Add mutation for deleting columns
  const deleteColumnMutation = trpc.tables.deleteColumn.useMutation({
    onSuccess: () => {
      // Refetch table data after successful column deletion
      refetch();
    },
    onError: (error) => {
      console.error("Failed to delete column:", error.message);
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

  // Process row data for AG Grid
  useEffect(() => {
    if (rowsData && rowsData.rows) {
      console.log('Setting row data:', rowsData.rows);
      setRowData(rowsData.rows);
    }
  }, [rowsData]);

  // Add flags to track state
  const isApplyingState = useRef(false);
  const hasAppliedInitialState = useRef(false);
  
  const processColumnStateChange = useCallback(() => {
    if (!gridRef.current?.api || !table?.id || !token) return;
    
    // Use api to get column state
    const columnState = gridRef.current.api.getColumnState() as AgGridColumnState[];
    
    // Map the column state to our data structure
    const columnStates = columnState.map((state: AgGridColumnState, index: number) => ({
      name: state.colId,
      columnState: {
        colId: state.colId,
        hide: state.hide,
        pinned: state.pinned,
        sort: state.sort,
        sortIndex: index,
        width: state.width,
        flex: index
      }
    }));
    
    updateColumnStateMutation.mutate({
      token,
      tableId: table.id,
      columnStates
    });
    
  }, [table?.id, token, updateColumnStateMutation]);

  // Create a debounced version of the state change processor
  const debouncedProcessColumnStateChange = useMemo(
    () => debounce(processColumnStateChange, 300),
    [processColumnStateChange]
  );

  // Set up AG Grid column definitions based on table columns
  useEffect(() => {
    if (table && table.columns) {
      // Don't set up columns until we've applied the initial state
      if (!hasAppliedInitialState.current) {
        return;
      }
      
      // Sort columns by their sortIndex value
      const sortedColumns = [...table.columns].sort((a, b) => {
        const orderA = a.columnState?.sortIndex ?? Number.MAX_SAFE_INTEGER;
        const orderB = b.columnState?.sortIndex ?? Number.MAX_SAFE_INTEGER;
        return orderA - orderB;
      });

      const agGridColumns: ColDef[] = sortedColumns.map(column => {
        const columnStateProps: any = {};
        
        if (column.columnState) {
          if (column.columnState.width !== undefined && column.columnState.width !== null) {
            columnStateProps.width = column.columnState.width;
          }
          
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
          
          // Keep flex value for width flexibility
          if (column.columnState.flex !== null && column.columnState.flex !== undefined) {
            columnStateProps.flex = column.columnState.flex;
          }
        }
      
        const colDef: ColDef = {
          headerName: column.name,
          field: `data.${column.name}`,
          sortable: true,
          filter: true,
          resizable: true,
          editable: true,
          cellRenderer: smartCellRenderer,
          ...columnStateProps,
          colId: column.name
        };
        
        return colDef;
      });
      
      setColumnDefs(agGridColumns);
    }
  // ATTENTION: DO NOT remove hasAppliedInitialState.current (it causes the data to not load)
  // eslint-disable-next-line
  }, [table, hasAppliedInitialState.current]);

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
      
      // Check if any column names are being changed
      const hasNameChanges = columnStates.some(cs => cs.columnState.colId && cs.columnState.colId !== cs.name);
      
      updateColumnStateMutation.mutate({
        token,
        tableId: id || "",
        columnStates
      }, {
        onSuccess: () => {
          if (hasNameChanges) {
            // Refetch both table and row data when column names change
            refetch();
            utils.rows.getRows.invalidate({ token, tableId: id });
          }
        }
      });
    },
    addColumn: (position: 'left' | 'right', relativeTo: string) => {
      if (!token || !id) return;
      
      // Generate a unique name for the new column
      const generateUniqueColumnName = (existingColumns: Table['columns']) => {
        let counter = 0;
        let candidateName = 'New Column';
        
        const isNameTaken = (name: string) => existingColumns.some(col => col.name === name);
        
        while (isNameTaken(candidateName)) {
          counter++;
          candidateName = `New Column ${counter}`;
        }
        
        return candidateName;
      };

      const newColumnName = generateUniqueColumnName(table?.columns || []);
      
      addColumnMutation.mutate({
        token,
        tableId: id,
        columnName: newColumnName,
        position,
        relativeTo
      });
    },
    deleteColumn: (columnName: string) => {
      if (!token || !id) return;
      
      deleteColumnMutation.mutate({
        token,
        tableId: id,
        columnName
      });
    }
  }), [id, token, updateColumnStateMutation, refetch, utils.rows.getRows, table?.columns, addColumnMutation, deleteColumnMutation]);

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

  // Handler for grid ready event
  const onGridReady = useCallback((params: GridReadyEvent) => {
    // If we have column state stored in the table, apply it after grid initialization
    if (table?.columns && table.columns.some(col => col.columnState)) {
      // Wait for the grid to be fully initialized before attempting to apply column state
      setTimeout(() => {
        if (!gridRef.current?.api) return;
        
        isApplyingState.current = true;
        
        // Collect all column states from the table
        const savedColumnStates = table.columns
          .filter(col => col.columnState)
          .map(col => {
            const colState = col.columnState!;
            return {
              colId: col.name,
              hide: nullToUndefined(colState.hide),
              pinned: colState.pinned === null ? undefined : colState.pinned,
              sort: colState.sort === null ? undefined : colState.sort,
              sortIndex: nullToUndefined(colState.sortIndex),
              width: colState.width !== null ? colState.width : undefined,
              flex: colState.width === null ? colState.flex : undefined
            };
          });
        
        try {
          // Apply the saved column state directly to AG Grid
          gridRef.current.api.applyColumnState({
            state: savedColumnStates,
            applyOrder: true
          });
          
          gridRef.current.api.refreshHeader();
        } catch (error) { 
          console.error("Error applying column state:", error);
        }

        // Reset the flags after a short delay to ensure all events have processed
        setTimeout(() => {
          isApplyingState.current = false;
          hasAppliedInitialState.current = true;
          // Force a re-render to set up columns with the correct order
          setColumnDefs([]);
        }, 100);
      }, 200);
    } else {
      // If no saved state, mark as ready for column setup
      hasAppliedInitialState.current = true;
    }
  }, [table?.columns]);

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
    // Only process if the move is finished and we're not applying initial state
    if (event.finished && !isApplyingState.current) {
      debouncedProcessColumnStateChange();
    }
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
        <div className="p-3 flex items-center justify-start gap-2">
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
              style={{ 
                height: '500px',
                width: '100%',
              }}
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