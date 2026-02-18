'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Search, Package, Home, Car, Box } from 'lucide-react'
import type { Product, Property, Vehicle } from '@/lib/types/database.types'

interface SearchResult {
  type: 'product' | 'property' | 'vehicle'
  id: string
  title: string
  price: number
  image?: string
  slug: string
  description?: string
}

function SearchContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''

  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState(query)
  const [filter, setFilter] = useState<'all' | 'product' | 'property' | 'vehicle'>('all')

  useEffect(() => {
    if (searchTerm || query) {
      performSearch()
    }
  }, [searchTerm, query, filter])

  async function performSearch() {
    const term = searchTerm || query
    if (!term || term.length < 2) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const searchQueryPattern = `%${term}%`
      const allResults: SearchResult[] = []

      // Search products
      if (filter === 'all' || filter === 'product') {
        const { data: products } = await supabase
          .from('products')
          .select('id, name, slug, price, images, description')
          .eq('status', 'active')
          .or(`name.ilike.${searchQueryPattern},description.ilike.${searchQueryPattern}`)
          .limit(10)

        if (products) {
          allResults.push(
            ...products.map((p: any) => ({
              type: 'product' as const,
              id: p.id,
              title: p.name,
              price: p.price,
              image: p.images?.[0],
              slug: p.slug,
              description: p.description,
            }))
          )
        }
      }

      // Search properties
      if (filter === 'all' || filter === 'property') {
        const { data: properties } = await supabase
          .from('properties')
          .select('id, title, slug, price, images, description')
          .eq('status', 'active')
          .or(`title.ilike.${searchQueryPattern},description.ilike.${searchQueryPattern}`)
          .limit(10)

        if (properties) {
          allResults.push(
            ...properties.map((p: any) => ({
              type: 'property' as const,
              id: p.id,
              title: p.title,
              price: p.price,
              image: p.images?.[0],
              slug: p.slug,
              description: p.description,
            }))
          )
        }
      }

      // Search vehicles
      if (filter === 'all' || filter === 'vehicle') {
        const { data: vehicles } = await supabase
          .from('vehicles')
          .select('id, title, slug, price, images, year, make, model')
          .eq('status', 'active')
          .or(`title.ilike.${searchQueryPattern},make.ilike.${searchQueryPattern},model.ilike.${searchQueryPattern}`)
          .limit(10)

        if (vehicles) {
          allResults.push(
            ...vehicles.map((v: any) => ({
              type: 'vehicle' as const,
              id: v.id,
              title: `${v.year} ${v.make} ${v.model}`,
              price: v.price,
              image: v.images?.[0],
              slug: v.slug,
            }))
          )
        }
      }

      setResults(allResults)
    } catch (error) {
      console.error('Error searching:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch()
  }

  const filteredResults =
    filter === 'all' ? results : results.filter((r) => r.type === filter)

  const getResultUrl = (result: SearchResult) => {
    switch (result.type) {
      case 'product':
        return `/products/${result.slug}`
      case 'property':
        return `/real-estate/${result.slug}`
      case 'vehicle':
        return `/automotive/${result.slug}`
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'product':
        return <Package className="w-5 h-5 text-blue-600" />
      case 'property':
        return <Home className="w-5 h-5 text-green-600" />
      case 'vehicle':
        return <Car className="w-5 h-5 text-purple-600" />
      default:
        return <Box className="w-5 h-5 text-gray-600" />
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-6">Search MK Solution Ltd</h1>

          <form onSubmit={handleSearch} className="max-w-2xl">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products, properties, vehicles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-2 rounded-lg bg-white text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Filter Tabs */}
        {searchTerm || query ? (
          <>
            <div className="flex flex-wrap gap-3 mb-8">
              {[
                { key: 'all', label: 'All', icon: Box },
                { key: 'product', label: 'Products', icon: Package },
                { key: 'property', label: 'Properties', icon: Home },
                { key: 'vehicle', label: 'Vehicles', icon: Car },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === key
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Results */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin">Loading...</div>
                <p className="text-gray-600 mt-4">Searching marketplace...</p>
              </div>
            ) : filteredResults.length > 0 ? (
              <>
                <p className="text-gray-600 mb-6">
                  Found {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''} for "
                  <strong>{searchTerm || query}</strong>"
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredResults.map((result) => (
                    <Link
                      key={`${result.type}-${result.id}`}
                      href={getResultUrl(result)}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="relative h-48 bg-gray-200 overflow-hidden">
                        {result.image ? (
                          <img
                            src={result.image}
                            alt={result.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Box className="w-12 h-12" />
                          </div>
                        )}
                        <div className="absolute top-3 right-3 bg-white/90 rounded-full p-2">
                          {getTypeIcon(result.type)}
                        </div>
                      </div>

                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
                          {result.title}
                        </h3>

                        {result.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                            {result.description}
                          </p>
                        )}

                        <p className="text-blue-600 font-bold text-lg">
                          ₦{formatPrice(result.price)}
                        </p>

                        <div className="mt-4 inline-block text-sm px-3 py-1 bg-blue-50 text-blue-600 rounded-full capitalize">
                          {result.type}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Results Found</h2>
                <p className="text-gray-600">
                  No items found matching "<strong>{searchTerm || query}</strong>". Try a different search term.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Start Searching</h2>
            <p className="text-gray-600">
              Enter a search term above to find products, properties, and vehicles in MK Solution Ltd.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
          <p className="mt-4 text-gray-600">Loading search...</p>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
