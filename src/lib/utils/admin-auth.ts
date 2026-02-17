// src/lib/utils/admin-auth.js
// Admin authentication middleware helper for API routes

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * Validates that the request is from an authenticated admin user
 * @param {Request} request - The incoming request
 * @returns {Promise<{user: object, profile: object, error: NextResponse|null}>}
 */
export async function validateAdminRequest(request) {
  try {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignore errors in read-only contexts
            }
          },
        },
      }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        user: null,
        profile: null,
        error: NextResponse.json(
          { error: 'Unauthorized', message: 'Authentication required' },
          { status: 401 }
        ),
      };
    }

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return {
        user,
        profile: null,
        error: NextResponse.json(
          { error: 'Forbidden', message: 'User profile not found' },
          { status: 403 }
        ),
      };
    }

    // Check if user is admin
    if (profile.role !== 'admin') {
      return {
        user,
        profile,
        error: NextResponse.json(
          { error: 'Forbidden', message: 'Admin access required' },
          { status: 403 }
        ),
      };
    }

    return { user, profile, error: null };
  } catch (error) {
    console.error('Admin auth validation error:', error);
    return {
      user: null,
      profile: null,
      error: NextResponse.json(
        { error: 'Internal Server Error', message: 'Authentication check failed' },
        { status: 500 }
      ),
    };
  }
}

/**
 * Wrapper to create an admin-only API handler
 * @param {Function} handler - The API handler function
 * @returns {Function} - Wrapped handler with admin authentication
 */
export function withAdminAuth(handler) {
  return async (request, context) => {
    const { user, profile, error } = await validateAdminRequest(request);
    
    if (error) {
      return error;
    }

    // Add user and profile to request for use in handler
    request.admin = { user, profile };
    
    return handler(request, context);
  };
}

/**
 * Standard error response helper
 */
export function errorResponse(message, status = 500, details = null) {
  const response = {
    error: status >= 500 ? 'Internal Server Error' : 'Bad Request',
    message,
  };
  
  if (details) {
    response.details = details;
  }
  
  return NextResponse.json(response, { status });
}

/**
 * Standard success response helper
 */
export function successResponse(data, status = 200) {
  return NextResponse.json(data, { status });
}

/**
 * Parse pagination params from URL
 */
export function getPaginationParams(searchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
  
  return { page, limit };
}
