import { smartCellRenderer } from '@/components/CustomCellRenderers';
import { useSidebar } from '@/components/ui/sidebar';
import { trpc } from '@/utils/trpc';
import { ColumnState, ColumnType, Table } from '@shared/types';
import {
  CellRange,
  CellValueChangedEvent,
  ColDef,
  ColumnMovedEvent,
  ColumnPinnedEvent,
  ColumnResizedEvent,
  ColumnVisibleEvent,
  GridReadyEvent,
  SortChangedEvent,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { convertColumnStateToAgGridProps } from './TablePageHelpers';

// Finally our custom overrides
import '@/styles/ag-grid-theme.css';
import { ModuleRegistry } from 'ag-grid-community';
import 'ag-grid-enterprise'; // This is the correct way to import enterprise features
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { CustomColumnHeader } from './CustomColumnHeader';
import { TablePageError } from './TablePageError';
import { TablePageHeader } from './TablePageHeader';

// Register all enterprise modules (includes ClientSideRowModel)
ModuleRegistry.registerModules([AllEnterpriseModule as any]);

// Debounce function to limit the frequency of calls
const debounce = (func: Function, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;

  return function (...args: any[]) {
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

export interface CustomColDef extends ColDef {
  description?: string;
}

// Helper function to convert null to undefined for AG Grid compatibility
function nullToUndefined<T>(value: T | null): T | undefined {
  return value === null ? undefined : value;
}

const TablePage = () => {
  const { id, slug } = useParams<{ id?: string; slug?: string }>();
  const navigate = useNavigate();
  const sidebar = useSidebar();
  const [table, setTable] = useState<Table | null>(null);
  const [error, setError] = useState('');
  const [rowData, setRowData] = useState<any[]>([]);
  const [columnDefs, setColumnDefs] = useState<ColDef[]>([]);
  const [selectedRanges, setSelectedRanges] = useState<CellRange[]>([]);
  const [isGridReady, setIsGridReady] = useState(false);

  // Reference to the AG Grid API
  const gridRef = useRef<AgGridReact>(null);

  const token = localStorage.getItem('token');
  const utils = trpc.useContext();

  // FETCH DATA
  const {
    data: tableData,
    refetch,
    isLoading: isTableLoading,
  } = trpc.tables.getTable.useQuery(
    {
      id: id || undefined,
      slug: slug || undefined,
      token: token || '',
    },
    {
      enabled: !!(id || slug),
      onError: (err) => {
        setError(err.message || 'Failed to load table');
      },
    }
  );

  const { data: rowsData } = trpc.rows.getRows.useQuery(
    { token: token || '', tableId: tableData?.id || '' },
    {
      enabled: !!tableData?.id && (!!token || tableData?.sharingStatus === 'public'),
      onError: (err) => {
        console.error('Failed to load rows:', err);
      },
    }
  );

  // UPDATE MUTATION
  const updateRowMutation = trpc.rows.updateRow.useMutation({
    onSuccess: () => {
      // Refetch rows after successful update
      if (token && id) {
        utils.rows.getRows.invalidate({ token, tableId: id });
      }
    },
    onError: (error) => {
      console.error('Failed to update row:', error);
      // You could add a toast notification here
    },
  });
  const updateColumnStateMutation = trpc.tables.updateColumnState.useMutation({
    onSuccess: () => {
      console.log('Column state updated successfully');
      // Force refetch to get updated column state
      refetch();
    },
    onError: (error) => {
      console.error('Failed to update column state:', error);
    },
  });
  const addColumnMutation = trpc.tables.addColumn.useMutation({
    onSuccess: () => {
      // Refetch table data after successful column addition
      refetch();
    },
    onError: (error) => {
      console.error('Failed to add column:', error.message);
    },
  });
  const deleteColumnMutation = trpc.tables.deleteColumn.useMutation({
    onSuccess: () => {
      // Refetch table data after successful column deletion
      refetch();
    },
    onError: (error) => {
      console.error('Failed to delete column:', error.message);
    },
  });
  const updateColumnTypeMutation = trpc.tables.updateColumnType.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      console.error('Failed to update column type:', error);
    },
  });
  const updateColumnDescriptionMutation = trpc.tables.updateColumnDescription.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      console.error('Failed to update column description:', error);
    },
  });

  // USE EFFECTS
  useEffect(() => {
    if (!isTableLoading && tableData) {
      // If table is not public and user is not logged in, redirect to login
      if (tableData.sharingStatus !== 'public' && !token) {
        navigate('/login');
        return;
      }
      setTable(tableData);
    }
  }, [tableData, isTableLoading, token, navigate]);

  // Process row data for AG Grid
  useEffect(() => {
    if (rowsData?.rows) {
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
        flex: state.flex,
      },
    }));

    updateColumnStateMutation.mutate({
      token,
      tableId: table.id,
      columnStates,
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

      const agGridColumns: CustomColDef[] = sortedColumns.map((column) => {
        // Convert our column state to AG Grid properties
        const columnStateProps = convertColumnStateToAgGridProps(column.columnState);

        const colDef: CustomColDef = {
          headerName: column.name,
          field: `data.${column.name}`,
          sortable: true,
          filter: true,
          resizable: true,
          editable: true,
          wrapHeaderText: true,
          autoHeaderHeight: true,
          cellRenderer: smartCellRenderer,
          suppressSizeToFit: true,
          suppressHeaderMenuButton: true,
          suppressHeaderContextMenu: true,
          ...columnStateProps,
          colId: column.name,
          type: column.type || 'text',
          description: column.description,
          valueParser: (params) => {
            if (column.type === 'number') {
              return Number(params.newValue);
            }
            return params.newValue;
          },
        };

        return colDef;
      });

      setColumnDefs(agGridColumns);
    }
    // ATTENTION: DO NOT remove hasAppliedInitialState.current (it causes the data to not load)
    // eslint-disable-next-line
  }, [table, hasAppliedInitialState.current]);

  // Create context object for AG Grid
  const gridContext = useMemo(
    () => ({
      tableId: id,
      isOwner: tableData?.isOwner ?? false,
      updateColumnState: (columnStates: { name: string; columnState: ColumnState }[]) => {
        if (!token) return;

        // Check if any column names are being changed
        const hasNameChanges = columnStates.some(
          (cs) => cs.columnState.colId && cs.columnState.colId !== cs.name
        );

        updateColumnStateMutation.mutate(
          {
            token,
            tableId: id || '',
            columnStates,
          },
          {
            onSuccess: () => {
              if (hasNameChanges) {
                // Refetch both table and row data when column names change
                refetch();
                utils.rows.getRows.invalidate({ token, tableId: id });
              }
            },
          }
        );
      },
      addColumn: (position: 'left' | 'right', relativeTo: string) => {
        if (!token || !id) return;

        // Generate a unique name for the new column
        const generateUniqueColumnName = (existingColumns: Table['columns']) => {
          let counter = 0;
          let candidateName = 'New Column';

          const isNameTaken = (name: string) => existingColumns.some((col) => col.name === name);

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
          relativeTo,
          description: `Column for ${newColumnName}`,
        });
      },
      deleteColumn: (columnName: string) => {
        if (!token || !id) return;

        deleteColumnMutation.mutate({
          token,
          tableId: id,
          columnName,
        });
      },
      updateColumnType: (columnName: string, newType: ColumnType) => {
        if (!token || !id) return;

        updateColumnTypeMutation.mutate({
          token,
          tableId: id,
          columnName,
          type: newType,
        });
      },
      updateColumnDescription: (columnName: string, description: string) => {
        if (!token || !id) return;

        updateColumnDescriptionMutation.mutate({
          token,
          tableId: id,
          columnName,
          description,
        });
      },
    }),
    [
      id,
      token,
      updateColumnStateMutation,
      refetch,
      utils.rows.getRows,
      table?.columns,
      addColumnMutation,
      deleteColumnMutation,
      updateColumnTypeMutation,
      updateColumnDescriptionMutation,
    ]
  );

  // AG Grid default column definition
  const defaultColDef = useMemo(
    () => ({
      minWidth: 100,
      resizable: true,
      sortable: true,
      filter: true,
      editable: () => {
        // Only allow editing if user is the owner
        return tableData?.isOwner ?? false;
      },
      headerComponent: CustomColumnHeader,
      suppressHeaderMenuButton: true,
      suppressHeaderContextMenu: true,
      suppressSizeToFit: true,
    }),
    [tableData?.isOwner]
  );

  // Cell selection configuration
  const cellSelection = useMemo(
    () => ({
      enableRangeSelection: true,
      enableRangeHandle: true,
      enableFillHandle: true,
      enableHeaderHighlight: true,
    }),
    []
  );

  // Handle cell range selection changed
  const onRangeSelectionChanged = useCallback((event: any) => {
    const ranges = gridRef.current?.api.getCellRanges();
    setSelectedRanges(ranges || []);
  }, []);

  // Handle cell value changes
  const onCellValueChanged = (event: CellValueChangedEvent) => {
    const { data, colDef } = event;
    if (!data.id || !colDef.field) return;
    // If not owner, redirect to login
    if (!tableData?.isOwner) {
      navigate('/login?reason=edit-table-login-wall');
      return;
    }

    // Extract the field name from the path (e.g., 'data.name' -> 'name')
    const fieldName = colDef.field.replace('data.', '');

    // Create updated data object
    const updatedData = { ...data.data };
    updatedData[fieldName] = event.newValue;

    // Call the update mutation
    updateRowMutation.mutate({
      token: token || '',
      id: data.id,
      data: updatedData,
    });
  };

  // Handler for grid ready event
  const onGridReady = useCallback(
    (params: GridReadyEvent) => {
      setIsGridReady(true);

      const hasSavedColumnState = table?.columns && table.columns.some((col) => col.columnState);

      if (hasSavedColumnState) {
        applySavedColumnState();
      } else {
        applyDefaultColumnState();
      }
    },
    [table?.columns]
  );

  // Extract the saved column state application logic
  const applySavedColumnState = () => {
    setTimeout(() => {
      if (!gridRef.current?.api) return;

      isApplyingState.current = true;

      // Collect all column states from the table
      const savedColumnStates = buildSavedColumnStates();

      try {
        // Apply the saved column state directly to AG Grid
        gridRef.current.api.applyColumnState({
          state: savedColumnStates,
          applyOrder: true,
        });

        gridRef.current.api.refreshHeader();
      } catch (error) {
        console.error('Error applying column state:', error);
      }

      setTimeout(() => {
        isApplyingState.current = false;
        hasAppliedInitialState.current = true;
        setColumnDefs([]); // Force a re-render
      }, 100);
    }, 200);
  };

  // Extract the column state building logic
  const buildSavedColumnStates = () => {
    return table?.columns
      .filter((col) => col.columnState)
      .map((col) => {
        const colState = col.columnState!;
        return {
          colId: col.name,
          hide: nullToUndefined(colState.hide),
          pinned: colState.pinned === null ? undefined : colState.pinned,
          sort: colState.sort === null ? undefined : colState.sort,
          sortIndex: nullToUndefined(colState.sortIndex),
          width: colState.width !== null ? colState.width : undefined,
          flex: colState.width === null ? colState.flex : undefined,
        };
      });
  };

  // Extract the default column state application logic
  const applyDefaultColumnState = () => {
    // Important: Set hasAppliedInitialState to true immediately if no saved state
    hasAppliedInitialState.current = true;

    // Force a refresh of the column definitions
    if (table?.columns) {
      const initialColumns = createInitialColumnDefs(table.columns);
      setColumnDefs(initialColumns);
    }
  };

  // Extract the column definition creation logic
  const createInitialColumnDefs = (columns: any[]) => {
    return columns.map((column) => ({
      headerName: column.name,
      field: `data.${column.name}`,
      sortable: true,
      filter: true,
      resizable: true,
      editable: true,
      cellRenderer: smartCellRenderer,
      suppressSizeToFit: true,
      suppressHeaderMenuButton: true,
      suppressHeaderContextMenu: true,
      colId: column.name,
      type: column.type || 'text',
      description: column.description,
      valueParser: (params: any) => {
        if (column.type === 'number') {
          return Number(params.newValue);
        }
        return params.newValue;
      },
    }));
  };

  // Handler for column resized event
  const onColumnResized = useCallback(
    (event: ColumnResizedEvent) => {
      if (event.finished) {
        debouncedProcessColumnStateChange();
      }
    },
    [debouncedProcessColumnStateChange]
  );

  // Handler for column moved event
  const onColumnMoved = useCallback(
    (event: ColumnMovedEvent) => {
      // Only process if the move is finished and we're not applying initial state
      if (event.finished && !isApplyingState.current) {
        debouncedProcessColumnStateChange();
      }
    },
    [debouncedProcessColumnStateChange]
  );

  // Handler for column visibility change
  const onColumnVisible = useCallback(
    (event: ColumnVisibleEvent) => {
      debouncedProcessColumnStateChange();
    },
    [debouncedProcessColumnStateChange]
  );

  // Handler for column pinned state change
  const onColumnPinned = useCallback(
    (event: ColumnPinnedEvent) => {
      debouncedProcessColumnStateChange();
    },
    [debouncedProcessColumnStateChange]
  );

  // Handler for sort changed event
  const onSortChanged = useCallback(
    (event: SortChangedEvent) => {
      debouncedProcessColumnStateChange();
    },
    [debouncedProcessColumnStateChange]
  );

  if (error) {
    return <TablePageError error={error} />;
  }

  if (!tableData && !isTableLoading) {
    return <TablePageError error="Table not found" />;
  }

  if (!tableData) return null;

  return (
    <AppLayout>
      {tableData && (
        <Helmet>
          <title>{`${tableData.name} - Deep Table`}</title>
          <meta name="description" content={tableData.description || ''} />
        </Helmet>
      )}
      <div className="h-full w-full flex flex-col">
        <TablePageHeader
          tableName={tableData.name}
          tableDescription={tableData.description || ''}
          tableId={tableData.id}
          isSidebarOpen={sidebar.open}
          selectedRanges={selectedRanges}
          onRowsAdded={() => {
            if (token && id) {
              utils.rows.getRows.invalidate({ token, tableId: id });
            }
          }}
          gridApi={gridRef.current?.api}
          sharingStatus={tableData.sharingStatus}
          isOwner={tableData.isOwner}
          table={tableData}
          rows={rowData}
        />
        <div className="flex-1 min-h-0">
          {!isGridReady && (
            <div className="flex justify-center items-center h-full">Loading table...</div>
          )}
          <div className={`ag-theme-alpine h-full w-full ${!isGridReady ? 'invisible' : ''}`}>
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
              cellSelection={cellSelection}
              onRangeSelectionChanged={onRangeSelectionChanged}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default TablePage;
