// src/app/admin/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign,
  TrendingUp,
  AlertCircle,
  Activity
} from 'lucide-react';

// Type definitions
interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalVendors: number;
  pendingVendors: number;
  totalProducts: number;
  activeProducts: number;
}

interface SalesDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

interface ActivityItem {
  id: string;
  action: string;
  entity_type: string;
  created_at: string;
  admin?: {
    full_name: string | null;
    email: string;
  };
}

interface ApiResponse<T> {
  data: T;
  error?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [salesData, setSalesData] = useState<SalesDataPoint[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async (): Promise<void> => {
    try {
      setLoading(true);
      
      // Fetch overview stats
      const statsRes = await fetch('/api/admin/stats?type=overview');
      if (!statsRes.ok) {
        if (statsRes.status === 401) {
          router.push('/auth/login?redirect=/admin');
          return;
        }
        throw new Error('Failed to fetch stats');
      }
      
      const statsData: ApiResponse<DashboardStats> = await statsRes.json();
      setStats(statsData.data);

      // Fetch sales chart data
      const salesRes = await fetch('/api/admin/stats?type=sales');
      if (salesRes.ok) {
        const salesData: ApiResponse<SalesDataPoint[]> = await salesRes.json();
        setSalesData(salesData.data);
      }

      // Fetch recent activity
      const activityRes = await fetch('/api/admin/stats?type=activity&limit=10');
      if (activityRes.ok) {
        const activityData: ApiResponse<ActivityItem[]> = await activityRes.json();
        setRecentActivity(activityData.data);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="text-red-600" size={24} />
            <h3 className="text-lg font-semibold text-red-900">Error Loading Dashboard</h3>
          </div>
          <p className="text-red-700">{error}</p>
          <button
            onClick={loadDashboardData}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here&apos;s what&apos;s happening with MNK Solution Ltd.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalRevenue ? formatCurrency(stats.totalRevenue) : '₦0'}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <DollarSign className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalOrders || 0}</p>
                <p className="text-sm text-yellow-600 mt-1">
                  {stats?.pendingOrders || 0} pending
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <ShoppingCart className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          {/* Total Vendors */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Vendors</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalVendors || 0}</p>
                <p className="text-sm text-orange-600 mt-1">
                  {stats?.pendingVendors || 0} pending approval
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Users className="text-purple-600" size={24} />
              </div>
            </div>
          </div>

          {/* Total Products */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalProducts || 0}</p>
                <p className="text-sm text-green-600 mt-1">
                  {stats?.activeProducts || 0} active
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Package className="text-yellow-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/admin/vendors?status=pending"
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Pending Vendors</h3>
                <p className="text-sm text-gray-600">Review vendor applications</p>
              </div>
              <div className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-semibold">
                {stats?.pendingVendors || 0}
              </div>
            </div>
          </Link>

          <Link
            href="/admin/orders?status=pending"
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Pending Orders</h3>
                <p className="text-sm text-gray-600">Process new orders</p>
              </div>
              <div className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-sm font-semibold">
                {stats?.pendingOrders || 0}
              </div>
            </div>
          </Link>

          <Link
            href="/admin/products"
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Manage Products</h3>
                <p className="text-sm text-gray-600">View all products</p>
              </div>
              <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-semibold">
                {stats?.totalProducts || 0}
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Activity size={20} className="text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {recentActivity && recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {activity.admin?.full_name || activity.admin?.email || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {activity.action.replace(/_/g, ' ')} - {activity.entity_type}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                No recent activity
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}