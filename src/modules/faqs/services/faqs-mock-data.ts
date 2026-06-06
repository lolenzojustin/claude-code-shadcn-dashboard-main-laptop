import categoriesData from "./data/categories.json"
import faqsData from "./data/faqs.json"
import featuresData from "./data/features.json"

import type { FAQ, FAQCategory, FAQFeature } from "./types/faqs-types"

export const faqsMockData = {
  categories: categoriesData as FAQCategory[],
  faqs: faqsData as FAQ[],
  features: featuresData as FAQFeature[],
}
