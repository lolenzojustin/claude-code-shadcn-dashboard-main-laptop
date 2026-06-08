"use client"

import * as React from "react"
import type { Row } from "@tanstack/react-table"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
import {
  customerSchema,
  type Customer,
} from "@/modules/customers/services/types/customer-types"

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
  onUpdateCustomer?: (customer: Customer) => void | Promise<void>
  onDeleteCustomer?: (customerId: string) => void | Promise<void>
}

export function DataTableRowActions<TData>({
  row,
  onUpdateCustomer,
  onDeleteCustomer,
}: DataTableRowActionsProps<TData>) {
  const parsed = customerSchema.safeParse(row.original)
  const [editOpen, setEditOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [draft, setDraft] = React.useState<Customer | null>(null)
  const [isSaving, setIsSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  if (!parsed.success) return null

  const customer = parsed.data

  function openEditDialog() {
    setDraft({ ...customer })
    setError(null)
    setEditOpen(true)
  }

  async function handleSaveEdit() {
    if (!draft) return
    if (!draft.fullName.trim() || !draft.email.trim() || !draft.phoneNumber.trim() || !draft.service) {
      setError("All fields are required")
      return
    }
    try {
      setIsSaving(true)
      setError(null)
      await onUpdateCustomer?.(draft)
      setEditOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update customer")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleConfirmDelete() {
    try {
      setIsSaving(true)
      await onDeleteCustomer?.(customer.id)
      setDeleteOpen(false)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted cursor-pointer"
          >
            <MoreHorizontal />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={openEditDialog}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer text-destructive focus:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>
              Update customer information and save changes.
            </DialogDescription>
          </DialogHeader>

          {draft && (
            <div className="space-y-4">
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <div className="space-y-2">
                <Label htmlFor="edit-fullName">Full Name</Label>
                <Input
                  id="edit-fullName"
                  value={draft.fullName}
                  onChange={(e) =>
                    setDraft((curr) =>
                      curr ? { ...curr, fullName: e.target.value } : curr
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={draft.email}
                  onChange={(e) =>
                    setDraft((curr) =>
                      curr ? { ...curr, email: e.target.value } : curr
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input
                  id="edit-phone"
                  value={draft.phoneNumber}
                  onChange={(e) =>
                    setDraft((curr) =>
                      curr ? { ...curr, phoneNumber: e.target.value } : curr
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-service">Service</Label>
                <Select
                  value={draft.service}
                  onValueChange={(value) =>
                    setDraft((curr) =>
                      curr ? { ...curr, service: value } : curr
                    )
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((svc) => (
                      <SelectItem key={svc.value} value={svc.value}>
                        {svc.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Alert Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              customer <strong>{customer.fullName}</strong> and remove their data
              from Firestore.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isSaving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSaving ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
