import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { trpc } from '@/utils/trpc';
import { Column, Table } from '@shared/types';
import { CellRange, GridApi } from 'ag-grid-community';
import { Download, Info, Plus, Share, Sparkle } from 'lucide-react';
import { KeyboardEvent, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { downloadJson, exportTableData } from './TablePageHelpers';

export interface TablePageHeaderProps {
  tableName: string;
  tableDescription: string;
  tableId: string;
  isSidebarOpen: boolean;
  selectedRanges: CellRange[];
  onRowsAdded: () => void;
  gridApi: GridApi | undefined;
  sharingStatus: 'private' | 'public';
  isOwner: boolean;
  table: Table;
  rows: any[];
}

const AddRowsDropdown = ({ tableId, onSuccess }: { tableId: string; onSuccess: () => void }) => {
  const token = localStorage.getItem('token');
  const { toast } = useToast();
  const navigate = useNavigate();

  const createRowsMutation = trpc.rows.createRows.useMutation({
    onSuccess: () => {
      onSuccess();
      toast({
        title: 'Success',
        description: 'Rows added successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add rows',
        variant: 'destructive',
      });
    },
  });

  const createRowsWithEntitiesMutation = trpc.rows.createRowsWithEntities.useMutation({
    onSuccess: () => {
      onSuccess();
      toast({
        title: 'Success',
        description: 'Rows with entities added successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add rows with entities',
        variant: 'destructive',
      });
    },
  });

  const handleAddRows = (count: number, withEntities: boolean = false) => {
    if (!token) {
      navigate('/login?reason=add-rows-login-wall');
      return;
    }

    if (withEntities) {
      createRowsWithEntitiesMutation.mutate({ token, tableId, count });
    } else {
      createRowsMutation.mutate({ token, tableId, count });
    }
  };

  const isLoadingRegular = createRowsMutation.isLoading;
  const isLoadingEntities = createRowsWithEntitiesMutation.isLoading;
  const isLoading = isLoadingRegular || isLoadingEntities;

  const rowCounts = [10, 25, 50];

  interface AddRowMenuItemProps {
    count: number;
    withEntities?: boolean;
    isLoadingRegular: boolean;
    isLoadingEntities: boolean;
    onAdd: (count: number, withEntities: boolean) => void;
  }

  const AddRowMenuItem = ({
    count,
    withEntities = false,
    isLoadingRegular,
    isLoadingEntities,
    onAdd,
  }: AddRowMenuItemProps) => {
    const isLoading = isLoadingRegular || isLoadingEntities;
    const isCurrentTypeLoading = withEntities ? isLoadingEntities : isLoadingRegular;

    return (
      <DropdownMenuItem
        onClick={() => onAdd(count, withEntities)}
        disabled={isLoading}
        className={isLoading ? 'cursor-wait' : 'cursor-pointer'}
      >
        {isCurrentTypeLoading
          ? `Adding ${count} rows${withEntities ? ' with entities' : ''}...`
          : `Add ${count} rows${withEntities ? ' with entities' : ''}`}
      </DropdownMenuItem>
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`flex items-center gap-1 ${isLoading ? 'cursor-wait' : 'cursor-pointer'}`}
          disabled={isLoading}
        >
          <Plus className="h-4 w-4" />
          {isLoading ? 'Adding Rows...' : 'Add Rows'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {rowCounts.map((count) => (
          <div key={count}>
            <AddRowMenuItem
              count={count}
              isLoadingRegular={isLoadingRegular}
              isLoadingEntities={isLoadingEntities}
              onAdd={handleAddRows}
            />
            <AddRowMenuItem
              count={count}
              withEntities={true}
              isLoadingRegular={isLoadingRegular}
              isLoadingEntities={isLoadingEntities}
              onAdd={handleAddRows}
            />
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const TablePageHeader = ({
  tableName,
  tableDescription,
  tableId,
  isSidebarOpen,
  selectedRanges,
  onRowsAdded,
  gridApi,
  sharingStatus,
  isOwner,
  table,
  rows,
}: TablePageHeaderProps) => {
  const token = localStorage.getItem('token');
  const trpcUtils = trpc.useContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(tableName);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const updateTableMutation = trpc.tables.updateTable.useMutation({
    onSuccess: () => {
      trpcUtils.tables.getTables.invalidate();
    },
  });

  const fillCellMutation = trpc.columns.fillCellBatched.useMutation({
    onSuccess: (result) => {
      console.log('Fill cell result:', result);
    },
    onError: (error) => {
      console.error('Fill cell error:', error);
    },
  });

  const fillSingleCellMutation = trpc.columns.fillSingleCell.useMutation({
    onSuccess: (result) => {
      console.log('Single cell fill result:', result);
    },
    onError: (error) => {
      console.error('Single cell fill error:', error);
    },
  });

  // unused but keep for reference
  const handleEnrichCellsInBatchOld = () => {
    if (!token || !gridApi) return;
    if (selectedRanges.length === 0) {
      console.log('No cells selected for enrichment');
      return;
    }

    console.log('selectedRanges', selectedRanges[0]);

    // Get the row nodes from the range
    const startRowIndex = selectedRanges[0].startRow?.rowIndex || 0;
    const endRowIndex = selectedRanges[0].endRow?.rowIndex || 0;

    // Get the row data using the grid API
    const startRowNode = gridApi.getDisplayedRowAtIndex(startRowIndex);
    const endRowNode = gridApi.getDisplayedRowAtIndex(endRowIndex);

    if (!startRowNode || !endRowNode) {
      console.error('Could not get row nodes from selection');
      return;
    }

    // Get the row IDs from the row data
    const startRowId = startRowNode.data.id;
    const endRowId = endRowNode.data.id;

    console.log('Row IDs:', { startRowId, endRowId });

    const columnNames = selectedRanges[0].columns.map((col) => col.getColDef().headerName);

    fillCellMutation.mutate({
      tableId,
      columnNames: columnNames.filter((name) => name !== undefined) as string[],
      startRowId,
      endRowId,
    });
  };

  const updateSharingStatusMutation = trpc.tables.updateSharingStatus.useMutation({
    onSuccess: () => {
      trpcUtils.tables.getTables.invalidate();
      trpcUtils.tables.getTable.invalidate({ id: tableId, token: token || '' });
      toast({
        title: 'Success',
        description:
          sharingStatus === 'public' ? 'Table is now private' : 'Share link copied to clipboard!',
      });
    },
  });

  const handleEnrichCells = async () => {
    if (!token) {
      navigate('/login?reason=enrichment-login-wall');
      return;
    }

    if (!gridApi) return;
    if (selectedRanges.length === 0) {
      toast({
        title: 'No cells selected',
        description: 'Please select one or more cells to enrich by clicking (and dragging).',
        variant: 'default',
      });
      return;
    }

    const range = selectedRanges[0];
    const startRowIndex = range.startRow?.rowIndex || 0;
    const endRowIndex = range.endRow?.rowIndex || 0;
    const selectedColumns = range.columns
      .map((col) => col.getColDef().headerName)
      .filter((name): name is string => name !== undefined);

    console.log('Starting update for range:', { startRowIndex, endRowIndex, selectedColumns });

    const cellPromises: Promise<unknown>[] = [];
    const updatedCells: { rowIndex: number; columnName: string }[] = [];

    // First, update all selected cells to show "Enriching..."
    for (let rowIndex = startRowIndex; rowIndex <= endRowIndex; rowIndex++) {
      const rowNode = gridApi.getDisplayedRowAtIndex(rowIndex);
      if (!rowNode) {
        console.warn('Could not find row node for index:', rowIndex);
        continue;
      }

      console.log('Row node data structure:', {
        rowIndex,
        data: rowNode.data,
        // Log the actual structure to see how the data is organized
      });

      for (const columnName of selectedColumns) {
        // Store which cells we're updating so we can track them
        updatedCells.push({ rowIndex, columnName });

        // Try both with and without the 'data.' prefix
        try {
          rowNode.setDataValue(columnName, 'Enriching...');
          console.log(
            `Attempted to set loading state without data. prefix for row ${rowIndex}, column ${columnName}`
          );

          // Log the value right after setting to see if it took effect
          console.log('Current cell value after update:', {
            withPrefix: rowNode.data[`data.${columnName}`],
            withoutPrefix: rowNode.data[columnName],
            rawData: rowNode.data,
          });
        } catch (error) {
          console.error('Error updating cell value:', error);
        }
      }
    }

    // Then process each cell
    for (let rowIndex = startRowIndex; rowIndex <= endRowIndex; rowIndex++) {
      const rowNode = gridApi.getDisplayedRowAtIndex(rowIndex);
      if (!rowNode) continue;

      const rowId = rowNode.data.id;

      for (const columnName of selectedColumns) {
        const promise = fillSingleCellMutation
          .mutateAsync({
            tableId,
            columnName,
            rowId,
          })
          .catch((error) => {
            console.error(`Error processing cell at row ${rowIndex}, column ${columnName}:`, error);
            // If there's an error, update the cell to show the error
            const errorRowNode = gridApi.getDisplayedRowAtIndex(rowIndex);
            if (errorRowNode) {
              errorRowNode.setDataValue(`data.${columnName}`, 'Error enriching cell');
            }
            return null;
          });

        cellPromises.push(promise);
      }
    }

    try {
      // Execute all promises in parallel
      await Promise.all(cellPromises);

      // After all cells are processed, invalidate the rows data once
      if (token && tableId) {
        trpcUtils.rows.getRows.invalidate({ token, tableId });
      }
    } catch (error) {
      console.error('Error processing cells:', error);

      // If there's a catastrophic error, update all affected cells
      updatedCells.forEach(({ rowIndex, columnName }) => {
        const rowNode = gridApi.getDisplayedRowAtIndex(rowIndex);
        if (rowNode) {
          rowNode.setDataValue(`data.${columnName}`, 'Error enriching cell');
        }
      });
    }
  };

  const handleShareTable = async () => {
    try {
      const newStatus = sharingStatus === 'public' ? 'private' : 'public';
      await updateSharingStatusMutation.mutateAsync({
        token: token || '',
        tableId,
        sharingStatus: newStatus,
      });

      if (newStatus === 'public') {
        const shareUrl = `${window.location.origin}/tables/${tableId}`;
        await navigator.clipboard.writeText(shareUrl);
      }
    } catch (error) {
      console.error('Failed to update sharing status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update sharing status',
        variant: 'destructive',
      });
    }
  };

  const handleExportTable = () => {
    const exportData = {
      name: table.name,
      description: table.description,
      columns: table.columns.map((column: Column) => ({
        columnId: column.columnId,
        name: column.name,
        type: column.type,
        required: column.required || false,
        defaultValue: column.defaultValue,
        description: column.description,
        columnState: column.columnState,
      })),
      rows: rows.map((row) => ({
        id: row.id,
        data: row.data as Record<string, any>,
      })),
      sharingStatus: table.sharingStatus,
    };

    const jsonString = exportTableData(exportData);
    downloadJson(jsonString, `${tableName.toLowerCase()}-deeptable.json`);
  };

  const handleStartEditing = () => {
    setIsEditing(true);
    setEditedName(tableName);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSaveTitle = async () => {
    if (!token || editedName.trim() === '') return;

    setIsEditing(false);
    if (editedName !== tableName) {
      updateTableMutation.mutate({
        token,
        id: tableId,
        name: editedName.trim(),
        description: tableDescription,
      });
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditedName(tableName);
    }
  };

  return (
    <div className="sticky top-0 z-10 bg-background border-b">
      <div className="p-2 pl-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {!isSidebarOpen && <SidebarTrigger className="h-8 w-8" />}
          <div className="font-semibold flex items-center gap-2">
            {isEditing ? (
              <Input
                ref={inputRef}
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={handleKeyDown}
                className="h-7 w-[200px] px-0 border-0 shadow-none font-semibold focus-visible:ring-0 hover:text-primary transition-colors"
              />
            ) : (
              <span
                onClick={handleStartEditing}
                className="cursor-pointer hover:text-primary transition-colors"
              >
                {tableName}
              </span>
            )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-gray-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{tableDescription}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="text-sm font-normal text-gray-500">
              Right-click the column header below to edit
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={handleEnrichCells}
          >
            <Sparkle className="h-4 w-4" />
            Enrich Selected Cells
          </Button>
          {isOwner && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={handleShareTable}
              >
                <Share className="h-4 w-4" />
                {sharingStatus === 'public' ? 'Make Private' : 'Share'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={handleExportTable}
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </>
          )}
          <AddRowsDropdown tableId={tableId} onSuccess={onRowsAdded} />
        </div>
      </div>
    </div>
  );
};
