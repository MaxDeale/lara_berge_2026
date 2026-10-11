import type { Metadata } from 'next'
import { LegalPage } from '@/components/LegalPage'

export const metadata: Metadata = { title: 'Privacy', alternates: { canonical: '/privacy' } }

export default function PrivacyPage() {
  return <LegalPage slug="privacy" fallbackTitle="Privacy" />
}
