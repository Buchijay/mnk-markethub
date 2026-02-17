// src/app/api/admin/products/route.js
// GET /api/admin/products - Returns paginated products with vendor info

import { NextResponse } from 'next/server';
import { validateAdminRequest, errorResponse, successResponse } from '@/lib/utils/admin-auth';
import { productQuerySchema, validateQuery } from '@/lib/validations/admin';
import { adminDb } from '@/lib/supabase-server';

export async function GET(request) {
  // Validate admin authentication
  const { error: authError } = await validateAdminRequest(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    
    // Validate query parameters
    const { data: params, error: validationError } = validateQuery(searchParams, productQuerySchema);
    if (validationError) {
      return errorResponse(validationError.message, 400, validationError.details);
    }

    const { page, limit, vendorId, status, category, search, featured, sort, order } = params;
    const offset = (page - 1) * limit;

    // Build query
    let query = adminDb.from('products')
      .select(`
        id,
        name,
        slug,
        description,
        price,
        compare_at_price,
        cost_price,
        sku,
        barcode,
        quantity,
        category,
        subcategory,
        images,
        status,
        is_featured,
        is_approved,
        rejection_reason,
        admin_notes,
        vendor_id,
        created_at,
        updated_at,
        vendor:vendor_id (
          id,
          business_name,
          logo_url,
          verification_status
        )
      `, { count: 'exact' });

    // Apply filters
    if (vendorId) {
      query = query.eq('vendor_id', vendorId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (featured !== undefined) {
      query = query.eq('is_featured', featured);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,sku.ilike.%${search}%`);
    }

    // Apply sorting
    query = query.order(sort, { ascending: order === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: products, error, count } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      return errorResponse('Failed to fetch products', 500);
    }

    // Calculate pagination info
    const totalPages = Math.ceil((count || 0) / limit);

    // Get category counts for filters
    const { data: categoryCounts } = await adminDb.from('products')
      .select('category')
      .not('category', 'is', null);

    const categories = {};
    categoryCounts?.forEach(p => {
      if (p.category) {
        categories[p.category] = (categories[p.category] || 0) + 1;
      }
    });

    return successResponse({
      products,
      pagination: {
        page,
        limit,
        totalPages,
        totalCount: count || 0,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      filters: {
        categories,
      },
    });
  } catch (error) {
    console.error('Products API error:', error);
    return errorResponse('Internal server error', 500);
  }
}
