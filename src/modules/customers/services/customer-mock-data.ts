import { customerSchema } from "./types/customer-types"

export const services = [
  { value: "consulting", label: "Consulting" },
  { value: "development", label: "Development" },
  { value: "design", label: "Design" },
  { value: "marketing", label: "Marketing" },
  { value: "support", label: "Support" },
]

const customersData = [
  { id: "CUS-1001", fullName: "Nguyen Van A", email: "nguyenvana@email.com", phoneNumber: "0912 345 678", service: "consulting" },
  { id: "CUS-1002", fullName: "Tran Thi B", email: "tranthib@email.com", phoneNumber: "0934 567 890", service: "development" },
  { id: "CUS-1003", fullName: "Le Van C", email: "levanc@email.com", phoneNumber: "0945 678 901", service: "design" },
  { id: "CUS-1004", fullName: "Pham Thi D", email: "phamthid@email.com", phoneNumber: "0956 789 012", service: "marketing" },
  { id: "CUS-1005", fullName: "Hoang Van E", email: "hoangvane@email.com", phoneNumber: "0967 890 123", service: "support" },
  { id: "CUS-1006", fullName: "Dinh Thi F", email: "dinhthif@email.com", phoneNumber: "0978 901 234", service: "consulting" },
  { id: "CUS-1007", fullName: "Bui Van G", email: "buivang@email.com", phoneNumber: "0989 012 345", service: "development" },
  { id: "CUS-1008", fullName: "Do Thi H", email: "dothih@email.com", phoneNumber: "0901 123 456", service: "design" },
  { id: "CUS-1009", fullName: "Vu Van I", email: "vuvani@email.com", phoneNumber: "0912 234 567", service: "marketing" },
  { id: "CUS-1010", fullName: "Ngo Thi K", email: "ngothik@email.com", phoneNumber: "0923 345 678", service: "support" },
]

export const customerMockData = customerSchema.array().parse(customersData)
