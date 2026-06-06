export interface User {
  id: number
  name: string
  email: string
  avatar: string
  role: string
  plan: string
  billing: string
  status: string
  joinedDate: string
  lastLogin: string
}

export interface UserFormValues {
  name: string
  email: string
  role: string
  plan: string
  billing: string
  status: string
}
