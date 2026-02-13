"use client"

import { useState, useEffect } from "react"
import { Search, Eye, Ban, CheckCircle } from "lucide-react"

interface Vendor {
  id: string
  name: string
  email: string
  phone: string
  status: "active" | "inactive" | "suspended"
  products: number
  revenue: number
  joinedDate: string
}

const VendorsTab = () => {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockVendors: Vendor[] = [
      {
        id: "v1",
        name: "Tech Store",
        email: "tech@example.com",
        phone: "+1234567890",
        status: "active",
        products: 150,
        revenue: 45000,
        joinedDate: "2024-01-15",
      },
      {
        id: "v2",
        name: "Fashion Hub",
        email: "fashion@example.com",
        phone: "+1987654321",
        status: "active",
        products: 200,
        revenue: 62000,
        joinedDate: "2024-02-20",
      },
    ]
    setVendors(mockVendors)
    setLoading(false)
  }, [])

  const filteredVendors = vendors.filter(
    (vendor) =>
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <div className="text-center py-8">Loading...</div>

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Search Bar */}
      <div className="p-6 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search vendors by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Vendor Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Email
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Products
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Revenue
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Status
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredVendors.map((vendor) => (
              <tr key={vendor.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {vendor.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{vendor.email}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{vendor.products}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  ${vendor.revenue.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      vendor.status === "active"
                        ? "bg-green-100 text-green-800"
                        : vendor.status === "inactive"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm flex gap-2">
                  <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition">
                    <Eye size={18} />
                  </button>
                  <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition">
                    <Ban size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredVendors.length === 0 && (
        <div className="text-center py-8 text-gray-500">No vendors found</div>
      )}
    </div>
  )
}

export default VendorsTab
