"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

import { services } from "@/modules/customers/services/customer-mock-data"
import type { Customer } from "@/modules/customers/services/types/customer-types"
import { DataTableRowActions } from "./data-table-row-actions"

interface CustomerColumnActions {
  onUpdateCustomer?: (customer: Customer) => void | Promise<void>
  onDeleteCustomer?: (customerId: string) => void | Promise<void>
}

export function getCustomerColumns({
  onUpdateCustomer,
  onDeleteCustomer,
}: CustomerColumnActions = {}): ColumnDef<Customer>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px] cursor-pointer"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px] cursor-pointer"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "id",
      header: "ID",
      size: 190,
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.getValue("id")}
        </span>
      ),
      enableHiding: false,
    },
    {
      accessorKey: "fullName",
      header: "Full Name",
      size: 220,
      cell: ({ row }) => (
        <span className="font-medium text-sm">
          {row.getValue("fullName")}
        </span>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      size: 280,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.getValue("email")}
        </span>
      ),
    },
    {
      accessorKey: "phoneNumber",
      header: "Phone",
      size: 140,
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue("phoneNumber")}</span>
      ),
    },
    {
      accessorKey: "service",
      header: "Service",
      size: 160,
      cell: ({ row }) => {
        const service = services.find(
          (s) => s.value === row.getValue("service")
        )
        if (!service) return null
        return <Badge variant="outline">{service.label}</Badge>
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DataTableRowActions
          row={row}
          onUpdateCustomer={onUpdateCustomer}
          onDeleteCustomer={onDeleteCustomer}
        />
      ),
    },
  ]
}

export const columns = getCustomerColumns()
