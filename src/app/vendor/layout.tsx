'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  LayoutDashboard,
  Package,
  Home as HomeIcon,
  Car,
  ShoppingCart,
  MessageSquare,
  BarChart3,
  Settings,
  HelpCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  Plus,
  LogOut,
  Store,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/vendor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/vendor/products', label: 'Products', icon: Package },
  { href: '/vendor/properties', label: 'Properties', icon: HomeIcon },
  { href: '/vendor/vehicles', label: 'Vehicles', icon: Car },
  { href: '/vendor/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/vendor/messages', label: 'Messages', icon: MessageSquare },
  { href: '/vendor/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/vendor/settings', label: 'Settings', icon: Settings },
  { href: '/vendor/help', label: 'Help Center', icon: HelpCircle },
  { href: '/vendor/policies', label: 'Policies', icon: FileText },
];

const QUICK_ADD = [
  { href: '/vendor/products/create', label: 'Product', color: 'bg-blue-600 hover:bg-blue-700' },
  { href: '/vendor/properties/create', label: 'Property', color: 'bg-green-600 hover:bg-green-700' },
  { href: '/vendor/vehicles/create', label: 'Vehicle', color: 'bg-red-600 hover:bg-red-700' },
];

export default function VendorLayout({ children }: { children: ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  // Skip layout for the vendor register page
  const isRegisterPage = pathname === '/vendor/register';

  useEffect(() => {
    if (isRegisterPage) {
      setAuthorized(true);
      return;
    }

    if (!loading) {
      if (!user) {
        router.push('/auth/login?redirect=/vendor/dashboard');
      } else if (!profile?.vendor) {
        router.push('/vendor/register');
      } else {
        setAuthorized(true);
      }
    }
  }, [user, profile, loading, router, isRegisterPage]);

  // Register page renders without the sidebar
  if (isRegisterPage) {
    return <>{children}</>;
  }

  if (loading || !authorized) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">{loading ? 'Loading...' : 'Checking vendor access...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          collapsed ? 'w-[72px]' : 'w-64'
        } bg-white border-r border-gray-200 flex flex-col transition-all duration-200`}
      >
        {/* Brand */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Store className="text-blue-600" size={24} />
              <span className="font-bold text-gray-900 truncate">
                {profile?.vendor?.business_name ?? 'Vendor'}
              </span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Quick Add */}
        {!collapsed && (
          <div className="p-3 border-b border-gray-200 space-y-1.5">
            <p className="text-xs font-semibold text-gray-500 uppercase px-1 mb-2">Quick Add</p>
            {QUICK_ADD.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-white text-sm ${item.color} transition`}
              >
                <Plus size={14} />
                {item.label}
              </Link>
            ))}
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={20} className={isActive ? 'text-blue-600' : 'text-gray-500'} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition"
            title={collapsed ? 'Back to Store' : undefined}
          >
            <Store size={18} className="text-gray-500" />
            {!collapsed && <span>Back to Store</span>}
          </Link>
          <button
            onClick={async () => {
              const { supabase: sb } = await import('@/lib/supabase/client');
              await sb.auth.signOut();
              router.push('/');
            }}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition"
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut size={18} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
