import { collection, getDocs } from "firebase/firestore"

export async function getFirestoreCollection<T>(
  collectionName: string,
  fallbackData: T[]
): Promise<T[]> {
  try {
    const { db } = await import("@/lib/firebase/client")
    const snapshot = await getDocs(collection(db, collectionName))

    if (snapshot.empty) {
      return fallbackData
    }

    const result = snapshot.docs.map((doc) => {
      const data = doc.data() as T
      const dataWithId = data as T & { id?: string | number }

      return {
        ...data,
        id: dataWithId.id ?? doc.id,
      }
    })

    return JSON.parse(JSON.stringify(result))
  } catch (error) {
    console.warn(`Failed to load ${collectionName} from Firestore. Falling back to local mock data.`, error)
    return fallbackData
  }
}

export async function getFirestoreDocumentCollection<T>(
  collectionName: string,
  fallbackData: T[]
): Promise<T[]> {
  try {
    const { db } = await import("@/lib/firebase/client")
    const snapshot = await getDocs(collection(db, collectionName))

    if (snapshot.empty) {
      return fallbackData
    }

    const result = snapshot.docs.map((doc) => doc.data() as T)
    return JSON.parse(JSON.stringify(result))
  } catch (error) {
    console.warn(`Failed to load ${collectionName} from Firestore. Falling back to local mock data.`, error)
    return fallbackData
  }
}
