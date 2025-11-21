"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";

export type NavLeaf = {
  name: string;
  url: string;
  icon?: LucideIcon;
};

export type NavParent = {
  sidebarGroupTitle: string;
  url?: string;
  icon?: LucideIcon;
  sidebarSubItems: NavLeaf[];
};

export type NavItem = NavLeaf | NavParent;

export type NavGroup = {
  sidebarGroupTitle: string;
  sidebarItems: NavItem[];
};

function isNavParent(item: NavItem): item is NavParent {
  return "sidebarSubItems" in item && Array.isArray(item.sidebarSubItems);
}

export function NavItems({ navItems }: { navItems: NavGroup[] }) {
  const pathname = usePathname();
  const { state } = useSidebar();

  return (
    <>
      {navItems.map((group) => (
        <SidebarGroup key={group.sidebarGroupTitle}>
          <SidebarGroupLabel>{group.sidebarGroupTitle}</SidebarGroupLabel>
          <SidebarMenu>
            {group.sidebarItems.map((item) => {
              if (isNavParent(item)) {
                const childActive = item.sidebarSubItems.some((child) =>
                  pathname === child.url || pathname.startsWith(`${child.url}/`),
                );

                // When collapsed, show dropdown menu
                if (state === "collapsed") {
                  return (
                    <SidebarMenuItem key={item.sidebarGroupTitle}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <SidebarMenuButton
                            tooltip={item.sidebarGroupTitle}
                            data-active={childActive}
                            className="transition-colors"
                          >
                            {item.icon ? <item.icon /> : null}
                            <span>{item.sidebarGroupTitle}</span>
                          </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          side="right"
                          align="start"
                          className="min-w-48"
                        >
                          {item.sidebarSubItems.map((child) => {
                            const isActive =
                              pathname === child.url ||
                              pathname.startsWith(`${child.url}/`);

                            return (
                              <DropdownMenuItem key={child.name} asChild>
                                <Link
                                  href={child.url}
                                  className={
                                    isActive
                                      ? "bg-accent font-medium"
                                      : ""
                                  }
                                >
                                  {child.name}
                                </Link>
                              </DropdownMenuItem>
                            );
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </SidebarMenuItem>
                  );
                }

                // When expanded, show collapsible menu
                return (
                  <Collapsible
                    key={item.sidebarGroupTitle}
                    asChild
                    defaultOpen={childActive}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={item.sidebarGroupTitle}
                          data-active={childActive}
                          className="transition-colors"
                        >
                          {item.icon ? <item.icon /> : null}
                          <span>{item.sidebarGroupTitle}</span>
                          <ChevronRight className="ml-auto shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.sidebarSubItems.map((child) => {
                            const isActive =
                              pathname === child.url ||
                              pathname.startsWith(`${child.url}/`);

                            return (
                              <SidebarMenuSubItem key={child.name}>
                                <SidebarMenuSubButton asChild isActive={isActive}>
                                  <Link href={child.url}>
                                    <span>{child.name}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              }

              const isActive =
                pathname === item.url || pathname.startsWith(`${item.url}/`);

              return (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.name}
                    data-active={isActive}
                    className="transition-colors"
                  >
                    <Link href={item.url}>
                      {item.icon ? <item.icon /> : null}
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  );
}
