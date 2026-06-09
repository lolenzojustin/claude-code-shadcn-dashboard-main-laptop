"use client"

import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { z } from "zod"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { services } from "@/modules/customers/services/customer-mock-data"
import type { Customer } from "@/modules/customers/services/types/customer-types"

const customerFormSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  serviceName: z.string().min(1, "Service is required"),
})

type CustomerFormData = z.infer<typeof customerFormSchema>

interface CustomerColumnsProps {
  onUpdateCustomer: (customer: Customer) => void
  onDeleteCustomer: (customerId: string) => void
}

function EditCustomerDialog({
  customer,
  onSave,
  onClose,
}: {
  customer: Customer
  onSave: (c: Customer) => void
  onClose: () => void
}) {
  const [formData, setFormData] = useState<CustomerFormData>({
    fullName: customer.fullName,
    email: customer.email,
    phoneNumber: customer.phoneNumber,
    serviceName: customer.serviceName,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerFormData, string>>>({})

  const validate = () => {
    const result = customerFormSchema.safeParse(formData)
    if (!result.success) {
      const newErrors: Partial<Record<keyof CustomerFormData, string>> = {}
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof CustomerFormData
        if (!newErrors[field]) newErrors[field] = issue.message
      })
      setErrors(newErrors)
      return false
    }
    setErrors({})
    return true
  }

  const handleSave = () => {
    if (!validate()) return
    onSave({ ...customer, ...formData })
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Customer</DialogTitle>
          <DialogDescription>
            Update the customer information below.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-fullName">Full Name *</Label>
            <Input
              id="edit-fullName"
              value={formData.fullName}
              onChange={(e) =>
                setFormData((p) => ({ ...p, fullName: e.target.value }))
              }
            />
            {errors.fullName && (
              <p className="text-sm text-destructive">{errors.fullName}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-email">Email *</Label>
            <Input
              id="edit-email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((p) => ({ ...p, email: e.target.value }))
              }
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-phoneNumber">Phone Number *</Label>
            <Input
              id="edit-phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData((p) => ({ ...p, phoneNumber: e.target.value }))
              }
            />
            {errors.phoneNumber && (
              <p className="text-sm text-destructive">{errors.phoneNumber}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-serviceName">Service *</Label>
            <Select
              value={formData.serviceName}
              onValueChange={(value) =>
                setFormData((p) => ({ ...p, serviceName: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {services.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.serviceName && (
              <p className="text-sm text-destructive">{errors.serviceName}</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function getCustomerColumns({
  onUpdateCustomer,
  onDeleteCustomer,
}: CustomerColumnsProps): ColumnDef<Customer>[] {
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
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "id",
      header: "ID",
      size: 140,
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground block overflow-hidden text-ellipsis whitespace-nowrap">
          {row.getValue("id")}
        </span>
      ),
      enableHiding: false,
    },
    {
      accessorKey: "fullName",
      header: "Full Name",
      size: 160,
      cell: ({ row }) => (
        <span className="font-medium text-sm block overflow-hidden text-ellipsis whitespace-nowrap">
          {row.getValue("fullName")}
        </span>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      size: 200,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground block overflow-hidden text-ellipsis whitespace-nowrap">
          {row.getValue("email")}
        </span>
      ),
    },
    {
      accessorKey: "phoneNumber",
      header: "Phone",
      size: 110,
      cell: ({ row }) => (
        <span className="text-sm block overflow-hidden text-ellipsis whitespace-nowrap">
          {row.getValue("phoneNumber")}
        </span>
      ),
    },
    {
      accessorKey: "serviceName",
      header: "Service",
      size: 120,
      cell: ({ row }) => {
        const service = services.find(
          (s) => s.value === row.getValue("serviceName")
        )
        if (!service) return null
        return <Badge variant="outline">{service.label}</Badge>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const customer = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => onUpdateCustomer(customer)}
                className="cursor-pointer"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDeleteCustomer(customer.id)}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}

export const columns = getCustomerColumns({
  onUpdateCustomer: () => {},
  onDeleteCustomer: () => {},
})
