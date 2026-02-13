'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getVehicleBySlug, getRelatedVehicles } from '@/lib/services/vehicles'
import { useAuth } from '@/lib/hooks/useAuth'
import { addFavorite, removeFavorite, isFavorited } from '@/lib/services/favorites'
import toast from 'react-hot-toast'
import {
  Heart,
  Share2,
  MapPin,
  Gauge,
  Fuel,
  Cog,
  User,
  Phone,
  Mail,
  CheckCircle2,
  Zap,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Calendar,
  Award,
} from 'lucide-react'

export default function VehicleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const { user } = useAuth()

  const [vehicle, setVehicle] = useState<any>(null)
  const [relatedVehicles, setRelatedVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isFav, setIsFav] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'features'>('overview')

  useEffect(() => {
    if (slug) loadVehicle()
  }, [slug])

  useEffect(() => {
    if (user && vehicle) {
      checkIfFavorited()
    }
  }, [user, vehicle])

  async function loadVehicle() {
    setLoading(true)
    try {
      const { vehicle: data } = await getVehicleBySlug(slug)
      if (data) {
        setVehicle(data)
        if (data.make) {
          const { vehicles } = await getRelatedVehicles(data.id, data.make, 4)
          setRelatedVehicles(vehicles)
        }
      }
    } catch (error) {
      console.error('Error loading vehicle:', error)
      toast.error('Failed to load vehicle')
    } finally {
      setLoading(false)
    }
  }

  async function checkIfFavorited() {
    if (!user || !vehicle) return
    const favorited = await isFavorited(user.id, 'vehicle', vehicle.id)
    setIsFav(favorited)
  }

  const handleToggleFavorite = async () => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    if (!vehicle) return

    try {
      if (isFav) {
        await removeFavorite(user.id, 'vehicle', vehicle.id)
        setIsFav(false)
        toast.success('Removed from favorites')
      } else {
        await addFavorite(user.id, 'vehicle', vehicle.id)
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
    router.push(`/messages?vendor=${vehicle.vendor_id}`)
  }

  const handlePreviousImage = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? (vehicle.images?.length || 1) - 1 : prev - 1
    )
  }

  const handleNextImage = () => {
    setSelectedImageIndex((prev) =>
      prev === (vehicle.images?.length || 1) - 1 ? 0 : prev + 1
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

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Vehicle Not Found</h1>
          <p className="text-gray-600 mb-6">The vehicle you're looking for doesn't exist.</p>
          <Link href="/automotive" className="text-blue-600 hover:underline">
            Back to Automotive
          </Link>
        </div>
      </div>
    )
  }

  const specs = vehicle.specifications || {}
  const features = vehicle.features || []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Image Gallery */}
        <div className="mb-8">
          <div className="relative bg-gray-900 rounded-2xl overflow-hidden aspect-video mb-4">
            {vehicle.images && vehicle.images.length > 0 ? (
              <>
                <img
                  src={vehicle.images[selectedImageIndex]}
                  alt={`Vehicle ${selectedImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                {vehicle.images.length > 1 && (
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
                      {vehicle.images.map((_: any, idx: number) => (
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
          {vehicle.images && vehicle.images.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {vehicle.images.slice(0, 8).map((img: string, idx: number) => (
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
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h1>
                  {vehicle.location && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-5 h-5" />
                      <span>
                        {vehicle.location.area}, {vehicle.location.city}, {vehicle.location.state}
                      </span>
                    </div>
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

              <div className="text-3xl font-bold text-blue-600 mb-4">
                ₦{formatPrice(vehicle.price)}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {vehicle.year && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Year</p>
                      <p className="font-semibold">{vehicle.year}</p>
                    </div>
                  </div>
                )}
                {vehicle.mileage !== null && (
                  <div className="flex items-center gap-2">
                    <Gauge className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Mileage</p>
                      <p className="font-semibold">{vehicle.mileage?.toLocaleString()} km</p>
                    </div>
                  </div>
                )}
                {vehicle.transmission && (
                  <div className="flex items-center gap-2">
                    <Cog className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Transmission</p>
                      <p className="font-semibold capitalize">{vehicle.transmission}</p>
                    </div>
                  </div>
                )}
                {vehicle.fuel_type && (
                  <div className="flex items-center gap-2">
                    <Fuel className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Fuel</p>
                      <p className="font-semibold capitalize">{vehicle.fuel_type}</p>
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
                  { id: 'specs', label: 'Specifications' },
                  { id: 'features', label: 'Features' },
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
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">About This Vehicle</h3>
                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                      {vehicle.description || 'No description provided.'}
                    </p>

                    {vehicle.customs_cleared && (
                      <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                        <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-green-900">Customs Cleared</p>
                          <p className="text-sm text-green-700">This vehicle has been cleared by customs</p>
                        </div>
                      </div>
                    )}

                    {vehicle.warranty_available && (
                      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                        <Award className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-blue-900">Warranty Available</p>
                          <p className="text-sm text-blue-700">
                            {vehicle.warranty_duration || 'Warranty available'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'specs' && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Technical Specifications</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {vehicle.engine_capacity && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                          <span className="text-gray-600">Engine Capacity</span>
                          <span className="font-semibold text-gray-900">{vehicle.engine_capacity}</span>
                        </div>
                      )}
                      {vehicle.horsepower && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                          <span className="text-gray-600">Horsepower</span>
                          <span className="font-semibold text-gray-900">{vehicle.horsepower} HP</span>
                        </div>
                      )}
                      {vehicle.color && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                          <span className="text-gray-600">Color</span>
                          <span className="font-semibold text-gray-900">{vehicle.color}</span>
                        </div>
                      )}
                      {vehicle.body_type && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                          <span className="text-gray-600">Body Type</span>
                          <span className="font-semibold text-gray-900">{vehicle.body_type}</span>
                        </div>
                      )}
                      {vehicle.condition && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                          <span className="text-gray-600">Condition</span>
                          <span className="font-semibold text-gray-900 capitalize">{vehicle.condition}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'features' && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Features</h3>
                    {Array.isArray(features) && features.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3">
                        {features.map((feature: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-blue-600" />
                            <span className="text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">No features listed.</p>
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
                {vehicle.vendor?.logo_url && (
                  <img
                    src={vehicle.vendor.logo_url}
                    alt={vehicle.vendor.business_name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{vehicle.vendor?.business_name}</h3>
                  {vehicle.vendor?.verification_status === 'verified' && (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-xs">Verified</span>
                    </div>
                  )}
                </div>
              </div>

              {vehicle.vendor?.phone && (
                <div className="flex items-center gap-2 mb-4 text-gray-700">
                  <Phone className="w-5 h-5 text-gray-600" />
                  <a href={`tel:${vehicle.vendor.phone}`} className="hover:text-blue-600">
                    {vehicle.vendor.phone}
                  </a>
                </div>
              )}

              {vehicle.vendor?.email && (
                <div className="flex items-center gap-2 mb-6 text-gray-700">
                  <Mail className="w-5 h-5 text-gray-600" />
                  <a href={`mailto:${vehicle.vendor.email}`} className="hover:text-blue-600">
                    {vehicle.vendor.email}
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
            {vehicle.verification_status && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Verification Status:</strong> {vehicle.verification_status}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Related Vehicles */}
        {relatedVehicles.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Vehicles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedVehicles.map((v: any) => (
                <Link
                  key={v.id}
                  href={`/automotive/${v.slug}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-48 bg-gray-200 overflow-hidden">
                    {v.images && v.images.length > 0 ? (
                      <img src={v.images[0]} alt={`${v.year} ${v.make} ${v.model}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
                      {v.year} {v.make} {v.model}
                    </h3>
                    <p className="text-blue-600 font-bold mb-2">₦{formatPrice(v.price)}</p>
                    <p className="text-sm text-gray-600">
                      {v.mileage?.toLocaleString()} km • {v.transmission}
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
