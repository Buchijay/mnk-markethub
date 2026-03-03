'use client'

import { Eye, Trash2, Star, Package } from 'lucide-react'
import Image from 'next/image'

type ProductStatus = 'draft' | 'active' | 'out_of_stock' | 'archived'

export interface ProductRow {
  id: string
  name: string
  slug: string
  price: number
  stock_quantity: number
  status: ProductStatus
  is_featured: boolean
  images: string[]
  created_at: string
  vendor?: { id: string; business_name: string } | null
}

interface ProductTableProps {
  products: ProductRow[]
  loading?: boolean
  onView?: (product: ProductRow) => void
  onDelete?: (productId: string) => void
  onToggleFeatured?: (productId: string, featured: boolean) => void
  showVendor?: boolean
}

const statusColors: Record<ProductStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  active: 'bg-green-100 text-green-800',
  out_of_stock: 'bg-red-100 text-red-700',
  archived: 'bg-yellow-100 text-yellow-800',
}

export default function ProductTable({ products, loading, onView, onDelete, onToggleFeatured, showVendor = true }: ProductTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto" />
        <p className="mt-3 text-gray-500">Loading products…</p>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <Package size={40} className="mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500">No products found</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
              {showVendor && (
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Vendor</th>
              )}
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                      {product.images?.[0] ? (
                        <Image src={product.images[0]} alt={product.name} width={40} height={40} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={16} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">{product.name}</p>
                      <p className="text-xs text-gray-500">{new Date(product.created_at).toLocaleDateString('en-NG')}</p>
                    </div>
                  </div>
                </td>
                {showVendor && (
                  <td className="px-6 py-4 text-sm text-gray-700">{product.vendor?.business_name || '—'}</td>
                )}
                <td className="px-6 py-4 text-sm font-medium text-gray-900">₦{product.price?.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{product.stock_quantity}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[product.status] || 'bg-gray-100 text-gray-700'}`}>
                    {product.status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5">
                    {onToggleFeatured && (
                      <button
                        onClick={() => onToggleFeatured(product.id, !product.is_featured)}
                        className={`p-1.5 rounded-lg transition ${product.is_featured ? 'text-yellow-500 hover:bg-yellow-50' : 'text-gray-400 hover:bg-gray-100'}`}
                        title={product.is_featured ? 'Remove featured' : 'Set featured'}
                      >
                        <Star size={16} fill={product.is_featured ? 'currentColor' : 'none'} />
                      </button>
                    )}
                    {onView && (
                      <button
                        onClick={() => onView(product)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="View product"
                      >
                        <Eye size={16} />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(product.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Delete product"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
