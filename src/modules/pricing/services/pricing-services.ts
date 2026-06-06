import { getFirestoreCollection } from "@/lib/firebase/firestore-query"

import { pricingMockData } from "./pricing-mock-data"
import type { PricingFAQ, PricingFeature } from "./types/pricing-types"

export async function getPricingData() {
  const [features, faqs] = await Promise.all([
    getFirestoreCollection<PricingFeature>("pricingFeatures", pricingMockData.features),
    getFirestoreCollection<PricingFAQ>("pricingFaqs", pricingMockData.faqs),
  ])

  return {
    features,
    faqs,
  }
}
