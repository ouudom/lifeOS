"use client"

import * as React from "react"
import {
  AudioWaveform,
  Command,
  Computer,
  GalleryVerticalEnd,
  LayoutGrid,
  Settings2,
  Share2,
  Sparkles,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavGroup, NavItems } from "./nav-items"
import { TeamSwitcher } from "./team-switcher"
import { NavUser } from "./nav-user"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
}

const navItems: NavGroup[] = [
  {
    sidebarGroupTitle: "Platform",
    sidebarItems: [
      {
        name: "Dashboard",
        url: "/",
        icon: Computer,
      },

    ]
  },
  {
    sidebarGroupTitle: "Content Engine",
    sidebarItems: [
      {
        name: "Content",
        url: "/content",
        icon: Sparkles,
      },
      {
        name: "Posts",
        url: "/post",
        icon: LayoutGrid,
      },
    ],
  },
  {
    sidebarGroupTitle: "Settings",
    sidebarItems: [
      {
        sidebarGroupTitle: "Settings",
        url: "#",
        icon: Settings2,
        sidebarSubItems: [
          {
            name: "General",
            url: "#",
          },
          {
            name: "Team",
            url: "#",
          },
          {
            name: "Billing",
            url: "#",
          },
          {
            name: "Limits",
            url: "#",
          },
        ],
      },
      {
        name: "Platforms",
        url: "/platforms",
        icon: Share2,
      },
    ],
  },

];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavItems navItems={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: data.user.name,
            email: data.user.email,
            avatar: data.user.avatar,
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
