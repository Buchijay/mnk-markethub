import { supabase } from '@/lib/supabase/client'
import type { Product } from '@/lib/types/database.types'
import { ProductFilterOptions, ProductsResponse, ProductResponse } from '@/lib/types/products'

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
      .select('*', { count: 'exact' })

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

    // Fetch vendor and category details separately for each product
    if (data && data.length > 0) {
      const enrichedData = await Promise.all(
        data.map(async (product: any) => {
          let vendor = null
          let category = null

          if (product.vendor_id) {
            const { data: vendorData } = await supabase
              .from('vendors')
              .select('id, business_name, slug, rating, logo_url, total_reviews, total_sales, verification_status')
              .eq('id', product.vendor_id)
              .single()
            vendor = vendorData
          }

          if (product.category_id) {
            // TODO: Implement when categories table is added to database
            // For now, category will be null
            category = null
          }

          return { ...product, vendor, category }
        })
      )
      return { products: enrichedData, error: null, count: count || 0 }
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
      .select('*')
      .eq('slug', slug)
      .eq('status', 'active')
      .single()

    if (error) {
      console.error('Error fetching product:', error)
      return { product: null, error }
    }

    // Enrich with vendor and category data
    let enrichedData: any = { ...(data as any) }

    if ((data as any)?.vendor_id) {
      const { data: vendorData } = await supabase
        .from('vendors')
        .select('id, business_name, slug, rating, total_reviews, total_sales, logo_url, description, verification_status')
        .eq('id', (data as any).vendor_id)
        .single()
      enrichedData.vendor = vendorData
    }

    if ((data as any)?.category_id) {
      // TODO: Implement when categories table is added to database
      // For now, category will be null
      enrichedData.category = null
    }

    return { product: enrichedData, error: null }
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
      .select('*')
      .eq('category_id', categoryId)
      .neq('id', productId)
      .eq('status', 'active')
      .limit(limit)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching related products:', error)
      return { products: [], error }
    }

    // Enrich with vendor data
    const enrichedData = await Promise.all(
      (data || []).map(async (product: any) => {
        let vendor = null
        if (product.vendor_id) {
          const { data: vendorData } = await supabase
            .from('vendors')
            .select('id, business_name, slug, rating')
            .eq('id', product.vendor_id)
            .single()
          vendor = vendorData
        }
        return { ...product, vendor }
      })
    )

    return { products: enrichedData, error: null }
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
