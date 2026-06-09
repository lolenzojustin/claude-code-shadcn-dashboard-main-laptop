"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { ArrowUp, Users, UserCheck, UserCog, UserX } from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

import {
  createCustomer,
  deleteCustomer,
  getCustomers,
  seedCustomersWithClient,
} from "@/modules/customers/services/customer-services"
import { DataTable } from "@/modules/customers/components/data-table"
import { getCustomerColumns } from "@/modules/customers/components/columns"
import type { Customer } from "@/modules/customers/services/types/customer-types"

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [isSeeding, setIsSeeding] = useState(false)

  const refreshCustomers = useCallback(async () => {
    setCustomers(await getCustomers())
  }, [])

  useEffect(() => {
    refreshCustomers().finally(() => setLoading(false))
  }, [refreshCustomers])

  const handleAddCustomer = useCallback(
    async (customer: Customer) => {
      await createCustomer(customer)
      await refreshCustomers()
    },
    [refreshCustomers]
  )

  const handleUpdateCustomer = useCallback(
    async (customer: Customer) => {
      await createCustomer(customer)
      setCustomers((prev) =>
        prev.map((item) => (item.id === customer.id ? customer : item))
      )
    },
    []
  )

  const handleDeleteCustomer = useCallback(async (customerId: string) => {
    await deleteCustomer(customerId)
    setCustomers((prev) => prev.filter((c) => c.id !== customerId))
  }, [])

  const handleSeed = useCallback(async () => {
    setIsSeeding(true)
    try {
      setCustomers(await seedCustomersWithClient())
    } finally {
      setIsSeeding(false)
    }
  }, [])

  const columns = useMemo(
    () =>
      getCustomerColumns({
        onUpdateCustomer: handleUpdateCustomer,
        onDeleteCustomer: handleDeleteCustomer,
      }),
    [handleDeleteCustomer, handleUpdateCustomer]
  )

  const stats = useMemo(() => {
    const total = customers.length
    const marketing = customers.filter(
      (c) => c.serviceName === "Marketing"
    ).length
    const seo = customers.filter((c) => c.serviceName === "SEO").length
    const dev = customers.filter(
      (c) => c.serviceName === "Development"
    ).length
    const other = total - marketing - seo - dev
    return { total, marketing, seo, dev, other }
  }, [customers])

  if (loading) {
    return (
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <>
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Customer Management
          </h1>
          <p className="text-muted-foreground">
            Manage your customers and their information.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Customers
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.total > 0 ? Math.round(stats.total * 0.1) : 0} from
                last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Marketing
              </CardTitle>
              <UserCog className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.marketing}</div>
              <p className="text-xs text-muted-foreground">Active campaigns</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">SEO</CardTitle>
              <ArrowUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.seo}</div>
              <p className="text-xs text-muted-foreground">SEO projects</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Development</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.dev}</div>
              <p className="text-xs text-muted-foreground">Dev projects</p>
            </CardContent>
          </Card>
        </div>

        <DataTable
          data={customers}
          columns={columns}
          onAddCustomer={handleAddCustomer}
          onSeedCustomers={handleSeed}
          isSeedingCustomers={isSeeding}
        />
      </div>
    </>
  )
}
