import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  writeBatch,
} from "firebase/firestore"

import { db } from "@/lib/firebase/client"
import { ROLES, USER_ROLES } from "./rbac-mock-data"
import type { Role, UserRole } from "./types/rbac-types"

const ROLES_COLLECTION = "roles"
const USER_ROLES_COLLECTION = "user_roles"

// ─── Query ───────────────────────────────────────────────────────────────────

export async function getRoleById(roleId: string): Promise<Role | null> {
  const snap = await getDoc(doc(db, ROLES_COLLECTION, roleId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Role
}

export async function getAllRoles(): Promise<Role[]> {
  const snap = await getDocs(collection(db, ROLES_COLLECTION))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Role)
}

export async function getUserRole(uid: string): Promise<UserRole | null> {
  const snap = await getDoc(doc(db, USER_ROLES_COLLECTION, uid))
  if (!snap.exists()) return null
  return { uid: snap.id, ...snap.data() } as UserRole
}

export async function getUserRoleWithDetails(
  uid: string
): Promise<{ userRole: UserRole | null; role: Role | null }> {
  const userRole = await getUserRole(uid)
  if (!userRole) return { userRole: null, role: null }
  const role = await getRoleById(userRole.roleId)
  return { userRole, role }
}

// ─── Seed ────────────────────────────────────────────────────────────────────

export async function seedRolesAndUserRoles(): Promise<void> {
  const batch = writeBatch(db)

  ROLES.forEach((role) => {
    batch.set(doc(db, ROLES_COLLECTION, role.id), role, { merge: true })
  })

  USER_ROLES.forEach((ur) => {
    batch.set(doc(db, USER_ROLES_COLLECTION, ur.uid), ur, { merge: true })
  })

  await batch.commit()
}

// ─── Permission helpers ──────────────────────────────────────────────────────

export async function canAccessMenu(
  uid: string,
  menuKey: string
): Promise<boolean> {
  const { role } = await getUserRoleWithDetails(uid)
  if (!role) return false
  return role.menus.includes(menuKey)
}

export async function getUserMenus(uid: string): Promise<string[]> {
  const { role } = await getUserRoleWithDetails(uid)
  return role?.menus ?? []
}
