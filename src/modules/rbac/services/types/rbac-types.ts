import { z } from "zod"

export const roleSchema = z.object({
  id: z.string(),
  name: z.string(),
  displayName: z.string(),
  description: z.string(),
  menus: z.array(z.string()),
})

export type Role = z.infer<typeof roleSchema>

export const userRoleSchema = z.object({
  uid: z.string(),
  roleId: z.string(),
  roleName: z.string(),
  assignedAt: z.any().optional(),
  assignedBy: z.string().optional(),
})

export type UserRole = z.infer<typeof userRoleSchema>

export const MENU_KEYS = {
  DASHBOARD: "dashboard",
  DASHBOARD_2: "dashboard-2",
  DASHBOARD_3: "dashboard-3",
  ISO_DOCUMENTS: "iso-documents",
  CHAT: "chat",
  TASKS: "tasks",
  USERS: "users",
  CUSTOMERS: "customers",
  MAIL: "mail",
  CALENDAR: "calendar",
  FAQs: "faqs",
  PRICING: "pricing",
  SETTINGS: "settings",
} as const

export type MenuKey = (typeof MENU_KEYS)[keyof typeof MENU_KEYS]
