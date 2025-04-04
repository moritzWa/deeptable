import { SelectItem } from '@shared/types';
import { CustomCellEditorProps } from 'ag-grid-react';
import { useEffect, useRef, useState } from 'react';
import { SelectPill } from './CellRendererSelect';
import { Command, CommandGroup, CommandItem } from './ui/command';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

interface SelectCellEditorProps extends CustomCellEditorProps {
  colDef: {
    type: 'select' | 'multiSelect';
    additionalTypeInformation?: {
      selectItems?: SelectItem[];
    };
  };
}

export const SelectCellEditor = ({
  value: initialValue,
  onValueChange,
  colDef,
  stopEditing,
}: SelectCellEditorProps) => {
  const isMultiSelect = colDef.type === 'multiSelect';
  const selectItems = colDef.additionalTypeInformation?.selectItems || [];
  const [isOpen, setIsOpen] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

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
    } else if (e.key === 'Enter' && !isMultiSelect) {
      stopEditing();
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
          className="w-full h-full flex flex-wrap gap-1 focus:outline-none"
          onKeyDown={onKeyDown}
          onMouseDown={handleMouseDown}
          tabIndex={0}
        >
          {selectedValues.map((val) => {
            const item = selectItems.find((i) => i.name === val);
            if (!item) return null;
            return <SelectPill key={item.id} value={item.name} color={item.color} />;
          })}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandGroup>
            {selectItems.map((item) => (
              <CommandItem
                key={item.id}
                onSelect={() => handleSelect(item.name)}
                className="flex items-center gap-2"
                onMouseDown={(e) => e.stopPropagation()} // Prevent AG Grid from handling the event
              >
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.name}</span>
                {selectedValues.includes(item.name) && <span className="ml-auto">✓</span>}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
