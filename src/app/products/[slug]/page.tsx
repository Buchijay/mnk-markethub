'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getProductBySlug, getRelatedProducts } from '@/lib/services/products'
import ProductCard from '@/components/products/ProductCard'
import toast from 'react-hot-toast'
import {
  Star,
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  ShieldCheck,
  RotateCcw,
  Minus,
  Plus,
  ChevronRight,
  Store,
  Check,
  Package,
} from 'lucide-react'

interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  vendor_id: string
  vendor_name: string
  slug: string
}

export default function ProductDetailPage() {
  const params = useParams()
  const slug = params.slug as string

  const [product, setProduct] = useState<any>(null)
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>('description')

  useEffect(() => {
    if (slug) loadProduct()
  }, [slug])

  async function loadProduct() {
    setLoading(true)
    const { product: data, error } = await getProductBySlug(slug)
    if (data) {
      setProduct(data)
      if (data.category_id) {
        const { products } = await getRelatedProducts(data.id, data.category_id, 4)
        setRelatedProducts(products)
      }
    }
    setLoading(false)
  }

  const addToCart = () => {
    if (!product) return

    const cart: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingIndex = cart.findIndex((item) => item.id === product.id)

    if (existingIndex >= 0) {
      cart[existingIndex].quantity += quantity
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || '',
        quantity,
        vendor_id: product.vendor_id,
        vendor_name: product.vendor?.business_name || 'Unknown',
        slug: product.slug,
      })
    }

    localStorage.setItem('cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cartUpdated'))
    toast.success(`${product.name} added to cart!`)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(price)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="bg-gray-200 animate-pulse rounded-2xl h-[500px]" />
            <div className="space-y-4">
              <div className="bg-gray-200 animate-pulse rounded h-8 w-3/4" />
              <div className="bg-gray-200 animate-pulse rounded h-6 w-1/2" />
              <div className="bg-gray-200 animate-pulse rounded h-10 w-1/3" />
              <div className="bg-gray-200 animate-pulse rounded h-24 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package size={64} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-500 mb-6">The product you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Link href="/products" className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-bold transition">
            Browse Products
          </Link>
        </div>
      </div>
    )
  }

  const mainImage = product.images?.[selectedImage] || product.images?.[0]
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price
  const discountPercent = hasDiscount
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-amber-600 transition">Home</Link>
            <ChevronRight size={14} />
            <Link href="/products" className="hover:text-amber-600 transition">Products</Link>
            <ChevronRight size={14} />
            {product.category && (
              <>
                <Link href={`/products?category=${product.category.id}`} className="hover:text-amber-600 transition">
                  {product.category.name}
                </Link>
                <ChevronRight size={14} />
              </>
            )}
            <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Product Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
          {/* Image Gallery */}
          <div>
            <div className="relative w-full h-[400px] md:h-[500px] bg-white rounded-2xl overflow-hidden shadow-lg border">
              {mainImage ? (
                <Image
                  src={mainImage}
                  alt={product.name}
                  fill
                  className="object-contain p-4"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Package size={80} />
                </div>
              )}
              {hasDiscount && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow">
                  -{discountPercent}% OFF
                </div>
              )}
            </div>
            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                {product.images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition ${
                      selectedImage === idx ? 'border-amber-600 shadow-lg' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image src={img} alt={`${product.name} ${idx + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {/* Category & Status */}
            <div className="flex items-center gap-3 mb-3">
              {product.category && (
                <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-sm font-medium">
                  {product.category.name}
                </span>
              )}
              {product.stock_quantity > 0 ? (
                <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Check size={14} /> In Stock
                </span>
              ) : (
                <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Name */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>

            {/* Rating & Vendor */}
            <div className="flex items-center gap-4 mb-4">
              {product.vendor && (
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={
                          i < Math.floor(product.vendor?.rating || 0)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    ({product.vendor.total_reviews || 0} reviews)
                  </span>
                </div>
              )}
              <span className="text-sm text-gray-400">|</span>
              <span className="text-sm text-gray-600">{product.sales_count || 0} sold</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-amber-600">{formatPrice(product.price)}</span>
              {hasDiscount && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(product.compare_at_price)}
                  </span>
                  <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-sm font-bold">
                    Save {formatPrice(product.compare_at_price - product.price)}
                  </span>
                </>
              )}
            </div>

            {/* Short Description */}
            {product.short_description && (
              <p className="text-gray-600 mb-6 leading-relaxed">{product.short_description}</p>
            )}

            {/* Quantity & Add to Cart */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-3 hover:bg-gray-100 transition"
                >
                  <Minus size={16} />
                </button>
                <span className="px-5 py-3 font-bold text-lg bg-gray-50 min-w-[60px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                  className="px-3 py-3 hover:bg-gray-100 transition"
                >
                  <Plus size={16} />
                </button>
              </div>

              <button
                onClick={addToCart}
                disabled={product.stock_quantity === 0}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-3.5 rounded-lg font-bold transition shadow-lg shadow-amber-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShoppingCart size={20} />
                Add to Cart
              </button>

              <button className="p-3.5 border border-gray-300 rounded-lg hover:bg-red-50 hover:border-red-300 hover:text-red-500 transition text-gray-500">
                <Heart size={20} />
              </button>

              <button className="p-3.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition text-gray-500">
                <Share2 size={20} />
              </button>
            </div>

            {/* Vendor Info */}
            {product.vendor && (
              <Link
                href={`/vendors/${product.vendor.slug}`}
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition mb-6 border"
              >
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <Store size={20} className="text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{product.vendor.business_name}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    {product.vendor.verification_status === 'verified' && (
                      <span className="flex items-center gap-1 text-green-600">
                        <ShieldCheck size={14} /> Verified
                      </span>
                    )}
                    <span>{product.vendor.total_sales || 0} sales</span>
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
              </Link>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center gap-2 p-3 bg-blue-50 rounded-xl text-center">
                <Truck size={20} className="text-blue-600" />
                <span className="text-xs font-medium text-blue-900">Fast Delivery</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 bg-green-50 rounded-xl text-center">
                <ShieldCheck size={20} className="text-green-600" />
                <span className="text-xs font-medium text-green-900">Secure Payment</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 bg-purple-50 rounded-xl text-center">
                <RotateCcw size={20} className="text-purple-600" />
                <span className="text-xs font-medium text-purple-900">Easy Returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-2xl shadow-lg border mb-16">
          <div className="flex border-b">
            {(['description', 'specifications', 'reviews'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-medium capitalize transition border-b-2 -mb-px ${
                  activeTab === tab
                    ? 'border-amber-600 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-6 md:p-8">
            {activeTab === 'description' && (
              <div className="prose max-w-none text-gray-700 leading-relaxed">
                {product.description ? (
                  <div dangerouslySetInnerHTML={{ __html: product.description.replace(/\n/g, '<br/>') }} />
                ) : (
                  <p className="text-gray-400">No description available.</p>
                )}
                {product.features?.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Key Features</h3>
                    <ul className="space-y-2">
                      {product.features.map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check size={16} className="text-green-500 mt-1 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'specifications' && (
              <div>
                {product.specifications && Object.keys(product.specifications).length > 0 ? (
                  <table className="w-full">
                    <tbody>
                      {Object.entries(product.specifications).map(([key, value], idx) => (
                        <tr key={key} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                          <td className="px-4 py-3 font-medium text-gray-700 w-1/3 capitalize">
                            {key.replace(/_/g, ' ')}
                          </td>
                          <td className="px-4 py-3 text-gray-600">{String(value)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-400">No specifications available.</p>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="text-center py-12">
                <Star size={48} className="text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-900 mb-1">No Reviews Yet</h3>
                <p className="text-gray-500">Be the first to review this product.</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p: any) => (
                <ProductCard key={p.id} product={p} view="grid" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
