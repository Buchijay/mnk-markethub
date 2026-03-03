'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Package, Truck, CheckCircle, XCircle, Clock, Filter, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

interface Order {
  id: string
  order_number: string
  status: OrderStatus
  payment_status: PaymentStatus
  total: number
  created_at: string
  tracking_number: string | null
  courier: string | null
}

interface PaginationInfo {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export default function AdminOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)

  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const [actionModal, setActionModal] = useState<{ orderId: string; type: 'status' | 'tracking' } | null>(null)
  const [newStatus, setNewStatus] = useState<OrderStatus>('confirmed')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [courier, setCourier] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => { loadOrders() }, [statusFilter, currentPage])

  const loadOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams({ page: currentPage.toString(), pageSize: '20' })
      if (statusFilter) params.append('status', statusFilter)
      if (searchQuery) params.append('search', searchQuery)

      const res = await fetch(`/api/admin/orders?${params}`)
      if (!res.ok) {
        if (res.status === 401) { router.push('/auth/login?redirect=/admin/orders'); return }
        throw new Error('Failed to fetch orders')
      }
      const data = await res.json()
      setOrders(data.orders || [])
      setPagination(data.pagination || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async () => {
    if (!actionModal) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/orders/${actionModal.orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Failed to update')
      toast.success(`Order status updated to ${newStatus}`)
      setActionModal(null)
      loadOrders()
    } catch { toast.error('Failed to update order status') }
    finally { setActionLoading(false) }
  }

  const handleUpdateTracking = async () => {
    if (!actionModal) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/orders/${actionModal.orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'shipped', tracking_number: trackingNumber, courier }),
      })
      if (!res.ok) throw new Error('Failed to update')
      toast.success('Tracking info updated & order shipped')
      setActionModal(null); setTrackingNumber(''); setCourier('')
      loadOrders()
    } catch { toast.error('Failed to update tracking info') }
    finally { setActionLoading(false) }
  }

  const getStatusBadge = (status: OrderStatus) => {
    const cfg: Record<OrderStatus, { bg: string; icon: typeof Clock }> = {
      pending: { bg: 'bg-yellow-100 text-yellow-800', icon: Clock },
      confirmed: { bg: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      processing: { bg: 'bg-indigo-100 text-indigo-800', icon: Package },
      shipped: { bg: 'bg-purple-100 text-purple-800', icon: Truck },
      delivered: { bg: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { bg: 'bg-red-100 text-red-800', icon: XCircle },
      refunded: { bg: 'bg-gray-100 text-gray-800', icon: RefreshCw },
    }
    const { bg, icon: Icon } = cfg[status] || cfg.pending
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${bg}`}>
        <Icon size={12} />{status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const getPaymentBadge = (status: PaymentStatus) => {
    const styles: Record<PaymentStatus, string> = {
      paid: 'bg-green-100 text-green-800', pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800', refunded: 'bg-gray-100 text-gray-800',
    }
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-center gap-3">
          <Package className="text-blue-600" size={28} />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
            <p className="text-gray-600 mt-1">View and manage all marketplace orders</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="text" placeholder="Search by order number..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadOrders()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <select value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as OrderStatus | ''); setCurrentPage(1) }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Statuses</option>
              <option value="pending">Pending</option><option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option><option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option><option value="cancelled">Cancelled</option>
            </select>
            <button onClick={loadOrders} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
              <Filter size={18} />Search
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <p className="text-red-700">{error}</p>
            <button onClick={loadOrders} className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Retry</button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" /><p className="text-gray-600">Loading orders...</p></div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No orders found</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tracking</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900 text-sm">{order.order_number}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{new Date(order.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">₦{order.total?.toLocaleString()}</td>
                        <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                        <td className="px-6 py-4">{getPaymentBadge(order.payment_status)}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {order.tracking_number ? <span className="text-xs">{order.courier && <span className="font-medium">{order.courier}: </span>}{order.tracking_number}</span> : <span className="text-gray-400">—</span>}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <button onClick={() => { setActionModal({ orderId: order.id, type: 'status' }); setNewStatus(order.status) }}
                              className="text-blue-600 hover:text-blue-800 text-xs font-medium px-2 py-1 rounded hover:bg-blue-50">Update</button>
                            {['confirmed', 'processing'].includes(order.status) && (
                              <button onClick={() => setActionModal({ orderId: order.id, type: 'tracking' })}
                                className="text-purple-600 hover:text-purple-800 text-xs font-medium px-2 py-1 rounded hover:bg-purple-50">Ship</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {pagination && pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <p className="text-sm text-gray-600">Page {currentPage} of {pagination.totalPages} ({pagination.total} orders)</p>
                  <div className="flex gap-2">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50">Previous</button>
                    <button onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))} disabled={currentPage === pagination.totalPages} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50">Next</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {actionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            {actionModal.type === 'status' ? (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Order Status</h3>
                <select value={newStatus} onChange={e => setNewStatus(e.target.value as OrderStatus)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500">
                  <option value="pending">Pending</option><option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option><option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option><option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
                <div className="flex gap-3">
                  <button onClick={handleUpdateStatus} disabled={actionLoading} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">{actionLoading ? 'Updating...' : 'Update Status'}</button>
                  <button onClick={() => setActionModal(null)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300">Cancel</button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Tracking & Ship</h3>
                <div className="space-y-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Courier</label>
                    <input type="text" placeholder="e.g. GIG Logistics, DHL" value={courier} onChange={e => setCourier(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Number</label>
                    <input type="text" placeholder="Enter tracking number" value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleUpdateTracking} disabled={actionLoading || !trackingNumber.trim()} className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400">{actionLoading ? 'Updating...' : 'Ship Order'}</button>
                  <button onClick={() => setActionModal(null)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300">Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}