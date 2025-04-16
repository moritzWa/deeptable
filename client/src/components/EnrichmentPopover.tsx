import { EnrichmentMetadata } from '@shared/types';
import { Info, Link as LinkIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ScrollArea } from './ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface EnrichmentPopoverProps {
  enrichment: EnrichmentMetadata;
  children: React.ReactNode;
}

// Utility functions for favicon
function getRootOfURL(url: string): string {
  try {
    return new URL(url).hostname;
  } catch (e) {
    return '';
  }
}

function getFaviconUrlFromDuckDuckGo(baseDomain: string): string {
  return `https://icons.duckduckgo.com/ip3/${baseDomain}.ico`;
}

function getFaviconURL(url: string): string {
  const root = getRootOfURL(url);
  return getFaviconUrlFromDuckDuckGo(root);
}

function isValidUrl(urlString: string): boolean {
  try {
    new URL(urlString);
    return true;
  } catch (e) {
    return false;
  }
}

export const EnrichmentPopover = ({ enrichment, children }: EnrichmentPopoverProps) => {
  if (!enrichment) return <>{children}</>;

  return (
    <TooltipProvider>
      <Tooltip delayDuration={400}>
        <TooltipTrigger asChild>
          <div className="relative group flex items-center w-full h-full">
            <Popover>
              <PopoverTrigger asChild>
                <div className="relative group flex items-center w-full h-full">
                  {children}
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-[350px] p-4" align="start">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Reasoning Steps</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                      {enrichment.reasoningSteps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Sources</h4>
                    <ScrollArea className="h-[60px]">
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {enrichment.sources.map((source, index) => {
                          const isUrl = isValidUrl(source);
                          return (
                            <li key={index} className="flex items-center gap-2">
                              {isUrl ? (
                                <>
                                  <img
                                    src={getFaviconURL(source)}
                                    alt=""
                                    className="w-4 h-4 object-contain"
                                    onError={(e) => {
                                      // If favicon fails to load, replace with generic link icon
                                      e.currentTarget.style.display = 'none';
                                      e.currentTarget.nextElementSibling?.classList.remove(
                                        'hidden'
                                      );
                                    }}
                                  />
                                  <LinkIcon className="w-4 h-4 hidden" />
                                  <a
                                    href={source}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:underline text-blue-600 dark:text-blue-400"
                                  >
                                    {getRootOfURL(source)}
                                  </a>
                                </>
                              ) : (
                                <span>{source}</span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </ScrollArea>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Enriched on: {new Date(enrichment.createdAt).toLocaleString()}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" align="center">
          <p>Click to see enrichment metadata, double click to edit</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
