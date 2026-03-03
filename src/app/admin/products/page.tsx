'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Eye, Trash2, Star, Filter, Package } from 'lucide-react'
import toast from 'react-hot-toast'

type ProductStatus = 'draft' | 'active' | 'out_of_stock' | 'archived'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  stock_quantity: number
  status: ProductStatus
  is_featured: boolean
  images: string[]
  created_at: string
  vendor?: {
    id: string
    business_name: string
  }
}

interface PaginationInfo {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export default function AdminProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)

  const [statusFilter, setStatusFilter] = useState<ProductStatus | ''>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    loadProducts()
  }, [statusFilter, currentPage])

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: '20',
      })
      if (statusFilter) params.append('status', statusFilter)
      if (searchQuery) params.append('search', searchQuery)

      const res = await fetch(`/api/admin/products?${params}`)
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/auth/login?redirect=/admin/products')
          return
        }
        throw new Error('Failed to fetch products')
      }

      const data = await res.json()
      setProducts(data.products || [])
      setPagination(data.pagination || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (productId: string, status: ProductStatus) => {
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Failed to update product')
      toast.success(`Product ${status === 'archived' ? 'archived' : 'updated'}`)
      loadProducts()
    } catch {
      toast.error('Failed to update product')
    }
  }

  const handleToggleFeatured = async (productId: string, isFeatured: boolean) => {
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: !isFeatured }),
      })
      if (!res.ok) throw new Error('Failed to update product')
      toast.success(isFeatured ? 'Removed from featured' : 'Marked as featured')
      loadProducts()
    } catch {
      toast.error('Failed to update product')
    }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Archive this product? It will be hidden from the storefront.')) return
    await handleUpdateStatus(productId, 'archived')
  }

  const getStatusBadge = (status: ProductStatus) => {
    const styles: Record<ProductStatus, string> = {
      active: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      out_of_stock: 'bg-red-100 text-red-800',
      archived: 'bg-gray-100 text-gray-800',
    }
    const labels: Record<ProductStatus, string> = {
      active: 'Active',
      draft: 'Draft',
      out_of_stock: 'Out of Stock',
      archived: 'Archived',
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <Package className="text-blue-600" size={28} />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
            <p className="text-gray-600 mt-1">View and manage all marketplace products</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadProducts()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as ProductStatus | '')
                setCurrentPage(1)
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="archived">Archived</option>
            </select>

            <button
              onClick={loadProducts}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Filter size={18} />
              Search
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <p className="text-red-700">{error}</p>
            <button onClick={loadProducts} className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
              Retry
            </button>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No products found</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Featured</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {product.images?.[0] ? (
                              <img src={product.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                <Package size={16} className="text-gray-400" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                              <p className="text-xs text-gray-500">{product.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {product.vendor?.business_name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          ₦{product.price?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={product.stock_quantity < 5 ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                            {product.stock_quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(product.status)}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleFeatured(product.id, product.is_featured)}
                            title={product.is_featured ? 'Remove from featured' : 'Mark as featured'}
                          >
                            <Star
                              size={18}
                              className={product.is_featured ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                            />
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => router.push(`/products/${product.slug}`)}
                              className="text-blue-600 hover:text-blue-800"
                              title="View"
                            >
                              <Eye size={18} />
                            </button>
                            {product.status === 'active' && (
                              <button
                                onClick={() => handleUpdateStatus(product.id, 'draft')}
                                className="text-yellow-600 hover:text-yellow-800 text-xs font-medium"
                              >
                                Unpublish
                              </button>
                            )}
                            {product.status === 'draft' && (
                              <button
                                onClick={() => handleUpdateStatus(product.id, 'active')}
                                className="text-green-600 hover:text-green-800 text-xs font-medium"
                              >
                                Publish
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Archive"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * pagination.pageSize) + 1} to{' '}
                    {Math.min(currentPage * pagination.pageSize, pagination.total)} of {pagination.total} products
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                      disabled={currentPage === pagination.totalPages}
                      className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
