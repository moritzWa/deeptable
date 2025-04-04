import { generateRandomColor } from '@/utils/selectUtils';
import { SelectItem } from '@shared/types';
import { CustomCellEditorProps } from 'ag-grid-react';
import { Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { SelectPill } from './CellRendererSelect';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

interface SelectCellEditorProps extends CustomCellEditorProps {
  colDef: {
    type: 'select' | 'multiSelect';
    additionalTypeInformation?: {
      selectItems?: SelectItem[];
    };
  };
  context: {
    updateSelectItems?: (items: SelectItem[]) => void;
  };
}

export const SelectCellEditor = ({
  value: initialValue,
  onValueChange,
  colDef,
  stopEditing,
  context,
}: SelectCellEditorProps) => {
  const isMultiSelect = colDef.type === 'multiSelect';
  const selectItems = colDef.additionalTypeInformation?.selectItems || [];
  const [isOpen, setIsOpen] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const commandRef = useRef<HTMLDivElement>(null);

  // For multiSelect, split by comma and trim
  const initialValues = isMultiSelect
    ? initialValue
        ?.split(',')
        .map((v: string) => v.trim())
        .filter(Boolean)
    : [initialValue].filter(Boolean);

  const [selectedValues, setSelectedValues] = useState<string[]>(initialValues);

  // Focus the container when mounted
  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  const handleAddNewItem = () => {
    console.log('in handleAddNewItem - inputValue:', inputValue);

    if (!inputValue.trim() || !context.updateSelectItems) return;

    const newItem: SelectItem = {
      id: crypto.randomUUID(),
      name: inputValue.trim(),
      color: generateRandomColor(),
    };

    // Update available select items
    const newSelectItems = [...selectItems, newItem];
    context.updateSelectItems(newSelectItems);

    // Update selected values
    const newValues = isMultiSelect ? [...selectedValues, newItem.name] : [newItem.name];

    setSelectedValues(newValues);
    onValueChange(newValues.join(', '));
    setInputValue('');

    if (!isMultiSelect) {
      setIsOpen(false);
      stopEditing();
    }
  };

  const handleSelect = (itemName: string) => {
    let newValues: string[];

    if (isMultiSelect) {
      // Toggle selection for multi-select
      newValues = selectedValues.includes(itemName)
        ? selectedValues.filter((v) => v !== itemName)
        : [...selectedValues, itemName];
      setSelectedValues(newValues);
      onValueChange(newValues.join(', '));
    } else {
      // Single select - replace value and close
      newValues = [itemName];
      setSelectedValues(newValues);
      onValueChange(newValues.join(', '));
      setIsOpen(false);
      stopEditing();
    }
  };

  console.log('in SelectCellEditor - selectedValues:', selectedValues);

  // Handle keyboard events
  const onKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation(); // Prevent AG Grid from handling the event

    if (e.key === 'Escape') {
      setIsOpen(false);
      stopEditing();
    } else if (e.key === 'Enter') {
      if (inputValue) {
        e.preventDefault();
        handleAddNewItem();
      } else if (!isMultiSelect) {
        stopEditing();
      }
    }
  };

  // Handle mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent AG Grid from handling the event
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div
          ref={containerRef}
          className="w-[200px] min-h-[32px] bg-popover border rounded-md p-1 flex flex-wrap gap-1 focus:outline-none shadow-sm"
          onKeyDown={onKeyDown}
          onMouseDown={handleMouseDown}
          tabIndex={0}
        >
          {selectedValues.length > 0 ? (
            selectedValues.map((val) => {
              const item = selectItems.find((i) => i.name === val);
              if (!item) return null;
              return <SelectPill key={item.id} value={item.name} color={item.color} />;
            })
          ) : (
            <span className="text-muted-foreground text-sm px-2 py-1">Select...</span>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start" sideOffset={-1}>
        <Command ref={commandRef} shouldFilter={true}>
          <CommandInput
            placeholder="Search or add new..."
            value={inputValue}
            onValueChange={setInputValue}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && inputValue.trim()) {
                e.preventDefault();
                handleAddNewItem();
              }
            }}
          />
          <CommandList>
            <CommandEmpty className="py-2 px-2 cursor-pointer">
              <div
                onSelect={handleAddNewItem}
                className="text-sm text-muted-foreground flex items-center h-full w-full gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Press Enter to add "{inputValue.trim()}"</span>
              </div>
            </CommandEmpty>
            <CommandGroup>
              {selectItems.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.name}
                  className="flex items-center gap-2"
                  onMouseDown={(e) => {
                    console.log('in onMouseDown - item.name:', item.name);
                    e.preventDefault();
                    handleSelect(item.name);
                  }}
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                  {selectedValues.includes(item.name) && <span className="ml-auto">✓</span>}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
