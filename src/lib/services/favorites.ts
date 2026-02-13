import { supabase } from '@/lib/supabase/client'
import type { Favorite } from '@/lib/types/database.types'

export async function getFavorites(userId: string) {
  const { data, error } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []) as Favorite[]
}

export async function getFavoritesByType(userId: string, itemType: 'product' | 'property' | 'vehicle') {
  const { data, error } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', userId)
    .eq('item_type', itemType)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []) as Favorite[]
}

export async function addFavorite(userId: string, itemType: 'product' | 'property' | 'vehicle', itemId: string) {
  // Check if already favorited
  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('item_type', itemType)
    .eq('item_id', itemId)
    .single()

  if (existing) {
    return existing
  }

  const { data, error } = await supabase
    .from('favorites')
    .insert({
      user_id: userId,
      item_type: itemType,
      item_id: itemId,
    } as any)
    .select('*')
    .single()

  if (error) throw error
  return data as Favorite
}

export async function removeFavorite(userId: string, itemType: 'product' | 'property' | 'vehicle', itemId: string) {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('item_type', itemType)
    .eq('item_id', itemId)

  if (error) throw error
}

export async function isFavorited(userId: string, itemType: 'product' | 'property' | 'vehicle', itemId: string) {
  const { data } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('item_type', itemType)
    .eq('item_id', itemId)
    .single()

  return !!data
}
