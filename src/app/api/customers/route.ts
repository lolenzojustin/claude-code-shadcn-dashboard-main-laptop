import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

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

    const apiKey = process.env.FIREBASE_API_KEY
    const projectId = process.env.FIREBASE_PROJECT_ID

    if (!apiKey || !projectId) {
      return NextResponse.json(
        {
          success: false,
          message: "Firebase configuration missing",
        },
        { status: 500 }
      )
    }

    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/customers/${customerId}?key=${apiKey}`

    const response = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(customer),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Firestore error:", errorText)
      return NextResponse.json(
        { success: false, message: "Failed to save to Firestore" },
        { status: 500 }
      )
    }

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
