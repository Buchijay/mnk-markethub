// Re-export the products service to consolidate imports
// Use this or '@/lib/services/products' — they point to the same functionality

export {
  getProducts,
  getProductBySlug,
  getFeaturedProducts,
  getRelatedProducts,
  productsService,
} from './products'

export type { ProductFilters } from './products'
