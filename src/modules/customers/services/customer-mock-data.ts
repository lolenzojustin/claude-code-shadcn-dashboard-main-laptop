import { customerSchema } from "./types/customer-types"

export const services = [
  { value: "SEO", label: "SEO" },
  { value: "Marketing", label: "Marketing" },
  { value: "Development", label: "Development" },
  { value: "Design", label: "Design" },
  { value: "Support", label: "Support" },
]

const customersData = [
  {
    id: "CUS-1001",
    fullName: "John Doe",
    email: "john.doe@example.com",
    phoneNumber: "+1-555-0101",
    serviceName: "SEO",
  },
  {
    id: "CUS-1002",
    fullName: "Jane Smith",
    email: "jane.smith@example.com",
    phoneNumber: "+1-555-0102",
    serviceName: "Marketing",
  },
  {
    id: "CUS-1003",
    fullName: "Michael Johnson",
    email: "michael.johnson@example.com",
    phoneNumber: "+1-555-0103",
    serviceName: "Development",
  },
  {
    id: "CUS-1004",
    fullName: "Emily Brown",
    email: "emily.brown@example.com",
    phoneNumber: "+1-555-0104",
    serviceName: "Design",
  },
  {
    id: "CUS-1005",
    fullName: "David Wilson",
    email: "david.wilson@example.com",
    phoneNumber: "+1-555-0105",
    serviceName: "Support",
  },
]

export const customerMockData = customerSchema.array().parse(customersData)
