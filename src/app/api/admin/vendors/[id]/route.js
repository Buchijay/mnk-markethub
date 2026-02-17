// src/app/api/admin/vendors/[id]/route.js
// Vendor detail endpoints: GET, PATCH, DELETE

import { NextResponse } from 'next/server';
import { validateAdminRequest, errorResponse, successResponse } from '@/lib/utils/admin-auth';
import { idParamSchema, vendorUpdateSchema, validateBody } from '@/lib/validations/admin';
import { adminDb } from '@/lib/supabase-server';

/**
 * GET /api/admin/vendors/[id]
 * Returns vendor with products and stats
 */
export async function GET(request, { params }) {
  const { error: authError } = await validateAdminRequest(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    
    // Validate ID
    const idValidation = idParamSchema.safeParse({ id });
    if (!idValidation.success) {
      return errorResponse('Invalid vendor ID', 400);
    }

    // Fetch vendor with related data
    const { data: vendor, error: vendorError } = await adminDb.from('vendors')
      .select(`
        *,
        user:user_id (
          id,
          email,
          created_at
        )
      `)
      .eq('id', id)
      .single();

    if (vendorError) {
      if (vendorError.code === 'PGRST116') {
        return errorResponse('Vendor not found', 404);
      }
      throw vendorError;
    }

    // Fetch vendor's products
    const { data: products, error: productsError } = await adminDb.from('products')
      .select('id, name, price, status, is_featured, created_at')
      .eq('vendor_id', id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Fetch vendor statistics
    const [
      { count: totalProducts },
      { count: activeProducts },
      { data: orderStats },
    ] = await Promise.all([
      adminDb.from('products')
        .select('*', { count: 'exact', head: true })
        .eq('vendor_id', id),
      adminDb.from('products')
        .select('*', { count: 'exact', head: true })
        .eq('vendor_id', id)
        .eq('status', 'active'),
      adminDb.from('order_items')
        .select(`
          quantity,
          price,
          order:order_id (
            status,
            created_at
          )
        `)
        .eq('vendor_id', id),
    ]);

    // Calculate stats
    const completedOrders = orderStats?.filter(item => 
      item.order?.status === 'delivered' || item.order?.status === 'completed'
    ) || [];
    
    const totalRevenue = completedOrders.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );

    const stats = {
      totalProducts: totalProducts || 0,
      activeProducts: activeProducts || 0,
      totalOrders: orderStats?.length || 0,
      completedOrders: completedOrders.length,
      totalRevenue,
    };

    return successResponse({
      vendor,
      products: products || [],
      stats,
    });
  } catch (error) {
    console.error('Vendor GET error:', error);
    return errorResponse('Failed to fetch vendor details', 500);
  }
}

/**
 * PATCH /api/admin/vendors/[id]
 * Update vendor (status, commission, notes)
 */
export async function PATCH(request, { params }) {
  const { error: authError, profile } = await validateAdminRequest(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    
    // Validate ID
    const idValidation = idParamSchema.safeParse({ id });
    if (!idValidation.success) {
      return errorResponse('Invalid vendor ID', 400);
    }

    // Parse and validate body
    const body = await request.json();
    const { data: updateData, error: validationError } = validateBody(body, vendorUpdateSchema);
    
    if (validationError) {
      return errorResponse(validationError.message, 400, validationError.details);
    }

    // Check if vendor exists
    const { data: existingVendor, error: fetchError } = await adminDb.from('vendors')
      .select('id, verification_status')
      .eq('id', id)
      .single();

    if (fetchError || !existingVendor) {
      return errorResponse('Vendor not found', 404);
    }

    // Prepare update data
    const updates = {
      ...updateData,
      updated_at: new Date().toISOString(),
    };

    // If status is being changed to verified, set verified_at
    if (updateData.verification_status === 'verified' && existingVendor.verification_status !== 'verified') {
      updates.verified_at = new Date().toISOString();
    }

    // Update vendor
    const { data: vendor, error: updateError } = await adminDb.from('vendors')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return successResponse({
      message: 'Vendor updated successfully',
      vendor,
    });
  } catch (error) {
    console.error('Vendor PATCH error:', error);
    return errorResponse('Failed to update vendor', 500);
  }
}

/**
 * DELETE /api/admin/vendors/[id]
 * Soft delete vendor
 */
export async function DELETE(request, { params }) {
  const { error: authError } = await validateAdminRequest(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    
    // Validate ID
    const idValidation = idParamSchema.safeParse({ id });
    if (!idValidation.success) {
      return errorResponse('Invalid vendor ID', 400);
    }

    // Check if vendor exists
    const { data: existingVendor, error: fetchError } = await adminDb.from('vendors')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !existingVendor) {
      return errorResponse('Vendor not found', 404);
    }

    // Soft delete - update status and set deleted_at
    const { error: deleteError } = await adminDb.from('vendors')
      .update({
        verification_status: 'suspended',
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (deleteError) {
      throw deleteError;
    }

    // Also deactivate all vendor's products
    await adminDb.from('products')
      .update({ 
        status: 'archived',
        updated_at: new Date().toISOString(),
      })
      .eq('vendor_id', id);

    return successResponse({
      message: 'Vendor deleted successfully',
    });
  } catch (error) {
    console.error('Vendor DELETE error:', error);
    return errorResponse('Failed to delete vendor', 500);
  }
}
