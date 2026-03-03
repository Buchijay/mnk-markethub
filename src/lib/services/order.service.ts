import { supabase } from '@/lib/supabase/client'
import type { Order } from '@/lib/types/database.types'

export interface OrderFilters {
  status?: Order['status']
  user_id?: string
  limit?: number
  offset?: number
}

export async function getOrders(filters: OrderFilters = {}) {
  try {
    let query = supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (filters.status) query = query.eq('status', filters.status)
    if (filters.user_id) query = query.eq('user_id', filters.user_id)
    if (filters.limit) query = query.limit(filters.limit)
    if (filters.offset !== undefined && filters.limit) {
      query = query.range(filters.offset, filters.offset + filters.limit - 1)
    }

    const { data, error, count } = await query
    if (error) return { orders: [], error, count: 0 }
    return { orders: (data || []) as Order[], error: null, count: count || 0 }
  } catch (error) {
    return { orders: [], error, count: 0 }
  }
}

export async function getOrderByNumber(orderNumber: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('order_number', orderNumber)
    .single()
  return { order: data as Order | null, error }
}

export async function getUserOrders(userId: string, status?: Order['status']) {
  let query = supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)
  const { data, error } = await query
  return { orders: (data || []) as Order[], error }
}

export async function createOrder(orderData: {
  user_id: string
  order_number: string
  items: Array<{ product_id: string; quantity: number; price: number; vendor_id: string }>
  shipping_address: Record<string, string>
  payment_method: string
  subtotal: number
  shipping_fee: number
  total: number
}) {
  const { items, ...orderFields } = orderData

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      ...orderFields,
      status: 'pending' as const,
      payment_status: 'pending' as const,
      tax: 0,
      discount: 0,
    })
    .select()
    .single()

  if (orderError || !order) return { order: null, error: orderError }

  // Insert order items
  const orderItems = items.map(item => ({
    order_id: order.id,
    product_id: item.product_id,
    vendor_id: item.vendor_id,
    quantity: item.quantity,
    price: item.price,
    total: item.price * item.quantity,
  }))

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
  if (itemsError) return { order, error: itemsError }

  return { order: order as Order, error: null }
}

export const orderService = {
  getOrders,
  getOrderByNumber,
  getUserOrders,
  createOrder,
}
