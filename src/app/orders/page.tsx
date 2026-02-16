'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  ChevronRight,
  ShoppingBag,
  PartyPopper,
  AlertCircle,
  RotateCcw,
  Eye,
} from 'lucide-react'
import type { Order } from '@/lib/types/database.types'

const statusConfig: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Pending' },
  confirmed: { icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Confirmed' },
  processing: { icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-50', label: 'Processing' },
  shipped: { icon: Truck, color: 'text-purple-600', bg: 'bg-purple-50', label: 'Shipped' },
  delivered: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', label: 'Delivered' },
  cancelled: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Cancelled' },
  refunded: { icon: RotateCcw, color: 'text-gray-600', bg: 'bg-gray-50', label: 'Refunded' },
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth()
  const searchParams = useSearchParams()
  const successOrder = searchParams.get('success')

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | Order['status']>('all')

  useEffect(() => {
    if (user) loadOrders()
    else if (!authLoading) setLoading(false)
  }, [user, authLoading])

  async function loadOrders() {
    setLoading(true)
    try {
      let query = supabase
        .from('orders')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter as Order['status'])
      }

      const { data, error } = await query
      if (error) throw error
      setOrders((data as Order[]) || [])
    } catch (err) {
      console.error('Error loading orders:', err)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) loadOrders()
  }, [filter])

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(price)

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  // Not logged in
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={64} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h2>
          <p className="text-gray-500 mb-6">Please sign in to view your orders.</p>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-bold transition"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Banner */}
      {successOrder && (
        <div className="bg-green-50 border-b border-green-200">
          <div className="container mx-auto px-4 py-4 flex items-center gap-3">
            <PartyPopper size={24} className="text-green-600" />
            <div>
              <p className="font-bold text-green-800">Order Placed Successfully!</p>
              <p className="text-sm text-green-600">
                Your order <span className="font-mono font-bold">{successOrder}</span> has been placed. You&apos;ll receive a confirmation email shortly.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">My Orders</h1>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {([
              { key: 'all' as const, label: 'All Orders' },
              { key: 'pending' as const, label: 'Pending' },
              { key: 'confirmed' as const, label: 'Confirmed' },
              { key: 'shipped' as const, label: 'Shipped' },
              { key: 'delivered' as const, label: 'Delivered' },
              { key: 'cancelled' as const, label: 'Cancelled' },
            ] as const).map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  filter === f.key
                    ? 'bg-amber-600 text-white shadow'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow border p-6 animate-pulse">
                <div className="flex justify-between mb-4">
                  <div className="bg-gray-200 rounded h-5 w-40" />
                  <div className="bg-gray-200 rounded h-8 w-24" />
                </div>
                <div className="bg-gray-200 rounded h-4 w-60 mb-2" />
                <div className="bg-gray-200 rounded h-4 w-32" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag size={80} className="text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Orders Found</h2>
            <p className="text-gray-500 mb-6">
              {filter !== 'all'
                ? `You don't have any ${filter} orders.`
                : "You haven't placed any orders yet."}
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-bold transition shadow-lg shadow-amber-200"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.pending
              const StatusIcon = status.icon
              const address = order.shipping_address as any

              return (
                <div key={order.id} className="bg-white rounded-2xl shadow-lg border hover:shadow-xl transition overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <div>
                        <p className="font-mono text-sm text-gray-500">
                          Order <span className="font-bold text-gray-900">{order.order_number}</span>
                        </p>
                        <p className="text-sm text-gray-400">{formatDate(order.created_at)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${status.bg} ${status.color}`}>
                          <StatusIcon size={14} />
                          {status.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        {address && (
                          <p className="text-sm text-gray-600">
                            Ship to: {address.full_name || 'N/A'}, {address.city || ''}, {address.state || ''}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Payment: <span className="capitalize">{order.payment_method?.replace(/_/g, ' ') || 'N/A'}</span></span>
                          <span className={`font-medium ${
                            order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            {order.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-amber-600">{formatPrice(order.total)}</p>
                          <p className="text-xs text-gray-400">
                            {order.shipping_fee > 0 ? `incl. ${formatPrice(order.shipping_fee)} shipping` : 'Free shipping'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Tracking */}
                    {order.tracking_number && (
                      <div className="mt-4 pt-4 border-t flex items-center gap-2 text-sm">
                        <Truck size={16} className="text-purple-600" />
                        <span className="text-gray-600">Tracking:</span>
                        <span className="font-mono font-bold text-gray-900">{order.tracking_number}</span>
                        {order.courier && <span className="text-gray-400">via {order.courier}</span>}
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {!['cancelled', 'refunded'].includes(order.status) && (
                    <div className="bg-gray-50 px-6 py-3 border-t">
                      <div className="flex items-center justify-between text-xs font-medium text-gray-400">
                        {['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'].map((s, i) => {
                          const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']
                          const currentIndex = statusOrder.indexOf(order.status)
                          const isActive = i <= currentIndex
                          return (
                            <div key={s} className="flex items-center gap-1">
                              <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                              <span className={isActive ? 'text-green-600' : ''}>{s}</span>
                              {i < 4 && <div className={`w-6 lg:w-12 h-0.5 mx-1 ${i < currentIndex ? 'bg-green-500' : 'bg-gray-300'}`} />}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
