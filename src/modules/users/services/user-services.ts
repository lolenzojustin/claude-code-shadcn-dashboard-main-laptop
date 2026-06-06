import { getFirestoreCollection } from "@/lib/firebase/firestore-query"

import { userMockData } from "./user-mock-data"
import type { User, UserFormValues } from "./types/user-types"

export async function getUsers(): Promise<User[]> {
  return getFirestoreCollection<User>("users", userMockData)
}

export function generateUserAvatar(name: string) {
  const names = name.split(" ")

  if (names.length >= 2) {
    return `${names[0][0]}${names[1][0]}`.toUpperCase()
  }

  return name.substring(0, 2).toUpperCase()
}

export function createUser(users: User[], userData: UserFormValues): User {
  const nextId = users.length > 0 ? Math.max(...users.map((user) => user.id)) + 1 : 1
  const today = new Date().toISOString().split("T")[0]

  return {
    id: nextId,
    name: userData.name,
    email: userData.email,
    avatar: generateUserAvatar(userData.name),
    role: userData.role,
    plan: userData.plan,
    billing: userData.billing,
    status: userData.status,
    joinedDate: today,
    lastLogin: today,
  }
}
