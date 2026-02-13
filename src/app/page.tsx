'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { productsService } from '@/lib/services/products'
import { ShoppingBag, TrendingUp, Shield, Truck, Star, ArrowRight, Zap } from 'lucide-react'
import ProductCard from '@/components/products/ProductCard'
import toast from 'react-hot-toast'
import type { Product } from '@/lib/types/products'

interface FeaturedProduct extends Omit<Product, 'vendor'> {
  vendor?: {
    id: string
    business_name: string
    logo_url?: string | null
    rating: number
  }
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const { products } = await productsService.getAll({
        is_featured: true,
        limit: 8,
      } as any)
      setFeaturedProducts(products as FeaturedProduct[])
    } catch (error) {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (product: FeaturedProduct) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingItem = cart.find((item: any) => item.id === product.id)

    if (existingItem) {
      existingItem.quantity += 1
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0],
        vendor_id: product.vendor_id,
        quantity: 1,
      })
    }

    localStorage.setItem('cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cartUpdated'))
    toast.success('Product added to cart!')
  }

  return (
    <div className="bg-white">
      {/* Hero Section - Premium Design */}
      <section className="relative bg-gradient-to-br from-gray-900 via-amber-900 to-gray-900 text-white overflow-hidden min-h-screen flex items-center py-20">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-amber-900/20 to-black/40"></div>
          <svg className="absolute w-full h-full opacity-10" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            {/* Logo/Brand */}
            <div className="text-center mb-12">
              <div className="inline-block mb-8">
                <div className="relative">
                  {/* Animated badge */}
                  <div className="absolute -top-4 -right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-bounce">
                    New
                  </div>
                  <div className="w-32 h-32 mx-auto mb-6 relative">
                    {/* Animated gradient circle */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 opacity-20 animate-pulse"></div>
                    <div className="absolute inset-2 rounded-full border-2 border-amber-500/50"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-6xl font-bold bg-gradient-to-br from-amber-300 to-amber-500 bg-clip-text text-transparent">
                        M
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold mb-4">
                <span className="bg-gradient-to-r from-amber-300 via-amber-200 to-amber-300 bg-clip-text text-transparent">
                  MK Solution Ltd
                </span>
              </h1>
              <p className="text-2xl md:text-3xl text-gray-200 mb-6">
                Discover Amazing Products from Trusted Vendors
              </p>
            </div>

            {/* Description & CTA */}
            <div className="text-center max-w-3xl mx-auto mb-12">
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Shop from thousands of quality products across multiple categories. Fast delivery, secure payments, verified vendors, and excellent customer service.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/products"
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black px-8 py-4 rounded-lg font-bold shadow-xl transform hover:scale-105 transition flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={20} />
                  Start Shopping
                </Link>
                <Link
                  href="/vendor/register"
                  className="bg-white/10 hover:bg-white/20 border-2 border-amber-400 text-white px-8 py-4 rounded-lg font-bold transition transform hover:scale-105 flex items-center justify-center gap-2 backdrop-blur"
                >
                  <TrendingUp size={20} />
                  Become a Vendor
                </Link>
              </div>
            </div>

            {/* Features Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 bg-white/10 backdrop-blur-md rounded-2xl p-8">
              <div className="flex items-center gap-3">
                <Truck className="text-amber-400" size={24} />
                <div>
                  <p className="font-semibold text-white">Fast Delivery</p>
                  <p className="text-sm text-gray-300">Nationwide shipping</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="text-amber-400" size={24} />
                <div>
                  <p className="font-semibold text-white">Secure Payment</p>
                  <p className="text-sm text-gray-300">100% protected</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Star className="text-amber-400" size={24} />
                <div>
                  <p className="font-semibold text-white">Quality Products</p>
                  <p className="text-sm text-gray-300">Verified only</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Zap className="text-amber-400" size={24} />
                <div>
                  <p className="font-semibold text-white">Best Prices</p>
                  <p className="text-sm text-gray-300">Competitive rates</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">Featured Products</h2>
              <p className="text-gray-600">Handpicked selection from our trusted vendors</p>
            </div>
            <Link
              href="/products"
              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold transition transform hover:translate-x-1"
            >
              View All
              <ArrowRight size={18} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-200 animate-pulse rounded-xl h-80"></div>
              ))}
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No featured products available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product as any} view="grid" />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Shop by Category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: 'Automotive',
                icon: '🚗',
                href: '/products?category=automotive',
                description: 'Cars, parts & accessories',
                color: 'from-blue-500 to-blue-600',
              },
              {
                name: 'Real Estate',
                icon: '🏠',
                href: '/products?category=real-estate',
                description: 'Properties & land',
                color: 'from-green-500 to-green-600',
              },
              {
                name: 'Electronics',
                icon: '💻',
                href: '/products?category=electronics',
                description: 'Gadgets & devices',
                color: 'from-purple-500 to-purple-600',
              },
              {
                name: 'Fashion',
                icon: '👗',
                href: '/products?category=fashion',
                description: 'Clothing & accessories',
                color: 'from-pink-500 to-pink-600',
              },
              {
                name: 'Home & Living',
                icon: '🛋️',
                href: '/products?category=home-living',
                description: 'Furniture & decor',
                color: 'from-yellow-500 to-yellow-600',
              },
              {
                name: 'Services',
                icon: '🔧',
                href: '/products?category=services',
                description: 'Professional services',
                color: 'from-red-500 to-red-600',
              },
            ].map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition"
              >
                <div className={`bg-gradient-to-br ${category.color} p-8 py-16 text-white relative`}>
                  <div className="text-5xl mb-4">{category.icon}</div>
                  <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                  <p className="text-white/80 text-sm">{category.description}</p>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition"></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-amber-500 mb-2">10K+</div>
              <p className="text-gray-400">Products Listed</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-amber-500 mb-2">500+</div>
              <p className="text-gray-400">Verified Vendors</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-amber-500 mb-2">50K+</div>
              <p className="text-gray-400">Happy Customers</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-amber-500 mb-2">99.8%</div>
              <p className="text-gray-400">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-amber-600 to-amber-700 text-white relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to Sell Online?</h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Join thousands of successful vendors. Set up your store in minutes and reach millions of customers nationwide.
          </p>
          <Link
            href="/vendor/register"
            className="inline-block bg-white text-amber-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-bold shadow-xl transform hover:scale-105 transition"
          >
            Start Your Store Today
          </Link>
        </div>
      </section>
    </div>
  )
}
