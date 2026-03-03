import { getAdminClient } from '@/lib/supabase-server'
import { logger } from '@/lib/utils/logger'

const supabaseAdmin = getAdminClient()

export const getAdminKPIs = async () => {
  try {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
    const thirtyStr = thirtyDaysAgo.toISOString()
    const sixtyStr = sixtyDaysAgo.toISOString()

    // Parallel queries for performance
    const [ordersRes, prevOrdersRes, vendorsRes, prevVendorsRes, usersRes, prevUsersRes, pendingVendorsRes, pendingProductsRes, pendingPropertiesRes, pendingVehiclesRes] = await Promise.all([
      // Current period orders (last 30 days)
      supabaseAdmin.from('orders').select('total, created_at, status').gte('created_at', thirtyStr),
      // Previous period orders (30-60 days ago)
      supabaseAdmin.from('orders').select('total, created_at, status').gte('created_at', sixtyStr).lt('created_at', thirtyStr),
      // Current active vendors
      supabaseAdmin.from('vendors').select('id, created_at', { count: 'exact' }).eq('is_active', true),
      // Vendors created before last 30 days
      supabaseAdmin.from('vendors').select('id', { count: 'exact' }).eq('is_active', true).lt('created_at', thirtyStr),
      // Current active users
      supabaseAdmin.from('profiles').select('id, created_at', { count: 'exact' }).eq('is_active', true),
      // Users created before last 30 days
      supabaseAdmin.from('profiles').select('id', { count: 'exact' }).eq('is_active', true).lt('created_at', thirtyStr),
      // Pending approvals
      supabaseAdmin.from('vendors').select('id', { count: 'exact' }).eq('verification_status', 'pending'),
      supabaseAdmin.from('products').select('id', { count: 'exact' }).eq('status', 'draft'),
      supabaseAdmin.from('properties').select('id', { count: 'exact' }).eq('verification_status', 'pending'),
      supabaseAdmin.from('vehicles').select('id', { count: 'exact' }).eq('verification_status', 'pending'),
    ])

    const currentOrders = ordersRes.data || []
    const prevOrders = prevOrdersRes.data || []

    // Revenue calculations
    const totalRevenue = currentOrders
      .filter(o => o.status !== 'cancelled' && o.status !== 'refunded')
      .reduce((sum, o) => sum + (o.total || 0), 0)
    const prevRevenue = prevOrders
      .filter(o => o.status !== 'cancelled' && o.status !== 'refunded')
      .reduce((sum, o) => sum + (o.total || 0), 0)
    const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0

    // Orders change
    const totalOrders = currentOrders.length
    const prevOrderCount = prevOrders.length
    const ordersChange = prevOrderCount > 0 ? ((totalOrders - prevOrderCount) / prevOrderCount) * 100 : 0

    // Vendors change
    const activeVendors = vendorsRes.count || 0
    const prevVendorCount = prevVendorsRes.count || 0
    const newVendors = activeVendors - prevVendorCount
    const vendorsChange = prevVendorCount > 0 ? (newVendors / prevVendorCount) * 100 : 0

    // Users change
    const activeUsers = usersRes.count || 0
    const prevUserCount = prevUsersRes.count || 0
    const newUsers = activeUsers - prevUserCount
    const usersChange = prevUserCount > 0 ? (newUsers / prevUserCount) * 100 : 0

    // Pending approvals
    const pendingApprovals = (pendingVendorsRes.count || 0) + (pendingProductsRes.count || 0) + (pendingPropertiesRes.count || 0) + (pendingVehiclesRes.count || 0)

    // Revenue trend (last 7 weeks, grouped by week)
    const allOrders = [...(ordersRes.data || []), ...(prevOrdersRes.data || [])]
    const revenueTrend: { name: string; value: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000)
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000)
      const weekRevenue = allOrders
        .filter(o => {
          const d = new Date(o.created_at)
          return d >= weekStart && d < weekEnd && o.status !== 'cancelled' && o.status !== 'refunded'
        })
        .reduce((sum, o) => sum + (o.total || 0), 0)
      revenueTrend.push({ name: `Week ${7 - i}`, value: Math.round(weekRevenue) })
    }

    // Orders trend (last 7 days, grouped by day)
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const ordersTrend: { name: string; value: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now)
      dayStart.setDate(dayStart.getDate() - i)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(dayStart)
      dayEnd.setDate(dayEnd.getDate() + 1)
      const dayCount = currentOrders.filter(o => {
        const d = new Date(o.created_at)
        return d >= dayStart && d < dayEnd
      }).length
      ordersTrend.push({ name: dayNames[dayStart.getDay()], value: dayCount })
    }

    // Platform health: % of non-cancelled orders
    const platformHealth = totalOrders > 0
      ? Math.round((currentOrders.filter(o => o.status !== 'cancelled' && o.status !== 'refunded').length / totalOrders) * 100)
      : 100

    return {
      totalRevenue: Math.round(totalRevenue),
      revenueChange: Math.round(revenueChange * 10) / 10,
      totalOrders,
      ordersChange: Math.round(ordersChange * 10) / 10,
      activeVendors,
      vendorsChange: Math.round(vendorsChange * 10) / 10,
      activeUsers,
      usersChange: Math.round(usersChange * 10) / 10,
      pendingApprovals,
      flaggedItems: 0,
      platformHealth,
      revenueTrend,
      ordersTrend,
    }
  } catch (error) {
    logger.error('Error fetching KPIs:', error)
    throw error
  }
}
