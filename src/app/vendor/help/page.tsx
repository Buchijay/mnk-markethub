'use client'

import { HelpCircle, MessageSquare, BookOpen, Phone, Mail, MapPin } from 'lucide-react'
import Link from 'next/link'

const faqs = [
  { q: 'How do I list a product?', a: 'Go to Products in your dashboard and click "Add Product". Fill in the details and set status to Active when ready.' },
  { q: 'When do I get paid?', a: 'Payments are processed within 3-5 business days after order delivery is confirmed by the customer.' },
  { q: 'How do I track my orders?', a: 'Visit the Orders section of your dashboard to see all orders and update their status.' },
  { q: 'What fees does MNK charge?', a: 'MNK charges a small commission on each sale. Commission rates vary by category — typically 5-10%.' },
  { q: 'How do I get verified?', a: 'Submit your business documents (CAC, ID, utility bill) during registration. Our team reviews within 24-48 hours.' },
  { q: 'Can I list vehicles and properties?', a: 'Yes! MNK supports product listings, real estate, and automotive. Navigate to the respective section in your dashboard.' },
]

export default function VendorHelpPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <HelpCircle size={28} className="text-amber-600" />
          <h1 className="text-3xl font-bold text-gray-900">Help Center</h1>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Link href="/vendor/messages" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition text-center group">
            <MessageSquare size={32} className="mx-auto text-blue-500 mb-3 group-hover:scale-110 transition" />
            <h3 className="font-semibold text-gray-900">Contact Support</h3>
            <p className="text-sm text-gray-500 mt-1">Send us a message</p>
          </Link>
          <Link href="/vendor/policies" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition text-center group">
            <BookOpen size={32} className="mx-auto text-green-500 mb-3 group-hover:scale-110 transition" />
            <h3 className="font-semibold text-gray-900">Policies</h3>
            <p className="text-sm text-gray-500 mt-1">Terms & guidelines</p>
          </Link>
          <Link href="/vendor/analytics" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition text-center group">
            <BookOpen size={32} className="mx-auto text-purple-500 mb-3 group-hover:scale-110 transition" />
            <h3 className="font-semibold text-gray-900">Analytics Guide</h3>
            <p className="text-sm text-gray-500 mt-1">Understanding your data</p>
          </Link>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="border border-gray-200 rounded-lg">
                <summary className="px-4 py-3 cursor-pointer font-medium text-gray-900 hover:bg-gray-50">{faq.q}</summary>
                <p className="px-4 pb-3 text-gray-600">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Us</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gray-600">
              <Mail size={18} className="text-amber-600" />
              <span>support@mnkmarketplace.com</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Phone size={18} className="text-amber-600" />
              <span>+234 800 MNK HELP</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <MapPin size={18} className="text-amber-600" />
              <span>Lagos, Nigeria</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
