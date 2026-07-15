import type { Metadata } from "next";

import "./globals.css";

import { defaultMetadata } from "@/config/metadata";
import { jakarta, mono } from "@/core/fonts";
export const metadata: Metadata = defaultMetadata;
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jakarta.variable} ${mono.variable}`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
