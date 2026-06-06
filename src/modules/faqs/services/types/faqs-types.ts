export interface FAQ {
  id: number
  question: string
  answer: string
  category: string
}

export interface FAQCategory {
  name: string
  count: number
}

export interface FAQFeature {
  id: number
  title: string
  description: string
  icon: string
}
