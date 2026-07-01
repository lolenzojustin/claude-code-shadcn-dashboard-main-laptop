"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import {
  LayoutPanelLeft,
  LayoutDashboard,
  Megaphone,
  Mail,
  CheckSquare,
  MessageCircle,
  Calendar,
  HelpCircle,
  CreditCard,
  Users,
  UserCog,
  FileText,
  Settings,
  type LucideIcon,
} from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/logo"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useUserRole } from "@/hooks/use-user-role"
import { MENU_KEYS } from "@/modules/rbac/services/types/rbac-types"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2 } from "lucide-react"

interface NavMenuItem {
  title: string
  url: string
  icon?: LucideIcon
  menuKey?: string
  items?: NavMenuItem[]
}

interface NavGroup {
  label: string
  items: NavMenuItem[]
}

const ALL_NAV_GROUPS: NavGroup[] = [
  {
    label: "Dashboards",
    items: [
      {
        title: "Dashboard 1",
        url: "/dashboard",
        icon: LayoutDashboard,
        menuKey: MENU_KEYS.DASHBOARD,
      },
      {
        title: "Dashboard 2",
        url: "/dashboard-2",
        icon: LayoutPanelLeft,
        menuKey: MENU_KEYS.DASHBOARD_2,
      },
      {
        title: "Dashboard 3",
        url: "/dashboard-3",
        icon: Megaphone,
        menuKey: MENU_KEYS.DASHBOARD_3,
      },
    ],
  },
  {
    label: "Management",
    items: [
      {
        title: "Tasks",
        url: "/tasks",
        icon: CheckSquare,
        menuKey: MENU_KEYS.TASKS,
      },
      {
        title: "Users",
        url: "/users",
        icon: Users,
        menuKey: MENU_KEYS.USERS,
      },
      {
        title: "Customers",
        url: "/customers",
        icon: UserCog,
        menuKey: MENU_KEYS.CUSTOMERS,
      },
      {
        title: "Mail",
        url: "/mail",
        icon: Mail,
        menuKey: MENU_KEYS.MAIL,
      },
      {
        title: "Calendar",
        url: "/calendar",
        icon: Calendar,
        menuKey: MENU_KEYS.CALENDAR,
      },
    ],
  },
  {
    label: "Documents",
    items: [
      {
        title: "ISO Documents",
        url: "/iso-documents",
        icon: FileText,
        menuKey: MENU_KEYS.ISO_DOCUMENTS,
      },
    ],
  },
  {
    label: "Chat",
    items: [
      {
        title: "Chat",
        url: "/chat",
        icon: MessageCircle,
        menuKey: MENU_KEYS.CHAT,
      },
    ],
  },
  {
    label: "Pages",
    items: [
      {
        title: "Settings",
        url: "/settings/user",
        icon: Settings,
        menuKey: MENU_KEYS.SETTINGS,
      },
      {
        title: "FAQs",
        url: "/faqs",
        icon: HelpCircle,
        menuKey: MENU_KEYS.FAQs,
      },
      {
        title: "Pricing",
        url: "/pricing",
        icon: CreditCard,
        menuKey: MENU_KEYS.PRICING,
      },
    ],
  },
]

function filterNavGroups(
  groups: NavGroup[],
  allowedMenus: string[]
): Parameters<typeof NavMain>[0]["items"][] {
  return groups
    .map((group) => {
      const filteredItems: Parameters<typeof NavMain>[0]["items"] = []
      for (const item of group.items) {
        if (item.menuKey && !allowedMenus.includes(item.menuKey)) continue
        const filteredSubItems = item.items?.filter(
          (sub) => !sub.menuKey || allowedMenus.includes(sub.menuKey)
        )
        filteredItems.push({ ...item, items: filteredSubItems })
      }
      return filteredItems
    })
    .filter((items) => items.length > 0)
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session, status } = useSession()
  const { menus: allowedMenus, roleName, roleId, uid, loading: roleLoading, error: rbacError } = useUserRole()

  const user = {
    name:
      status === "loading" || roleLoading
        ? "Loading..."
        : session?.user?.name || session?.user?.email?.split("@")[0] || "Guest",
    email: session?.user?.email ?? "",
    avatar: session?.user?.image ?? "",
  }

  const visibleNavGroups = filterNavGroups(ALL_NAV_GROUPS, allowedMenus)

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Logo size={24} className="text-current" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Claude Code</span>
                  <span className="truncate text-xs">Admin Dashboard</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {ALL_NAV_GROUPS.map((group, idx) => {
          const filteredItems = visibleNavGroups[idx] ?? []
          return (
            <NavMain
              key={group.label}
              label={group.label}
              items={filteredItems}
            />
          )
        })}
      </SidebarContent>
      <SidebarFooter>
        {/* ── RBAC Debug Panel ─────────────────────────────── */}
        <div className="px-3 py-2 border-t">
          <div className="text-xs text-muted-foreground mb-1 font-medium">
            RBAC Debug
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">UID:</span>
              <span className="text-[10px] font-mono text-muted-foreground truncate max-w-[140px]">
                {uid || "(none)"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">Role:</span>
              <Badge variant="outline" className="text-[10px] h-4 px-1">
                {roleLoading ? (
                  <Loader2 className="w-2.5 h-2.5 animate-spin mr-0.5 inline" />
                ) : roleName ? (
                  roleName
                ) : (
                  "(no role)"
                )}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">RoleId:</span>
              <span className="text-[10px] font-mono text-muted-foreground">
                {roleId || "(none)"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">Menus:</span>
              <span className="text-[10px] text-muted-foreground">
                {roleLoading ? (
                  "..."
                ) : allowedMenus.length > 0 ? (
                  allowedMenus.length + " menus"
                ) : (
                  "(none)"
                )}
              </span>
            </div>
            <div className="flex flex-wrap gap-0.5 mt-1">
              {allowedMenus.map((m) => (
                <span
                  key={m}
                  className="text-[9px] bg-primary/10 text-primary px-1 rounded"
                >
                  {m}
                </span>
              ))}
              {allowedMenus.length === 0 && !roleLoading && rbacError && (
                <span className="text-[9px] text-destructive">error loading role</span>
              )}
            {allowedMenus.length === 0 && !roleLoading && !rbacError && (
              <span className="text-[9px] text-destructive">no menus — check Firestore</span>
            )}
            </div>
          </div>
        </div>
        <Separator className="my-1" />
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
