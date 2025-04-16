import { Column, EnrichmentMetadata } from '@shared/types';
import { ICellRendererParams } from 'ag-grid-community';
import { LinkCellRenderer, LinkCellRendererProps, shouldUseUrlRenderer } from './CellRendererLink';
import { SelectCellRenderer, SelectCellRendererParams } from './CellRendererSelect';
import { EnrichmentPopover } from './EnrichmentPopover';

// Extend the Column type to include AG Grid specific properties
interface ExtendedColumn extends Column {
  field?: string;
}

// Renderer for select/multiSelect cells

// Add this near the top with other components
const EnrichingIndicator = () => (
  <div className="flex items-center gap-2">
    <span className="text-muted-foreground flex items-center">
      Enriching
      <span className="inline-flex ml-1">
        <span className="animate-[pulse_1s_ease-in-out_0s_infinite]">.</span>
        <span className="animate-[pulse_1s_ease-in-out_0.3s_infinite]">.</span>
        <span className="animate-[pulse_1s_ease-in-out_0.6s_infinite]">.</span>
      </span>
    </span>
    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse transition-transform duration-1000 hover:scale-110" />
  </div>
);

// Helper to find enrichment for a specific column
const findEnrichmentForColumn = (
  enrichments: EnrichmentMetadata[] | undefined,
  columnId: string
): EnrichmentMetadata | undefined => {
  if (!enrichments) return undefined;
  const columnEnrichments = enrichments.filter((e) => e.columnId === columnId);
  if (columnEnrichments.length === 0) return undefined;

  // Sort by date in descending order (most recent first)
  return columnEnrichments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
};

// Update the smartCellRenderer to handle select types
export const smartCellRenderer = (params: ICellRendererParams) => {
  const colDef = params.colDef as ExtendedColumn;
  const value = params.value;
  const rowData = params.data;

  console.log('rowData in smartCellRenderer', rowData);

  // Extract columnId from the field name (e.g., 'data.columnId' -> 'columnId')
  const columnId = colDef.field?.replace('data.', '') || '';

  // Find enrichment for this cell if it exists
  const enrichment = findEnrichmentForColumn(rowData.enrichments, columnId);

  // Add check for enriching state
  if (value === 'Enriching...') {
    console.log('value in smartCellRenderer', value);
    return <EnrichingIndicator />;
  }

  // Create the cell content based on type
  let cellContent;

  // Handle select/multiSelect types
  if (colDef.type === 'select' || colDef.type === 'multiSelect') {
    cellContent = (
      <SelectCellRenderer {...(params as SelectCellRendererParams)} enrichment={enrichment} />
    );
  }
  // Check if the value is a URL
  else if (shouldUseUrlRenderer(value) || colDef.type === 'link') {
    cellContent = (
      <LinkCellRenderer {...(params as LinkCellRendererProps)} enrichment={enrichment} />
    );
  } else if (colDef.type === 'number') {
    // Add null/undefined check for the value
    if (value === null || value === undefined) {
      cellContent = <span className="font-mono w-full text-right"></span>;
    } else {
      // Convert to number if it's a string
      const numValue = typeof value === 'string' ? parseFloat(value) : value;

      // Check if it's a valid number
      if (isNaN(numValue)) {
        cellContent = <span className="font-mono w-full text-right"></span>;
      } else {
        const isCurrency = colDef.additionalTypeInformation?.currency || false;
        const decimals = colDef.additionalTypeInformation?.decimals ?? 2;

        cellContent = (
          <span className="font-mono w-full text-right">
            {isCurrency ? '$' : ''}
            {numValue.toFixed(decimals)}
          </span>
        );
      }
    }
  }
  // For non-special values, just return the value directly
  else {
    cellContent = <span>{value !== undefined && value !== null ? value : ''}</span>;
  }

  // Wrap with enrichment popover if enrichment data exists
  return enrichment ? (
    <EnrichmentPopover enrichment={enrichment}>{cellContent}</EnrichmentPopover>
  ) : (
    cellContent
  );
};
