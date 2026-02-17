// src/app/api/admin/vendors/route.js
// GET /api/admin/vendors - Returns paginated vendors list

import { NextResponse } from 'next/server';
import { validateAdminRequest, errorResponse, successResponse } from '@/lib/utils/admin-auth';
import { vendorQuerySchema, validateQuery } from '@/lib/validations/admin';
import { adminDb } from '@/lib/supabase-server';

export async function GET(request) {
  // Validate admin authentication
  const { error: authError } = await validateAdminRequest(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    
    // Validate query parameters
    const { data: params, error: validationError } = validateQuery(searchParams, vendorQuerySchema);
    if (validationError) {
      return errorResponse(validationError.message, 400, validationError.details);
    }

    const { page, limit, search, status, sort, order } = params;
    const offset = (page - 1) * limit;

    // Build query
    let query = adminDb.from('vendors')
      .select(`
        id,
        user_id,
        business_name,
        business_email,
        business_phone,
        business_address,
        logo_url,
        description,
        verification_status,
        verification_notes,
        verified_at,
        commission_rate,
        is_featured,
        created_at,
        updated_at,
        user:user_id (
          id,
          email
        )
      `, { count: 'exact' });

    // Apply filters
    if (status) {
      query = query.eq('verification_status', status);
    }

    if (search) {
      query = query.or(`business_name.ilike.%${search}%,business_email.ilike.%${search}%`);
    }

    // Apply sorting
    query = query.order(sort, { ascending: order === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: vendors, error, count } = await query;

    if (error) {
      console.error('Error fetching vendors:', error);
      return errorResponse('Failed to fetch vendors', 500);
    }

    // Calculate pagination info
    const totalPages = Math.ceil((count || 0) / limit);

    return successResponse({
      vendors,
      pagination: {
        page,
        limit,
        totalPages,
        totalCount: count || 0,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Vendors API error:', error);
    return errorResponse('Internal server error', 500);
  }
}
