import { EnrichmentMetadata } from '@shared/types';
import { Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ScrollArea } from './ui/scroll-area';

interface EnrichmentPopoverProps {
  enrichment: EnrichmentMetadata;
  children: React.ReactNode;
}

export const EnrichmentPopover = ({ enrichment, children }: EnrichmentPopoverProps) => {
  if (!enrichment) return <>{children}</>;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="relative group flex items-center w-full h-full">
          {children}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 " />
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-4" align="start">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Reasoning Steps</h4>
            <ScrollArea className="h-[100px]">
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                {enrichment.reasoningSteps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </ScrollArea>
          </div>
          <div>
            <h4 className="font-medium mb-2">Sources</h4>
            <ScrollArea className="h-[60px]">
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {enrichment.sources.map((source, index) => (
                  <li key={index}>{source}</li>
                ))}
              </ul>
            </ScrollArea>
          </div>
          <div className="text-xs text-muted-foreground">
            Enriched on: {new Date(enrichment.createdAt).toLocaleString()}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
