import { Table } from '@shared/types';
import { Moon, Plus, Settings, Sun } from 'lucide-react';
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
  const token = localStorage.getItem('token');
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
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            <Link to="/home">Deep Table</Link>
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleCreateTable} className="h-8 w-8">
              <Plus className="h-4 w-4" />
            </Button>
            <SidebarTrigger className="h-8 w-8" />
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
                    onClick={() => navigate(`/tables/${table.id}`)}
                    isActive={currentTableId === table.id}
                  >
                    {table.name}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {tables.length === 0 && (
                <div className="px-2 py-4 text-sm text-muted-foreground">
                  No tables yet. Create your first table to get started.
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
                <Settings className="mr-2 h-4 w-4" />
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
