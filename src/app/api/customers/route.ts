import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

function getDb() {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
  return getFirestore(app)
}

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
      createdAt: serverTimestamp(),
    }

    const db = getDb()
    await setDoc(doc(db, "customers", customerId), customer)

    return NextResponse.json(
      {
        success: true,
        message: "Customer created successfully",
        data: {
          id: customerId,
          ...validatedData,
          createdAt: new Date().toISOString(),
        },
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
      },
      { status: 500 }
    )
  }
}
