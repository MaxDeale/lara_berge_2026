import type { Metadata } from 'next'
import { LegalPage } from '@/components/LegalPage'

export const metadata: Metadata = { title: 'Terms', alternates: { canonical: '/terms' } }

export default function TermsPage() {
  return <LegalPage slug="terms" fallbackTitle="Terms" />
}
