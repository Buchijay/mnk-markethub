// src/app/api/admin/orders/[id]/route.js
// Order detail endpoints: GET, PATCH

import { NextResponse } from 'next/server';
import { validateAdminRequest, errorResponse, successResponse } from '@/lib/utils/admin-auth';
import { idParamSchema, orderUpdateSchema, validateBody } from '@/lib/validations/admin';
import { adminDb } from '@/lib/supabase-server';

/**
 * GET /api/admin/orders/[id]
 * Returns order with items and vendor details
 */
export async function GET(request, { params }) {
  const { error: authError } = await validateAdminRequest(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    
    // Validate ID
    const idValidation = idParamSchema.safeParse({ id });
    if (!idValidation.success) {
      return errorResponse('Invalid order ID', 400);
    }

    // Fetch order with all related data
    const { data: order, error: orderError } = await adminDb.from('orders')
      .select(`
        *,
        user:user_id (
          id,
          email
        ),
        items:order_items (
          id,
          product_id,
          vendor_id,
          quantity,
          price,
          subtotal,
          product:product_id (
            id,
            name,
            slug,
            images,
            sku
          ),
          vendor:vendor_id (
            id,
            business_name,
            business_email,
            business_phone,
            logo_url
          )
        )
      `)
      .eq('id', id)
      .single();

    if (orderError) {
      if (orderError.code === 'PGRST116') {
        return errorResponse('Order not found', 404);
      }
      throw orderError;
    }

    // Fetch order timeline/history if available
    const { data: timeline } = await adminDb.from('order_history')
      .select('*')
      .eq('order_id', id)
      .order('created_at', { ascending: false });

    // Group items by vendor
    const itemsByVendor = {};
    order.items?.forEach(item => {
      const vendorId = item.vendor?.id || 'unknown';
      if (!itemsByVendor[vendorId]) {
        itemsByVendor[vendorId] = {
          vendor: item.vendor,
          items: [],
          subtotal: 0,
        };
      }
      itemsByVendor[vendorId].items.push(item);
      itemsByVendor[vendorId].subtotal += item.price * item.quantity;
    });

    return successResponse({
      order,
      timeline: timeline || [],
      itemsByVendor: Object.values(itemsByVendor),
    });
  } catch (error) {
    console.error('Order GET error:', error);
    return errorResponse('Failed to fetch order details', 500);
  }
}

/**
 * PATCH /api/admin/orders/[id]
 * Update order status, add tracking number
 */
export async function PATCH(request, { params }) {
  const { error: authError, profile } = await validateAdminRequest(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    
    // Validate ID
    const idValidation = idParamSchema.safeParse({ id });
    if (!idValidation.success) {
      return errorResponse('Invalid order ID', 400);
    }

    // Parse and validate body
    const body = await request.json();
    const { data: updateData, error: validationError } = validateBody(body, orderUpdateSchema);
    
    if (validationError) {
      return errorResponse(validationError.message, 400, validationError.details);
    }

    // Check if order exists
    const { data: existingOrder, error: fetchError } = await adminDb.from('orders')
      .select('id, status')
      .eq('id', id)
      .single();

    if (fetchError || !existingOrder) {
      return errorResponse('Order not found', 404);
    }

    // Prepare update data
    const updates = {
      ...updateData,
      updated_at: new Date().toISOString(),
    };

    // Set timestamp based on status change
    if (updateData.status) {
      switch (updateData.status) {
        case 'shipped':
          updates.shipped_at = new Date().toISOString();
          break;
        case 'delivered':
          updates.delivered_at = new Date().toISOString();
          break;
        case 'refunded':
          updates.refunded_at = new Date().toISOString();
          if (!updateData.refund_reason) {
            return errorResponse('Refund reason is required when refunding an order', 400);
          }
          break;
        case 'cancelled':
          updates.cancelled_at = new Date().toISOString();
          break;
      }
    }

    // Update order
    const { data: order, error: updateError } = await adminDb.from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Add to order history
    if (updateData.status && updateData.status !== existingOrder.status) {
      await adminDb.from('order_history').insert({
        order_id: id,
        previous_status: existingOrder.status,
        new_status: updateData.status,
        changed_by: profile?.id,
        notes: updateData.admin_notes || `Status changed to ${updateData.status}`,
        created_at: new Date().toISOString(),
      });
    }

    return successResponse({
      message: 'Order updated successfully',
      order,
    });
  } catch (error) {
    console.error('Order PATCH error:', error);
    return errorResponse('Failed to update order', 500);
  }
}
