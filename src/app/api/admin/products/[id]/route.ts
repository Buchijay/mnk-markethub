// src/app/api/admin/products/[id]/route.ts
// Product detail endpoints: GET, PATCH, DELETE

import { NextRequest, NextResponse } from 'next/server';
import { validateAdminRequest, errorResponse, successResponse } from '@/lib/utils/admin-auth';
import { idParamSchema, productUpdateSchema, validateBody } from '@/lib/validations/admin';
import { adminDb } from '@/lib/supabase-server';
import { logger } from '@/lib/utils/logger';

/**
 * GET /api/admin/products/[id]
 * Returns product with vendor details
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { error: authError } = await validateAdminRequest(request);
  if (authError) return authError;

  try {
    const { id } = params;
    // Validate ID
    const idValidation = idParamSchema.safeParse({ id });
    if (!idValidation.success) {
      return errorResponse('Invalid product ID', 400);
    }

    // Fetch product with vendor details
    const { data: product, error: productError } = await adminDb.from('products')
      .select(`
        *,
        vendor:vendor_id (
          id,
          business_name,
          business_email,
          business_phone,
          logo_url,
          verification_status,
          commission_rate
        )
      `)
      .eq('id', id)
      .single();

    if (productError) {
      if (productError.code === 'PGRST116') {
        return errorResponse('Product not found', 404);
      }
      throw productError;
    }

    // Fetch product statistics
    const { data: orderItems } = await adminDb.from('order_items')
      .select(`
        quantity,
        price,
        order:order_id (
          status,
          created_at
        )
      `)
      .eq('product_id', id);

    // Calculate stats
    const totalSales = orderItems?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
    const totalRevenue = orderItems?.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) || 0;

    const stats = {
      totalSales,
      totalRevenue,
      totalOrders: orderItems?.length || 0,
    };

    return successResponse({
      product,
      stats,
    });
  } catch (error) {
    logger.error({ err: error }, 'Product GET error');
    return errorResponse('Failed to fetch product details', 500);
  }
}

/**
 * PATCH /api/admin/products/[id]
 * Update product (status, approval, featured)
 */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { error: authError } = await validateAdminRequest(request);
  if (authError) return authError;

  try {
    const { id } = params;
    // Validate ID
    const idValidation = idParamSchema.safeParse({ id });
    if (!idValidation.success) {
      return errorResponse('Invalid product ID', 400);
    }

    // Parse and validate body
    const body = await request.json();
    const { data: updateData, error: validationError } = validateBody(body, productUpdateSchema);
    if (validationError) {
      return errorResponse(validationError.message, 400, validationError.details);
    }

    // Check if product exists
    const { data: existingProduct, error: fetchError } = await adminDb.from('products')
      .select('id, status')
      .eq('id', id)
      .single();

    if (fetchError || !existingProduct) {
      return errorResponse('Product not found', 404);
    }

    // Prepare update data
    const updates: any = {
      ...updateData,
      updated_at: new Date().toISOString(),
    };

    // If product is being approved, set status to active
    if (updateData.is_approved === true && existingProduct.status === 'pending') {
      updates.status = 'active';
      updates.approved_at = new Date().toISOString();
    }

    // If product is being rejected, require rejection reason
    if (updateData.status === 'rejected' && !updateData.rejection_reason) {
      return errorResponse('Rejection reason is required when rejecting a product', 400);
    }

    // Update product
    const { data: product, error: updateError } = await adminDb.from('products')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        vendor:vendor_id (
          id,
          business_name
        )
      `)
      .single();

    if (updateError) {
      throw updateError;
    }

    return successResponse({
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    logger.error({ err: error }, 'Product PATCH error');
    return errorResponse('Failed to update product', 500);
  }
}

/**
 * DELETE /api/admin/products/[id]
 * Soft delete product
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { error: authError } = await validateAdminRequest(request);
  if (authError) return authError;

  try {
    const { id } = params;
    // Validate ID
    const idValidation = idParamSchema.safeParse({ id });
    if (!idValidation.success) {
      return errorResponse('Invalid product ID', 400);
    }

    // Check if product exists
    const { data: existingProduct, error: fetchError } = await adminDb.from('products')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !existingProduct) {
      return errorResponse('Product not found', 404);
    }

    // Soft delete: set deleted_at
    const { data: product, error: updateError } = await adminDb.from('products')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .select('id, deleted_at')
      .single();

    if (updateError) {
      throw updateError;
    }

    return successResponse({
      message: 'Product deleted successfully',
      product,
    });
  } catch (error) {
    logger.error({ err: error }, 'Product DELETE error');
    return errorResponse('Failed to delete product', 500);
  }
}
