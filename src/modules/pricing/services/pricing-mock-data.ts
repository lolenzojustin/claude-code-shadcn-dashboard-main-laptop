import faqsData from "./data/faqs.json"
import featuresData from "./data/features.json"

import type { PricingFAQ, PricingFeature } from "./types/pricing-types"

export const pricingMockData = {
  faqs: faqsData as PricingFAQ[],
  features: featuresData as PricingFeature[],
}
