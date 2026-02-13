"use client"

import { useState, useEffect } from "react"
import KPICard from "@/components/admin/KPICard"
import KPIChart from "@/components/admin/KPIChart"
import { getAdminKPIs } from "@/lib/services/admin/kpi"

interface KPIData {
  totalRevenue: number
  revenueChange: number
  totalOrders: number
  ordersChange: number
  activeVendors: number
  vendorsChange: number
  activeUsers: number
  usersChange: number
  pendingApprovals: number
  flaggedItems: number
  platformHealth: number
  revenueTrend: any[]
  ordersTrend: any[]
}

export default function AdminDashboard() {
  const [kpis, setKpis] = useState<KPIData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        const data = await getAdminKPIs()
        setKpis(data)
      } catch (err) {
        setError("Failed to fetch KPIs")
        console.error(err as unknown)
      } finally {
        setLoading(false)
      }
    }

    fetchKPIs()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Total Revenue"
          value={`$${(kpis?.totalRevenue || 0).toLocaleString()}`}
          change={kpis?.revenueChange || 0}
          icon="💰"
        />
        <KPICard
          title="Total Orders"
          value={(kpis?.totalOrders || 0).toLocaleString()}
          change={kpis?.ordersChange || 0}
          icon="📦"
        />
        <KPICard
          title="Active Vendors"
          value={(kpis?.activeVendors || 0).toLocaleString()}
          change={kpis?.vendorsChange || 0}
          icon="🏪"
        />
        <KPICard
          title="Active Users"
          value={(kpis?.activeUsers || 0).toLocaleString()}
          change={kpis?.usersChange || 0}
          icon="👥"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <KPIChart
          title="Revenue Trend"
          type="line"
          data={kpis?.revenueTrend || []}
        />
        <KPIChart
          title="Orders Trend"
          type="bar"
          data={kpis?.ordersTrend || []}
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Approvals</h3>
          <p className="text-2xl font-bold text-orange-500">{kpis?.pendingApprovals || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Flagged Items</h3>
          <p className="text-2xl font-bold text-red-500">{kpis?.flaggedItems || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Platform Health</h3>
          <p className="text-2xl font-bold text-green-500">{kpis?.platformHealth || 0}%</p>
        </div>
      </div>
    </div>
  )
}
