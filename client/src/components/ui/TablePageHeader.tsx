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
              if (selectedRanges.length === 0) {
                console.log('No cells selected for enrichment');
                return;
              }

              // Log enrichment information for each range
              selectedRanges.forEach((range, index) => {
                console.log(`Range ${index + 1}:`, {
                  tableId,
                  range: {
                    startRow: range.startRow,
                    endRow: range.endRow,
                    columns: range.columns.map(col => col.getColId()),
                    startColumn: range.startColumn.getColId()
                  }
                });
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