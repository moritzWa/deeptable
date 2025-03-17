import { ColumnState } from '@shared/types';
import { IHeaderParams } from 'ag-grid-community';
import { useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from './dropdown-menu';
import { Input } from './input';

interface CustomHeaderParams extends IHeaderParams {
  context: {
    tableId: string;
    updateColumnState: (columnStates: { name: string; columnState: ColumnState }[]) => void;
  };
}

export const CustomColumnHeader = (props: CustomHeaderParams) => {
  const [columnName, setColumnName] = useState(props.displayName);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColumnName(e.target.value);
  };

  const handleNameBlur = () => {
    if (columnName === props.displayName) return;

    // Get current column state
    const column = props.column;
    if (!column) return;

    const currentState = {
      width: column.getActualWidth(),
      hide: !column.isVisible(),
      pinned: column.getPinned() as 'left' | 'right' | null,
      sort: column.getSort() as 'asc' | 'desc' | null,
      sortIndex: column.getSortIndex(),
    };

    // Update column state with new name
    props.context.updateColumnState([
      {
        name: props.column.getColId(),
        columnState: {
          ...currentState,
          colId: columnName // Update the column name
        }
      }
    ]);
  };

  const handlePin = (direction: 'left' | 'right' | null) => {
    if (!props.column || !props.columnApi) return;
    props.columnApi.setColumnPinned(props.column.getColId(), direction);
  };

  const handleHideColumn = () => {
    if (!props.column || !props.columnApi) return;
    props.columnApi.setColumnVisible(props.column.getColId(), false);
  };

  const handleShowAllColumns = () => {
    if (!props.columnApi) return;
    const allColumns = props.columnApi.getAllColumns();
    if (!allColumns) return;
    
    allColumns.forEach(col => {
      props.columnApi?.setColumnVisible(col.getColId(), true);
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="w-full h-full flex items-center px-2 cursor-pointer hover:bg-accent/50">
          {columnName}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64">
        <DropdownMenuLabel>Column Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5">
          <Input
            value={columnName}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            className="h-8 w-full"
            placeholder="Column name"
          />
        </div>
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => handlePin('left')}>
            Pin Left
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handlePin('right')}>
            Pin Right
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handlePin(null)}>
            Reset Pin
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleHideColumn}>
            Hide Column
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleShowAllColumns}>
            Show All Columns
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}; 