import { Table } from '@shared/types';
import { Moon, MoreVertical, Plus, Settings, Share, Sun, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { trpc } from '../utils/trpc';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from './ui/sidebar';

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: currentTableId } = useParams<{ id?: string }>();
  const [tables, setTables] = useState<Table[]>([]);
  const token = localStorage.getItem('accessToken');
  const utils = trpc.useContext();
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    return stored || 'system';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';

    root.classList.remove('light', 'dark');
    const effectiveTheme = theme === 'system' ? systemTheme : theme;
    root.classList.add(effectiveTheme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Add system theme change listener
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(mediaQuery.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const { data: tablesData } = trpc.tables.getTables.useQuery(
    { token: token || '' },
    { enabled: !!token }
  );

  const deleteTableMutation = trpc.tables.deleteTable.useMutation({
    onSuccess: () => {
      // Refetch tables after deletion
      if (token) {
        utils.tables.getTables.invalidate();
      }
    },
  });

  const handleDeleteTable = async (tableId: string) => {
    try {
      await deleteTableMutation.mutateAsync({
        token: token || '',
        id: tableId,
      });

      // If we're currently viewing the table that was deleted, navigate to home
      if (currentTableId === tableId) {
        navigate('/home');
      }
    } catch (error) {
      console.error('Failed to delete table:', error);
    }
  };

  const updateSharingStatusMutation = trpc.tables.updateSharingStatus.useMutation({
    onSuccess: () => {
      // Refetch tables after updating sharing status
      if (token) {
        utils.tables.getTables.invalidate();
      }
    },
  });

  const handleShareTable = async (tableId: string) => {
    try {
      const table = tables.find((t) => t.id === tableId);
      if (!table) return;

      const newStatus = table.sharingStatus === 'public' ? 'private' : 'public';
      const result = await updateSharingStatusMutation.mutateAsync({
        token: token || '',
        tableId,
        sharingStatus: newStatus,
      });

      if (newStatus === 'public') {
        // Only show the share link and copy to clipboard if making public
        const shareUrl = `${window.location.origin}/tables/${tableId}`;
        await navigator.clipboard.writeText(shareUrl);
        alert('Share link copied to clipboard!');
      }
    } catch (error) {
      console.error('Failed to update sharing status:', error);
      alert('Failed to update sharing status');
    }
  };

  useEffect(() => {
    if (tablesData) {
      setTables(tablesData);
    }
  }, [tablesData]);

  const handleCreateTable = () => {
    navigate('/new');
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center p-[0.12rem] justify-between">
          <h2 className="text-lg ml-2 font-semibold">
            <Link to="/home">Deep Table</Link>
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleCreateTable} className="h-6 w-6">
              <Plus />
            </Button>
            {location.pathname !== '/home' && <SidebarTrigger className="h-6 w-6" />}
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Recently Created</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {tables.map((table) => (
                <SidebarMenuItem key={table.id}>
                  <SidebarMenuButton
                    asChild
                    onClick={() => navigate(`/tables/${table.id}`)}
                    isActive={currentTableId === table.id}
                    className="relative group/item cursor-pointer flex w-full items-center"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="block truncate">{table.name}</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover/item:opacity-100 group-hover/item:bg-background absolute right-1"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleShareTable(table.id)}>
                            {table.sharingStatus === 'public' ? (
                              <>
                                <Share className="mr-2 h-4 w-4" />
                                <span>Make Private</span>
                              </>
                            ) : (
                              <>
                                <Share className="mr-2 h-4 w-4" />
                                <span>Share</span>
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteTable(table.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {tables.length === 0 && (
                <div className="px-2 py-4 text-sm text-muted-foreground">
                  {!token ? (
                    <p>
                      <Link className="text-blue-500" to="/login">
                        Login here
                      </Link>{' '}
                      to create your own tables.
                    </p>
                  ) : (
                    <>
                      <p>
                        <Link className="text-blue-500" to="/new">
                          Create a new table
                        </Link>{' '}
                        to get started.
                      </p>
                    </>
                  )}
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <div className="flex items-center justify-between px-2 py-2">
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => navigate('/settings')}
                isActive={location.pathname === '/settings'}
              >
                <Settings className="mr-2" />
                Settings
              </SidebarMenuButton>
            </SidebarMenuItem>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  {theme === 'light' && <Sun className="h-4 w-4" />}
                  {theme === 'dark' && <Moon className="h-4 w-4" />}
                  {theme === 'system' && <Sun className="h-4 w-4" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme('light')}>
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Light</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Dark</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')}>
                  <span>System</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
