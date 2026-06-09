import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

const customerBodySchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  serviceName: z.string().min(1, "Service is required"),
})

function toFirestoreDocument(data: Record<string, unknown>) {
  const fields: Record<string, { stringValue: string }> = {}
  for (const [key, value] of Object.entries(data)) {
    fields[key] = { stringValue: String(value ?? "") }
  }
  return { fields }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

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

    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID

    if (!apiKey || !projectId) {
      return NextResponse.json(
        { success: false, message: "Firebase configuration missing" },
        { status: 500, headers: corsHeaders }
      )
    }

    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/customers/${customerId}?key=${apiKey}`

    const firestoreDoc = toFirestoreDocument(customer)

    const response = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(firestoreDoc),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Firestore error:", errorText)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to save to Firestore",
          firestoreError: errorText,
        },
        { status: 500, headers: corsHeaders }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: "Customer created successfully",
        data: customer,
      },
      { status: 201, headers: corsHeaders }
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
        { status: 400, headers: corsHeaders }
      )
    }

    console.error("POST /api/customers error:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: corsHeaders }
    )
  }
}
