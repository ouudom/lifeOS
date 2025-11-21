"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { Chat } from "@/components/chat/chat";

export default function Home() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <Chat />
      </SidebarInset>
    </SidebarProvider>
  );
}
