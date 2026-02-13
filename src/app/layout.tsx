import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { Providers } from "@/components/layout/Providers"

const geistSans = localFont({
  src: "./fonts/Geist-Variable.woff2",
  variable: "--font-geist-sans",
})

const geistMono = localFont({
  src: "./fonts/GeistMono-Variable.woff2",
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: "MK Solution Ltd - Multi-Vendor Platform",
  description: "Discover amazing products from trusted vendors. Fast delivery, secure payments, and excellent customer service.",
  keywords: ["marketplace", "shopping", "vendors", "products", "ecommerce"],
  openGraph: {
    title: "MK Solution Ltd",
    description: "Your trusted multi-vendor marketplace",
    url: "https://mksolution.com",
    siteName: "MK Solution Ltd",
    locale: "en_US",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="min-h-screen flex flex-col bg-white">
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
        <Providers />
      </body>
    </html>
  )
}
