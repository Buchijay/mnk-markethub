'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import { BarChart3, TrendingUp, Eye, ShoppingCart, DollarSign, Package } from 'lucide-react'

interface AnalyticsData {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  totalViews: number
  recentOrders: { date: string; count: number; revenue: number }[]
}

export default function VendorAnalyticsPage() {
  const router = useRouter()
  const { profile, loading: authLoading } = useAuth()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !profile?.vendor) router.push('/vendor/register')
  }, [authLoading, profile, router])

  useEffect(() => {
    if (profile?.vendor?.id) loadAnalytics()
  }, [profile])

  const loadAnalytics = async () => {
    setLoading(true)
    const vendorId = profile!.vendor!.id

    const [ordersRes, productsRes] = await Promise.all([
      supabase.from('orders').select('total, created_at, status').eq('vendor_id', vendorId),
      supabase.from('products').select('views_count, sales_count').eq('vendor_id', vendorId),
    ])

    const orders = ordersRes.data || []
    const products = productsRes.data || []

    const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + (o.total || 0), 0)
    const totalViews = products.reduce((sum, p) => sum + (p.views_count || 0), 0)

    // Group orders by date for last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentOrders: Record<string, { count: number; revenue: number }> = {}
    orders.forEach(o => {
      const d = new Date(o.created_at)
      if (d >= thirtyDaysAgo) {
        const key = d.toISOString().split('T')[0]
        if (!recentOrders[key]) recentOrders[key] = { count: 0, revenue: 0 }
        recentOrders[key].count++
        recentOrders[key].revenue += o.total || 0
      }
    })

    setAnalytics({
      totalRevenue,
      totalOrders: orders.length,
      totalProducts: products.length,
      totalViews,
      recentOrders: Object.entries(recentOrders)
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    })
    setLoading(false)
  }

  if (authLoading || !profile?.vendor) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600" /></div>
  }

  const cards = analytics ? [
    { label: 'Total Revenue', value: `₦${analytics.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'green' },
    { label: 'Total Orders', value: analytics.totalOrders.toString(), icon: ShoppingCart, color: 'blue' },
    { label: 'Products', value: analytics.totalProducts.toString(), icon: Package, color: 'amber' },
    { label: 'Total Views', value: analytics.totalViews.toLocaleString(), icon: Eye, color: 'purple' },
  ] : []

  const colorMap: Record<string, string> = {
    green: 'bg-green-50 text-green-600', blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600', purple: 'bg-purple-50 text-purple-600',
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Track your store performance</p>
        </div>

        {loading ? (
          <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto" /></div>
        ) : analytics ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {cards.map(c => (
                <div key={c.label} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{c.label}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{c.value}</p>
                    </div>
                    <div className={`p-3 rounded-full ${colorMap[c.color]}`}>
                      <c.icon size={24} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {analytics.recentOrders.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Last 30 Days - Daily Orders</h2>
                <div className="space-y-2">
                  {analytics.recentOrders.map(day => (
                    <div key={day.date} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <span className="text-sm text-gray-600">{new Date(day.date).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })}</span>
                      <div className="flex items-center gap-6">
                        <span className="text-sm text-gray-600">{day.count} orders</span>
                        <span className="text-sm font-semibold text-gray-900">₦{day.revenue.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  )
}
