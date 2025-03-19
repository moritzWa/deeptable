import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { trpc } from "@/utils/trpc";
import { CellRange } from 'ag-grid-community';
import { Info, Plus, Sparkle } from "lucide-react";

export interface TablePageHeaderProps {
  tableName: string;
  tableDescription: string | null | undefined;
  tableId: string;
  isSidebarOpen: boolean;
  selectedRanges: CellRange[];
  onRowsAdded: () => void;
}

const AddRowsDropdown = ({ tableId, onSuccess }: { tableId: string, onSuccess: () => void }) => {
  const token = localStorage.getItem("token");
  const createRowsMutation = trpc.rows.createRows.useMutation({
    onSuccess: () => {
      onSuccess();
    }
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
        <DropdownMenuItem onClick={() => handleAddRows(10)}>
          Add 10 rows
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAddRows(25)}>
          Add 25 rows
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAddRows(50)}>
          Add 50 rows
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAddRows(100)}>
          Add 100 rows
        </DropdownMenuItem>
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
  onRowsAdded
}: TablePageHeaderProps) => {
  const token = localStorage.getItem("token");
  const fillCellMutation = trpc.columns.fillCell.useMutation({
    onSuccess: (result) => {
      console.log('Fill cell result:', result);
    },
    onError: (error) => {
      console.error('Fill cell error:', error);
    }
  });

  return (
    <div className="sticky top-0 z-10 bg-background border-b">
      <div className="p-2 pl-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {!isSidebarOpen && (
            <SidebarTrigger className="h-8 w-8" />
          )}
          <div className="font-semibold flex items-center gap-2">
            {tableName}
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
          <Button variant="outline" size="sm" className="flex items-center gap-1"
            onClick={() => {
              if (!token) return;
              if (selectedRanges.length === 0) {
                console.log('No cells selected for enrichment');
                return;
              }

              // For now, just handle the first range and first cell
              const range = selectedRanges[0];
              const column = range.startColumn.getColId();
              const rowIndex = range.startRow?.rowIndex;

              if (rowIndex === undefined) {
                console.log('No valid row selected');
                return;
              }

              fillCellMutation.mutate({
                tableId,
                rowIndex,
                columnName: column,
                context: tableDescription || tableName, // Optional context
              });
            }}
          >
            <Sparkle className="h-4 w-4" />
            Enrich Cells
          </Button>
          <AddRowsDropdown 
            tableId={tableId} 
            onSuccess={onRowsAdded}
          />  
        </div>
      </div>
    </div>
  );
}; 