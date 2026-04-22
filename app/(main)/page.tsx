import type { Metadata } from 'next'
import { Hero } from '@/components/landing/Hero'
import { FeatureGrid } from '@/components/landing/FeatureGrid'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { CallToAction } from '@/components/landing/CallToAction'
import { Footer } from '@/components/landing/Footer'

export const metadata: Metadata = {
  title: 'APIVerse — every public API, one keystroke away',
  description:
    'Browse, search, and run live sandboxed demos of hundreds of public APIs. Bookmark your favourites, curate collections, and share demos with the community.',
}

export default function Home() {
  return (
    <>
      <Hero />
      <FeatureGrid />
      <HowItWorks />
      <CallToAction />
      <Footer />
    </>
  )
}
