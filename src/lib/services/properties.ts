import { supabase } from '@/lib/supabase/client'
import type { Property } from '@/lib/types/database.types'

export interface PropertyFilters {
  search?: string
  listingType?: 'rent' | 'sale' | 'short_let'
  minPrice?: number
  maxPrice?: number
  minBedrooms?: number
  location?: string
  sort?: 'newest' | 'price-low' | 'price-high' | 'popular'
}

export async function getPropertyBySlug(slug: string) {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*, vendor:vendors(*)')
      .eq('slug', slug)
      .eq('status', 'active')
      .single()

    if (error) throw error
    return { property: data as any, error: null }
  } catch (error) {
    console.error('Error fetching property:', error)
    return { property: null, error }
  }
}

export async function getPropertiesByFilters(filters: PropertyFilters) {
  try {
    let query = supabase
      .from('properties')
      .select('*, vendor:vendors(*)', { count: 'exact' })
      .eq('status', 'active')

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    if (filters.listingType) {
      query = query.eq('listing_type', filters.listingType)
    }

    if (filters.minPrice !== undefined) {
      query = query.gte('price', filters.minPrice)
    }

    if (filters.maxPrice !== undefined) {
      query = query.lte('price', filters.maxPrice)
    }

    if (filters.minBedrooms !== undefined) {
      query = query.gte('bedrooms', filters.minBedrooms)
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
    return { properties: (data || []) as any[], count, error: null }
  } catch (error) {
    console.error('Error fetching properties:', error)
    return { properties: [], count: 0, error }
  }
}

export async function getRelatedProperties(propertyId: string, locationArea: string, limit = 4) {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*, vendor:vendors(*)')
      .eq('status', 'active')
      .neq('id', propertyId)
      .like('location->>"area"', `%${locationArea}%`)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return { properties: (data || []) as any[], error: null }
  } catch (error) {
    console.error('Error fetching related properties:', error)
    return { properties: [], error }
  }
}

export const propertiesService = {
  getPropertyBySlug,
  getPropertiesByFilters,
  getRelatedProperties,
}

