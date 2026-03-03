import { supabase } from '@/lib/supabase/client';
import type { Review as DBReview } from '@/lib/types/database.types';

/* ---------- Types ---------- */
export type Review = DBReview & {
  profiles?: { full_name: string | null; avatar_url: string | null };
};

export interface ReviewStats {
  average: number;
  total: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

type Vertical = 'products' | 'real_estate' | 'automotive';

/* ---------- Queries ---------- */

/**
 * Fetch reviews for a given item.
 */
export async function getReviewsForItem(
  itemId: string,
  vertical: Vertical,
  page = 1,
  pageSize = 10
) {
  const from = (page - 1) * pageSize;

  const { data, error, count } = await supabase
    .from('reviews')
    .select('*, profiles(full_name, avatar_url)', { count: 'exact' })
    .eq('item_id', itemId)
    .eq('vertical', vertical)
    .order('created_at', { ascending: false })
    .range(from, from + pageSize - 1);

  if (error) throw error;
  return { reviews: (data ?? []) as unknown as Review[], total: count ?? 0 };
}

/**
 * Compute rating stats.
 */
export async function getReviewStats(
  itemId: string,
  vertical: Vertical
): Promise<ReviewStats> {
  const { data, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('item_id', itemId)
    .eq('vertical', vertical);

  if (error) throw error;

  const reviews = data ?? [];
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<1 | 2 | 3 | 4 | 5, number>;
  let sum = 0;
  for (const r of reviews) {
    const rating = r.rating as 1 | 2 | 3 | 4 | 5;
    distribution[rating] = (distribution[rating] || 0) + 1;
    sum += r.rating;
  }

  return {
    total: reviews.length,
    average: reviews.length ? sum / reviews.length : 0,
    distribution,
  };
}

/* ---------- Mutations ---------- */

/**
 * Submit a new review. Checks for duplicate (one review per user per item).
 * After insert, updates the vendor rating aggregate.
 */
export async function submitReview(review: {
  item_id: string;
  vertical: Vertical;
  vendor_id: string;
  user_id: string;
  rating: number;
  title?: string;
  comment?: string;
}) {
  // Duplicate guard
  const { data: existing } = await supabase
    .from('reviews')
    .select('id')
    .eq('item_id', review.item_id)
    .eq('vertical', review.vertical)
    .eq('user_id', review.user_id)
    .maybeSingle();

  if (existing) throw new Error('You have already reviewed this item');

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      item_id: review.item_id,
      vertical: review.vertical,
      vendor_id: review.vendor_id,
      user_id: review.user_id,
      rating: review.rating,
      title: review.title || null,
      comment: review.comment || null,
    })
    .select()
    .single();

  if (error) throw error;

  // Fire-and-forget vendor rating update
  updateVendorRating(review.vendor_id, review.vertical).catch(() => {});

  return data;
}

/**
 * Increment the helpful_count on a review.
 */
export async function markReviewHelpful(reviewId: string) {
  const { data: current } = await supabase
    .from('reviews')
    .select('helpful_count')
    .eq('id', reviewId)
    .single();

  if (current) {
    await supabase
      .from('reviews')
      .update({ helpful_count: (current.helpful_count || 0) + 1 })
      .eq('id', reviewId);
  }
}

/* ---------- Helpers ---------- */

async function updateVendorRating(vendorId: string, vertical: Vertical) {
  const table =
    vertical === 'products' ? 'products' : vertical === 'real_estate' ? 'properties' : 'vehicles';

  const vendorItems = await supabase.from(table).select('id').eq('vendor_id', vendorId);
  if (!vendorItems.data?.length) return;

  const ids = vendorItems.data.map((i) => i.id);

  const { data: allReviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('vertical', vertical)
    .in('item_id', ids);

  if (!allReviews?.length) return;

  const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

  await supabase
    .from('vendors')
    .update({ rating: Math.round(avg * 10) / 10 })
    .eq('id', vendorId);
}
