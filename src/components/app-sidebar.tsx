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
import { getUserMenus } from "@/modules/rbac/services/rbac-services"
import { auth } from "@/lib/firebase/client"
import { MENU_KEYS } from "@/modules/rbac/services/types/rbac-types"

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
  const [allowedMenus, setAllowedMenus] = React.useState<string[]>([])

  const user = {
    name:
      status === "loading"
        ? "Loading..."
        : session?.user?.name || session?.user?.email?.split("@")[0] || "Guest",
    email: session?.user?.email ?? "",
    avatar: session?.user?.image ?? "",
  }

  React.useEffect(() => {
    async function loadRole() {
      try {
        const firebaseUser = auth.currentUser
        const uid = firebaseUser?.uid || session?.user?.id
        if (!uid) return

        const menus = await getUserMenus(uid)
        setAllowedMenus(menus)
      } catch (err) {
        console.error("Failed to load user role for sidebar:", err)
      }
    }

    if (session?.user?.id || auth.currentUser) {
      loadRole()
    }
  }, [session])

  const filteredNavGroups = filterNavGroups(ALL_NAV_GROUPS, allowedMenus)

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
          const filteredItems = filteredNavGroups[idx] ?? []
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
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
