"use client"

import { useState, useEffect } from "react"
import { Search, Eye, Ban } from "lucide-react"
// import { supabase } from "@/lib/supabase/client"

interface Vendor {
  id: string
  business_name: string
  email: string | null
  phone: string | null
  verification_status: "pending" | "verified" | "rejected"
  is_active: boolean
  rating: number
  total_sales: number
  created_at: string
}

const VendorsTab = () => {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    setLoading(true)
    fetch('/api/admin/vendors')
      .then(res => res.json())
      .then(data => setVendors(data.vendors || []))
      .catch(() => setVendors([]))
      .finally(() => setLoading(false))
  }, [])

  const filteredVendors = vendors.filter((v) =>
    v.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusStyle = (status: string) => {
    if (status === 'verified') return 'bg-green-100 text-green-800'
    if (status === 'pending') return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  if (loading) return <div className="text-center py-8">Loading...</div>

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input type="text" placeholder="Search vendors..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Business Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Sales</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Rating</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredVendors.map((v) => (
              <tr key={v.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{v.business_name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{v.email || '—'}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{v.total_sales}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{v.rating?.toFixed(1)} ⭐</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(v.verification_status)}`}>
                    {v.verification_status?.charAt(0).toUpperCase() + v.verification_status?.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm flex gap-2">
                  <button onClick={() => window.location.href = `/admin/vendors`} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Eye size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filteredVendors.length === 0 && <div className="text-center py-8 text-gray-500">No vendors found</div>}
    </div>
  )
}

export default VendorsTab
