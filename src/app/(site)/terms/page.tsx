import type { Metadata } from 'next'
import { LegalPage } from '@/components/LegalPage'

export const metadata: Metadata = { title: 'Terms' }

export default function TermsPage() {
  return <LegalPage slug="terms" fallbackTitle="Terms" />
}
