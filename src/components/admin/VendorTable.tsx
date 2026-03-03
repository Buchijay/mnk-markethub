'use client'

import { Eye, Ban, CheckCircle, Clock, XCircle, Store } from 'lucide-react'
import Image from 'next/image'

type VendorStatus = 'pending' | 'approved' | 'rejected' | 'suspended'

export interface VendorRow {
  id: string
  business_name: string
  slug: string
  email: string
  phone: string
  status: VendorStatus
  created_at: string
  logo_url?: string | null
  rating?: number
  total_sales?: number
}

interface VendorTableProps {
  vendors: VendorRow[]
  loading?: boolean
  onView?: (vendorId: string) => void
  onApprove?: (vendorId: string) => void
  onReject?: (vendorId: string) => void
  onSuspend?: (vendorId: string) => void
  showActions?: boolean
}

const statusConfig: Record<VendorStatus, { color: string; icon: React.ReactNode }> = {
  pending: { color: 'bg-yellow-100 text-yellow-800', icon: <Clock size={14} /> },
  approved: { color: 'bg-green-100 text-green-800', icon: <CheckCircle size={14} /> },
  rejected: { color: 'bg-red-100 text-red-700', icon: <XCircle size={14} /> },
  suspended: { color: 'bg-gray-100 text-gray-700', icon: <Ban size={14} /> },
}

export default function VendorTable({ vendors, loading, onView, onApprove, onReject, onSuspend, showActions = true }: VendorTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto" />
        <p className="mt-3 text-gray-500">Loading vendors…</p>
      </div>
    )
  }

  if (vendors.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <Store size={40} className="mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500">No vendors found</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Vendor</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rating</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Joined</th>
              {showActions && (
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {vendors.map((vendor) => {
              const cfg = statusConfig[vendor.status] || statusConfig.pending
              return (
                <tr key={vendor.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                        {vendor.logo_url ? (
                          <Image src={vendor.logo_url} alt={vendor.business_name} width={40} height={40} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold text-sm">
                            {vendor.business_name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{vendor.business_name}</p>
                        {vendor.total_sales !== undefined && (
                          <p className="text-xs text-gray-500">{vendor.total_sales} sales</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">{vendor.email}</p>
                    <p className="text-xs text-gray-500">{vendor.phone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
                      {cfg.icon}
                      {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {vendor.rating ? (
                      <span className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span> {vendor.rating.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(vendor.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  {showActions && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {onView && (
                          <button
                            onClick={() => onView(vendor.id)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="View details"
                          >
                            <Eye size={16} />
                          </button>
                        )}
                        {onApprove && vendor.status === 'pending' && (
                          <button
                            onClick={() => onApprove(vendor.id)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition"
                            title="Approve"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                        {onReject && vendor.status === 'pending' && (
                          <button
                            onClick={() => onReject(vendor.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Reject"
                          >
                            <XCircle size={16} />
                          </button>
                        )}
                        {onSuspend && vendor.status === 'approved' && (
                          <button
                            onClick={() => onSuspend(vendor.id)}
                            className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition"
                            title="Suspend"
                          >
                            <Ban size={16} />
                          </button>
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
