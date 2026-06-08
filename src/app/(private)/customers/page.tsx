"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { ArrowUp, Users, UserCheck, UserCog, UserX } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getCustomerColumns } from "@/modules/customers/components/columns"
import { DataTable } from "@/modules/customers/components/data-table"
import {
  createCustomer,
  deleteCustomer,
  getCustomerStats,
  getCustomers,
  seedCustomersWithClient,
  updateCustomer,
} from "@/modules/customers/services/customer-services"
import type { Customer } from "@/modules/customers/services/types/customer-types"

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [isSeedingCustomers, setIsSeedingCustomers] = useState(false)

  const refreshCustomers = useCallback(async () => {
    const list = await getCustomers()
    setCustomers(list)
  }, [])

  useEffect(() => {
    const load = async () => {
      try {
        await refreshCustomers()
      } catch (error) {
        console.error("Failed to load customers:", error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [refreshCustomers])

  const handleAddCustomer = useCallback(
    async (newCustomer: Customer) => {
      await createCustomer(newCustomer)
      await refreshCustomers()
    },
    [refreshCustomers]
  )

  const handleUpdateCustomer = useCallback(async (customer: Customer) => {
    await updateCustomer(customer)
    setCustomers((prev) =>
      prev.map((item) => (item.id === customer.id ? customer : item))
    )
  }, [])

  const handleDeleteCustomer = useCallback(async (customerId: string) => {
    await deleteCustomer(customerId)
    setCustomers((prev) => prev.filter((c) => c.id !== customerId))
  }, [])

  const handleSeedCustomers = useCallback(async () => {
    try {
      setIsSeedingCustomers(true)
      const seeded = await seedCustomersWithClient()
      setCustomers(seeded)
    } catch (error) {
      console.error("Failed to seed customers:", error)
    } finally {
      setIsSeedingCustomers(false)
    }
  }, [])

  const customerColumns = useMemo(
    () =>
      getCustomerColumns({
        onUpdateCustomer: handleUpdateCustomer,
        onDeleteCustomer: handleDeleteCustomer,
      }),
    [handleDeleteCustomer, handleUpdateCustomer]
  )

  const stats = getCustomerStats(customers)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading customers...</div>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-2 px-4 md:px-6">
        <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
        <p className="text-muted-foreground">
          Manage your customer list with full CRUD operations.
        </p>
      </div>

      <div className="h-full flex-1 flex-col space-y-6 px-4 md:px-6 md:flex">
        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Total Customers
                  </p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{stats.total}</span>
                  </div>
                </div>
                <div className="bg-secondary rounded-lg p-3">
                  <Users className="size-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Consulting
                  </p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold">
                      {stats.byService["consulting"] ?? 0}
                    </span>
                  </div>
                </div>
                <div className="bg-secondary rounded-lg p-3">
                  <UserCog className="size-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Development
                  </p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold">
                      {stats.byService["development"] ?? 0}
                    </span>
                  </div>
                </div>
                <div className="bg-secondary rounded-lg p-3">
                  <UserCheck className="size-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Other Services
                  </p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold">
                      {(stats.byService["design"] ?? 0) +
                        (stats.byService["marketing"] ?? 0) +
                        (stats.byService["support"] ?? 0)}
                    </span>
                  </div>
                </div>
                <div className="bg-secondary rounded-lg p-3">
                  <UserX className="size-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Management</CardTitle>
            <CardDescription>
              View, filter, and manage all your customers in one place
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={customers}
              columns={customerColumns}
              onAddCustomer={handleAddCustomer}
              onSeedCustomers={handleSeedCustomers}
              isSeedingCustomers={isSeedingCustomers}
            />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
