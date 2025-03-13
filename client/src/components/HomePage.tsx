import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table } from "../../../server/src/types";
import { trpc } from "../utils/trpc";
import { Button } from "./ui/button";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
} from "./ui/sidebar";

export default function HomePage() {
  const navigate = useNavigate();
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
    <SidebarProvider>
      <div className="flex h-full">
        <Sidebar>
          <SidebarHeader className="mt-16">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-lg font-semibold">Tables</h2>
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
              <SidebarGroupLabel>Your Tables</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {tables.map((table) => (
                    <SidebarMenuItem key={table.id}>
                      <SidebarMenuButton
                        onClick={() => navigate(`/tables/${table.id}`)}
                      >
                        {table.name}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-bold">Welcome to Deep Table</h1>
          <p className="mt-2 text-gray-600">
            Select a table from the sidebar or create a new one to get started.
          </p>
        </main>
      </div>
    </SidebarProvider>
  );
} 