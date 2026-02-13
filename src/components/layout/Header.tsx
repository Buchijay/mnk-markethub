'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingCart, User, Search, Menu, X, Store, LogOut, LogIn, Heart, MessageSquare } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'

interface CartItem {
  id: string
  quantity: number
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [cartCount, setCartCount] = useState(0)
  const [mounted, setMounted] = useState(false)
  const { user, profile, signOut, loading: authLoading } = useAuth()

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
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
    }
  }

  if (!mounted) return null

  return (
    <header className="bg-gray-900 shadow-md sticky top-0 z-50">
      {/* Premium Top Bar */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-500 text-white text-sm font-medium">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <p>✨ Welcome to MK Solution Ltd - Your Trusted Multi-Vendor Platform</p>
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
            <span className="hidden sm:inline text-xl font-bold text-white">
              MK Solution
            </span>
            <span className="hidden lg:inline text-xs text-gray-300 font-medium ml-1">Ltd</span>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-4">
            <div className="flex w-full rounded-lg border border-gray-600 overflow-hidden shadow-sm">
              <input
                type="text"
                placeholder="Search products, vendors, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-gray-800 text-white placeholder-gray-400"
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
            <Link href="/cart" className="relative group p-2 hover:bg-gray-800 rounded-lg transition">
              <ShoppingCart size={24} className="text-gray-200 group-hover:text-amber-500" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            <div className="relative group">
              <button className="flex items-center gap-2 p-2 hover:bg-gray-800 rounded-lg transition text-gray-200 group-hover:text-amber-500">
                <User size={24} />
                <span className="hidden lg:inline text-sm font-medium">
                  {user ? (profile?.full_name?.split(' ')[0] || 'Account') : 'Account'}
                </span>
              </button>
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl py-2 hidden group-hover:block z-50">
                {user ? (
                  <>
                    <div className="px-4 py-2 border-b mb-1">
                      <p className="font-medium text-gray-900 text-sm">{profile?.full_name || 'User'}</p>
                      <p className="text-xs text-gray-500 truncate">{profile?.email}</p>
                    </div>
                    <Link href="/profile" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-900">
                      <User size={16} />
                      My Profile
                    </Link>
                    <Link href="/favorites" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-900">
                      <Heart size={16} />
                      Favorites
                    </Link>
                    <Link href="/messages" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-900">
                      <MessageSquare size={16} />
                      Messages
                    </Link>
                    <Link href="/orders" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-900">
                      <ShoppingCart size={16} />
                      My Orders
                    </Link>
                    {profile?.role === 'vendor' && (
                      <Link href="/vendor/dashboard" className="block px-4 py-2 hover:bg-gray-50 text-gray-900">
                        Vendor Dashboard
                      </Link>
                    )}
                    <hr className="my-2" />
                    <button
                      onClick={signOut}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600 font-medium"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" className="block px-4 py-2 hover:bg-gray-50 text-gray-900 font-medium">
                      Sign In
                    </Link>
                    <Link href="/auth/register" className="block px-4 py-2 hover:bg-gray-50 text-amber-600 font-medium">
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 hover:bg-gray-800 rounded-lg transition text-gray-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Search Bar - Mobile */}
        <form onSubmit={handleSearch} className="md:hidden mt-3">
          <div className="flex rounded-lg border border-gray-600 overflow-hidden">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-gray-800 text-white placeholder-gray-400"
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
      <nav className="bg-gray-800 border-t border-gray-700 hidden md:block">
        <div className="container mx-auto px-4">
          <ul className="flex gap-8 py-3 text-sm font-medium">
            <li>
              <Link href="/products" className="text-gray-200 hover:text-amber-500 transition">
                All Products
              </Link>
            </li>
            <li>
              <Link href="/automotive" className="text-gray-200 hover:text-amber-500 transition">
                Automotive
              </Link>
            </li>
            <li>
              <Link href="/real-estate" className="text-gray-200 hover:text-amber-500 transition">
                Real Estate
              </Link>
            </li>
            <li>
              <Link href="/vendors" className="text-gray-200 hover:text-amber-500 transition">
                Top Vendors
              </Link>
            </li>
            <li>
              <Link href="/deals" className="text-red-400 hover:text-red-300 transition font-bold">
                🔥 Hot Deals
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-800 border-t border-gray-700">
          <nav className="container mx-auto px-4 py-4">
            <ul className="space-y-3 text-gray-200 font-medium">
              <li>
                <Link href="/products" className="block hover:text-amber-500 transition">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/vendors" className="block hover:text-amber-500 transition">
                  Top Vendors
                </Link>
              </li>
              <li>
                <Link href="/deals" className="block text-red-400 hover:text-red-300 transition">
                  🔥 Hot Deals
                </Link>
              </li>
              <li className="border-t border-gray-700 pt-3">
                <Link href="/profile" className="block hover:text-amber-500 transition">
                  My Profile
                </Link>
              </li>
              <li>
                <Link href="/favorites" className="block hover:text-amber-500 transition">
                  Favorites
                </Link>
              </li>
              <li>
                <Link href="/messages" className="block hover:text-amber-500 transition">
                  Messages
                </Link>
              </li>
              <li>
                <Link href="/vendor/register" className="block text-amber-500 hover:text-amber-400 transition font-semibold">
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
