import { supabase } from '@/lib/supabase/client'
import { Product, ProductFilterOptions, ProductsResponse, ProductResponse } from '@/lib/types/products'

export interface ProductFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  search?: string
  sort?: 'newest' | 'price_low' | 'price_high' | 'popular'
}

export async function getProducts(
  options: ProductFilterOptions = {}
): Promise<ProductsResponse> {
  try {
    let query = supabase
      .from('products')
      .select(`
        *,
        vendor:vendor_id (
          id,
          business_name,
          slug,
          rating,
          logo_url
        ),
        category:category_id (
          id,
          name,
          slug
        )
      `, { count: 'exact' })

    // Apply filters
    if (options.status) {
      query = query.eq('status', options.status)
    } else {
      query = query.eq('status', 'active')
    }
    
    if (options.category) {
      query = query.eq('category_id', options.category)
    }
    
    if (options.vendor) {
      query = query.eq('vendor_id', options.vendor)
    }
    
    if (options.search) {
      query = query.or(`name.ilike.%${options.search}%,description.ilike.%${options.search}%`)
    }
    
    if (options.minPrice !== undefined) {
      query = query.gte('price', options.minPrice)
    }
    
    if (options.maxPrice !== undefined) {
      query = query.lte('price', options.maxPrice)
    }
    
    if (options.is_featured !== undefined) {
      query = query.eq('is_featured', options.is_featured)
    }
    
    // Apply sorting
    const sortBy = options.sortBy || 'created_at'
    const sortOrder = options.sortOrder || 'desc'
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })
    
    // Apply pagination
    if (options.limit) {
      query = query.limit(options.limit)
    }
    
    if (options.offset !== undefined && options.limit) {
      query = query.range(options.offset, options.offset + options.limit - 1)
    }
    
    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching products:', error)
      return { products: [], error, count: 0 }
    }

    return { products: data || [], error: null, count: count || 0 }
  } catch (error) {
    console.error('Error in getProducts:', error)
    return { products: [], error, count: 0 }
  }
}

export async function getProductBySlug(slug: string): Promise<ProductResponse> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        vendor:vendor_id (
          id,
          business_name,
          slug,
          rating,
          total_reviews,
          total_sales,
          logo_url,
          description,
          verification_status
        ),
        category:category_id (
          id,
          name,
          slug,
          parent_id
        ),
        variants:product_variants(*)
      `)
      .eq('slug', slug)
      .eq('status', 'active')
      .single()

    if (error) {
      console.error('Error fetching product:', error)
      return { product: null, error }
    }

    return { product: data, error: null }
  } catch (error) {
    console.error('Error in getProductBySlug:', error)
    return { product: null, error }
  }
}

export async function getFeaturedProducts(limit: number = 8): Promise<ProductsResponse> {
  return getProducts({
    is_featured: true,
    limit,
    sortBy: 'created_at',
    sortOrder: 'desc'
  })
}

export async function getRelatedProducts(
  productId: string,
  categoryId: string,
  limit: number = 4
): Promise<ProductsResponse> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        vendor:vendor_id (
          id,
          business_name,
          slug,
          rating
        )
      `)
      .eq('category_id', categoryId)
      .neq('id', productId)
      .eq('status', 'active')
      .limit(limit)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching related products:', error)
      return { products: [], error }
    }

    return { products: data || [], error: null }
  } catch (error) {
    console.error('Error in getRelatedProducts:', error)
    return { products: [], error }
  }
}

class ProductsServiceClass {
  async getAll(filters: ProductFilters = {}) {
    const options: ProductFilterOptions = {
      search: filters.search,
      category: filters.category,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
    }

    if (filters.sort === 'price_low') {
      options.sortBy = 'price'
      options.sortOrder = 'asc'
    } else if (filters.sort === 'price_high') {
      options.sortBy = 'price'
      options.sortOrder = 'desc'
    } else if (filters.sort === 'popular') {
      options.sortBy = 'rating'
      options.sortOrder = 'desc'
    } else {
      options.sortBy = 'created_at'
      options.sortOrder = 'desc'
    }

    return getProducts(options)
  }
}

export const productsService = new ProductsServiceClass()
