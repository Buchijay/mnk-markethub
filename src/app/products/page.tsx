// app/products/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { productsService } from '@/lib/services/products'
import ProductCard from '@/components/products/ProductCard'
import { supabase } from '@/lib/supabase/client'
import { Filter, Grid, List } from 'lucide-react'
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
    const result = await productsService.getAll(filters)
    setProducts((result.products || []) as any)
    setLoading(false)
  }

  async function loadCategories() {
    // Load categories from Supabase
    const { data } = await supabase
      .from('product_categories')
      .select('*')
      .eq('is_active', true)
      .order('name')
    setCategories(data || [])
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Discover Amazing Products</h1>
          <p className="text-xl">Shop from thousands of quality items across all categories</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-lg">Filters</h2>
                <button
                  onClick={() => setFilters({
                    category: '',
                    minPrice: undefined,
                    maxPrice: undefined,
                    search: '',
                    sort: 'newest'
                  })}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Clear All
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Search</label>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={filters.search || ''}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Category */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={filters.category || ''}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Price Range</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice || ''}
                    onChange={(e) => setFilters({ 
                      ...filters, 
                      minPrice: e.target.value ? Number(e.target.value) : undefined 
                    })}
                    className="w-1/2 px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice || ''}
                    onChange={(e) => setFilters({ 
                      ...filters, 
                      maxPrice: e.target.value ? Number(e.target.value) : undefined 
                    })}
                    className="w-1/2 px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium mb-2">Sort By</label>
                <select
                  value={filters.sort || 'newest'}
                  onChange={(e) => setFilters({ 
                    ...filters, 
                    sort: e.target.value as ProductFilters['sort']
                  })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="newest">Newest</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Toolbar */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex items-center justify-between">
              <p className="text-gray-600">
                {products.length} products found
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setView('grid')}
                  className={`p-2 rounded ${view === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                  aria-label="Grid view"
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`p-2 rounded ${view === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                  aria-label="List view"
                >
                  <List size={20} />
                </button>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-96"></div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-600 text-lg mb-4">No products found</p>
                <button
                  onClick={() => setFilters({
                    category: '',
                    minPrice: undefined,
                    maxPrice: undefined,
                    search: '',
                    sort: 'newest'
                  })}
                  className="text-blue-600 hover:underline"
                >
                  Clear filters and try again
                </button>
              </div>
            ) : (
              <div className={view === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
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