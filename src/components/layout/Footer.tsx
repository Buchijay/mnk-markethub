'use client'

import Link from 'next/link'
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300 mt-16 border-t border-gray-800">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 to-amber-500 flex items-center justify-center text-white font-bold text-lg">
                M
              </div>
              <h3 className="font-bold text-lg text-white">MNK Marketplace</h3>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Your trusted multi-vendor marketplace connecting quality sellers with satisfied customers. Secure, reliable, and innovative shopping experience.
            </p>
            <div className="flex gap-4 mt-4">
              <a href="#" className="hover:text-amber-500 transition" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="#" className="hover:text-amber-500 transition" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="#" className="hover:text-amber-500 transition" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="#" className="hover:text-amber-500 transition" aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white mb-4 text-lg">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/products" className="hover:text-amber-500 transition">
                  Browse Products
                </Link>
              </li>
              <li>
                <Link href="/vendors" className="hover:text-amber-500 transition">
                  Top Vendors
                </Link>
              </li>
              <li>
                <Link href="/deals" className="hover:text-amber-500 transition">
                  Hot Deals
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-amber-500 transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-amber-500 transition">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* For Vendors */}
          <div>
            <h4 className="font-bold text-white mb-4 text-lg">For Vendors</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/vendor/register" className="hover:text-amber-500 transition">
                  Start Selling
                </Link>
              </li>
              <li>
                <Link href="/vendor/dashboard" className="hover:text-amber-500 transition">
                  Vendor Dashboard
                </Link>
              </li>
              <li>
                <Link href="/vendor/help" className="hover:text-amber-500 transition">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/vendor/analytics" className="hover:text-amber-500 transition">
                  Analytics
                </Link>
              </li>
              <li>
                <Link href="/vendor/policies" className="hover:text-amber-500 transition">
                  Policies
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h4 className="font-bold text-white mb-4 text-lg">Support</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <Phone size={18} className="text-amber-500 flex-shrink-0 mt-1" />
                <a href="tel:+2341234567890" className="hover:text-amber-500 transition">
                  +234 (0) 123 456 7890
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={18} className="text-amber-500 flex-shrink-0 mt-1" />
                <a href="mailto:support@mnkmarketplace.com" className="hover:text-amber-500 transition">
                  support@mnkmarketplace.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-amber-500 flex-shrink-0 mt-1" />
                <span>Lagos, Nigeria</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-gray-800 my-8" />

        {/* Bottom Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
          {/* Legal Links */}
          <div className="flex flex-wrap gap-4">
            <Link href="/privacy" className="hover:text-amber-500 transition">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-amber-500 transition">
              Terms of Service
            </Link>
            <Link href="/cookies" className="hover:text-amber-500 transition">
              Cookie Policy
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-center text-gray-500">
            <p>&copy; {currentYear} MNK Marketplace. All rights reserved.</p>
            <p className="text-xs mt-1">Secure Shopping | Trusted Vendors | Quality Assured</p>
          </div>

          {/* Payment Methods */}
          <div className="flex justify-end gap-2">
            <span className="text-gray-400 text-xs font-medium">We Accept:</span>
            <div className="flex gap-2 text-gray-500">
              <span className="text-xs">💳 Card</span>
              <span className="text-xs">📱 Mobile</span>
              <span className="text-xs">🏦 Bank</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 hidden lg:block">
        <button className="bg-amber-600 hover:bg-amber-700 text-white rounded-full p-4 shadow-lg transition transform hover:scale-110">
          <svg
            className="w-6 h-6"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v6a2 2 0 01-2 2H4l-3 3v-3H2a2 2 0 01-2-2V5z"></path>
          </svg>
        </button>
      </div>
    </footer>
  )
}
