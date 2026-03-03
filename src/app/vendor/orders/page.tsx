'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import type { Order } from '@/lib/types/database.types'
import { useAuth } from '@/lib/hooks/useAuth'
import toast from 'react-hot-toast'
import { Package, Truck, CheckCircle, XCircle, Clock, Eye } from 'lucide-react'

interface VendorOrder {
  id: string
  order_number: string
  status: string
  total_amount: number
  payment_status: string
  created_at: string
  shipping_address: Record<string, string> | null
  profiles?: { full_name: string; email: string } | null
}

export default function VendorOrdersPage() {
  const router = useRouter()
  const { profile, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState<VendorOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    if (!authLoading && !profile?.vendor) router.push('/vendor/register')
  }, [authLoading, profile, router])

  useEffect(() => {
    if (profile?.vendor?.id) loadOrders()
  }, [profile, statusFilter])

  const loadOrders = async () => {
    setLoading(true)
    let query = supabase
      .from('orders')
      .select('*, profiles(full_name, email)')
      .eq('vendor_id', profile!.vendor!.id)
      .order('created_at', { ascending: false })

    if (statusFilter) query = query.eq('status', statusFilter as Order['status'])

    const { data } = await query
    setOrders((data || []) as unknown as VendorOrder[])
    setLoading(false)
  }

  const updateStatus = async (orderId: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status: status as Order['status'] }).eq('id', orderId)
    if (error) toast.error('Failed to update')
    else { toast.success('Order updated'); loadOrders() }
  }

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800', confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800', shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (authLoading || !profile?.vendor) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600" /></div>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders</h1>
        <p className="text-gray-600 mb-8">Manage customer orders</p>

        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent">
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto" /></div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Package size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No orders yet</h3>
            <p className="text-gray-500">Orders will appear here once customers start purchasing</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Order #</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Customer</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map(o => (
                    <tr key={o.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{o.order_number}</td>
                      <td className="px-6 py-4 text-gray-600">{o.profiles?.full_name || 'N/A'}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">₦{o.total_amount?.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusBadge(o.status)}`}>{o.status}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">{new Date(o.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)}
                          className="text-sm px-3 py-1 border rounded-lg">
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
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
