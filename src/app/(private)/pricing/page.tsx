import { PricingPlans } from "@/components/pricing-plans"
import { FeaturesGrid } from "@/modules/pricing/components/features-grid"
import { FAQSection } from "@/modules/pricing/components/faq-section"
import { getPricingData } from "@/modules/pricing/services/pricing-services"

export default async function PricingPage() {
  const { features, faqs } = await getPricingData()

  return (
    <div className="px-4 lg:px-6">
      {/* Pricing Cards */}
      <section className='pb-12' id='pricing'>
        <PricingPlans mode="pricing" />
      </section>

      {/* Features Section */}
      <FeaturesGrid features={features} />

      {/* FAQ Section */}
      <FAQSection faqs={faqs} />
    </div>
  )
}
