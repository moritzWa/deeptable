import { IHeaderParams } from 'ag-grid-community';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from './dropdown-menu';
import { Input } from './input';

export const CustomColumnHeader = (props: IHeaderParams) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="w-full h-full flex items-center px-2 cursor-pointer hover:bg-accent/50">
          {props.displayName}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64">
        <DropdownMenuLabel>Column Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5">
          <Input
            value={props.displayName}
            className="h-8 w-full"
            placeholder="Column name"
          />
        </div>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            Pin Left
          </DropdownMenuItem>
          <DropdownMenuItem>
            Pin Right
          </DropdownMenuItem>
          <DropdownMenuItem>
            Reset Pin
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            Hide Column
          </DropdownMenuItem>
          <DropdownMenuItem>
            Show All Columns
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}; 