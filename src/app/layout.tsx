import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://yogajam.fit'),
  title: {
    default: "YogaJam | Where Life Feels Alive",
    template: "%s | YogaJam",
  },
  description: "Immerse yourself in YogaJam's signature cinematic wellness experiences in Bengaluru. From Bollywood yoga to live music events and private celebrations.",
  applicationName: "YogaJam",
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "YogaJam | Where Life Feels Alive",
    description: "Immerse yourself in YogaJam's signature cinematic wellness experiences in Bengaluru.",
    url: "https://yogajam.fit",
    siteName: "YogaJam",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YogaJam | Where Life Feels Alive",
    description: "Immerse yourself in YogaJam's signature cinematic wellness experiences in Bengaluru.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: "/site.webmanifest",
};

import type { Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { ClientLayoutWrapper } from "@/components/layout/ClientLayoutWrapper";
import { Analytics } from "@vercel/analytics/react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${manrope.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col overscroll-none">
        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>
        <Analytics />
      </body>
    </html>
  );
}
