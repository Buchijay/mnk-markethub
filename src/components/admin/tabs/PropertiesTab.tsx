"use client"

import { useState, useEffect } from "react"
import { Search, Eye, Trash2 } from "lucide-react"

interface Property {
  id: string
  title: string
  vendor: string
  location: string
  price: number
  beds: number
  baths: number
  status: "active" | "inactive"
  createdDate: string
}

const PropertiesTab = () => {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockProperties: Property[] = [
      {
        id: "re1",
        title: "Luxury 3BR Apartment",
        vendor: "Prime Realty",
        location: "Downtown",
        price: 550000,
        beds: 3,
        baths: 2,
        status: "active",
        createdDate: "2024-02-01",
      },
      {
        id: "re2",
        title: "Cozy 2BR House",
        vendor: "Home Services",
        location: "Suburbs",
        price: 350000,
        beds: 2,
        baths: 1,
        status: "active",
        createdDate: "2024-02-03",
      },
    ]
    setProperties(mockProperties)
    setLoading(false)
  }, [])

  const filteredProperties = properties.filter(
    (property) =>
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase())
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
            placeholder="Search properties by title or location..."
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
                Title
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Vendor
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Location
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Price
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Beds/Baths
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
            {filteredProperties.map((property) => (
              <tr key={property.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {property.title}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{property.vendor}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{property.location}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  ${property.price.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {property.beds}BR / {property.baths}BA
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      property.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {property.status.charAt(0).toUpperCase() +
                      property.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm flex gap-2">
                  <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition">
                    <Eye size={18} />
                  </button>
                  <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredProperties.length === 0 && (
        <div className="text-center py-8 text-gray-500">No properties found</div>
      )}
    </div>
  )
}

export default PropertiesTab
