'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getPropertyBySlug, getRelatedProperties } from '@/lib/services/properties'
import { useAuth } from '@/lib/hooks/useAuth'
import { addFavorite, removeFavorite, isFavorited } from '@/lib/services/favorites'
import toast from 'react-hot-toast'
import {
  Heart,
  Share2,
  MapPin,
  Bath,
  Bed,
  Ruler,
  User,
  Phone,
  Mail,
  CheckCircle2,
  Building2,
  Zap,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
} from 'lucide-react'

export default function PropertyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const { user } = useAuth()

  const [property, setProperty] = useState<any>(null)
  const [relatedProperties, setRelatedProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isFav, setIsFav] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'amenities'>('overview')

  useEffect(() => {
    if (slug) loadProperty()
  }, [slug])

  useEffect(() => {
    if (user && property) {
      checkIfFavorited()
    }
  }, [user, property])

  async function loadProperty() {
    setLoading(true)
    try {
      const { property: data } = await getPropertyBySlug(slug)
      if (data) {
        setProperty(data)
        if (data.location?.area) {
          const { properties } = await getRelatedProperties(data.id, data.location.area, 4)
          setRelatedProperties(properties)
        }
      }
    } catch (error) {
      console.error('Error loading property:', error)
      toast.error('Failed to load property')
    } finally {
      setLoading(false)
    }
  }

  async function checkIfFavorited() {
    if (!user || !property) return
    const favorited = await isFavorited(user.id, 'property', property.id)
    setIsFav(favorited)
  }

  const handleToggleFavorite = async () => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    if (!property) return

    try {
      if (isFav) {
        await removeFavorite(user.id, 'property', property.id)
        setIsFav(false)
        toast.success('Removed from favorites')
      } else {
        await addFavorite(user.id, 'property', property.id)
        setIsFav(true)
        toast.success('Added to favorites')
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('Failed to update favorites')
    }
  }

  const handleContactVendor = () => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    router.push(`/messages?vendor=${property.vendor_id}`)
  }

  const handlePreviousImage = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? (property.images?.length || 1) - 1 : prev - 1
    )
  }

  const handleNextImage = () => {
    setSelectedImageIndex((prev) =>
      prev === (property.images?.length || 1) - 1 ? 0 : prev + 1
    )
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

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h1>
          <p className="text-gray-600 mb-6">The property you're looking for doesn't exist.</p>
          <Link href="/real-estate" className="text-blue-600 hover:underline">
            Back to Real Estate
          </Link>
        </div>
      </div>
    )
  }

  const amenities = property.amenities || []
  const features = property.features || {}

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Image Gallery */}
        <div className="mb-8">
          <div className="relative bg-gray-900 rounded-2xl overflow-hidden aspect-video mb-4">
            {property.images && property.images.length > 0 ? (
              <>
                <img
                  src={property.images[selectedImageIndex]}
                  alt={`Property ${selectedImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                {property.images.length > 1 && (
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
                      {property.images.map((_: any, idx: number) => (
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
          {property.images && property.images.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {property.images.slice(0, 8).map((img: string, idx: number) => (
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
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-5 h-5" />
                    <span>
                      {property.location?.area}, {property.location?.city}, {property.location?.state}
                    </span>
                  </div>
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

              <div className="text-3xl font-bold text-blue-600 mb-4">
                ₦{formatPrice(property.price)}
                {property.price_frequency && <span className="text-lg text-gray-600">/{property.price_frequency}</span>}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {property.bedrooms !== null && (
                  <div className="flex items-center gap-2">
                    <Bed className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Bedrooms</p>
                      <p className="font-semibold">{property.bedrooms}</p>
                    </div>
                  </div>
                )}
                {property.bathrooms !== null && (
                  <div className="flex items-center gap-2">
                    <Bath className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Bathrooms</p>
                      <p className="font-semibold">{property.bathrooms}</p>
                    </div>
                  </div>
                )}
                {property.size_sqm && (
                  <div className="flex items-center gap-2">
                    <Ruler className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Size</p>
                      <p className="font-semibold">{property.size_sqm} sqm</p>
                    </div>
                  </div>
                )}
                {property.listing_type && (
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Type</p>
                      <p className="font-semibold capitalize">{property.listing_type}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="border-b border-gray-200 flex">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'details', label: 'Details' },
                  { id: 'amenities', label: 'Amenities' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
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
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Property Description</h3>
                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                      {property.description || 'No description provided.'}
                    </p>
                  </div>
                )}

                {activeTab === 'details' && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Property Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(features).map(([key, value]: [string, any]) => (
                        <div key={key} className="flex justify-between items-center py-2 border-b border-gray-200">
                          <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}</span>
                          <span className="font-semibold text-gray-900">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'amenities' && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Amenities</h3>
                    {amenities.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3">
                        {amenities.map((amenity: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-green-600" />
                            <span className="text-gray-700">{amenity}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">No amenities listed.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Vendor Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6 sticky top-4">
              <div className="flex items-center gap-4 mb-6">
                {property.vendor?.logo_url && (
                  <img
                    src={property.vendor.logo_url}
                    alt={property.vendor.business_name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{property.vendor?.business_name}</h3>
                  {property.vendor?.verification_status === 'verified' && (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-xs">Verified</span>
                    </div>
                  )}
                </div>
              </div>

              {property.vendor?.phone && (
                <div className="flex items-center gap-2 mb-4 text-gray-700">
                  <Phone className="w-5 h-5 text-gray-600" />
                  <a href={`tel:${property.vendor.phone}`} className="hover:text-blue-600">
                    {property.vendor.phone}
                  </a>
                </div>
              )}

              {property.vendor?.email && (
                <div className="flex items-center gap-2 mb-6 text-gray-700">
                  <Mail className="w-5 h-5 text-gray-600" />
                  <a href={`mailto:${property.vendor.email}`} className="hover:text-blue-600">
                    {property.vendor.email}
                  </a>
                </div>
              )}

              <button
                onClick={handleContactVendor}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-medium transition-colors"
              >
                <MessageSquare className="w-5 h-5" />
                Contact Vendor
              </button>
            </div>

            {/* Verification Status */}
            {property.verification_status && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Verification Status:</strong> {property.verification_status}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Related Properties */}
        {relatedProperties.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Properties</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProperties.map((prop: any) => (
                <Link
                  key={prop.id}
                  href={`/real-estate/${prop.slug}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-48 bg-gray-200 overflow-hidden">
                    {prop.images && prop.images.length > 0 ? (
                      <img src={prop.images[0]} alt={prop.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">{prop.title}</h3>
                    <p className="text-blue-600 font-bold mb-2">₦{formatPrice(prop.price)}</p>
                    <p className="text-sm text-gray-600">
                      {prop.bedrooms} bed • {prop.bathrooms} bath
                    </p>
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
