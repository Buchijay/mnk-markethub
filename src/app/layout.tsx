import type { Metadata } from "next"
import { Geist, Geist_Mono, Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { Toaster } from "react-hot-toast"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MNK Marketplace - Multi-Vendor Platform",
  description: "Discover amazing products from trusted vendors. Fast delivery, secure payments, and excellent customer service.",
  keywords: ["marketplace", "shopping", "vendors", "products", "ecommerce"],
  openGraph: {
    title: "MNK Marketplace",
    description: "Your trusted multi-vendor marketplace",
    url: "https://mnk-marketplace.com",
    siteName: "MNK Marketplace",
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
      <body className={`${geistSans.variable} ${geistMono.variable} ${inter.className} antialiased`}>
        <div className="min-h-screen flex flex-col bg-white">
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
