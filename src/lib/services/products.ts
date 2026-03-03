import { supabase } from '@/lib/supabase/client'
import { Product, ProductFilterOptions, ProductsResponse, ProductResponse } from '@/lib/types/products'
import { logger } from '@/lib/utils/logger'

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
      logger.error('Error fetching products:', error)
      return { products: [], error, count: 0 }
    }

    // Batch-fetch vendor and category data to avoid N+1 queries
    if (data && data.length > 0) {
      const vendorIds = [...new Set(data.map((p: any) => p.vendor_id).filter(Boolean))]
      const categoryIds = [...new Set(data.map((p: any) => p.category_id).filter(Boolean))]

      const [vendorsResult, categoriesResult] = await Promise.all([
        vendorIds.length > 0
          ? supabase.from('vendors').select('id, business_name, slug, rating, logo_url, total_reviews, total_sales, verification_status').in('id', vendorIds)
          : Promise.resolve({ data: [] }),
        categoryIds.length > 0
          ? supabase.from('categories').select('id, name, slug').in('id', categoryIds)
          : Promise.resolve({ data: [] }),
      ])

      const vendorMap = new Map((vendorsResult.data || []).map((v: any) => [v.id, v]))
      const categoryMap = new Map((categoriesResult.data || []).map((c: any) => [c.id, c]))

      const enrichedData = data.map((product: any) => ({
        ...product,
        vendor: vendorMap.get(product.vendor_id) || null,
        category: categoryMap.get(product.category_id) || null,
      }))
      return { products: enrichedData, error: null, count: count || 0 }
    }

    return { products: (data || []) as unknown as Product[], error: null, count: count || 0 }
  } catch (error) {
    logger.error('Error in getProducts:', error)
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
      logger.error('Error fetching product:', error)
      return { product: null, error }
    }

    // Enrich with vendor and category data
    let enrichedData: Record<string, unknown> = { ...data }

    if (data?.vendor_id) {
      const { data: vendorData } = await supabase
        .from('vendors')
        .select('id, business_name, slug, rating, total_reviews, total_sales, logo_url, description, verification_status')
        .eq('id', data.vendor_id)
        .single()
      enrichedData.vendor = vendorData
    }

    if (data?.category_id) {
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('id', data.category_id)
        .single()
      enrichedData.category = categoryData
    }

    return { product: enrichedData as unknown as Product, error: null }
  } catch (error) {
    logger.error('Error in getProductBySlug:', error)
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
      logger.error('Error fetching related products:', error)
      return { products: [], error }
    }

    // Batch-fetch vendor data
    const vendorIds = [...new Set((data || []).map((p: any) => p.vendor_id).filter(Boolean))]
    const vendorsResult = vendorIds.length > 0
      ? await supabase.from('vendors').select('id, business_name, slug, rating').in('id', vendorIds)
      : { data: [] }
    const vendorMap = new Map((vendorsResult.data || []).map((v: any) => [v.id, v]))

    const enrichedData = (data || []).map((product: any) => ({
      ...product,
      vendor: vendorMap.get(product.vendor_id) || null,
    }))

    return { products: enrichedData, error: null }
  } catch (error) {
    logger.error('Error in getRelatedProducts:', error)
    return { products: [], error }
  }
}

class ProductsServiceClass {
  async getAll(filters: ProductFilters & { limit?: number; offset?: number } = {}) {
    const options: ProductFilterOptions = {
      search: filters.search,
      category: filters.category,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      limit: filters.limit,
      offset: filters.offset,
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
