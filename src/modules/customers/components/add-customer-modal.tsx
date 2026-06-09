"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { services } from "@/modules/customers/services/customer-mock-data"
import type { Customer } from "@/modules/customers/services/types/customer-types"

const customerFormSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  serviceName: z.string().min(1, "Service is required"),
})

type CustomerFormData = z.infer<typeof customerFormSchema>

interface AddCustomerModalProps {
  onAddCustomer?: (customer: Customer) => Promise<void>
}

export function AddCustomerModal({ onAddCustomer }: AddCustomerModalProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [rootError, setRootError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerFormData, string>>>({})
  const [formData, setFormData] = useState<CustomerFormData>({
    fullName: "",
    email: "",
    phoneNumber: "",
    serviceName: "",
  })

  const validate = (): boolean => {
    const result = customerFormSchema.safeParse(formData)
    if (!result.success) {
      const newErrors: Partial<Record<keyof CustomerFormData, string>> = {}
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof CustomerFormData
        if (!newErrors[field]) {
          newErrors[field] = issue.message
        }
      })
      setErrors(newErrors)
      return false
    }
    setErrors({})
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setRootError(null)

    if (!validate()) return

    setIsLoading(true)
    try {
      const customerId = `CUS-${Date.now()}`
      const customer: Customer = {
        id: customerId,
        ...formData,
      }
      await onAddCustomer?.(customer)
      setFormData({ fullName: "", email: "", phoneNumber: "", serviceName: "" })
      setOpen(false)
    } catch (err) {
      setRootError(err instanceof Error ? err.message : "Failed to create customer")
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setFormData({ fullName: "", email: "", phoneNumber: "", serviceName: "" })
    setErrors({})
    setRootError(null)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          <span>Add Customer</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Customer</DialogTitle>
            <DialogDescription>
              Enter the customer information below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, fullName: e.target.value }))
                }
              />
              {errors.fullName && (
                <p className="text-sm text-destructive">{errors.fullName}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="+1-555-0101"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    phoneNumber: e.target.value,
                  }))
                }
              />
              {errors.phoneNumber && (
                <p className="text-sm text-destructive">{errors.phoneNumber}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="serviceName">Service *</Label>
              <Select
                value={formData.serviceName}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, serviceName: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.value} value={service.value}>
                      {service.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.serviceName && (
                <p className="text-sm text-destructive">{errors.serviceName}</p>
              )}
            </div>
            {rootError && (
              <p className="text-sm text-destructive">{rootError}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                handleReset()
                setOpen(false)
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
