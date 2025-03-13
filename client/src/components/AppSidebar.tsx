import { Plus, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Table } from "../../../server/src/types";
import { trpc } from "../utils/trpc";
import { Button } from "./ui/button";
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
} from "./ui/sidebar";

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: currentTableId } = useParams<{ id?: string }>();
  const [tables, setTables] = useState<Table[]>([]);
  const token = localStorage.getItem("token");

  const { data: tablesData } = trpc.tables.getTables.useQuery(
    { token: token || "" },
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
        <div className="flex items-center justify-between px-2 py-4">
          <h2 className="text-lg font-semibold"><Link to="/home">Deep Table</Link></h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCreateTable}
            className="h-8 w-8"
          >
            <Plus className="h-4 w-4" />
          </Button>
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
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => navigate('/settings')}
              isActive={location.pathname === '/settings'}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
} 