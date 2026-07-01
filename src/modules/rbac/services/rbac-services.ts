import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore"

import { db } from "@/lib/firebase/client"
import { ROLES, USER_ROLES } from "./rbac-mock-data"
import type { Role, UserRole } from "./types/rbac-types"

const ROLES_COLLECTION = "roles"
const USER_ROLES_COLLECTION = "user_roles"

// ─── Query ───────────────────────────────────────────────────────────────────

export async function getRoleById(roleId: string): Promise<Role | null> {
  try {
    const snap = await getDoc(doc(db, ROLES_COLLECTION, roleId))
    if (snap.exists()) return { id: snap.id, ...snap.data() } as Role
  } catch (err) {
    console.warn("[RBAC] getRoleById Firestore error, using mock:", err)
  }
  // Fallback to mock data
  return (ROLES as Role[]).find((r) => r.id === roleId) ?? null
}

export async function getAllRoles(): Promise<Role[]> {
  try {
    const snap = await getDocs(collection(db, ROLES_COLLECTION))
    if (snap.docs.length > 0) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Role)
    }
  } catch (err) {
    console.warn("[RBAC] getAllRoles Firestore error, using mock:", err)
  }
  return ROLES as Role[]
}

export async function getUserRole(uid: string): Promise<UserRole | null> {
  try {
    // Query by the `uid` field (not document ID) since doc IDs are fake strings
    const q = query(
      collection(db, USER_ROLES_COLLECTION),
      where("uid", "==", uid)
    )
    const snap = await getDocs(q)
    if (!snap.empty) {
      const d = snap.docs[0]
      const result = { uid: d.data().uid, ...d.data() } as UserRole
      console.debug("[RBAC] getUserRole from Firestore:", result)
      return result
    }
    console.debug("[RBAC] No Firestore doc with uid field =", uid, "— checking mock fallback")
  } catch (err) {
    console.warn("[RBAC] getUserRole Firestore error:", err)
  }
  // Fallback to mock data (useful before seeding or during development)
  const fallback = (USER_ROLES as UserRole[]).find((ur) => ur.uid === uid) ?? null
  console.debug("[RBAC] Mock fallback result:", fallback)
  return fallback
}

export async function getAllUserRoles(): Promise<UserRole[]> {
  try {
    const snap = await getDocs(collection(db, USER_ROLES_COLLECTION))
    if (snap.docs.length > 0) {
      return snap.docs.map((d) => ({ uid: d.id, ...d.data() }) as UserRole)
    }
  } catch (err) {
    console.warn("[RBAC] getAllUserRoles Firestore error:", err)
  }
  return USER_ROLES as UserRole[]
}

export async function getUserRoleWithDetails(
  uid: string
): Promise<{ userRole: UserRole | null; role: Role | null }> {
  const userRole = await getUserRole(uid)
  if (!userRole) {
    console.debug("[RBAC] No userRole found for uid:", uid)
    return { userRole: null, role: null }
  }
  console.debug("[RBAC] userRole found:", userRole)
  const role = await getRoleById(userRole.roleId)
  console.debug("[RBAC] role found for roleId", userRole.roleId, ":", role)
  return { userRole, role }
}

// ─── Assign / Update / Delete ───────────────────────────────────────────────

/**
 * Assign (or update) a role to a Firebase user.
 * Document ID = Firebase UID (from Authentication).
 */
export async function setUserRole(
  uid: string,
  roleId: string,
  roleName: string
): Promise<void> {
  await setDoc(
    doc(db, USER_ROLES_COLLECTION, uid),
    { uid, roleId, roleName },
    { merge: true }
  )
}

export async function deleteUserRole(uid: string): Promise<void> {
  await deleteDoc(doc(db, USER_ROLES_COLLECTION, uid))
}

// ─── Seed ────────────────────────────────────────────────────────────────────

export async function seedRoles(): Promise<void> {
  const batch = writeBatch(db)
  ROLES.forEach((role) => {
    batch.set(doc(db, ROLES_COLLECTION, role.id), role, { merge: true })
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
