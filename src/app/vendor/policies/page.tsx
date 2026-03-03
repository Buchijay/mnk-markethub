'use client'

import { FileText, Shield, AlertTriangle, CreditCard, Package, Users } from 'lucide-react'

const sections = [
  {
    icon: Users,
    title: 'Vendor Agreement',
    content: `By registering as a vendor on MNK Marketplace, you agree to comply with all applicable Nigerian laws and regulations. Vendors must provide accurate business information and maintain valid documentation throughout their partnership with MNK. We reserve the right to suspend or terminate accounts that violate these terms.`,
  },
  {
    icon: Package,
    title: 'Listing Policies',
    content: `All products, properties, and vehicles listed must be accurately described with genuine photos. Misleading descriptions, counterfeit goods, and prohibited items will be removed immediately. Vendors are responsible for keeping listings up-to-date, including price and availability. Listings that remain inactive for 90+ days may be automatically archived.`,
  },
  {
    icon: CreditCard,
    title: 'Pricing & Fees',
    content: `MNK charges a commission on successful sales: 5% for general products, 3% for real estate, and 4% for automotive. Prices must be listed in Nigerian Naira (₦). Vendors must not inflate prices to cover commission. Payment settlements occur within 3-5 business days after delivery confirmation. Vendors must provide valid bank details for disbursement.`,
  },
  {
    icon: Shield,
    title: 'Quality Standards',
    content: `Vendors must maintain a minimum 3.5-star average rating to remain active on the platform. Products must meet described quality standards. If a customer reports a quality issue, the vendor has 48 hours to respond. Repeated quality complaints may result in account suspension pending review.`,
  },
  {
    icon: AlertTriangle,
    title: 'Prohibited Items',
    content: `The following are strictly prohibited on MNK Marketplace: illegal drugs and controlled substances, weapons and ammunition, stolen goods, counterfeit or pirated products, hazardous materials, adult content, and any item prohibited by Nigerian federal or state laws. Listing prohibited items will result in immediate account termination.`,
  },
  {
    icon: FileText,
    title: 'Returns & Refunds',
    content: `Vendors must accept returns within 7 days of delivery for defective or misrepresented items. Refunds should be processed within 3 business days of receiving the return. For real estate and automotive listings, specific dispute resolution procedures apply. MNK may mediate disputes between vendors and customers when necessary.`,
  },
]

export default function VendorPoliciesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-3 mb-2">
          <FileText size={28} className="text-amber-600" />
          <h1 className="text-3xl font-bold text-gray-900">Vendor Policies</h1>
        </div>
        <p className="text-gray-600 mb-8">Please read and understand these policies to ensure a smooth selling experience on MNK Marketplace.</p>

        <div className="space-y-6">
          {sections.map((section, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-3">
                <section.icon size={24} className="text-amber-600" />
                <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-lg p-6">
          <p className="text-amber-800 text-sm">
            <strong>Last Updated:</strong> January 2025. MNK Marketplace reserves the right to update these policies at any time.
            Vendors will be notified of significant changes via email. Continued use of the platform after notification constitutes acceptance of updated policies.
          </p>
        </div>
      </div>
    </div>
  )
}
