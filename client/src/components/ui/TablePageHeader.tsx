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
import { CellRange, GridApi } from 'ag-grid-community';
import { Info, Plus, Sparkle } from 'lucide-react';
import { KeyboardEvent, useRef, useState } from 'react';

export interface TablePageHeaderProps {
  tableName: string;
  tableDescription: string | null | undefined;
  tableId: string;
  isSidebarOpen: boolean;
  selectedRanges: CellRange[];
  onRowsAdded: () => void;
  gridApi: GridApi | undefined;
}

const AddRowsDropdown = ({ tableId, onSuccess }: { tableId: string; onSuccess: () => void }) => {
  const token = localStorage.getItem('token');
  const createRowsMutation = trpc.rows.createRows.useMutation({
    onSuccess: () => {
      onSuccess();
    },
  });

  const handleAddRows = (count: number) => {
    if (!token) return;
    createRowsMutation.mutate({ token, tableId, count });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Add Rows
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleAddRows(10)}>Add 10 rows</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAddRows(25)}>Add 25 rows</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAddRows(50)}>Add 50 rows</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAddRows(100)}>Add 100 rows</DropdownMenuItem>
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
}: TablePageHeaderProps) => {
  const token = localStorage.getItem('token');
  const trpcUtils = trpc.useContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(tableName);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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

  const handleEnrichCells = async () => {
    if (!token || !gridApi) return;
    if (selectedRanges.length === 0) {
      console.log('No cells selected for enrichment');
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
            {tableDescription && !isSidebarOpen && (
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
            )}
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
          <AddRowsDropdown tableId={tableId} onSuccess={onRowsAdded} />
        </div>
      </div>
    </div>
  );
};
