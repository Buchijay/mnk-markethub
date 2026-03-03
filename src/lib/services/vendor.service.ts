import { supabase } from '@/lib/supabase/client'
import type { Vendor } from '@/lib/types/database.types'

export interface VendorFilters {
  search?: string
  verification_status?: Vendor['verification_status']
  is_active?: boolean
  limit?: number
  offset?: number
}

export async function getVendors(filters: VendorFilters = {}) {
  try {
    let query = supabase
      .from('vendors')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (filters.search) {
      query = query.or(`business_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
    }
    if (filters.verification_status) query = query.eq('verification_status', filters.verification_status)
    if (filters.is_active !== undefined) query = query.eq('is_active', filters.is_active)
    if (filters.limit) query = query.limit(filters.limit)
    if (filters.offset !== undefined && filters.limit) {
      query = query.range(filters.offset, filters.offset + filters.limit - 1)
    }

    const { data, error, count } = await query
    if (error) return { vendors: [], error, count: 0 }
    return { vendors: (data || []) as Vendor[], error: null, count: count || 0 }
  } catch (error) {
    return { vendors: [], error, count: 0 }
  }
}

export async function getVendorBySlug(slug: string) {
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  return { vendor: data as Vendor | null, error }
}

export async function getVendorById(id: string) {
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('id', id)
    .single()
  return { vendor: data as Vendor | null, error }
}

export async function getVendorProducts(vendorId: string, limit = 20) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('vendor_id', vendorId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(limit)
  return { products: data || [], error }
}

export async function getTopVendors(limit = 10) {
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('is_active', true)
    .eq('verification_status', 'verified')
    .order('rating', { ascending: false })
    .limit(limit)
  return { vendors: (data || []) as Vendor[], error }
}

export const vendorService = {
  getVendors,
  getVendorBySlug,
  getVendorById,
  getVendorProducts,
  getTopVendors,
}
