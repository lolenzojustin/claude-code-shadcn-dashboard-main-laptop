import { FAQList } from "@/modules/faqs/components/faq-list"
import { FeaturesGrid } from "@/modules/faqs/components/features-grid"
import { getFAQsData } from "@/modules/faqs/services/faqs-services"

export default async function FAQsPage() {
  const { faqs, categories, features } = await getFAQsData()

  return (
    <div className="px-4 lg:px-6">
      <FAQList faqs={faqs} categories={categories} />
      <FeaturesGrid features={features} />
    </div>
  )
}
