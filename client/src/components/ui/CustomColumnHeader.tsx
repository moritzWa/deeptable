import { ColumnState } from '@shared/types';
import { Column, IHeaderParams } from 'ag-grid-community';
import {
  ArrowLeftToLine,
  ArrowRightToLine,
  Eye,
  EyeOff,
  Hash,
  Link2,
  PinIcon,
  PinOff,
  Trash2,
  Type,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { CustomColDef } from '../TablePage';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from './context-menu';
import { Input } from './input';
import { Label } from './label';

interface CustomHeaderParams extends IHeaderParams {
  context: {
    tableId: string;
    updateColumnState: (columnStates: { name: string; columnState: ColumnState }[]) => void;
    addColumn?: (position: 'left' | 'right', relativeTo: string) => void;
    deleteColumn?: (columnName: string) => void;
    updateColumnType?: (columnName: string, newType: string) => void;
    updateColumnDescription?: (columnName: string, description: string) => void;
  };
  enableSorting: boolean;
  column: Column;
  description?: string;
}

export const CustomColumnHeader = (props: CustomHeaderParams) => {
  const [columnName, setColumnName] = useState(props.displayName);
  const [description, setDescription] = useState(() => {
    const colDef = props.column.getColDef() as CustomColDef;
    console.log('colDef.description', colDef.description);
    return colDef.description || '';
  });
  const inputRef = useRef<HTMLInputElement>(null);

  // Update local state when displayName or description changes
  useEffect(() => {
    setColumnName(props.displayName);
    const colDef = props.column.getColDef() as CustomColDef;
    setDescription(colDef.description || '');
  }, [props.displayName, props.column]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setColumnName(e.target.value);
  };

  const handleNameSave = () => {
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
          colId: columnName,
        },
      },
    ]);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation(); // Prevent event from bubbling up
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNameSave();
      e.currentTarget.blur();
    }
  };

  const handleNameBlur = () => {
    handleNameSave();
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDescription(e.target.value);
  };

  const handleDescriptionSave = () => {
    if (description === props.description) return;
    if (props.context.updateColumnDescription) {
      props.context.updateColumnDescription(props.column.getColId(), description);
    }
  };

  const handleDescriptionKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation(); // Prevent event from bubbling up
    if (e.key === 'Enter') {
      e.preventDefault();
      handleDescriptionSave();
      e.currentTarget.blur();
    }
  };

  const handleDescriptionBlur = () => {
    handleDescriptionSave();
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

  const handleInsertColumn = (position: 'left' | 'right') => {
    if (!props.context.addColumn) return;
    props.context.addColumn(position, props.column.getColId());
  };

  // ignore es list errors for next line
  // eslint-disable-next-line
  const handleDeleteColumn = () => {
    if (!props.context.deleteColumn) return;
    props.context.deleteColumn(props.column.getColId());
  };

  const handleTypeChange = (newType: string) => {
    if (props.context.updateColumnType) {
      props.context.updateColumnType(props.column.getColId(), newType);
    }
  };

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
              <span className="text-xs">{sortState === 'asc' ? '↑' : '↓'}</span>
            )}
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <div className="p-2 flex flex-col gap-2">
          <div className="flex flex-col gap-2">
            <Label>Name</Label>
            <Input
              ref={inputRef}
              value={columnName}
              onChange={handleNameChange}
              onBlur={handleNameBlur}
              onKeyDown={handleNameKeyDown}
              className="h-8 w-full"
              placeholder="Column name"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Description/Prompt</Label>
            <Input
              value={description}
              onChange={handleDescriptionChange}
              onBlur={handleDescriptionBlur}
              onKeyDown={handleDescriptionKeyDown}
              className="h-8 w-full"
              placeholder="Column description"
            />
          </div>
        </div>
        <ContextMenuGroup>
          <ContextMenuItem onClick={() => handlePin('left')} className="flex items-center gap-2">
            <PinIcon className="h-4 w-4" />
            Pin Left
          </ContextMenuItem>
          <ContextMenuItem onClick={() => handlePin('right')} className="flex items-center gap-2">
            <PinIcon className="h-4 w-4" />
            Pin Right
          </ContextMenuItem>
          <ContextMenuItem onClick={() => handlePin(null)} className="flex items-center gap-2">
            <PinOff className="h-4 w-4" />
            Reset Pin
          </ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuGroup>
          <ContextMenuItem
            onClick={() => handleInsertColumn('left')}
            className="flex items-center gap-2"
          >
            <ArrowLeftToLine className="h-4 w-4" />
            Insert Column Left
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => handleInsertColumn('right')}
            className="flex items-center gap-2"
          >
            <ArrowRightToLine className="h-4 w-4" />
            Insert Column Right
          </ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuGroup>
          <ContextMenuItem onClick={handleHideColumn} className="flex items-center gap-2">
            <EyeOff className="h-4 w-4" />
            Hide Column
          </ContextMenuItem>
          <ContextMenuItem onClick={handleShowAllColumns} className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Show All Columns
          </ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuGroup>
          <ContextMenuItem
            className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400 flex items-center gap-2"
            onClick={handleDeleteColumn}
          >
            <Trash2 className="h-4 w-4" />
            Delete Column
          </ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuGroup>
          <ContextMenuItem
            onClick={() => handleTypeChange('text')}
            className="flex items-center gap-2"
          >
            <Type className="h-4 w-4" />
            Text
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => handleTypeChange('number')}
            className="flex items-center gap-2"
          >
            <Hash className="h-4 w-4" />
            Number
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => handleTypeChange('link')}
            className="flex items-center gap-2"
          >
            <Link2 className="h-4 w-4" />
            Link
          </ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  );
};
