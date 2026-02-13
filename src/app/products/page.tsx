// app/products/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { productsService } from '@/lib/services/products'
import ProductCard from '@/components/products/ProductCard'
import { supabase } from '@/lib/supabase/client'
import { Search, Package, Tag, TrendingUp, Grid, List } from 'lucide-react'
import type { ProductWithVendor } from '@/lib/types/database.types'
import type { ProductFilters } from '@/lib/services/products'

interface Category {
  id: string
  name: string
  slug: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductWithVendor[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [popularCategories, setPopularCategories] = useState<Category[]>([])
  
  const [filters, setFilters] = useState<ProductFilters>({
    category: '',
    minPrice: undefined,
    maxPrice: undefined,
    search: '',
    sort: 'newest'
  })

  useEffect(() => {
    loadProducts()
  }, [filters])

  useEffect(() => {
    loadCategories()
  }, [])

  async function loadProducts() {
    setLoading(true)
    try {
      const result = await productsService.getAll(filters)
      console.log('Products loaded:', result)
      setProducts((result.products || []) as any)
    } catch (error) {
      console.error('Error loading products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  async function loadCategories() {
    // Try to load categories - try multiple table names
    let { data } = await supabase
      .from('categories')
      .select('*')
      .order('name')
    
    // Fallback to product_categories if first query fails
    if (!data) {
      const { data: altData } = await supabase
        .from('product_categories')
        .select('*')
        .order('name')
      data = altData
    }
    
    setCategories(data || [])
    // Set first 6 as popular categories
    setPopularCategories((data || []).slice(0, 6))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-900 to-black text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Discover Amazing Products</h1>
          <p className="text-xl mb-8">Shop from thousands of quality items across all categories</p>
          
          {/* Quick Search */}
          <div className="bg-gray-900 border border-yellow-500/30 rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={filters.search || ''}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
                />
              </div>

              <select
                value={filters.category || ''}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="px-4 py-3 border border-gray-600 rounded-lg bg-gray-800 text-white focus:outline-none focus:border-yellow-500"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>

              <button
                onClick={loadProducts}
                className="bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition flex items-center justify-center gap-2"
              >
                <Search size={20} />
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Categories */}
      {popularCategories.length > 0 && (
        <div className="bg-white py-8 border-b">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Popular Categories</h2>
            <div className="flex flex-wrap gap-3">
              {popularCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setFilters({ ...filters, category: cat.id })}
                  className={`px-6 py-3 rounded-lg border-2 font-semibold transition ${
                    filters.category === cat.id
                      ? 'bg-yellow-500 text-black border-yellow-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-yellow-500'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 flex items-center gap-4">
            <div className="bg-yellow-100 p-4 rounded-full">
              <Package className="text-yellow-600" size={32} />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{products.length}</p>
              <p className="text-gray-700 font-medium">Products Available</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 flex items-center gap-4">
            <div className="bg-green-100 p-4 rounded-full">
              <Tag className="text-green-600" size={32} />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{categories.length}</p>
              <p className="text-gray-700 font-medium">Categories</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 flex items-center gap-4">
            <div className="bg-yellow-100 p-4 rounded-full">
              <TrendingUp className="text-yellow-600" size={32} />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">₦500+</p>
              <p className="text-gray-700 font-medium">Starting Prices</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="font-bold text-lg mb-6 text-gray-900">Filter Results</h2>

              {/* Category */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2 text-gray-800">Category</label>
                <select
                  value={filters.category || ''}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-gray-900 focus:outline-none focus:border-yellow-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2 text-gray-800">Price Range (₦)</label>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={filters.minPrice || ''}
                    onChange={(e) => setFilters({ 
                      ...filters, 
                      minPrice: e.target.value ? Number(e.target.value) : undefined 
                    })}
                    className="w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-yellow-500"
                  />
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={filters.maxPrice || ''}
                    onChange={(e) => setFilters({ 
                      ...filters, 
                      maxPrice: e.target.value ? Number(e.target.value) : undefined 
                    })}
                    className="w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-yellow-500"
                  />
                </div>
              </div>

              {/* Sort */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2 text-gray-800">Sort By</label>
                <select
                  value={filters.sort || 'newest'}
                  onChange={(e) => setFilters({ 
                    ...filters, 
                    sort: e.target.value as ProductFilters['sort']
                  })}
                  className="w-full px-3 py-2 border rounded-lg text-gray-900 focus:outline-none focus:border-yellow-500"
                >
                  <option value="newest">Newest</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>

              <button
                onClick={() => setFilters({
                  category: '',
                  minPrice: undefined,
                  maxPrice: undefined,
                  search: '',
                  sort: 'newest'
                })}
                className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Clear All Filters
              </button>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="flex-1">
            {/* Toolbar */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex items-center justify-between">
              <p className="text-gray-800">
                <span className="font-bold text-gray-900">{products.length}</span> products found
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setView('grid')}
                  className={`p-2 rounded ${view === 'grid' ? 'bg-yellow-500 text-black' : 'bg-gray-100 hover:bg-gray-200'}`}
                  aria-label="Grid view"
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`p-2 rounded ${view === 'list' ? 'bg-yellow-500 text-black' : 'bg-gray-100 hover:bg-gray-200'}`}
                  aria-label="List view"
                >
                  <List size={20} />
                </button>
              </div>
            </div>

            {/* Products */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="bg-gray-200 animate-pulse h-48"></div>
                    <div className="p-4">
                      <div className="bg-gray-200 animate-pulse h-4 w-3/4 mb-2 rounded"></div>
                      <div className="bg-gray-200 animate-pulse h-4 w-1/2 mb-4 rounded"></div>
                      <div className="bg-gray-200 animate-pulse h-6 w-1/3 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <Package size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters or search terms</p>
                <button
                  onClick={() => setFilters({
                    category: '',
                    minPrice: undefined,
                    maxPrice: undefined,
                    search: '',
                    sort: 'newest'
                  })}
                  className="bg-yellow-500 text-black px-6 py-2 rounded-lg hover:bg-yellow-600 transition"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className={view === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
              }>
                {products.map(product => (
                  <ProductCard key={product.id} product={product} view={view} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}