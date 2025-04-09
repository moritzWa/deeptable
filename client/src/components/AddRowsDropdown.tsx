import { useToast } from '@/hooks/use-toast';
import { trpc } from '@/utils/trpc';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export const useAddRows = (tableId: string, onSuccess: () => void) => {
  const token = localStorage.getItem('accessToken');
  const { toast } = useToast();
  const navigate = useNavigate();

  const createRowsWithEntitiesMutation = trpc.rows.createRowsWithEntities.useMutation({
    onSuccess: () => {
      onSuccess();
      toast({
        title: 'Success',
        description: 'Rows with entities added successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add rows with entities',
        variant: 'destructive',
      });
    },
  });

  const handleAddRowsWithEntities = (count: number) => {
    if (!token) {
      navigate('/login?reason=add-rows-login-wall');
      return;
    }

    createRowsWithEntitiesMutation.mutate({ token, tableId, count });
  };

  return {
    handleAddRowsWithEntities,
    isLoadingEntities: createRowsWithEntitiesMutation.isLoading,
  };
};

export const AddRowsDropdown = ({
  tableId,
  onSuccess,
  isPublicView,
}: {
  tableId: string;
  onSuccess: () => void;
  isPublicView?: boolean;
}) => {
  const token = localStorage.getItem('accessToken');
  const { toast } = useToast();
  const navigate = useNavigate();
  const { handleAddRowsWithEntities, isLoadingEntities } = useAddRows(tableId, onSuccess);

  const createRowsMutation = trpc.rows.createRows.useMutation({
    onSuccess: () => {
      onSuccess();
      toast({
        title: 'Success',
        description: 'Rows added successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add rows',
        variant: 'destructive',
      });
    },
  });

  const handleAddRows = (count: number, withEntities: boolean = false) => {
    if (!token) {
      navigate('/login?reason=add-rows-login-wall');
      return;
    }

    if (withEntities) {
      handleAddRowsWithEntities(count);
    } else {
      createRowsMutation.mutate({ token, tableId, count });
    }
  };

  const isLoadingRegular = createRowsMutation.isLoading;
  const isLoading = isLoadingRegular || isLoadingEntities;

  const rowCounts = [10, 25, 50];

  interface AddRowMenuItemProps {
    count: number;
    withEntities?: boolean;
    isLoadingRegular: boolean;
    isLoadingEntities: boolean;
    onAdd: (count: number, withEntities: boolean) => void;
  }

  const AddRowMenuItem = ({
    count,
    withEntities = false,
    isLoadingRegular,
    isLoadingEntities,
    onAdd,
  }: AddRowMenuItemProps) => {
    const isLoading = isLoadingRegular || isLoadingEntities;
    const isCurrentTypeLoading = withEntities ? isLoadingEntities : isLoadingRegular;

    return (
      <DropdownMenuItem
        onClick={() => onAdd(count, withEntities)}
        disabled={isLoading}
        className={isLoading ? 'cursor-wait' : 'cursor-pointer'}
      >
        {isCurrentTypeLoading
          ? `Adding ${count} rows${withEntities ? ' with entities' : ''}...`
          : `Add ${count} rows${withEntities ? ' with entities' : ''}`}
      </DropdownMenuItem>
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`flex items-center gap-1 ${isLoading ? 'cursor-wait' : 'cursor-pointer'}`}
          disabled={isLoading}
        >
          <Plus className="h-4 w-4" />
          {isLoading ? 'Adding Rows...' : isPublicView ? 'Compare More Items' : 'Add Rows'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {rowCounts.map((count) => (
          <div key={count}>
            <AddRowMenuItem
              count={count}
              isLoadingRegular={isLoadingRegular}
              isLoadingEntities={isLoadingEntities}
              onAdd={handleAddRows}
            />
            <AddRowMenuItem
              count={count}
              withEntities={true}
              isLoadingRegular={isLoadingRegular}
              isLoadingEntities={isLoadingEntities}
              onAdd={handleAddRows}
            />
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
