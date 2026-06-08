import * as admin from "firebase-admin"

let db: admin.firestore.Firestore | null = null

export function getAdminDb(): admin.firestore.Firestore {
  if (db) return db

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    })
  }

  db = admin.firestore()
  return db
}
