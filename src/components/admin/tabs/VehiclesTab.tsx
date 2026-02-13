"use client"

import { useState, useEffect } from "react"
import { Search, Eye, Trash2 } from "lucide-react"

interface Vehicle {
  id: string
  make: string
  model: string
  vendor: string
  year: number
  price: number
  mileage: number
  status: "active" | "inactive"
  createdDate: string
}

const VehiclesTab = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockVehicles: Vehicle[] = [
      {
        id: "v1",
        make: "Toyota",
        model: "Camry",
        vendor: "Auto Sales",
        year: 2022,
        price: 28500,
        mileage: 25000,
        status: "active",
        createdDate: "2024-02-01",
      },
      {
        id: "v2",
        make: "Honda",
        model: "Civic",
        vendor: "Premium Cars",
        year: 2023,
        price: 32000,
        mileage: 8000,
        status: "active",
        createdDate: "2024-02-02",
      },
    ]
    setVehicles(mockVehicles)
    setLoading(false)
  }, [])

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      `${vehicle.make} ${vehicle.model}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      vehicle.vendor.toLowerCase().includes(searchTerm.toLowerCase())
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
            placeholder="Search vehicles by make/model or vendor..."
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
                Vehicle
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Vendor
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Year
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Price
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Mileage
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
            {filteredVehicles.map((vehicle) => (
              <tr key={vehicle.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{vehicle.vendor}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{vehicle.year}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  ${vehicle.price.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {vehicle.mileage.toLocaleString()} mi
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      vehicle.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {vehicle.status.charAt(0).toUpperCase() +
                      vehicle.status.slice(1)}
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

      {filteredVehicles.length === 0 && (
        <div className="text-center py-8 text-gray-500">No vehicles found</div>
      )}
    </div>
  )
}

export default VehiclesTab
