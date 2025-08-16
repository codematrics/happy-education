import { AppSidebar } from "@/components/common/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import React from "react";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen grid grid-cols-1 justify-center items-center">
      <SidebarProvider>
        <AppSidebar />
        <main className="w-full overflow-hidden">
          <SidebarTrigger />
          {children}
        </main>
      </SidebarProvider>
    </div>
  );
};

export default AdminLayout;
