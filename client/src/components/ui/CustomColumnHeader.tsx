import { ColumnState } from '@shared/types';
import { IHeaderParams } from 'ag-grid-community';
import { useEffect, useRef, useState } from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger
} from './context-menu';
import { Input } from './input';

interface CustomHeaderParams extends IHeaderParams {
  context: {
    tableId: string;
    updateColumnState: (columnStates: { name: string; columnState: ColumnState }[]) => void;
  };
}

export const CustomColumnHeader = (props: CustomHeaderParams) => {
  const [columnName, setColumnName] = useState(props.displayName);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update local state when displayName changes (after refetch)
  useEffect(() => {
    setColumnName(props.displayName);
  }, [props.displayName]);

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
    if (!props.column || !props.api) return;
    props.api.setColumnsPinned([props.column], direction);
  };

  const handleHideColumn = () => {
    if (!props.column || !props.api) return;
    props.api.setColumnsVisible([props.column], false);
  };

  const handleShowAllColumns = () => {
    if (!props.api) return;
    const allColumns = props.api.getColumns();
    if (!allColumns) return;
    
    props.api.setColumnsVisible(allColumns, true);
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      // Use setTimeout to ensure the input is mounted before focusing
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 0);
    }
  };

  // Handle sort click
  const onSortRequested = (event: React.MouseEvent) => {
    if (!props.column || !props.enableSorting) return;
    
    const multiSort = event.shiftKey;
    props.progressSort(multiSort);
  };

  // Get sort state for displaying the sort icon
  const sortState = props.column?.getSort();
  const isSortable = props.enableSorting;

  return (
    <ContextMenu onOpenChange={handleOpenChange}>
      <ContextMenuTrigger asChild>
        <div 
          className="w-full h-full flex items-center px-2 select-none cursor-pointer" 
          onClick={onSortRequested}
        >
          <div className="flex items-center gap-1">
            {columnName}
            {isSortable && sortState && (
              <span className="text-xs">
                {sortState === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <div className="px-2 py-1.5">
          <Input
            ref={inputRef}
            value={columnName}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            className="h-8 w-full"
            placeholder="Column name"
          />
        </div>
        <ContextMenuGroup>
          <ContextMenuItem onClick={() => handlePin('left')}>
            Pin Left
          </ContextMenuItem>
          <ContextMenuItem onClick={() => handlePin('right')}>
            Pin Right
          </ContextMenuItem>
          <ContextMenuItem onClick={() => handlePin(null)}>
            Reset Pin
          </ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuGroup>
          <ContextMenuItem onClick={handleHideColumn}>
            Hide Column
          </ContextMenuItem>
          <ContextMenuItem onClick={handleShowAllColumns}>
            Show All Columns
          </ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  );
}; 