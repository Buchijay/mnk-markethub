// src/lib/validations/admin.js
// Zod validation schemas for admin API endpoints

import { z } from 'zod';

// Common schemas
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

// Vendor schemas
export const vendorQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  status: z.enum(['pending', 'verified', 'suspended', 'rejected']).optional(),
  sort: z.enum(['created_at', 'business_name', 'verification_status', 'updated_at']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export const vendorUpdateSchema = z.object({
  verification_status: z.enum(['pending', 'verified', 'suspended', 'rejected']).optional(),
  commission_rate: z.number().min(0).max(100).optional(),
  notes: z.string().max(1000).optional(),
  verification_notes: z.string().max(1000).optional(),
  is_featured: z.boolean().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

// Product schemas
export const productQuerySchema = paginationSchema.extend({
  vendorId: z.string().uuid().optional(),
  status: z.enum(['draft', 'pending', 'active', 'rejected', 'archived']).optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  featured: z.coerce.boolean().optional(),
  sort: z.enum(['created_at', 'name', 'price', 'updated_at']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export const productUpdateSchema = z.object({
  status: z.enum(['draft', 'pending', 'active', 'rejected', 'archived']).optional(),
  is_featured: z.boolean().optional(),
  is_approved: z.boolean().optional(),
  rejection_reason: z.string().max(500).optional(),
  admin_notes: z.string().max(1000).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

// Order schemas
export const orderQuerySchema = paginationSchema.extend({
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']).optional(),
  vendorId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  minAmount: z.coerce.number().min(0).optional(),
  maxAmount: z.coerce.number().min(0).optional(),
  sort: z.enum(['created_at', 'total_amount', 'status', 'updated_at']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export const orderUpdateSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']).optional(),
  tracking_number: z.string().max(100).optional(),
  tracking_url: z.string().url().optional(),
  shipping_carrier: z.string().max(50).optional(),
  admin_notes: z.string().max(1000).optional(),
  refund_amount: z.number().min(0).optional(),
  refund_reason: z.string().max(500).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

// Stats query schema
export const statsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  period: z.enum(['day', 'week', 'month', 'year']).default('month'),
});

/**
 * Validate request body against schema
 * @param {object} body - Request body to validate
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @returns {{ data: object|null, error: object|null }}
 */
export function validateBody(body, schema) {
  const result = schema.safeParse(body);
  
  if (!result.success) {
    return {
      data: null,
      error: {
        message: 'Validation failed',
        details: result.error.flatten().fieldErrors,
      },
    };
  }
  
  return { data: result.data, error: null };
}

/**
 * Validate query params against schema
 * @param {URLSearchParams} searchParams - URL search params
 * @param {z.ZodSchema} schema - Zod schema to validate against  
 * @returns {{ data: object|null, error: object|null }}
 */
export function validateQuery(searchParams, schema) {
  const params = Object.fromEntries(searchParams.entries());
  const result = schema.safeParse(params);
  
  if (!result.success) {
    return {
      data: null,
      error: {
        message: 'Invalid query parameters',
        details: result.error.flatten().fieldErrors,
      },
    };
  }
  
  return { data: result.data, error: null };
}
