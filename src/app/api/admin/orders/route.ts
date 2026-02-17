// src/app/api/admin/orders/route.js
// GET /api/admin/orders - Returns paginated orders with filters

import { NextResponse } from 'next/server';
import { validateAdminRequest, errorResponse, successResponse } from '@/lib/utils/admin-auth';
import { orderQuerySchema, validateQuery } from '@/lib/validations/admin';
import { adminDb } from '@/lib/supabase-server';

export async function GET(request) {
  // Validate admin authentication
  const { error: authError } = await validateAdminRequest(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    
    // Validate query parameters
    const { data: params, error: validationError } = validateQuery(searchParams, orderQuerySchema);
    if (validationError) {
      return errorResponse(validationError.message, 400, validationError.details);
    }

    const { 
      page, limit, status, vendorId, userId, 
      startDate, endDate, minAmount, maxAmount, sort, order 
    } = params;
    const offset = (page - 1) * limit;

    // Build query
    let query = adminDb.from('orders')
      .select(`
        id,
        order_number,
        user_id,
        status,
        subtotal,
        tax_amount,
        shipping_amount,
        discount_amount,
        total_amount,
        payment_status,
        payment_method,
        shipping_address,
        billing_address,
        tracking_number,
        tracking_url,
        shipping_carrier,
        notes,
        admin_notes,
        created_at,
        updated_at,
        shipped_at,
        delivered_at,
        user:user_id (
          id,
          email
        ),
        items:order_items (
          id,
          product_id,
          quantity,
          price,
          product:product_id (
            name,
            images
          ),
          vendor:vendor_id (
            id,
            business_name
          )
        )
      `, { count: 'exact' });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    if (minAmount) {
      query = query.gte('total_amount', minAmount);
    }

    if (maxAmount) {
      query = query.lte('total_amount', maxAmount);
    }

    // Apply sorting
    query = query.order(sort, { ascending: order === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: orders, error, count } = await query;

    if (error) {
      console.error('Error fetching orders:', error);
      return errorResponse('Failed to fetch orders', 500);
    }

    // If vendorId filter was provided, we need to filter by vendor in order_items
    let filteredOrders = orders;
    if (vendorId) {
      filteredOrders = orders?.filter(order => 
        order.items?.some(item => item.vendor?.id === vendorId)
      );
    }

    // Calculate pagination info
    const totalCount = vendorId ? filteredOrders?.length : (count || 0);
    const totalPages = Math.ceil(totalCount / limit);

    // Get status counts for filters
    const { data: statusCounts } = await adminDb.from('orders')
      .select('status');

    const statuses = {};
    statusCounts?.forEach(o => {
      if (o.status) {
        statuses[o.status] = (statuses[o.status] || 0) + 1;
      }
    });

    return successResponse({
      orders: filteredOrders,
      pagination: {
        page,
        limit,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      filters: {
        statuses,
      },
    });
  } catch (error) {
    console.error('Orders API error:', error);
    return errorResponse('Internal server error', 500);
  }
}
