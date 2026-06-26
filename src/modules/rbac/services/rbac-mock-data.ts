import { roleSchema, userRoleSchema } from "./types/rbac-types"
import type { Role, UserRole } from "./types/rbac-types"

export const ROLES: Role[] = roleSchema.array().parse([
  {
    id: "administrators",
    name: "administrators",
    displayName: "Administrators",
    description: "Full system access — all menus and features",
    menus: [
      "dashboard",
      "dashboard-2",
      "dashboard-3",
      "iso-documents",
      "chat",
      "tasks",
      "users",
      "customers",
      "mail",
      "calendar",
      "faqs",
      "pricing",
      "settings",
    ],
  },
  {
    id: "directors",
    name: "directors",
    displayName: "Directors",
    description: "Access to dashboards and ISO documents",
    menus: ["dashboard", "dashboard-2", "dashboard-3", "iso-documents", "chat"],
  },
  {
    id: "accounting",
    name: "accounting",
    displayName: "Accounting",
    description: "Access to Dashboard 3 and ISO documents",
    menus: ["dashboard-3", "iso-documents", "chat"],
  },
  {
    id: "staffs",
    name: "staffs",
    displayName: "Staffs",
    description: "Access to ISO documents only",
    menus: ["iso-documents", "chat"],
  },
  {
    id: "customers",
    name: "customers",
    displayName: "Customers",
    description: "Access to chat and customer portal",
    menus: ["chat", "customers"],
  },
])

export const USER_ROLES: UserRole[] = userRoleSchema.array().parse([
  { uid: "user-a-001", roleId: "administrators", roleName: "Administrators" },
  { uid: "user-b-002", roleId: "directors", roleName: "Directors" },
  { uid: "user-c-003", roleId: "accounting", roleName: "Accounting" },
  { uid: "user-d-004", roleId: "staffs", roleName: "Staffs" },
  { uid: "user-e-005", roleId: "customers", roleName: "Customers" },
])
