import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore"

import { db } from "@/lib/firebase/client"
import { customerMockData } from "./customer-mock-data"
import type { Customer } from "./types/customer-types"

const CUSTOMERS_COLLECTION = "customers"

export async function getCustomers(): Promise<Customer[]> {
  const snapshot = await getDocs(collection(db, CUSTOMERS_COLLECTION))

  const result = snapshot.docs.map((document) => {
    const data = document.data() as Customer
    return {
      ...data,
      id: data.id ?? document.id,
    }
  })

  return JSON.parse(JSON.stringify(result))
}

export async function seedCustomersWithClient(): Promise<Customer[]> {
  const batch = writeBatch(db)

  customerMockData.forEach((customer) => {
    batch.set(doc(db, CUSTOMERS_COLLECTION, customer.id), customer, { merge: true })
  })

  await batch.commit()
  return getCustomers()
}

export async function createCustomer(customer: Customer): Promise<Customer> {
  await setDoc(doc(db, CUSTOMERS_COLLECTION, customer.id), customer)
  return customer
}

export async function updateCustomer(customer: Customer): Promise<Customer> {
  await updateDoc(doc(db, CUSTOMERS_COLLECTION, customer.id), customer)
  return customer
}

export async function deleteCustomer(customerId: string): Promise<void> {
  await deleteDoc(doc(db, CUSTOMERS_COLLECTION, customerId))
}

export function getCustomerStats(customers: Customer[]) {
  return {
    total: customers.length,
    byService: services.reduce((acc, svc) => {
      acc[svc.value] = customers.filter((c) => c.service === svc.value).length
      return acc
    }, {} as Record<string, number>),
  }
}

const services = [
  { value: "consulting", label: "Consulting" },
  { value: "development", label: "Development" },
  { value: "design", label: "Design" },
  { value: "marketing", label: "Marketing" },
  { value: "support", label: "Support" },
]
