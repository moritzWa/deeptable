import { Column } from '@shared/types';
import { ICellRendererParams } from 'ag-grid-community';
import { LinkCellRenderer, shouldUseUrlRenderer } from './CellRendererLink';
import { SelectCellRenderer, SelectCellRendererParams } from './CellRendererSelect';

// Renderer for select/multiSelect cells

// Update the smartCellRenderer to handle select types
export const smartCellRenderer = (params: ICellRendererParams) => {
  const colDef = params.colDef as Column;
  const value = params.value;

  // Handle select/multiSelect types
  if (colDef.type === 'select' || colDef.type === 'multiSelect') {
    return SelectCellRenderer(params as SelectCellRendererParams);
  }

  // Check if the value is a URL
  const useUrlRenderer = shouldUseUrlRenderer(value) || colDef.type === 'link';
  if (useUrlRenderer) {
    return LinkCellRenderer(params);
  }

  if (colDef.type === 'number') {
    // Add null/undefined check for the value
    if (value === null || value === undefined) {
      return <span className="font-mono w-full text-right"></span>;
    }

    // Convert to number if it's a string
    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    // Check if it's a valid number
    if (isNaN(numValue)) {
      return <span className="font-mono w-full text-right"></span>;
    }

    const isCurrency = colDef.additionalTypeInformation?.currency || false;
    const decimals = colDef.additionalTypeInformation?.decimals ?? 2;

    return (
      <span className="font-mono w-full text-right">
        {isCurrency ? '$' : ''}
        {numValue.toFixed(decimals)}
      </span>
    );
  }

  // For non-special values, just return the value directly
  return <span>{value !== undefined && value !== null ? value : ''}</span>;
};
