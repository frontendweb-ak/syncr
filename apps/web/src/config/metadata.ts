// src/config/metadata.ts

import type { Metadata } from "next";

export const siteConfig = {
  name: "Syncr",
  fullName: "Syncr",
  tagline: "Code. Deploy. Collaborate.",

  description:
    "Syncr helps teams code, deploy, and collaborate with seamless GitHub integration, automation, and developer workflows.",

  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://syncr.dev",

  ogImage: "/og-image.png",

  keywords: [
    "syncr",
    "developer platform",
    "github integration",
    "collaboration",
    "deployment",
    "automation",
    "devops",
    "repositories",
    "software teams",
    "engineering productivity",
  ],
};

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),

  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },

  description: siteConfig.description,

  keywords: siteConfig.keywords,

  applicationName: siteConfig.name,

  authors: [
    {
      name: "Syncr",
    },
  ],

  creator: "Syncr",

  publisher: "Syncr",

  openGraph: {
    type: "website",
    locale: "en_US",

    siteName: siteConfig.name,

    title: `${siteConfig.name} — ${siteConfig.tagline}`,

    description: siteConfig.description,

    url: siteConfig.url,

    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} Open Graph Image`,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title: `${siteConfig.name} — ${siteConfig.tagline}`,

    description: siteConfig.description,

    images: [siteConfig.ogImage],

    creator: "@syncr",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  icons: {
    icon: [
      {
        url: "/favicon.ico",
      },
      {
        url: "/icon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/icon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
    ],

    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
      },
    ],
  },

  manifest: "/site.webmanifest",

  category: "developer tools",
};