'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getProductBySlug, getRelatedProducts } from '@/lib/services/products'
import { useAuth } from '@/lib/hooks/useAuth'
import { addFavorite, removeFavorite, isFavorited } from '@/lib/services/favorites'
import { getReviewsForItem, getReviewStats, submitReview, markReviewHelpful, type Review, type ReviewStats } from '@/lib/services/reviews'
import toast from 'react-hot-toast'
import { logger } from '@/lib/utils/logger'
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
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  MessageSquare,
  Package,
  ThumbsUp,
  User,
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
  const router = useRouter()
  const slug = params.slug as string
  const { user } = useAuth()

  const [product, setProduct] = useState<any>(null)
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isFav, setIsFav] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'specifications' | 'reviews'>('overview')

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewStats, setReviewStats] = useState<ReviewStats>({ average: 0, total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } })
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' })
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    if (slug) loadProduct()
  }, [slug])

  useEffect(() => {
    if (user && product) {
      checkIfFavorited()
    }
  }, [user, product])

  async function loadProduct() {
    setLoading(true)
    try {
      const { product: data, error } = await getProductBySlug(slug)
      if (data) {
        setProduct(data)
        loadReviews(data.id)
        if (data.category_id) {
          const { products } = await getRelatedProducts(data.id, data.category_id, 4)
          setRelatedProducts(products)
        }
      }
    } catch (error) {
      logger.error('Error loading product:', error)
      toast.error('Failed to load product')
    } finally {
      setLoading(false)
    }
  }

  async function checkIfFavorited() {
    if (!user || !product) return
    const favorited = await isFavorited(user.id, 'product', product.id)
    setIsFav(favorited)
  }

  const handleToggleFavorite = async () => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    if (!product) return

    try {
      if (isFav) {
        await removeFavorite(user.id, 'product', product.id)
        setIsFav(false)
        toast.success('Removed from favorites')
      } else {
        await addFavorite(user.id, 'product', product.id)
        setIsFav(true)
        toast.success('Added to favorites')
      }
    } catch (error) {
      logger.error('Error toggling favorite:', error)
      toast.error('Failed to update favorites')
    }
  }

  const handleContactVendor = () => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    router.push(`/messages?vendor=${product.vendor_id}`)
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
    setQuantity(1)
  }

  const handlePreviousImage = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? (product.images?.length || 1) - 1 : prev - 1
    )
  }

  const handleNextImage = () => {
    setSelectedImageIndex((prev) =>
      prev === (product.images?.length || 1) - 1 ? 0 : prev + 1
    )
  }

  async function loadReviews(productId: string) {
    try {
      const [{ reviews: data }, stats] = await Promise.all([
        getReviewsForItem(productId, 'products'),
        getReviewStats(productId, 'products'),
      ])
      setReviews(data)
      setReviewStats(stats)
    } catch {
      // Reviews are non-critical; silently fail
    }
  }

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !product) return

    setSubmittingReview(true)
    try {
      await submitReview({
        item_id: product.id,
        vertical: 'products',
        vendor_id: product.vendor_id,
        user_id: user.id,
        rating: reviewForm.rating,
        title: reviewForm.title || undefined,
        comment: reviewForm.comment || undefined,
      })
      toast.success('Review submitted!')
      setReviewForm({ rating: 5, title: '', comment: '' })
      loadReviews(product.id)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

  async function handleHelpful(reviewId: string) {
    try {
      await markReviewHelpful(reviewId)
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, helpful_count: r.helpful_count + 1 } : r))
    } catch {
      toast.error('Failed to mark as helpful')
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(price)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-gray-200 animate-pulse rounded-2xl h-96" />
            <div className="bg-gray-200 animate-pulse rounded-2xl h-96" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <Link href="/products" className="text-blue-600 hover:underline">
            Back to Products
          </Link>
        </div>
      </div>
    )
  }

  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price
  const discountPercent = hasDiscount
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Image Gallery */}
        <div className="mb-8">
          <div className="relative bg-gray-900 rounded-2xl overflow-hidden aspect-video mb-4">
            {product.images && product.images.length > 0 ? (
              <>
                <img
                  src={product.images[selectedImageIndex]}
                  alt={`Product ${selectedImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                {hasDiscount && (
                  <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-lg">
                    -{discountPercent}%
                  </div>
                )}
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={handlePreviousImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 rounded-full p-2 transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 rounded-full p-2 transition-colors"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {product.images.map((_: any, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImageIndex(idx)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            idx === selectedImageIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600">
                No images available
              </div>
            )}
          </div>

          {/* Thumbnail Grid */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {product.images.slice(0, 8).map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative rounded-lg overflow-hidden aspect-square border-2 transition-colors ${
                    idx === selectedImageIndex
                      ? 'border-blue-600'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                  {product.category && (
                    <p className="text-gray-600 mb-3">{product.category.name}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleToggleFavorite}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      isFav
                        ? 'bg-red-50 border-red-200 text-red-600'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-red-200'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
                    {isFav ? 'Saved' : 'Save'}
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:border-gray-400">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-3">
                  <p className="text-3xl font-bold text-blue-600">
                    ₦{formatPrice(product.price)}
                  </p>
                  {hasDiscount && (
                    <>
                      <p className="text-lg text-gray-400 line-through">
                        ₦{formatPrice(product.compare_at_price)}
                      </p>
                      <p className="text-green-600 font-semibold">
                        Save ₦{formatPrice(product.compare_at_price - product.price)}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-gray-200">
                <div>
                  <p className="text-sm text-gray-600">In Stock</p>
                  <p className="font-semibold text-gray-900">
                    {product.stock_quantity > 0 ? product.stock_quantity : '0'} units
                  </p>
                </div>
                {product.vendor?.rating !== undefined && (
                  <div>
                    <p className="text-sm text-gray-600">Rating</p>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-gray-900">
                        {product.vendor.rating.toFixed(1)}
                      </span>
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Sold</p>
                  <p className="font-semibold text-gray-900">{product.sales_count || 0}</p>
                </div>
              </div>

              {/* Short Description */}
              {product.short_description && (
                <p className="text-gray-700 leading-relaxed">
                  {product.short_description}
                </p>
              )}
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="border-b border-gray-200 flex">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'specifications', label: 'Specifications' },
                  { id: 'reviews', label: 'Reviews' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'overview' | 'specifications' | 'reviews')}
                    className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">About This Product</h3>
                    <p className="text-gray-700 whitespace-pre-line leading-relaxed mb-6">
                      {product.description || 'No description provided.'}
                    </p>

                    {product.features && product.features.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Key Features</h4>
                        <ul className="space-y-2">
                          {product.features.map((feature: string, idx: number) => (
                            <li key={idx} className="flex items-center gap-2">
                              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                              <span className="text-gray-700">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'specifications' && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Specifications</h3>
                    {product.specifications && Object.keys(product.specifications).length > 0 ? (
                      <div className="space-y-3">
                        {Object.entries(product.specifications).map(([key, value]: [string, any]) => (
                          <div
                            key={key}
                            className="flex justify-between items-center py-3 border-b border-gray-200"
                          >
                            <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}</span>
                            <span className="font-semibold text-gray-900">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">No specifications available.</p>
                    )}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-8">
                    {/* Rating Overview */}
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                      <div className="text-center">
                        <p className="text-5xl font-bold text-gray-900">{reviewStats.average.toFixed(1)}</p>
                        <div className="flex justify-center my-2">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} className={`w-5 h-5 ${s <= Math.round(reviewStats.average) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        <p className="text-sm text-gray-600">{reviewStats.total} review{reviewStats.total !== 1 ? 's' : ''}</p>
                      </div>
                      <div className="flex-1 space-y-1.5 w-full">
                        {([5, 4, 3, 2, 1] as const).map(star => {
                          const count = reviewStats.distribution[star]
                          const pct = reviewStats.total ? (count / reviewStats.total) * 100 : 0
                          return (
                            <div key={star} className="flex items-center gap-2 text-sm">
                              <span className="w-3 text-gray-700">{star}</span>
                              <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                              <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div className="bg-yellow-500 h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="w-8 text-right text-gray-500">{count}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Submit Review Form */}
                    {user ? (
                      <form onSubmit={handleSubmitReview} className="bg-gray-50 rounded-lg p-5 space-y-4">
                        <h4 className="font-semibold text-gray-900">Write a Review</h4>
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Rating</label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(s => (
                              <button key={s} type="button" onClick={() => setReviewForm(f => ({ ...f, rating: s }))}>
                                <Star className={`w-7 h-7 transition ${s <= reviewForm.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 hover:text-yellow-300'}`} />
                              </button>
                            ))}
                          </div>
                        </div>
                        <input
                          type="text" placeholder="Review title (optional)"
                          value={reviewForm.title}
                          onChange={(e) => setReviewForm(f => ({ ...f, title: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <textarea
                          rows={3} placeholder="Share your experience…"
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button type="submit" disabled={submittingReview}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition">
                          {submittingReview ? 'Submitting…' : 'Submit Review'}
                        </button>
                      </form>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-5 text-center">
                        <p className="text-gray-600 text-sm">
                          <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">Sign in</Link> to leave a review.
                        </p>
                      </div>
                    )}

                    {/* Review List */}
                    {reviews.length > 0 ? (
                      <div className="divide-y divide-gray-200">
                        {reviews.map(review => (
                          <div key={review.id} className="py-5 first:pt-0">
                            <div className="flex items-start gap-3">
                              <div className="bg-gray-200 rounded-full p-2 flex-shrink-0">
                                <User className="w-5 h-5 text-gray-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-gray-900 text-sm">
                                    {review.profiles?.full_name || 'Anonymous'}
                                  </span>
                                  <div className="flex">
                                    {[1, 2, 3, 4, 5].map(s => (
                                      <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                                    ))}
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {new Date(review.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                                {review.title && <p className="font-medium text-gray-900 text-sm mb-1">{review.title}</p>}
                                {review.comment && <p className="text-gray-700 text-sm">{review.comment}</p>}
                                <button
                                  onClick={() => handleHelpful(review.id)}
                                  className="flex items-center gap-1 mt-2 text-xs text-gray-500 hover:text-blue-600 transition"
                                >
                                  <ThumbsUp className="w-3.5 h-3.5" />
                                  Helpful ({review.helpful_count})
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Star className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-600 text-sm">No reviews yet. Be the first!</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Add to Cart Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6 sticky top-4">
              {product.stock_quantity > 0 ? (
                <div className="space-y-4">
                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-2 hover:bg-gray-100 transition"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="flex-1 text-center py-2 focus:outline-none font-semibold"
                      />
                      <button
                        onClick={() =>
                          setQuantity(Math.min(product.stock_quantity, quantity + 1))
                        }
                        className="px-3 py-2 hover:bg-gray-100 transition"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={addToCart}
                    className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-medium transition-colors"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </button>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <p className="text-red-600 font-semibold">Out of Stock</p>
                  <p className="text-sm text-red-500 mt-1">This product is currently unavailable</p>
                </div>
              )}
            </div>

            {/* Vendor Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6 sticky top-96">
              <div className="flex items-center gap-4 mb-6">
                {product.vendor?.logo_url && (
                  <img
                    src={product.vendor.logo_url}
                    alt={product.vendor.business_name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{product.vendor?.business_name}</h3>
                  {product.vendor?.verification_status === 'verified' && (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-xs">Verified</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-6">
                {product.vendor?.phone && (
                  <a
                    href={`tel:${product.vendor.phone}`}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <MessageSquare className="w-4 h-4" />
                    {product.vendor.phone}
                  </a>
                )}
                {product.vendor?.email && (
                  <a
                    href={`mailto:${product.vendor.email}`}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <MessageSquare className="w-4 h-4" />
                    {product.vendor.email}
                  </a>
                )}
              </div>

              <button
                onClick={handleContactVendor}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-medium transition-colors text-sm"
              >
                <MessageSquare className="w-5 h-5" />
                Contact Vendor
              </button>
            </div>

            {/* Trust Badges */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Why Shop Here?</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Truck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Fast Delivery</p>
                    <p className="text-xs text-gray-600">Quick and reliable shipping</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Secure Payment</p>
                    <p className="text-xs text-gray-600">Safe & encrypted transactions</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <RotateCcw className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Easy Returns</p>
                    <p className="text-xs text-gray-600">Hassle-free returns policy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p: any) => (
                <Link
                  key={p.id}
                  href={`/products/${p.slug}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-48 bg-gray-200 overflow-hidden">
                    {p.images && p.images.length > 0 ? (
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">{p.name}</h3>
                    <p className="text-blue-600 font-bold">₦{formatPrice(p.price)}</p>
                    {p.vendor && (
                      <p className="text-xs text-gray-600 mt-2">{p.vendor.business_name}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
