import { ICellRendererParams } from 'ag-grid-community';
import { ExternalLink } from 'lucide-react';
import React from 'react';
import { CustomColDef } from './TablePage';

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

// Custom cell renderer factory - decides whether to use link renderer or default
export const smartCellRenderer = (params: ICellRendererParams<{ description: string}>) => {
  const value = params.value;

  // Check if the value is a URL
  const useUrlRenderer = shouldUseUrlRenderer(value) || params.colDef?.type === 'link';
  if (useUrlRenderer) {
    return LinkCellRenderer(params);
  }
  const colDef = params.colDef as CustomColDef;
  if (colDef.type === 'number' && colDef.additionalTypeInformation.currency) {
    const decimals = colDef.additionalTypeInformation.decimals || 2; 
    return <span className='font-mono w-full text-right'>${value.toFixed(decimals)}</span>;
  }

  // For non-URL values, just return the value directly
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
