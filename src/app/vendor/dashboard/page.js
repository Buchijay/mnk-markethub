// app/vendor/dashboard/page.js
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';
import { 
  Package, 
  Home as HomeIcon, 
  Car, 
  TrendingUp, 
  Eye, 
  ShoppingCart,
  DollarSign,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';

export default function VendorDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    products: { total: 0, active: 0, views: 0, sales: 0 },
    properties: { total: 0, active: 0, views: 0, inquiries: 0 },
    vehicles: { total: 0, active: 0, views: 0, inquiries: 0 },
    revenue: 0,
    messages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    if (profile?.vendor) {
      loadDashboardData();
    }
  }, [profile]);

  async function loadDashboardData() {
    const vendor_id = profile.vendor.id;

    // Fetch products stats
    const { data: products } = await supabase
      .from('products')
      .select('status, views_count, sales_count')
      .eq('vendor_id', vendor_id);

    // Fetch properties stats
    const { data: properties } = await supabase
      .from('properties')
      .select('status, views_count, inquiries_count')
      .eq('vendor_id', vendor_id);

    // Fetch vehicles stats
    const { data: vehicles } = await supabase
      .from('vehicles')
      .select('status, views_count, inquiries_count')
      .eq('vendor_id', vendor_id);

    // Calculate stats
    setStats({
      products: {
        total: products?.length || 0,
        active: products?.filter(p => p.status === 'active').length || 0,
        views: products?.reduce((sum, p) => sum + (p.views_count || 0), 0) || 0,
        sales: products?.reduce((sum, p) => sum + (p.sales_count || 0), 0) || 0,
      },
      properties: {
        total: properties?.length || 0,
        active: properties?.filter(p => p.status === 'active').length || 0,
        views: properties?.reduce((sum, p) => sum + (p.views_count || 0), 0) || 0,
        inquiries: properties?.reduce((sum, p) => sum + (p.inquiries_count || 0), 0) || 0,
      },
      vehicles: {
        total: vehicles?.length || 0,
        active: vehicles?.filter(v => v.status === 'active').length || 0,
        views: vehicles?.reduce((sum, v) => sum + (v.views_count || 0), 0) || 0,
        inquiries: vehicles?.reduce((sum, v) => sum + (v.inquiries_count || 0), 0) || 0,
      },
      revenue: 0, // Calculate from orders
      messages: 0, // Count unread messages
    });

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Vendor Dashboard</h1>
          <p className="text-gray-700">
            Welcome back, {profile?.vendor?.business_name}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <TrendingUp className="text-blue-600" size={24} />
              </div>
              <span className="text-sm text-gray-700">This Month</span>
            </div>
            <p className="text-3xl font-bold mb-1 text-gray-900">₦{stats.revenue.toLocaleString()}</p>
            <p className="text-sm text-gray-700 font-medium">Total Revenue</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Eye className="text-green-600" size={24} />
              </div>
              <span className="text-sm text-gray-700">All Time</span>
            </div>
            <p className="text-3xl font-bold mb-1 text-gray-900">
              {(stats.products.views + stats.properties.views + stats.vehicles.views).toLocaleString()}
            </p>
            <p className="text-sm text-gray-700 font-medium">Total Views</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <ShoppingCart className="text-yellow-600" size={24} />
              </div>
              <span className="text-sm text-gray-700">Products</span>
            </div>
            <p className="text-3xl font-bold mb-1 text-gray-900">{stats.products.sales}</p>
            <p className="text-sm text-gray-700 font-medium">Total Sales</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <MessageSquare className="text-purple-600" size={24} />
              </div>
              <span className="text-sm text-gray-700">Unread</span>
            </div>
            <p className="text-3xl font-bold mb-1 text-gray-900">{stats.messages}</p>
            <p className="text-sm text-gray-700 font-medium">Messages</p>
          </div>
        </div>

        {/* Verticals Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Products */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Package className="text-blue-600" size={24} />
                </div>
                <h3 className="font-bold text-lg text-gray-900">Products</h3>
              </div>
              <Link href="/vendor/products" className="text-blue-600 hover:underline text-sm font-medium">
                Manage →
              </Link>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-700">Total Listings:</span>
                <span className="font-semibold text-gray-900">{stats.products.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Active:</span>
                <span className="font-semibold text-green-600">{stats.products.active}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Views:</span>
                <span className="font-semibold text-gray-900">{stats.products.views}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Sales:</span>
                <span className="font-semibold text-gray-900">{stats.products.sales}</span>
              </div>
            </div>
            <Link
              href="/vendor/products/create"
              className="mt-4 block w-full bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Add New Product
            </Link>
          </div>

          {/* Properties */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-lg">
                  <HomeIcon className="text-green-600" size={24} />
                </div>
                <h3 className="font-bold text-lg text-gray-900">Properties</h3>
              </div>
              <Link href="/vendor/properties" className="text-green-600 hover:underline text-sm font-medium">
                Manage →
              </Link>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-700">Total Listings:</span>
                <span className="font-semibold text-gray-900">{stats.properties.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Active:</span>
                <span className="font-semibold text-green-600">{stats.properties.active}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Views:</span>
                <span className="font-semibold text-gray-900">{stats.properties.views}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Inquiries:</span>
                <span className="font-semibold text-gray-900">{stats.properties.inquiries}</span>
              </div>
            </div>
            <Link
              href="/vendor/properties/create"
              className="mt-4 block w-full bg-green-600 text-white text-center py-2 rounded-lg hover:bg-green-700 transition"
            >
              Add New Property
            </Link>
          </div>

          {/* Vehicles */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-3 rounded-lg">
                  <Car className="text-red-600" size={24} />
                </div>
                <h3 className="font-bold text-lg text-gray-900">Vehicles</h3>
              </div>
              <Link href="/vendor/vehicles" className="text-red-600 hover:underline text-sm font-medium">
                Manage →
              </Link>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-700">Total Listings:</span>
                <span className="font-semibold text-gray-900">{stats.vehicles.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Active:</span>
                <span className="font-semibold text-green-600">{stats.vehicles.active}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Views:</span>
                <span className="font-semibold text-gray-900">{stats.vehicles.views}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Inquiries:</span>
                <span className="font-semibold text-gray-900">{stats.vehicles.inquiries}</span>
              </div>
            </div>
            <Link
              href="/vendor/vehicles/create"
              className="mt-4 block w-full bg-red-600 text-white text-center py-2 rounded-lg hover:bg-red-700 transition"
            >
              Add New Vehicle
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-bold text-lg mb-4 text-gray-900">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/vendor/orders"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-600 transition text-center"
            >
              <ShoppingCart className="mx-auto mb-2 text-gray-700" size={32} />
              <p className="font-semibold text-gray-900">View Orders</p>
            </Link>
            <Link
              href="/vendor/messages"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-600 transition text-center"
            >
              <MessageSquare className="mx-auto mb-2 text-gray-700" size={32} />
              <p className="font-semibold text-gray-900">Messages</p>
            </Link>
            <Link
              href="/vendor/analytics"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-600 transition text-center"
            >
              <TrendingUp className="mx-auto mb-2 text-gray-700" size={32} />
              <p className="font-semibold text-gray-900">Analytics</p>
            </Link>
            <Link
              href="/vendor/settings"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-600 transition text-center"
            >
              <DollarSign className="mx-auto mb-2 text-gray-700" size={32} />
              <p className="font-semibold text-gray-900">Settings</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}