import { SelectItem } from '@shared/types';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';

interface SelectTypeItemFormProps {
  selectItems?: SelectItem[];
  onUpdateItems: (items: SelectItem[]) => void;
  isMultiSelect?: boolean;
}

export const SelectTypeItemForm = ({
  selectItems = [],
  onUpdateItems,
  isMultiSelect,
}: SelectTypeItemFormProps) => {
  const [newItemName, setNewItemName] = useState('');

  const handleAddItem = () => {
    if (!newItemName.trim()) return;

    const newItem: SelectItem = {
      id: crypto.randomUUID(),
      name: newItemName.trim(),
      color: generateRandomColor(), // You'll need to implement this
    };

    onUpdateItems([...selectItems, newItem]);
    setNewItemName('');
  };

  const handleRemoveItem = (id: string) => {
    onUpdateItems(selectItems.filter((item) => item.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddItem();
    }
  };

  return (
    <div className="p-2 flex flex-col gap-4">
      <div>
        <Label>{isMultiSelect ? 'Multi-Select' : 'Select'} Options</Label>
        <div className="flex gap-2 mt-2">
          <Input
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add new option..."
            className="h-8"
          />
          <Button onClick={handleAddItem} variant="outline" size="sm" className="px-2">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {selectItems.length > 0 && (
        <ScrollArea className="max-h-[400px]">
          <div className="flex flex-col gap-2">
            {selectItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 pl-2 rounded border group hover:border-primary"
              >
                <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }} />
                <span className="flex-1">{item.name}</span>
                <Button
                  onClick={() => handleRemoveItem(item.id)}
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

// Helper function to generate random colors
function generateRandomColor(): string {
  const colors = [
    '#373530', // Light Gray
    '#787774', // Gray
    '#976D57', // Brown
    '#CC772F', // Orange
    '#C29243', // Yellow
    '#548064', // Green
    '#477DA5', // Blue
    '#A48BBE', // Purple
    '#B35588', // Pink
    '#C4554D', // Red
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
