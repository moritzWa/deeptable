import { createNewSelectItem } from '@/utils/selectUtils';
import { trpc } from '@/utils/trpc';
import { ColumnState, SelectItem } from '@shared/types';
import { Column, IHeaderParams } from 'ag-grid-community';
import {
  AlignJustify,
  ArrowDownIcon,
  ArrowLeftToLine,
  ArrowRightToLine,
  ArrowUpIcon,
  ChevronDown,
  DollarSign,
  Eye,
  EyeOff,
  Hash,
  Info,
  Link2,
  ListChecks,
  ListFilter,
  PinIcon,
  PinOff,
  Trash2,
  Type,
  XIcon,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SelectTypeItemForm } from './SelectTypeItemForm';
import { CustomColDef } from './TableComponent';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface ColumnHeaderParams extends IHeaderParams {
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
}

export const ColumnHeader = (props: ColumnHeaderParams) => {
  const [columnName, setColumnName] = useState(props.displayName);
  const [description, setDescription] = useState(() => {
    const colDef = props.column.getColDef() as CustomColDef;
    return colDef.context?.description || '';
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('accessToken');
  const utils = trpc.useContext();

  const updateColumnNameMutation = trpc.tables.updateColumnName.useMutation({
    onSuccess: () => {
      utils.tables.getTable.invalidate();
    },
  });

  const updateSelectItemsMutation = trpc.tables.updateSelectItems.useMutation({
    onSuccess: () => {
      utils.tables.getTable.invalidate();
    },
  });

  // Update local state when displayName or description changes
  useEffect(() => {
    setColumnName(props.displayName);
    const colDef = props.column.getColDef() as CustomColDef;
    setDescription(colDef.context?.description || '');
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

    const colDef = props.column.getColDef() as CustomColDef;
    if (description === colDef.context?.description) return;

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
    props.context.setColumnCurrency(
      props.column.getColId(),
      !colDef.context?.additionalTypeInformation.currency
    );
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

  // Update the handleSort function to use the correct API
  const handleSort = (direction: 'asc' | 'desc' | null) => {
    if (!props.column || !props.enableSorting || !props.api) return;

    if (direction === null) {
      props.api.applyColumnState({ defaultState: { sort: null } }); // Clear sorting
    } else {
      props.api.applyColumnState({
        state: [{ colId: props.column.getColId(), sort: direction }],
        defaultState: { sort: null },
      });
    }
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

  const handleTypeChange = (newType: string, e?: React.MouseEvent) => {
    if (!props.context.isOwner) {
      redirectToLogin();
      return;
    }

    // For select and multiSelect, prevent menu from closing
    if ((newType === 'select' || newType === 'multiSelect') && e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (props.context.updateColumnType) {
      if (newType === 'multiSelect') {
        const allValues = new Set<string>();
        props.api?.forEachNode((node) => {
          const value = node.data?.data?.[props.column.getColId()];
          if (typeof value === 'string') {
            value.split(',').forEach((item) => {
              const trimmed = item.trim();
              if (trimmed) allValues.add(trimmed);
            });
          }
        });

        // Convert unique values to SelectItems using the improved color generation
        const selectItems: SelectItem[] = Array.from(allValues).map((value) =>
          createNewSelectItem(value, selectItems)
        );

        // Update the column type and its select items
        if (selectItems.length > 0) {
          updateSelectItemsMutation.mutate({
            token: token || '',
            tableId: props.context.tableId,
            columnId: props.column.getColId(),
            selectItems,
          });
        }
      }

      props.context.updateColumnType(props.column.getColId(), newType);
    }
  };

  const handleTextWrapping = () => {
    if (!props.context.isOwner) {
      redirectToLogin();
      return;
    }

    const column = props.column;
    if (!column) return;

    const currentState = column.getColDef() as CustomColDef;
    const currentColumnState = {
      colId: column.getColId(),
      width: column.getActualWidth(),
      hide: !column.isVisible(),
      pinned: column.getPinned() as 'left' | 'right' | null,
      sort: column.getSort() as 'asc' | 'desc' | null,
      sortIndex: column.getSortIndex(),
      wrapText: !currentState.wrapText,
      autoHeight: !currentState.autoHeight,
      wrapHeaderText: !currentState.wrapHeaderText,
      autoHeaderHeight: !currentState.autoHeaderHeight,
    };

    props.context.updateColumnState([
      {
        columnId: column.getColId(),
        columnState: currentColumnState,
      },
    ]);
  };

  const handleHeaderClick = (e: React.MouseEvent) => {
    // Only handle clicks on the main header area, not the menu trigger
    if ((e.target as HTMLElement).closest('.menu-trigger')) {
      return;
    }

    if (!props.column || !props.api) return;

    // Log current state
    console.log('Column ID:', props.column.getColId());
    console.log('Total rows:', props.api.getDisplayedRowCount());

    // Select all cells in the column (excluding header)
    const range = {
      rowStartIndex: 0,
      rowEndIndex: props.api.getDisplayedRowCount() - 1,
      columns: [props.column.getColId()],
    };

    console.log('Setting range:', range);

    props.api.clearRangeSelection();
    props.api.addCellRange(range);

    // Log the selected range after setting
    const selectedRanges = props.api.getCellRanges();
    console.log('Selected ranges after setting:', selectedRanges);
  };

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <div
        className="w-full h-full flex items-center select-none cursor-pointer relative"
        onClick={handleHeaderClick}
      >
        <div className="flex-1 flex items-center gap-2">
          {isSortable && sortState && (
            <span className="text-xs">{sortState === 'asc' ? '↑' : '↓'}</span>
          )}
          {columnName}
        </div>
        <DropdownMenuTrigger asChild>
          <div className="menu-trigger p-1 hover:bg-muted rounded cursor-pointer">
            <ChevronDown className="h-4 w-4" />
          </div>
        </DropdownMenuTrigger>
      </div>
      <DropdownMenuContent className="w-64">
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
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => handleTypeChange('text')}
            className={`flex items-center gap-2 ${
              props.column.getColDef().type === 'text' ? 'bg-secondary' : ''
            }`}
          >
            <Type className="h-4 w-4" />
            Text
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleTypeChange('number')}
            className={`flex items-center gap-2 ${
              props.column.getColDef().type === 'number' ? 'bg-secondary' : ''
            }`}
          >
            <Hash className="h-4 w-4" />
            Number
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleTypeChange('link')}
            className={`flex items-center gap-2 ${
              props.column.getColDef().type === 'link' ? 'bg-secondary' : ''
            }`}
          >
            <Link2 className="h-4 w-4" />
            Link
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => handleTypeChange('select', e)}
            className={`flex items-center gap-2 ${
              props.column.getColDef().type === 'select' ? 'bg-secondary' : ''
            }`}
          >
            <ListChecks className="h-4 w-4" />
            Select
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => handleTypeChange('multiSelect', e)}
            className={`flex items-center gap-2 ${
              props.column.getColDef().type === 'multiSelect' ? 'bg-secondary' : ''
            }`}
          >
            <ListFilter className="h-4 w-4" />
            Multi-Select
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {(props.column.getColDef().type === 'select' ||
          props.column.getColDef().type === 'multiSelect') && (
          <>
            <SelectTypeItemForm
              selectItems={
                (props.column.getColDef() as CustomColDef).context?.additionalTypeInformation
                  ?.selectItems
              }
              onUpdateItems={(items: SelectItem[]) => {
                if (!props.context.isOwner) {
                  redirectToLogin();
                  return;
                }

                updateSelectItemsMutation.mutate({
                  token: token || '',
                  tableId: props.context.tableId,
                  columnId: props.column.getColId(),
                  selectItems: items,
                });
              }}
              isMultiSelect={props.column.getColDef().type === 'multiSelect'}
            />
            <DropdownMenuSeparator />
          </>
        )}
        {props.column.getColDef().type === 'number' && (
          <>
            <DropdownMenuGroup>
              <Label className="p-2">Formatting</Label>
              <DropdownMenuItem
                onClick={() => handleSetColumnCurrency()}
                className="flex items-center gap-2"
              >
                <DollarSign className="h-4 w-4" />
                Currency
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => handlePin('left')} className="flex items-center gap-2">
            <PinIcon className="h-4 w-4" />
            Pin Left
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handlePin('right')} className="flex items-center gap-2">
            <PinIcon className="h-4 w-4" />
            Pin Right
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handlePin(null)} className="flex items-center gap-2">
            <PinOff className="h-4 w-4" />
            Reset Pin
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => handleInsertColumn('left')}
            className="flex items-center gap-2"
          >
            <ArrowLeftToLine className="h-4 w-4" />
            Insert Column Left
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleInsertColumn('right')}
            className="flex items-center gap-2"
          >
            <ArrowRightToLine className="h-4 w-4" />
            Insert Column Right
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleHideColumn} className="flex items-center gap-2">
            <EyeOff className="h-4 w-4" />
            Hide Column
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleShowAllColumns} className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Show All Columns
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Label className="p-2">Text Wrapping</Label>
          <DropdownMenuItem
            onClick={handleTextWrapping}
            className={`flex items-center gap-2 ${
              (props.column.getColDef() as CustomColDef).context?.wrapText ? 'bg-secondary' : ''
            }`}
          >
            <AlignJustify className="h-4 w-4" />
            Enable Text Wrapping
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Label className="p-2">Sort</Label>
          <DropdownMenuItem
            onClick={() => handleSort('asc')}
            className={`flex items-center gap-2 ${sortState === 'asc' ? 'bg-secondary' : ''}`}
          >
            <ArrowUpIcon className="h-4 w-4" />
            Sort Ascending
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleSort('desc')}
            className={`flex items-center gap-2 ${sortState === 'desc' ? 'bg-secondary' : ''}`}
          >
            <ArrowDownIcon className="h-4 w-4" />
            Sort Descending
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSort(null)} className="flex items-center gap-2">
            <XIcon className="h-4 w-4" />
            Clear Sort
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive flex items-center gap-2"
            onClick={handleDeleteColumn}
          >
            <Trash2 className="h-4 w-4" />
            Delete Column
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
