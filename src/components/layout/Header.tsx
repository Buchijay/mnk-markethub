'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingCart, User, Search, Menu, X, Store, LogOut, LogIn } from 'lucide-react'

interface CartItem {
  id: string
  quantity: number
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [cartCount, setCartCount] = useState(0)
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Load cart count from localStorage
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      const count = cart.reduce((sum: number, item: CartItem) => sum + item.quantity, 0)
      setCartCount(count)
    }

    updateCartCount()
    window.addEventListener('cartUpdated', updateCartCount)
    return () => window.removeEventListener('cartUpdated', updateCartCount)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`
    }
  }

  if (!mounted) return null

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      {/* Premium Top Bar */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-500 text-white text-sm font-medium">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <p>✨ Welcome to MNK Marketplace - Your Trusted Multi-Vendor Platform</p>
          <Link href="/vendor/register" className="hover:underline flex items-center gap-1 text-white font-semibold">
            <Store size={14} />
            Become a Vendor
          </Link>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-600 to-amber-500 flex items-center justify-center text-white font-bold shadow-lg">
              M
            </div>
            <span className="hidden sm:inline text-xl font-bold text-gray-900">
              MNK
            </span>
            <span className="hidden lg:inline text-xs text-gray-600 font-medium ml-1">Marketplace</span>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-4">
            <div className="flex w-full rounded-lg border border-gray-300 overflow-hidden shadow-sm">
              <input
                type="text"
                placeholder="Search products, vendors, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              />
              <button
                type="submit"
                className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 transition font-medium"
              >
                <Search size={20} />
              </button>
            </div>
          </form>

          {/* Right Menu */}
          <div className="flex items-center gap-2 lg:gap-4">
            {/* Cart */}
            <Link href="/cart" className="relative group p-2 hover:bg-gray-100 rounded-lg transition">
              <ShoppingCart size={24} className="text-gray-700 group-hover:text-amber-600" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            <div className="relative group">
              <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition text-gray-700 group-hover:text-amber-600">
                <User size={24} />
                <span className="hidden lg:inline text-sm font-medium">Account</span>
              </button>
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl py-2 hidden group-hover:block">
                <Link href="/profile" className="block px-4 py-2 hover:bg-gray-50 text-gray-900 font-medium">
                  My Profile
                </Link>
                <Link href="/orders" className="block px-4 py-2 hover:bg-gray-50 text-gray-900">
                  My Orders
                </Link>
                <Link href="/vendor/dashboard" className="block px-4 py-2 hover:bg-gray-50 text-gray-900">
                  Vendor Dashboard
                </Link>
                <hr className="my-2" />
                <button className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600 font-medium">
                  Sign Out
                </button>
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Search Bar - Mobile */}
        <form onSubmit={handleSearch} className="md:hidden mt-3">
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="submit"
              className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 transition"
            >
              <Search size={18} />
            </button>
          </div>
        </form>
      </div>

      {/* Navigation */}
      <nav className="bg-gray-50 border-t border-gray-200 hidden md:block">
        <div className="container mx-auto px-4">
          <ul className="flex gap-8 py-3 text-sm font-medium">
            <li>
              <Link href="/products" className="text-gray-700 hover:text-amber-600 transition">
                All Products
              </Link>
            </li>
            <li>
              <Link href="/products?category=automotive" className="text-gray-700 hover:text-amber-600 transition">
                Automotive
              </Link>
            </li>
            <li>
              <Link href="/products?category=real-estate" className="text-gray-700 hover:text-amber-600 transition">
                Real Estate
              </Link>
            </li>
            <li>
              <Link href="/vendors" className="text-gray-700 hover:text-amber-600 transition">
                Top Vendors
              </Link>
            </li>
            <li>
              <Link href="/deals" className="text-red-600 hover:text-red-700 transition font-bold">
                🔥 Hot Deals
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-50 border-t border-gray-200">
          <nav className="container mx-auto px-4 py-4">
            <ul className="space-y-3 text-gray-700 font-medium">
              <li>
                <Link href="/products" className="block hover:text-amber-600 transition">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/vendors" className="block hover:text-amber-600 transition">
                  Top Vendors
                </Link>
              </li>
              <li>
                <Link href="/deals" className="block hover:text-red-600 transition text-red-600">
                  🔥 Hot Deals
                </Link>
              </li>
              <li className="border-t pt-3">
                <Link href="/profile" className="block hover:text-amber-600 transition">
                  My Profile
                </Link>
              </li>
              <li>
                <Link href="/vendor/register" className="block hover:text-amber-600 transition font-semibold text-amber-600">
                  Become a Vendor
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  )
}
