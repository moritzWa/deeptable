import { trpc } from '@/utils/trpc';
import { ColumnState } from '@shared/types';
import { Column, IHeaderParams } from 'ag-grid-community';
import {
  ArrowLeftToLine,
  ArrowRightToLine,
  DollarSign,
  Eye,
  EyeOff,
  Hash,
  Info,
  Link2,
  PinIcon,
  PinOff,
  Trash2,
  Type,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomColDef } from './TableComponent';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from './ui/context-menu';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface CustomHeaderParams extends IHeaderParams {
  context: {
    tableId: string;
    isOwner: boolean;
    updateColumnState: (columnStates: { columnId: string; columnState: ColumnState }[]) => void;
    addColumn?: (position: 'left' | 'right', relativeTo: string) => void;
    deleteColumn?: (columnName: string) => void;
    updateColumnType?: (columnName: string, newType: string) => void;
    updateColumnDescription?: (columnName: string, description: string) => void;
    setColumnCurrency?: (columnId: string, currency: boolean) => void;
  };
  enableSorting: boolean;
  column: Column;
  description?: string;
}

export const CustomColumnHeader = (props: CustomHeaderParams) => {
  const [columnName, setColumnName] = useState(props.displayName);
  const [description, setDescription] = useState(() => {
    const colDef = props.column.getColDef() as CustomColDef;
    // console.log('colDef.description', colDef.description);
    return colDef.description || '';
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const utils = trpc.useContext();

  const updateColumnNameMutation = trpc.tables.updateColumnName.useMutation({
    onSuccess: () => {
      utils.tables.getTable.invalidate();
    },
  });

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

  const redirectToLogin = () => {
    navigate('/login?reason=edit-table-login-wall');
  };

  const handleNameSave = () => {
    if (!props.context.isOwner) {
      redirectToLogin();
      return;
    }

    if (columnName === props.displayName) return;

    // Update the column name in the database
    if (token) {
      updateColumnNameMutation.mutate({
        token,
        tableId: props.context.tableId,
        columnId: props.column.getColId(),
        name: columnName,
      });
    }

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
        columnId: props.column.getColId(),
        columnState: {
          ...currentState,
          colId: props.column.getColId(), // Keep the original colId
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
    if (!props.context.isOwner) {
      redirectToLogin();
      return;
    }

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

  const handleSetColumnCurrency = () => {
    if (!props.context.setColumnCurrency) return;
    const colDef = props.column.getColDef() as CustomColDef;
    props.context.setColumnCurrency(props.column.getColId(), !colDef.additionalTypeInformation.currency);
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
    if (!props.context.isOwner) {
      redirectToLogin();
      return;
    }

    if (!props.context.addColumn) return;
    props.context.addColumn(position, props.column.getColId());
  };

  const handleDeleteColumn = () => {
    if (!props.context.isOwner) {
      redirectToLogin();
      return;
    }

    if (!props.context.deleteColumn) return;
    props.context.deleteColumn(props.column.getColId());
  };

  const handleTypeChange = (newType: string) => {
    if (!props.context.isOwner) {
      redirectToLogin();
      return;
    }

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
        <div className="p-2 flex flex-col gap-4">
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
            <div className="flex flex-row gap-2">
              <Label>Description/Prompt</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-secondary-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>This will help the AI find the correct content.</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
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
        <ContextMenuSeparator />
        {props.column.getColDef().type === 'number' && (
          <>
        <ContextMenuGroup>
          <Label className='p-2'>Formatting</Label>
          <ContextMenuItem onClick={() => handleSetColumnCurrency()} className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Currency
          </ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
          </>
        )}
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
      </ContextMenuContent>
    </ContextMenu>
  );
};
