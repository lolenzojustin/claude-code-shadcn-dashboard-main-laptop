"use client"

import * as React from "react"
import { onAuthStateChanged, type User } from "firebase/auth"
import { auth } from "@/lib/firebase/client"
import { getUserRoleWithDetails } from "@/modules/rbac/services/rbac-services"

interface CachedRole {
  uid: string
  menus: string[]
  roleId: string
  roleName: string
}

function getCacheKey(uid: string) {
  return `rbac_role_${uid}`
}

function getCachedRole(uid: string): CachedRole | null {
  try {
    const raw = sessionStorage.getItem(getCacheKey(uid))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function setCachedRole(role: CachedRole): void {
  try {
    sessionStorage.setItem(getCacheKey(role.uid), JSON.stringify(role))
  } catch {
    // sessionStorage might be unavailable (e.g. private browsing restrictions)
  }
}

function clearCachedRole(uid: string): void {
  try {
    sessionStorage.removeItem(getCacheKey(uid))
  } catch {
    // ignore
  }
}

/**
 * Returns the current user's allowed menus based on their Firestore role.
 * Caches in sessionStorage per UID to avoid re-fetching on every navigation.
 * Listens to Firebase auth state and resolves role on first sign-in.
 */
export function useUserRole() {
  const [menus, setMenus] = React.useState<string[]>([])
  const [roleName, setRoleName] = React.useState<string>("")
  const [roleId, setRoleId] = React.useState<string>("")
  const [uid, setUid] = React.useState<string>("")
  const [loading, setLoading] = React.useState(true)
  const [loaded, setLoaded] = React.useState(false)
  const [error, setError] = React.useState<string>("")

  React.useEffect(() => {
    let cancelled = false

    async function resolveRole(user: User | null) {
      if (!user) {
        console.debug("[RBAC] useUserRole: no user")
        if (!cancelled) {
          setMenus([])
          setRoleName("")
          setRoleId("")
          setUid("")
          setLoading(false)
          setLoaded(true)
        }
        return
      }

      const firebaseUid = user.uid
      console.debug("[RBAC] useUserRole: Firebase UID =", firebaseUid)

      // Always clear stale cache — user may have logged in with a different account
      clearCachedRole(firebaseUid)

      // Check sessionStorage cache first
      const cached = getCachedRole(firebaseUid)
      if (cached) {
        console.debug("[RBAC] useUserRole: cache hit →", cached.menus)
        if (!cancelled) {
          setMenus(cached.menus)
          setRoleName(cached.roleName)
          setRoleId(cached.roleId)
          setUid(firebaseUid)
          setLoading(false)
          setLoaded(true)
        }
        return
      }

      // Fetch from Firestore (with fallback)
      console.debug("[RBAC] useUserRole: cache miss → fetching from Firestore")
      try {
        const { userRole, role } = await getUserRoleWithDetails(firebaseUid)

        if (cancelled) return

        if (role && userRole) {
          const newCache: CachedRole = {
            uid: firebaseUid,
            menus: role.menus,
            roleId: userRole.roleId,
            roleName: userRole.roleName,
          }
          setCachedRole(newCache)
          console.debug("[RBAC] useUserRole: role resolved →", role.menus)
          setMenus(role.menus)
          setRoleName(userRole.roleName)
          setRoleId(userRole.roleId)
        } else {
          console.debug("[RBAC] useUserRole: no role found for uid", firebaseUid)
          setMenus([])
          setRoleName("")
          setRoleId("")
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        console.error("[RBAC] useUserRole: error fetching role:", msg)
        if (!cancelled) {
          setError(msg)
          setMenus([])
        }
      }

      if (!cancelled) {
        setUid(firebaseUid)
        setLoading(false)
        setLoaded(true)
      }
    }

    // Resolve immediately if user already signed in (e.g. on HMR / Next.js fast refresh)
    if (auth.currentUser) {
      console.debug("[RBAC] useUserRole: currentUser already available →", auth.currentUser.uid)
      resolveRole(auth.currentUser)
    }

    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (cancelled) return
      await resolveRole(user)
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])

  return { menus, roleName, roleId, uid, loading, loaded, error }
}
