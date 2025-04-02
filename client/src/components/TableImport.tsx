import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FileImage, TableProperties } from 'lucide-react';

interface TableImportProps {
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasteImage: (e: React.ClipboardEvent) => void;
  selectedFile: File | null;
  pastedImage: string | null;
}

export const TableImport: React.FC<TableImportProps> = ({
  onFileUpload,
  onPasteImage,
  selectedFile,
  pastedImage,
}) => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Import Existing Data</CardTitle>
        <CardDescription>
          Upload a CSV/Excel file or paste a screenshot to generate your table structure
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-1">
              <Card className="border-2 border-dashed">
                <CardContent className="p-6">
                  <div className="text-center">
                    <Input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={onFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="space-y-2">
                        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <TableProperties className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-sm font-medium">Upload CSV/Excel</h3>
                        <p className="text-xs text-muted-foreground">
                          Drag & drop or click to upload
                        </p>
                      </div>
                    </label>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="col-span-1">
              <Card
                className="border-2 border-dashed"
                onPaste={onPasteImage}
                tabIndex={0}
                role="button"
              >
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="space-y-2">
                      <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <FileImage className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-sm font-medium">Paste Screenshot</h3>
                      <p className="text-xs text-muted-foreground">
                        Ctrl+V or Cmd+V to paste image
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {selectedFile && (
            <p className="text-sm text-muted-foreground">Selected file: {selectedFile.name}</p>
          )}
          {pastedImage && (
            <p className="text-sm text-muted-foreground">Screenshot received! Ready to process.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
