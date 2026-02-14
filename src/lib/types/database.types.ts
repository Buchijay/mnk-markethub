// lib/types/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Define all entity types BEFORE the Database interface
export type Profile = {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  role: 'customer' | 'vendor' | 'admin'
  is_active: boolean
  email_verified: boolean
  metadata: Json
  created_at: string
  updated_at: string
}

export type Vendor = {
  id: string
  user_id: string
  business_name: string
  business_type: string[]
  slug: string
  description: string | null
  logo_url: string | null
  banner_url: string | null
  phone: string | null
  email: string | null
  address: {
    street?: string
    city?: string
    state?: string
    country?: string
    postal_code?: string
  }
  business_hours: Json
  rating: number
  total_reviews: number
  total_sales: number
  verification_status: 'pending' | 'verified' | 'rejected'
  verification_documents: Json
  verified_at: string | null
  verified_by: string | null
  rejection_reason: string | null
  kyc_data: Json
  is_active: boolean
  is_suspended: boolean
  suspension_reason: string | null
  created_at: string
  updated_at: string
}

export type Product = {
  id: string
  vendor_id: string
  category_id: string | null
  name: string
  slug: string
  description: string | null
  short_description: string | null
  price: number
  compare_at_price: number | null
  cost_price: number | null
  sku: string | null
  barcode: string | null
  stock_quantity: number
  low_stock_threshold: number
  track_inventory: boolean
  images: string[]
  video_url: string | null
  specifications: Json
  features: string[]
  tags: string[]
  meta_title: string | null
  meta_description: string | null
  meta_keywords: string[] | null
  status: 'draft' | 'active' | 'out_of_stock' | 'archived'
  is_featured: boolean
  views_count: number
  favorites_count: number
  sales_count: number
  created_at: string
  updated_at: string
  published_at: string | null
}

export type Property = {
  id: string
  vendor_id: string
  category_id: string | null
  title: string
  slug: string
  description: string | null
  listing_type: 'rent' | 'sale' | 'short_let'
  price: number
  price_frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'total' | null
  service_charge: number
  legal_fees: number
  agency_fee: number
  caution_fee: number
  location: {
    state: string
    city: string
    area: string
    address?: string
    landmark?: string
    lat?: number
    lng?: number
  }
  bedrooms: number | null
  bathrooms: number | null
  toilets: number | null
  size_sqm: number | null
  plot_size_sqm: number | null
  floors: number | null
  furnishing_status: 'furnished' | 'semi_furnished' | 'unfurnished' | null
  property_condition: 'new' | 'renovated' | 'old' | 'under_construction' | null
  features: Json
  amenities: string[]
  images: string[]
  video_url: string | null
  virtual_tour_url: string | null
  floor_plan_url: string | null
  documents: Json
  verification_status: 'pending' | 'verified' | 'rejected'
  verification_notes: string | null
  verified_at: string | null
  verified_by: string | null
  status: 'draft' | 'active' | 'sold' | 'rented' | 'archived'
  is_featured: boolean
  is_negotiable: boolean
  views_count: number
  inquiries_count: number
  favorites_count: number
  inspection_requests_count: number
  available_from: string | null
  meta_title: string | null
  meta_description: string | null
  created_at: string
  updated_at: string
  published_at: string | null
}

export type Vehicle = {
  id: string
  vendor_id: string
  category_id: string | null
  title: string
  slug: string
  description: string | null
  listing_type: 'sale' | 'lease'
  price: number
  lease_price_monthly: number | null
  make: string
  model: string
  year: number
  mileage: number | null
  condition: 'new' | 'foreign_used' | 'nigerian_used' | 'accident_free' | null
  body_type: string | null
  transmission: 'automatic' | 'manual' | null
  fuel_type: 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'cng' | null
  color: string | null
  interior_color: string | null
  vin: string | null
  registration_number: string | null
  customs_cleared: boolean
  engine_capacity: string | null
  horsepower: number | null
  torque: string | null
  drive_type: 'fwd' | 'rwd' | 'awd' | '4wd' | null
  features: Json
  specifications: Json
  location: {
    state: string
    city: string
    area: string
  }
  images: string[]
  video_url: string | null
  documents: Json
  verification_status: 'pending' | 'verified' | 'rejected'
  verification_notes: string | null
  verified_at: string | null
  verified_by: string | null
  status: 'draft' | 'active' | 'sold' | 'archived'
  is_featured: boolean
  is_negotiable: boolean
  views_count: number
  inquiries_count: number
  favorites_count: number
  test_drive_requests_count: number
  warranty_available: boolean
  warranty_duration: string | null
  meta_title: string | null
  meta_description: string | null
  created_at: string
  updated_at: string
  published_at: string | null
}

export type Review = {
  id: string
  user_id: string
  vendor_id: string
  vertical: 'products' | 'real_estate' | 'automotive' | 'vendor'
  item_id: string | null
  rating: number
  title: string | null
  comment: string | null
  pros: string | null
  cons: string | null
  images: string[]
  is_verified_purchase: boolean
  order_id: string | null
  helpful_count: number
  not_helpful_count: number
  is_approved: boolean
  is_flagged: boolean
  moderation_notes: string | null
  vendor_response: string | null
  vendor_response_at: string | null
  created_at: string
  updated_at: string
}

export type Order = {
  id: string
  user_id: string
  order_number: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  subtotal: number
  shipping_fee: number
  tax: number
  discount: number
  total: number
  shipping_address: Json
  billing_address: Json | null
  shipping_method: string | null
  tracking_number: string | null
  courier: string | null
  estimated_delivery: string | null
  delivered_at: string | null
  payment_method: string | null
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  payment_reference: string | null
  paid_at: string | null
  notes: string | null
  customer_notes: string | null
  admin_notes: string | null
  cancelled_at: string | null
  cancellation_reason: string | null
  created_at: string
  updated_at: string
}

export type Favorite = {
  id: string
  user_id: string
  item_type: 'product' | 'property' | 'vehicle'
  item_id: string
  created_at: string
}

export type Message = {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  is_read: boolean
  created_at: string
}

// Database interface must come AFTER the type definitions it references
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
        Relationships: []
      }
      vendors: {
        Row: Vendor
        Insert: Omit<Vendor, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Vendor, 'id' | 'created_at'>>
        Relationships: []
      }
      products: {
        Row: Product
        Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Product, 'id' | 'created_at'>>
        Relationships: []
      }
      properties: {
        Row: Property
        Insert: Omit<Property, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Property, 'id' | 'created_at'>>
        Relationships: []
      }
      vehicles: {
        Row: Vehicle
        Insert: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Vehicle, 'id' | 'created_at'>>
        Relationships: []
      }
      reviews: {
        Row: Review
        Insert: Omit<Review, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Review, 'id' | 'created_at'>>
        Relationships: []
      }
      orders: {
        Row: Order
        Insert: Omit<Order, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Order, 'id' | 'created_at'>>
        Relationships: []
      }
      favorites: {
        Row: Favorite
        Insert: Omit<Favorite, 'id' | 'created_at'>
        Update: Partial<Omit<Favorite, 'id' | 'created_at'>>
        Relationships: []
      }
      messages: {
        Row: Message
        Insert: Omit<Message, 'id' | 'created_at'>
        Update: Partial<Omit<Message, 'id'>>
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Extended types with relations
export type ProductWithVendor = Product & {
  vendor: Vendor | null
  category: { id: string; name: string; slug: string } | null
}

export type PropertyWithVendor = Property & {
  vendor: Vendor | null
  category: { id: string; name: string; slug: string } | null
}

export type VehicleWithVendor = Vehicle & {
  vendor: Vendor | null
  category: { id: string; name: string; slug: string } | null
}

export type Conversation = {
  id: string
  user_id: string
  vendor_id: string
  last_message: string | null
  last_message_at: string | null
  unread_count: number
  created_at: string
  updated_at: string
}