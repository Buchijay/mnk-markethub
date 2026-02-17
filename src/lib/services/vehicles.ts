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
  condition?: string
  fuelType?: string
  transmission?: string
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

  // Alias used by automotive page
  async getAll(filters: Record<string, any> = {}) {
    const mapped: VehicleFilters = {
      make: filters.make || undefined,
      model: filters.model || undefined,
      minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
      maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
      minYear: filters.year_min ? Number(filters.year_min) : undefined,
      maxYear: filters.year_max ? Number(filters.year_max) : undefined,
      condition: filters.condition || undefined,
      fuelType: filters.fuel_type || undefined,
      transmission: filters.transmission || undefined,
      sort: filters.sort || 'newest',
    }
    const { vehicles, count, error } = await getVehiclesByFilters(mapped)
    return { data: vehicles, count, error }
  },

  // Get popular makes by counting vehicles per make
  async getPopularMakes() {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('make')
        .eq('status', 'active')

      if (error) throw error

      const makeCounts: Record<string, number> = {}
      ;(data || []).forEach((v: any) => {
        if (v.make) {
          makeCounts[v.make] = (makeCounts[v.make] || 0) + 1
        }
      })

      return Object.entries(makeCounts)
        .map(([make, count]) => ({ make, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
    } catch (error) {
      console.error('Error fetching popular makes:', error)
      return []
    }
  },
}

