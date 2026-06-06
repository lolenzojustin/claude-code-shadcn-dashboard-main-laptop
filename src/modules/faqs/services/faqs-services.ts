import { getFirestoreCollection } from "@/lib/firebase/firestore-query"

import { faqsMockData } from "./faqs-mock-data"
import type { FAQ, FAQCategory, FAQFeature } from "./types/faqs-types"

export async function getFAQsData() {
  const [faqs, categories, features] = await Promise.all([
    getFirestoreCollection<FAQ>("faqs", faqsMockData.faqs),
    getFirestoreCollection<FAQCategory>("faqCategories", faqsMockData.categories),
    getFirestoreCollection<FAQFeature>("faqFeatures", faqsMockData.features),
  ])

  return {
    faqs,
    categories,
    features,
  }
}
