"use client"

import { useState, useEffect } from "react"
import { Search, Eye } from "lucide-react"
// import { supabase } from "@/lib/supabase/client"

interface Property {
  id: string
  title: string
  slug: string
  listing_type: "rent" | "sale" | "short_let"
  price: number
  status: string
  verification_status: string
  views_count: number
  created_at: string
}

const PropertiesTab = () => {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    setLoading(true)
    fetch('/api/admin/properties')
      .then(res => res.json())
      .then(data => setProperties(data.properties || []))
      .catch(() => setProperties([]))
      .finally(() => setLoading(false))
  }, [])

  const filteredProperties = properties.filter((p) =>
    p.title?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <div className="text-center py-8">Loading...</div>

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input type="text" placeholder="Search properties..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Title</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Price</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Views</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredProperties.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.title}</td>
                <td className="px-6 py-4 text-sm text-gray-600 capitalize">{p.listing_type?.replace('_', ' ')}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">₦{p.price?.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{p.views_count}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${p.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                    {p.status?.charAt(0).toUpperCase() + p.status?.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <button onClick={() => window.location.href = `/real-estate/${p.slug}`} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Eye size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filteredProperties.length === 0 && <div className="text-center py-8 text-gray-500">No properties found</div>}
    </div>
  )
}

export default PropertiesTab
