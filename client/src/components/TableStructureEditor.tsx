import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Column } from '@shared/types';
import { X } from 'lucide-react';

interface TableStructureEditorProps {
  name: string;
  description: string;
  columns: Column[];
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onColumnsChange: (columns: Column[]) => void;
  onCreateTable: () => void;
}

export const TableStructureEditor: React.FC<TableStructureEditorProps> = ({
  name,
  description,
  columns,
  onNameChange,
  onDescriptionChange,
  onColumnsChange,
  onCreateTable,
}) => {
  const handleColumnNameChange = (index: number, newName: string) => {
    const updatedColumns = columns.map((col, i) => (i === index ? { ...col, name: newName } : col));
    onColumnsChange(updatedColumns);
  };

  const handleColumnDescriptionChange = (index: number, newDescription: string) => {
    const updatedColumns = columns.map((col, i) =>
      i === index ? { ...col, description: newDescription } : col
    );
    onColumnsChange(updatedColumns);
  };

  const handleDeleteColumn = (index: number) => {
    const updatedColumns = columns.filter((_, i) => i !== index);
    onColumnsChange(updatedColumns);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generated Table Structure</CardTitle>
        <CardDescription>Review and edit the generated table structure below.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Table Name</label>
            <Input value={name} onChange={(e) => onNameChange(e.target.value)} className="w-full" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              className="w-full"
            />
          </div>
          <Button variant="default" className="w-full mt-4" onClick={onCreateTable}>
            Create Research Table
          </Button>
          <div className="space-y-2">
            <label className="text-sm font-medium">Columns</label>
            <div className="grid grid-cols-1 gap-2">
              {columns.map((column, index) => (
                <div key={index} className="pb-4">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Input
                          value={column.name}
                          onChange={(e) => handleColumnNameChange(index, e.target.value)}
                          className="flex-1"
                          placeholder="Column name"
                        />
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {column.type}
                        </span>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteColumn(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <Textarea
                        value={column.description || ''}
                        onChange={(e) => handleColumnDescriptionChange(index, e.target.value)}
                        placeholder="Column description"
                        className="w-full text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
