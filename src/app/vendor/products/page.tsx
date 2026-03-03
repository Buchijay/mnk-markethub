'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import type { Product } from '@/lib/types/database.types'
import { useAuth } from '@/lib/hooks/useAuth'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Package, Plus, Search, Eye, Edit2, Trash2, Star } from 'lucide-react'

interface VendorProduct {
  id: string
  name: string
  slug: string
  price: number
  stock_quantity: number
  status: string
  is_featured: boolean
  views_count: number
  sales_count: number
  images: string[]
  created_at: string
}

export default function VendorProductsPage() {
  const router = useRouter()
  const { profile, loading: authLoading } = useAuth()
  const [products, setProducts] = useState<VendorProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    if (!authLoading && !profile?.vendor) {
      router.push('/vendor/register')
    }
  }, [authLoading, profile, router])

  useEffect(() => {
    if (profile?.vendor?.id) loadProducts()
  }, [profile])

  const loadProducts = async () => {
    setLoading(true)
    let query = supabase
      .from('products')
      .select('*')
      .eq('vendor_id', profile!.vendor!.id)
      .order('created_at', { ascending: false })

    if (statusFilter) query = query.eq('status', statusFilter as Product['status'])

    const { data } = await query
    setProducts((data || []) as VendorProduct[])
    setLoading(false)
  }

  useEffect(() => {
    if (profile?.vendor?.id) loadProducts()
  }, [statusFilter])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) {
      toast.error('Failed to delete product')
    } else {
      toast.success('Product deleted')
      setProducts(products.filter(p => p.id !== id))
    }
  }

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (authLoading || !profile?.vendor) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600" /></div>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
            <p className="text-gray-600 mt-1">{filtered.length} products</p>
          </div>
          <Link href="/vendor/products/create" className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition">
            <Plus size={20} /> Add Product
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input type="text" placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Products Table */}
        {loading ? (
          <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto" /></div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Package size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No products yet</h3>
            <p className="text-gray-500 mb-6">Start selling by adding your first product</p>
            <Link href="/vendor/products/create" className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2">
              <Plus size={20} /> Add Product
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Product</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Price</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Stock</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Views</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Sales</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filtered.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {p.images?.[0] && <img src={p.images[0]} alt="" className="w-10 h-10 rounded object-cover" />}
                          <span className="font-medium text-gray-900">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">₦{p.price?.toLocaleString()}</td>
                      <td className="px-6 py-4 text-gray-600">{p.stock_quantity}</td>
                      <td className="px-6 py-4 text-gray-600">{p.views_count}</td>
                      <td className="px-6 py-4 text-gray-600">{p.sales_count}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${p.status === 'active' ? 'bg-green-100 text-green-800' : p.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/products/${p.slug}`} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Eye size={16} /></Link>
                          <button onClick={() => handleDelete(p.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
