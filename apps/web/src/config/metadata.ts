// src/config/metadata.ts
import type { Metadata } from 'next'

export const siteConfig = {
  name: 'AIM',
  fullName: 'All India Mentorship',
  description:
    'Connect students with mentors, opportunities, and guidance to accelerate academic and professional growth.',
  url: process.env.NEXT_PUBLIC_APP_URL ?? 'https://aim.in',
  ogImage: '/og-image.png',
  keywords: ['mentorship', 'education', 'career guidance', 'students', 'india', 'mentors'],
}

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.fullName}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  applicationName: siteConfig.name,
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.fullName}`,
    description: siteConfig.description,
    url: siteConfig.url,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} — ${siteConfig.fullName}`,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  robots: {
    index: true,
    follow: true,
  },
}
