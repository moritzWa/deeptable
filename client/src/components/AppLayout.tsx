import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { SidebarInset } from "./ui/sidebar";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen w-full">
      <AppSidebar />
      <SidebarInset>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </SidebarInset>
    </div>
  );
} 