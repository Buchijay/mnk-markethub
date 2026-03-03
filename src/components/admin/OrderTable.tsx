'use client'

import { Package, Truck, CheckCircle, XCircle, Clock, Eye } from 'lucide-react'
import Link from 'next/link'

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export interface OrderRow {
  id: string
  order_number: string
  status: OrderStatus
  payment_status: PaymentStatus
  total: number
  created_at: string
  tracking_number: string | null
  courier: string | null
  customer_name?: string
}

interface OrderTableProps {
  orders: OrderRow[]
  loading?: boolean
  onStatusChange?: (orderId: string, newStatus: OrderStatus) => void
  onViewOrder?: (orderId: string) => void
  showActions?: boolean
}

const statusConfig: Record<OrderStatus, { color: string; icon: React.ReactNode }> = {
  pending: { color: 'bg-yellow-100 text-yellow-800', icon: <Clock size={14} /> },
  confirmed: { color: 'bg-teal-100 text-teal-800', icon: <CheckCircle size={14} /> },
  processing: { color: 'bg-blue-100 text-blue-800', icon: <Package size={14} /> },
  shipped: { color: 'bg-purple-100 text-purple-800', icon: <Truck size={14} /> },
  delivered: { color: 'bg-green-100 text-green-800', icon: <CheckCircle size={14} /> },
  cancelled: { color: 'bg-red-100 text-red-800', icon: <XCircle size={14} /> },
  refunded: { color: 'bg-gray-100 text-gray-800', icon: <XCircle size={14} /> },
}

const paymentColors: Record<PaymentStatus, string> = {
  pending: 'text-yellow-600',
  paid: 'text-green-600',
  failed: 'text-red-600',
  refunded: 'text-gray-600',
}

export default function OrderTable({ orders, loading, onStatusChange, onViewOrder, showActions = true }: OrderTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto" />
        <p className="mt-3 text-gray-500">Loading orders…</p>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <Package size={40} className="mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500">No orders found</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order #</th>
              {orders[0]?.customer_name !== undefined && (
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
              )}
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
              {showActions && (
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => {
              const cfg = statusConfig[order.status] || statusConfig.pending
              return (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.order_number}</td>
                  {order.customer_name !== undefined && (
                    <td className="px-6 py-4 text-sm text-gray-700">{order.customer_name || '—'}</td>
                  )}
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">₦{order.total?.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
                      {cfg.icon}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium capitalize ${paymentColors[order.payment_status] || 'text-gray-600'}`}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  {showActions && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onViewOrder?.(order.id)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="View order"
                        >
                          <Eye size={16} />
                        </button>
                        {onStatusChange && (
                          <select
                            value={order.status}
                            onChange={(e) => onStatusChange(order.id, e.target.value as OrderStatus)}
                            className="text-xs border border-gray-300 rounded-lg px-2 py-1 focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="refunded">Refunded</option>
                          </select>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
