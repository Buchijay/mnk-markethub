import { supabase } from '@/lib/supabase/client'
import type { Vehicle } from '@/lib/types/database.types'

export interface VehicleFilters {
  search?: string
  listingType?: 'sale' | 'lease'
  make?: string
  model?: string
  minPrice?: number
  maxPrice?: number
  minYear?: number
  maxYear?: number
  condition?: 'new' | 'foreign_used' | 'nigerian_used' | 'accident_free'
  fuelType?: 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'cng'
  transmission?: 'automatic' | 'manual'
  location?: string
  sort?: 'newest' | 'price-low' | 'price-high' | 'popular'
}

export async function getVehicleBySlug(slug: string) {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*, vendor:vendors(*)')
      .eq('slug', slug)
      .eq('status', 'active')
      .single()

    if (error) throw error
    return { vehicle: data as any, error: null }
  } catch (error) {
    console.error('Error fetching vehicle:', error)
    return { vehicle: null, error }
  }
}

export async function getVehiclesByFilters(filters: VehicleFilters) {
  try {
    let query = supabase
      .from('vehicles')
      .select('*, vendor:vendors(*)', { count: 'exact' })
      .eq('status', 'active')

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    if (filters.listingType) {
      query = query.eq('listing_type', filters.listingType)
    }

    if (filters.make) {
      query = query.ilike('make', `%${filters.make}%`)
    }

    if (filters.model) {
      query = query.ilike('model', `%${filters.model}%`)
    }

    if (filters.minPrice !== undefined) {
      query = query.gte('price', filters.minPrice)
    }

    if (filters.maxPrice !== undefined) {
      query = query.lte('price', filters.maxPrice)
    }

    if (filters.minYear !== undefined) {
      query = query.gte('year', filters.minYear)
    }

    if (filters.maxYear !== undefined) {
      query = query.lte('year', filters.maxYear)
    }

    if (filters.condition) {
      query = query.eq('condition', filters.condition)
    }

    if (filters.fuelType) {
      query = query.eq('fuel_type', filters.fuelType)
    }

    if (filters.transmission) {
      query = query.eq('transmission', filters.transmission)
    }

    if (filters.location) {
      query = query.or(`location->>'city'.ilike.%${filters.location}%,location->>'state'.ilike.%${filters.location}%`)
    }

    // Sorting
    switch (filters.sort) {
      case 'price-low':
        query = query.order('price', { ascending: true })
        break
      case 'price-high':
        query = query.order('price', { ascending: false })
        break
      case 'popular':
        query = query.order('views_count', { ascending: false })
        break
      default:
        query = query.order('created_at', { ascending: false })
    }

    query = query.limit(50)

    const { data, error, count } = await query

    if (error) throw error
    return { vehicles: (data || []) as any[], count, error: null }
  } catch (error) {
    console.error('Error fetching vehicles:', error)
    return { vehicles: [], count: 0, error }
  }
}

export async function getRelatedVehicles(vehicleId: string, make: string, limit = 4) {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*, vendor:vendors(*)')
      .eq('status', 'active')
      .neq('id', vehicleId)
      .ilike('make', `%${make}%`)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return { vehicles: (data || []) as any[], error: null }
  } catch (error) {
    console.error('Error fetching related vehicles:', error)
    return { vehicles: [], error }
  }
}

export const vehiclesService = {
  getVehicleBySlug,
  getVehiclesByFilters,
  getRelatedVehicles,
}

