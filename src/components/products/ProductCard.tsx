// components/products/ProductCard.tsx
'use client'

import Image from 'next/image'
import { Star, ShoppingCart } from 'lucide-react'
import type { ProductWithVendor } from '@/lib/types/database.types'

interface ProductCardProps {
  product: ProductWithVendor
  view: 'grid' | 'list'
}

export default function ProductCard({ product, view }: ProductCardProps) {
  const mainImage = product.images && product.images.length > 0 ? product.images[0] : null
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price

  if (view === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 flex gap-4">
        <div className="w-32 h-32 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden relative">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No image
            </div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-2">{product.name}</h3>
          <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.short_description || product.description}</p>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">\</div>
              {hasDiscount && (
                <div className="text-sm text-gray-500 line-through">\</div>
              )}
            </div>
            <button className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700">
              <ShoppingCart size={20} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative w-full h-48 bg-gray-200">
        {mainImage ? (
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No image
          </div>
        )}
        {hasDiscount && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
            Sale
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 line-clamp-2">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.short_description || product.description}</p>

        {product.vendor && (
          <div className="text-sm text-gray-500 mb-3">
            By {product.vendor.business_name}
          </div>
        )}

        <div className="flex items-center mb-3">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                className={i < Math.floor(product.vendor?.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 ml-2">({product.vendor?.total_reviews || 0})</span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-2xl font-bold text-blue-600">\</div>
            {hasDiscount && (
              <div className="text-sm text-gray-500 line-through">\</div>
            )}
          </div>
        </div>

        <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
          <ShoppingCart size={18} />
          Add to Cart
        </button>
      </div>
    </div>
  )
}
