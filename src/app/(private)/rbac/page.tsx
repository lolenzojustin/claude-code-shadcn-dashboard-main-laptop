"use client"

import * as React from "react"
import {
  Shield,
  Users,
  CheckCircle2,
  XCircle,
  Database,
  Loader2,
  Pencil,
  Trash2,
  UserCog,
  Plus,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import {
  seedRoles,
  getAllRoles,
  getAllUserRoles,
  setUserRole,
  deleteUserRole,
} from "@/modules/rbac/services/rbac-services"
import type { Role, UserRole } from "@/modules/rbac/services/types/rbac-types"
import { ROLES } from "@/modules/rbac/services/rbac-mock-data"

export default function RbacPage() {
  const [roles, setRoles] = React.useState<Role[]>([])
  const [userRoles, setUserRoles] = React.useState<UserRole[]>([])
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [seedingRoles, setSeedingRoles] = React.useState(false)

  // Assign form state
  const [formUid, setFormUid] = React.useState("")
  const [formRoleId, setFormRoleId] = React.useState("")
  const [editingUid, setEditingUid] = React.useState<string | null>(null)

  const loadData = React.useCallback(async () => {
    setLoading(true)
    try {
      const [r, ur] = await Promise.all([getAllRoles(), getAllUserRoles()])
      setRoles(r)
      setUserRoles(ur)
    } catch (err) {
      toast.error("Failed to load data: " + (err instanceof Error ? err.message : String(err)))
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const handleSeedRoles = async () => {
    setSeedingRoles(true)
    try {
      await seedRoles()
      toast.success("Roles seeded to Firestore successfully!")
      await loadData()
    } catch (err) {
      toast.error("Seed failed: " + (err instanceof Error ? err.message : String(err)))
    } finally {
      setSeedingRoles(false)
    }
  }

  function openEdit(ur: UserRole) {
    setEditingUid(ur.uid)
    setFormUid(ur.uid)
    setFormRoleId(ur.roleId)
  }

  function cancelEdit() {
    setEditingUid(null)
    setFormUid("")
    setFormRoleId("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formUid.trim()) {
      toast.error("Please enter a Firebase UID")
      return
    }
    if (!formRoleId) {
      toast.error("Please select a role")
      return
    }

    const role = roles.find((r) => r.id === formRoleId)
    if (!role) {
      toast.error("Invalid role")
      return
    }

    setSaving(true)
    try {
      await setUserRole(formUid.trim(), role.id, role.displayName)
      toast.success(
        editingUid
          ? `Updated role for UID ${formUid.trim()}`
          : `Assigned "${role.displayName}" to UID ${formUid.trim()}`
      )
      cancelEdit()
      await loadData()
    } catch (err) {
      toast.error("Save failed: " + (err instanceof Error ? err.message : String(err)))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(uid: string) {
    if (!confirm(`Delete role assignment for UID "${uid}"?`)) return
    try {
      await deleteUserRole(uid)
      toast.success(`Removed role for UID ${uid}`)
      await loadData()
    } catch (err) {
      toast.error("Delete failed: " + (err instanceof Error ? err.message : String(err)))
    }
  }

  return (
    <div className="px-4 lg:px-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">RBAC Management</h1>
        <p className="text-muted-foreground">
          Assign roles to Firebase users by their UID
        </p>
      </div>

      {/* ── Assign / Edit Form ───────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserCog className="w-5 h-5" />
            {editingUid ? "Edit User Role Assignment" : "Assign Role to User"}
          </CardTitle>
          <CardDescription>
            Enter the user&apos;s Firebase UID (from Authentication &rarr; Users &rarr; User UID) and select a role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex flex-col gap-1.5 w-full sm:w-80">
              <Label htmlFor="uid">Firebase UID</Label>
              <Input
                id="uid"
                placeholder="dAfi98yS7WT5f1LuK319MLrSd9T2"
                value={formUid}
                onChange={(e) => setFormUid(e.target.value)}
                disabled={saving}
              />
            </div>
            <div className="flex flex-col gap-1.5 w-full sm:w-52">
              <Label>Role</Label>
              <Select value={formRoleId} onValueChange={setFormRoleId} disabled={saving}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role..." />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={saving || !formUid || !formRoleId}>
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : editingUid ? (
                  <Pencil className="w-4 h-4 mr-2" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                {editingUid ? "Update" : "Assign"}
              </Button>
              {editingUid && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={cancelEdit}
                  disabled={saving}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ── Seed Roles + Tabs ────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSeedRoles}
          disabled={seedingRoles}
        >
          {seedingRoles ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Database className="w-4 h-4 mr-2" />
          )}
          {seedingRoles ? "Seeding..." : "Seed Roles to Firestore"}
        </Button>

        <Tabs defaultValue="assignments" className="w-auto">
          <TabsList>
            <TabsTrigger value="assignments">
              User Assignments ({userRoles.length})
            </TabsTrigger>
            <TabsTrigger value="role-matrix">Role Matrix</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* ── User Assignments Table ────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            User Role Assignments
          </CardTitle>
          <CardDescription>
            Each row = one Firestore document in &quot;user_roles&quot; — doc ID = Firebase UID
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading...
            </div>
          ) : userRoles.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
              <XCircle className="w-8 h-8" />
              <p className="font-medium">No user role assignments found</p>
              <p className="text-sm">Use the form above to assign a role to a Firebase UID</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Firebase UID</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Role ID</TableHead>
                  <TableHead>Menu Count</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userRoles.map((ur) => {
                  const role = roles.find((r) => r.id === ur.roleId)
                  return (
                    <TableRow key={ur.uid}>
                      <TableCell className="font-mono text-xs">{ur.uid}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{ur.roleName}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {ur.roleId}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {role?.menus.length ?? "?"} menus
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEdit(ur)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(ur.uid)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ── Role Matrix ───────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Role Permission Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-40">Role</TableHead>
                  <TableHead className="text-center">Dashboard 1</TableHead>
                  <TableHead className="text-center">Dashboard 2</TableHead>
                  <TableHead className="text-center">Dashboard 3</TableHead>
                  <TableHead className="text-center">ISO Docs</TableHead>
                  <TableHead className="text-center">Chat</TableHead>
                  <TableHead className="text-center">Tasks</TableHead>
                  <TableHead className="text-center">Users</TableHead>
                  <TableHead className="text-center">Customers</TableHead>
                  <TableHead className="text-center">Settings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ROLES.map((role) => {
                  const has = (m: string) => role.menus.includes(m)
                  return (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">{role.displayName}</TableCell>
                      <TableCell className="text-center">
                        {has("dashboard") ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" />
                        ) : (
                          <XCircle className="w-4 h-4 text-muted-foreground mx-auto" />
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {has("dashboard-2") ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" />
                        ) : (
                          <XCircle className="w-4 h-4 text-muted-foreground mx-auto" />
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {has("dashboard-3") ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" />
                        ) : (
                          <XCircle className="w-4 h-4 text-muted-foreground mx-auto" />
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {has("iso-documents") ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" />
                        ) : (
                          <XCircle className="w-4 h-4 text-muted-foreground mx-auto" />
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {has("chat") ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" />
                        ) : (
                          <XCircle className="w-4 h-4 text-muted-foreground mx-auto" />
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {has("tasks") ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" />
                        ) : (
                          <XCircle className="w-4 h-4 text-muted-foreground mx-auto" />
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {has("users") ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" />
                        ) : (
                          <XCircle className="w-4 h-4 text-muted-foreground mx-auto" />
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {has("customers") ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" />
                        ) : (
                          <XCircle className="w-4 h-4 text-muted-foreground mx-auto" />
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {has("settings") ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" />
                        ) : (
                          <XCircle className="w-4 h-4 text-muted-foreground mx-auto" />
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
