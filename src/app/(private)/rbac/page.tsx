"use client"

import * as React from "react"
import {
  Shield,
  Users,
  CheckCircle2,
  XCircle,
  Database,
  Loader2,
  Plus,
  Trash2,
  UserCog,
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
import { toast } from "sonner"
import {
  seedRolesAndUserRoles,
  getAllRoles,
  getUserRole,
} from "@/modules/rbac/services/rbac-services"
import type { Role, UserRole } from "@/modules/rbac/services/types/rbac-types"
import { ROLES, USER_ROLES } from "@/modules/rbac/services/rbac-mock-data"

export default function RbacPage() {
  const [seeding, setSeeding] = React.useState(false)
  const [roles, setRoles] = React.useState<Role[]>([])
  const [userRoles, setUserRoles] = React.useState<UserRole[]>([])
  const [loadingRoles, setLoadingRoles] = React.useState(true)

  const loadFromFirestore = React.useCallback(async () => {
    setLoadingRoles(true)
    try {
      const [firestoreRoles, firestoreUserRoles] = await Promise.all([
        getAllRoles(),
        Promise.all(
          USER_ROLES.map(async (ur) => {
            const r = await getUserRole(ur.uid)
            return r ?? ur
          })
        ),
      ])
      setRoles(firestoreRoles)
      setUserRoles(firestoreUserRoles)
    } catch (err) {
      console.error("Failed to load from Firestore:", err)
    } finally {
      setLoadingRoles(false)
    }
  }, [])

  React.useEffect(() => {
    loadFromFirestore()
  }, [loadFromFirestore])

  const handleSeed = async () => {
    setSeeding(true)
    try {
      await seedRolesAndUserRoles()
      toast.success("Seeded roles & user_roles to Firestore successfully!")
      await loadFromFirestore()
    } catch (err) {
      toast.error("Failed to seed: " + (err instanceof Error ? err.message : String(err)))
    } finally {
      setSeeding(false)
    }
  }

  return (
    <>
      <div className="px-4 lg:px-6 space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">RBAC Management</h1>
          <p className="text-muted-foreground">
            Manage roles, permissions, and user role assignments
          </p>
        </div>

        {/* Seed Action */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Seed Data
            </CardTitle>
            <CardDescription>
              Push roles and user_role seed data into Firestore collections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleSeed} disabled={seeding} size="sm">
              {seeding ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Seeding...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Seed to Firestore
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Tabs defaultValue="roles">
          <TabsList>
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="user-roles">User Roles</TabsTrigger>
            <TabsTrigger value="mock-data">Mock Data (Preview)</TabsTrigger>
          </TabsList>

          {/* ── Roles Tab ────────────────────────────────────────────── */}
          <TabsContent value="roles">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Roles
                </CardTitle>
                <CardDescription>
                  Role definitions — each role grants access to specific menus
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingRoles ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading from Firestore...
                  </div>
                ) : roles.length === 0 ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <XCircle className="w-4 h-4" />
                    No roles in Firestore — click &quot;Seed to Firestore&quot; above
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Role Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Menus</TableHead>
                        <TableHead>Doc ID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {roles.map((role) => (
                        <TableRow key={role.id}>
                          <TableCell className="font-medium">{role.displayName}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {role.description}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {role.menus.map((m) => (
                                <Badge key={m} variant="secondary" className="text-xs">
                                  {m}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {role.id}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── User Roles Tab ───────────────────────────────────────── */}
          <TabsContent value="user-roles">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCog className="w-5 h-5" />
                  User Role Assignments
                </CardTitle>
                <CardDescription>
                  Which role is assigned to each user (stored in Firestore
                  &quot;user_roles&quot; collection)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingRoles ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                  </div>
                ) : userRoles.length === 0 ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <XCircle className="w-4 h-4" />
                    No user_roles in Firestore
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>UID</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Role ID</TableHead>
                        <TableHead>Menu Count</TableHead>
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
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Mock Data Preview Tab ───────────────────────────────── */}
          <TabsContent value="mock-data">
            <div className="space-y-6">
              {/* Roles preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Roles (Mock Data)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Role Name</TableHead>
                        <TableHead>Menus</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ROLES.map((role) => (
                        <TableRow key={role.id}>
                          <TableCell className="font-medium">
                            {role.displayName}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {role.menus.map((m) => (
                                <Badge key={m} variant="secondary" className="text-xs">
                                  {m}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* User roles preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    User Roles (Mock Data)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>UID</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Dashboard 1</TableHead>
                        <TableHead>Dashboard 2</TableHead>
                        <TableHead>Dashboard 3</TableHead>
                        <TableHead>ISO Docs</TableHead>
                        <TableHead>Chat</TableHead>
                        <TableHead>Customers</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {USER_ROLES.map((ur) => {
                        const role = ROLES.find((r) => r.id === ur.roleId)
                        const has = (m: string) => role?.menus.includes(m)
                        return (
                          <TableRow key={ur.uid}>
                            <TableCell className="font-mono text-xs">{ur.uid}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{ur.roleName}</Badge>
                            </TableCell>
                            <TableCell>
                              {has("dashboard") ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              ) : (
                                <XCircle className="w-4 h-4 text-muted-foreground" />
                              )}
                            </TableCell>
                            <TableCell>
                              {has("dashboard-2") ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              ) : (
                                <XCircle className="w-4 h-4 text-muted-foreground" />
                              )}
                            </TableCell>
                            <TableCell>
                              {has("dashboard-3") ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              ) : (
                                <XCircle className="w-4 h-4 text-muted-foreground" />
                              )}
                            </TableCell>
                            <TableCell>
                              {has("iso-documents") ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              ) : (
                                <XCircle className="w-4 h-4 text-muted-foreground" />
                              )}
                            </TableCell>
                            <TableCell>
                              {has("chat") ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              ) : (
                                <XCircle className="w-4 h-4 text-muted-foreground" />
                              )}
                            </TableCell>
                            <TableCell>
                              {has("customers") ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              ) : (
                                <XCircle className="w-4 h-4 text-muted-foreground" />
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
