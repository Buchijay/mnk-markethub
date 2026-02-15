'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// Define the order status type
type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'failed';

interface Order {
  id: string;
  order_number: string;
  status: OrderStatus;
  total: number;
  created_at: string;
  items?: Array<{
    id: string;
    product?: {
      name: string;
      images: string[];
    };
  }>;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');

  useEffect(() => {
    loadOrders();
  }, [filter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            product:products(name, images)
          )
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);  // ✅ Now works!
      }

      const { data, error } = await query;

      if (error) throw error;
      setOrders((data || []) as Order[]);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>
      
      {/* Filter */}
      <div className="mb-6">
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value as OrderStatus | 'all')}
          className="border rounded px-4 py-2"
        >
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders list */}
      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border rounded-lg p-4">
              <h3 className="font-bold">{order.order_number}</h3>
              <p>Status: {order.status}</p>
              <p>Total: ₦{order.total?.toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}