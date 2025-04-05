import { Column, SelectItem } from '@shared/types';
import { ICellRendererParams } from 'ag-grid-community';
import { ExternalLink } from 'lucide-react';
import React from 'react';

// Helper functions
export const isUrl = (str: string | undefined | null): boolean => {
  if (!str) return false;

  // Skip numeric values, including those with commas/periods
  // eslint-disable-next-line no-useless-escape
  if (/^[\d,.]+$/.test(str)) return false;

  // More strict URL pattern requiring at least a domain part with a dot
  // eslint-disable-next-line no-useless-escape
  const urlPattern =
    /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/;
  return urlPattern.test(str);
};

export const truncateUrl = (url: any): string => {
  // Make sure url is a string
  if (typeof url !== 'string') {
    return url ? String(url) : '';
  }

  // Remove protocol and www
  return url.replace(/^(https?:\/\/)?(www\.)?/, '');
};

// Function to check if a value should be rendered as a URL
export const shouldUseUrlRenderer = (value: any): boolean => {
  return typeof value === 'string' && isUrl(value);
};

// New component for rendering individual select items as pills
const SelectPill = ({ value, color }: { value: string; color: string }) => {
  return (
    <span
      className="px-2 py-0.5 rounded-full text-sm inline-flex items-center"
      style={{
        backgroundColor: `${color}20`, // Using 20% opacity version of the color
        color: color,
        border: `1px solid ${color}40`, // Using 40% opacity for border
      }}
    >
      {value}
    </span>
  );
};

// Renderer for select/multiSelect cells
interface SelectCellRendererParams extends ICellRendererParams {
  colDef: Column;
  value: string;
}

const SelectCellRenderer = (props: SelectCellRendererParams) => {
  const selectItems = props.colDef.additionalTypeInformation?.selectItems || [];
  const value = props.value;

  if (!value) return <span></span>;

  // For multiSelect, value might be comma-separated
  const values: string[] =
    props.colDef.type === 'multiSelect'
      ? value
          .split(',')
          .map((v: string) => v.trim())
          .filter(Boolean)
      : [value];

  return (
    <div className="flex flex-wrap gap-1">
      {values.map((val: string, index: number) => {
        const selectItem = selectItems.find((item: SelectItem) => item.name === val);
        if (!selectItem) {
          // Fallback for values that don't have a matching select item
          return (
            <span key={index} className="text-gray-500">
              {val}
            </span>
          );
        }
        return <SelectPill key={selectItem.id} value={selectItem.name} color={selectItem.color} />;
      })}
    </div>
  );
};

// Add this near the top with other helper functions
const EnrichingIndicator = () => (
  <div className="flex items-center gap-2">
    <div className="h-2 w-2 rounded-full bg-green-500 animate-[pulse_1.5s_ease-in-out_infinite]" />
    <span className="text-gray-500">Enriching...</span>
  </div>
);

// Update the smartCellRenderer function
export const smartCellRenderer = (params: ICellRendererParams) => {
  const colDef = params.colDef as Column;
  const value = params.value;

  console.log('value in smartCellRenderer', value);

  // Add check for enriching state
  if (value === 'Enriching...') {
    return <EnrichingIndicator />;
  }

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

// Custom cell renderer for links
interface LinkCellRendererProps extends ICellRendererParams {
  value: any;
}

export const LinkCellRenderer = (props: LinkCellRendererProps) => {
  const url = props.value;

  if (!url) return <span></span>;

  // Convert to string if not already a string
  const urlString = typeof url === 'string' ? url : String(url);

  // Handle click on the link icon
  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent cell from going into edit mode

    // Ensure URL has protocol for opening
    let fullUrl = urlString;
    if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
      fullUrl = 'https://' + urlString;
    }

    window.open(fullUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex items-center gap-1 w-full h-full" title={urlString}>
      <span className="truncate flex-1">{truncateUrl(urlString)}</span>
      <button
        onClick={handleLinkClick}
        className="text-blue-400 hover:text-blue-600 focus:outline-none ml-auto"
        aria-label="Open link"
      >
        <ExternalLink size={16} />
      </button>
    </div>
  );
};
