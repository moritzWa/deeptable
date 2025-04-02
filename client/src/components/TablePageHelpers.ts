import { Column, ColumnState } from '@shared/types';
import { ColDef } from 'ag-grid-community';

/**
 * Converts our application's column state format to AG Grid's column definition properties.
 * This handles all the necessary type conversions and null checks for AG Grid compatibility.
 */
export const convertColumnStateToAgGridProps = (
  columnState: ColumnState | undefined
): Partial<ColDef> => {
  if (!columnState) return {};

  const props: Partial<ColDef> = {};

  // Map of column state properties to their conditions
  const propertyMappings = {
    width: columnState.width,
    hide: columnState.hide,
    pinned: columnState.pinned !== null ? columnState.pinned : undefined,
    sort: columnState.sort !== null ? columnState.sort : undefined,
    sortIndex: columnState.sortIndex,
    flex: columnState.flex,
  };

  // Only add properties that have valid values
  Object.entries(propertyMappings).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      props[key as keyof ColDef] = value;
    }
  });

  return props;
};

interface ExportData {
  name: string;
  description: string;
  columns: Column[];
  rows: { id: string; data: Record<string, any> }[];
  sharingStatus: 'private' | 'public';
}

/**
 * Exports table data in a format that can be directly inserted into the database
 */
export const exportTableData = (data: ExportData): string => {
  // Create a clean export object with only the necessary fields
  const exportData = {
    name: data.name,
    description: data.description,
    columns: data.columns.map((column) => ({
      name: column.name,
      type: column.type,
      required: column.required || false,
      defaultValue: column.defaultValue,
      description: column.description,
      columnState: column.columnState,
    })),
    rows: data.rows,
    sharingStatus: data.sharingStatus,
  };

  // Convert to pretty JSON string
  return JSON.stringify(exportData, null, 2);
};

/**
 * Downloads data as a JSON file
 */
export const downloadJson = (data: string, filename: string): void => {
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
