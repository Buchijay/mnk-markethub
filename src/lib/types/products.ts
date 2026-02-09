// Product Category Type
export interface ProductCategory {
  id: string
  name: string
  slug: string
  description?: string
  parent_id?: string
  image_url?: string
  icon?: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// Vendor Type
export interface Vendor {
  id: string
  user_id: string
  business_name: string
  business_type: string[]
  slug: string
  description?: string
  logo_url?: string
  banner_url?: string
  phone?: string
  email?: string
  address: {
    street?: string
    city?: string
    state?: string
    country?: string
    postal_code?: string
  }
  rating?: number
  total_reviews?: number
  total_sales?: number
  verification_status: 'pending' | 'verified' | 'rejected'
  is_active: boolean
  created_at: string
  updated_at: string
}

// Product Type
export interface Product {
  id: string
  vendor_id: string
  category_id?: string
  name: string
  slug: string
  description?: string
  short_description?: string
  price: number
  compare_at_price?: number
  cost_price?: number
  sku?: string
  barcode?: string
  stock_quantity: number
  low_stock_threshold: number
  track_inventory: boolean
  images: string[]
  video_url?: string
  specifications: Record<string, any>
  features: string[]
  tags: string[]
  meta_title?: string
  meta_description?: string
  meta_keywords?: string[]
  status: 'draft' | 'active' | 'out_of_stock' | 'archived'
  is_featured: boolean
  views_count: number
  favorites_count: number
  sales_count: number
  created_at: string
  updated_at: string
  published_at?: string
  vendor?: Vendor
  category?: ProductCategory
}

// Product Variant Type
export interface ProductVariant {
  id: string
  product_id: string
  name: string
  sku?: string
  price?: number
  stock_quantity: number
  attributes: Record<string, any>
  image_url?: string
  is_active: boolean
  created_at: string
}

// API Response Types
export interface ProductsResponse {
  products: Product[]
  error: any
  count?: number
}

export interface ProductResponse {
  product: Product | null
  error: any
}

// Filter Options Type
export interface ProductFilterOptions {
  category?: string
  vendor?: string
  limit?: number
  offset?: number
  search?: string
  minPrice?: number
  maxPrice?: number
  status?: 'draft' | 'active' | 'out_of_stock' | 'archived'
  is_featured?: boolean
  sortBy?: 'created_at' | 'price' | 'name' | 'sales_count' | 'rating'
  sortOrder?: 'asc' | 'desc'
}