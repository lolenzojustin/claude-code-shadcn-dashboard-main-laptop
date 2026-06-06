"use client"

import { useEffect, useState } from "react"
import { StatCards } from "@/modules/users/components/stat-cards"
import { DataTable } from "@/modules/users/components/data-table"
import { userMockData } from "@/modules/users/services/user-mock-data"
import { createUser, getUsers } from "@/modules/users/services/user-services"
import type { User, UserFormValues } from "@/modules/users/services/types/user-types"

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(userMockData)

  useEffect(() => {
    getUsers().then(setUsers)
  }, [])

  const handleAddUser = (userData: UserFormValues) => {
    const newUser = createUser(users, userData)
    setUsers(prev => [newUser, ...prev])
  }

  const handleDeleteUser = (id: number) => {
    setUsers(prev => prev.filter(user => user.id !== id))
  }

  const handleEditUser = (user: User) => {
    // For now, just log the user to edit
    // In a real app, you'd open an edit dialog
    console.log("Edit user:", user)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="@container/main px-4 lg:px-6">
        <StatCards />
      </div>
      
      <div className="@container/main px-4 lg:px-6 mt-8 lg:mt-12">
        <DataTable 
          users={users}
          onDeleteUser={handleDeleteUser}
          onEditUser={handleEditUser}
          onAddUser={handleAddUser}
        />
      </div>
    </div>
  )
}
