'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import { getFavorites, removeFavorite } from '@/lib/services/favorites'
import { Heart, ShoppingBag, Home, Car, ArrowRight, Trash2, Package } from 'lucide-react'
import type { Favorite, Product, Property, Vehicle } from '@/lib/types/database.types'

interface FavoriteWithItem extends Favorite {
  item?: Product | Property | Vehicle | null
}

export default function FavoritesPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [favorites, setFavorites] = useState<FavoriteWithItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'product' | 'property' | 'vehicle'>('all')
  const [removing, setRemoving] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      loadFavorites()
    }
  }, [user])

  async function loadFavorites() {
    if (!user) return

    setLoading(true)
    try {
      const faves = await getFavorites(user.id)

      // Fetch item details for each favorite
      const favoritesWithItems = await Promise.all(
        faves.map(async (fav) => {
          try {
            let item = null
            if (fav.item_type === 'product') {
              const { data } = await supabase
                .from('products')
                .select('*')
                .eq('id', fav.item_id)
                .single()
              item = data
            } else if (fav.item_type === 'property') {
              const { data } = await supabase
                .from('properties')
                .select('*')
                .eq('id', fav.item_id)
                .single()
              item = data
            } else if (fav.item_type === 'vehicle') {
              const { data } = await supabase
                .from('vehicles')
                .select('*')
                .eq('id', fav.item_id)
                .single()
              item = data
            }
            return { ...fav, item }
          } catch {
            return { ...fav, item: null }
          }
        })
      )

      setFavorites(favoritesWithItems)
    } catch (error) {
      console.error('Error loading favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFavorite = async (favorite: FavoriteWithItem) => {
    if (!user) return

    setRemoving(favorite.id)
    try {
      await removeFavorite(user.id, favorite.item_type, favorite.item_id)
      setFavorites(favorites.filter(f => f.id !== favorite.id))
    } catch (error) {
      console.error('Error removing favorite:', error)
    } finally {
      setRemoving(null)
    }
  }

  const filteredFavorites = filter === 'all' 
    ? favorites 
    : favorites.filter(f => f.item_type === filter)

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">Loading...</div>
          <p className="text-gray-600">Loading your favorites...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Favorites</h1>
          <p className="text-gray-600">
            {filteredFavorites.length} item{filteredFavorites.length !== 1 ? 's' : ''} saved
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-3 mb-8">
          {[
            { key: 'all', label: 'All Items', icon: Heart },
            { key: 'product', label: 'Products', icon: ShoppingBag },
            { key: 'property', label: 'Properties', icon: Home },
            { key: 'vehicle', label: 'Vehicles', icon: Car },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Favorites List */}
        {filteredFavorites.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Favorites Yet</h2>
            <p className="text-gray-600 mb-6">
              {filter === 'all'
                ? 'Start adding items to your favorites to save them for later!'
                : `No ${filter}s saved yet. Start adding items!`}
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Browse Items
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFavorites.map((favorite) => {
              const item = favorite.item
              if (!item) return null

              const isProduct = favorite.item_type === 'product'
              const isProperty = favorite.item_type === 'property'
              const isVehicle = favorite.item_type === 'vehicle'

              const name = isProduct
                ? (item as Product).name
                : isProperty
                ? (item as Property).title
                : (item as Vehicle).title

              const image = isProduct
                ? (item as Product).images?.[0]
                : isProperty
                ? (item as Property).images?.[0]
                : (item as Vehicle).images?.[0]

              const price = isProduct
                ? (item as Product).price
                : isProperty
                ? (item as Property).price
                : (item as Vehicle).price

              const slug = isProduct
                ? (item as Product).slug
                : isProperty
                ? (item as Property).slug
                : (item as Vehicle).slug

              const href = isProduct
                ? `/products/${slug}`
                : isProperty
                ? `/real-estate/${slug}`
                : `/automotive/${slug}`

              return (
                <div
                  key={favorite.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
                >
                  {/* Image */}
                  {image && (
                    <div className="relative h-48 bg-gray-200 overflow-hidden">
                      <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                      <div className="absolute top-3 right-3 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                        {favorite.item_type}
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 p-4 flex flex-col">
                    <Link href={href}>
                      <h3 className="font-semibold text-gray-900 hover:text-blue-600 line-clamp-2 mb-2">
                        {name}
                      </h3>
                    </Link>

                    <div className="mb-4">
                      <p className="text-2xl font-bold text-gray-900">
                        ₦{price?.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex gap-2 mt-auto">
                      <Link
                        href={href}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-medium transition-colors"
                      >
                        <ArrowRight className="w-4 h-4" />
                        View
                      </Link>
                      <button
                        onClick={() => handleRemoveFavorite(favorite)}
                        disabled={removing === favorite.id}
                        className="bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
                        title="Remove from favorites"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
