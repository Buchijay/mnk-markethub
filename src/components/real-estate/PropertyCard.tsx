import Image from 'next/image'
import Link from 'next/link'
import { Home, MapPin, Bed, Bath, Maximize } from 'lucide-react'

export default function PropertyCard({ property }: any) {
  const mainImage = property.images && property.images.length > 0 ? property.images[0] : null

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(price)

  const listingLabel = (type: string) => {
    switch (type) {
      case 'rent': return 'For Rent'
      case 'sale': return 'For Sale'
      case 'short_let': return 'Short Let'
      default: return type
    }
  }

  return (
    <Link href={`/real-estate/${property.slug}`} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative w-full h-48 bg-gray-200">
        {mainImage ? (
          <Image
            src={mainImage}
            alt={property.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Home size={48} />
          </div>
        )}
        {property.listing_type && (
          <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">
            {listingLabel(property.listing_type)}
          </div>
        )}
        {property.is_featured && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold">
            Featured
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-2">{property.title}</h3>

        {property.location && (
          <p className="text-sm text-gray-700 font-medium mb-3 flex items-center gap-1">
            <MapPin size={14} className="text-gray-600" />
            {property.location.area && `${property.location.area}, `}{property.location.city}, {property.location.state}
          </p>
        )}

        <div className="flex items-center gap-4 mb-3 text-sm">
          {property.bedrooms != null && (
            <div className="flex items-center gap-1 text-gray-800">
              <Bed size={14} className="text-gray-600" />
              <span className="font-medium">{property.bedrooms} Bed{property.bedrooms !== 1 ? 's' : ''}</span>
            </div>
          )}
          {property.bathrooms != null && (
            <div className="flex items-center gap-1 text-gray-800">
              <Bath size={14} className="text-gray-600" />
              <span className="font-medium">{property.bathrooms} Bath{property.bathrooms !== 1 ? 's' : ''}</span>
            </div>
          )}
          {property.size_sqm != null && (
            <div className="flex items-center gap-1 text-gray-800">
              <Maximize size={14} className="text-gray-600" />
              <span className="font-medium">{property.size_sqm} sqm</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-green-600">{formatPrice(property.price)}</div>
            {property.price_frequency && property.listing_type === 'rent' && (
              <span className="text-sm font-medium text-gray-700">/{property.price_frequency}</span>
            )}
          </div>
          {property.is_negotiable && (
            <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded">Negotiable</span>
          )}
        </div>
      </div>
    </Link>
  )
}
