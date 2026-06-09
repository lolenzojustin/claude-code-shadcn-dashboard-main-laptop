"use client"

import type { Table } from "@tanstack/react-table"
import { RefreshCcw, Database } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { services } from "@/modules/customers/services/customer-mock-data"
import type { Customer } from "@/modules/customers/services/types/customer-types"
import { DataTableViewOptions } from "./data-table-view-options"
import { AddCustomerModal } from "./add-customer-modal"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  onAddCustomer?: (customer: Customer) => Promise<void>
  onSeedCustomers?: () => void | Promise<void>
  isSeedingCustomers?: boolean
}

export function DataTableToolbar<TData>({
  table,
  onAddCustomer,
  onSeedCustomers,
  isSeedingCustomers,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  const handleServiceChange = (value: string) => {
    const column = table.getColumn("serviceName")
    if (value === "all") {
      column?.setFilterValue(undefined)
    } else {
      column?.setFilterValue(value)
    }
  }

  const serviceFilter = table.getColumn("serviceName")?.getFilterValue() as
    | string
    | undefined

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="Search name..."
            value={
              (table.getColumn("fullName")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("fullName")?.setFilterValue(event.target.value)
            }
            className="w-[200px] lg:w-[300px] cursor-text"
          />
          <Select value={serviceFilter || "all"} onValueChange={handleServiceChange}>
            <SelectTrigger className="w-[160px] cursor-pointer">
              <SelectValue placeholder="Service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="cursor-pointer">
                All Services
              </SelectItem>
              {services.map((svc) => (
                <SelectItem
                  key={svc.value}
                  value={svc.value}
                  className="cursor-pointer"
                >
                  {svc.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isFiltered && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.resetColumnFilters()}
              className="cursor-pointer"
            >
              <RefreshCcw className="h-4 w-4" />
              Reset
            </Button>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={onSeedCustomers}
            disabled={!onSeedCustomers || isSeedingCustomers}
          >
            <Database className="h-4 w-4" />
            <span className="hidden lg:block">
              {isSeedingCustomers ? "Seeding..." : "Seed Data"}
            </span>
          </Button>
          <DataTableViewOptions table={table} />
          <AddCustomerModal onAddCustomer={onAddCustomer} />
        </div>
      </div>
    </div>
  )
}
