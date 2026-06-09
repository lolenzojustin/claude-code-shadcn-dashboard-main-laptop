import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getAdminDb } from "@/lib/firebase/admin"

const customerBodySchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  serviceName: z.string().min(1, "Service is required"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const validatedData = customerBodySchema.parse(body)

    const customerId = `CUS-${Date.now()}`
    const customer = {
      id: customerId,
      ...validatedData,
      createdAt: new Date().toISOString(),
    }

    const db = getAdminDb()
    await db.collection("customers").doc(customerId).set(customer)

    return NextResponse.json(
      {
        success: true,
        message: "Customer created successfully",
        data: customer,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          errors: error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 }
      )
    }

    console.error("POST /api/customers error:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
