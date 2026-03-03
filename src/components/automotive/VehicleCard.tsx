import Image from 'next/image'
import Link from 'next/link'
import { Car, Calendar, Gauge, Fuel, Settings2 } from 'lucide-react'

export default function VehicleCard({ vehicle }: any) {
  const mainImage = vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : null

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(price)

  const conditionLabel = (c: string) => {
    switch (c) {
      case 'new': return 'New'
      case 'foreign_used': return 'Foreign Used'
      case 'nigerian_used': return 'Nigerian Used'
      case 'accident_free': return 'Accident Free'
      default: return c
    }
  }

  return (
    <Link href={`/automotive/${vehicle.slug}`} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative w-full h-48 bg-gray-200">
        {mainImage ? (
          <Image
            src={mainImage}
            alt={vehicle.title || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Car size={48} />
          </div>
        )}
        {vehicle.condition && (
          <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
            {conditionLabel(vehicle.condition)}
          </div>
        )}
        {vehicle.is_featured && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold">
            Featured
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">
          {vehicle.title || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
        </h3>

        <p className="text-sm text-gray-700 font-medium mb-3">
          {vehicle.make} {vehicle.model}
        </p>

        <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
          <div className="flex items-center gap-1 text-gray-800">
            <Calendar size={14} className="text-gray-600" />
            <span className="font-medium">{vehicle.year}</span>
          </div>
          {vehicle.mileage != null && (
            <div className="flex items-center gap-1 text-gray-800">
              <Gauge size={14} className="text-gray-600" />
              <span className="font-medium">{vehicle.mileage.toLocaleString()} km</span>
            </div>
          )}
          {vehicle.transmission && (
            <div className="flex items-center gap-1 text-gray-800">
              <Settings2 size={14} className="text-gray-600" />
              <span className="font-medium capitalize">{vehicle.transmission}</span>
            </div>
          )}
          {vehicle.fuel_type && (
            <div className="flex items-center gap-1 text-gray-800">
              <Fuel size={14} className="text-gray-600" />
              <span className="font-medium capitalize">{vehicle.fuel_type}</span>
            </div>
          )}
        </div>

        {vehicle.location && (
          <p className="text-sm text-gray-700 mb-3">
            📍 {vehicle.location.city}, {vehicle.location.state}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-red-600">{formatPrice(vehicle.price)}</div>
          {vehicle.is_negotiable && (
            <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded">Negotiable</span>
          )}
        </div>
      </div>
    </Link>
  )
}
