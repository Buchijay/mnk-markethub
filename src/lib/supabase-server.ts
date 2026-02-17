// src/lib/supabase-server.js
// Server-side Supabase client with SERVICE ROLE key
// Use this for admin operations that bypass Row Level Security (RLS)
// WARNING: Never expose this client to the browser

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create admin client with service role key (may be null if key is missing)
// This client bypasses RLS policies - use with caution
export const supabaseAdmin = supabaseUrl && supabaseServiceRoleKey 
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// Helper function to validate that we're on the server and have admin client
function ensureServer() {
  if (typeof window !== 'undefined') {
    throw new Error('supabase-server.js should only be used on the server');
  }
  if (!supabaseAdmin) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY - required for admin operations. Add it to your .env.local file.');
  }
}

// Admin auth operations
export const adminAuth = {
  // Get user by ID (bypasses RLS)
  async getUserById(userId) {
    ensureServer();
    const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);
    return { data, error };
  },

  // List all users with pagination
  async listUsers(page = 1, perPage = 50) {
    ensureServer();
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage,
    });
    return { data, error };
  },

  // Update user metadata
  async updateUserMetadata(userId, metadata) {
    ensureServer();
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: metadata,
    });
    return { data, error };
  },

  // Delete user
  async deleteUser(userId) {
    ensureServer();
    const { data, error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    return { data, error };
  },

  // Ban/unban user
  async setBanStatus(userId, banned) {
    ensureServer();
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      ban_duration: banned ? 'none' : '0',
    });
    return { data, error };
  },
};

// Admin database operations (bypasses RLS)
export const adminDb = {
  // Generic query builder - use for any table
  from(table) {
    ensureServer();
    return supabaseAdmin.from(table);
  },

  // Execute raw SQL (use sparingly)
  async rpc(functionName, params = {}) {
    ensureServer();
    const { data, error } = await supabaseAdmin.rpc(functionName, params);
    return { data, error };
  },
};

// Storage admin operations
export const adminStorage = {
  // List all buckets
  async listBuckets() {
    ensureServer();
    const { data, error } = await supabaseAdmin.storage.listBuckets();
    return { data, error };
  },

  // Get bucket
  getBucket(bucketName) {
    ensureServer();
    return supabaseAdmin.storage.from(bucketName);
  },

  // Delete file from any bucket
  async deleteFile(bucketName, filePath) {
    ensureServer();
    const { data, error } = await supabaseAdmin.storage
      .from(bucketName)
      .remove([filePath]);
    return { data, error };
  },
};

// Helper function to create a server client (returns the admin client)
export function createServerClient() {
  ensureServer();
  return supabaseAdmin;
}

// Verify if a user is an admin
export async function verifyAdmin(userId: string) {
  ensureServer();
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return { isAdmin: false, error };
    }

    return { isAdmin: data.role === 'admin', error: null };
  } catch (error) {
    return { isAdmin: false, error };
  }
}

// Log admin actions for audit trail
export async function logAdminAction(
  adminId: string,
  action: string,
  entityType: string,
  entityId: string,
  details?: Record<string, unknown>
) {
  ensureServer();
  try {
    const { data, error } = await supabaseAdmin
      .from('admin_logs')
      .insert({
        admin_id: adminId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        details,
        created_at: new Date().toISOString(),
      });

    return { data, error };
  } catch (error) {
    console.error('Failed to log admin action:', error);
    return { data: null, error };
  }
}

export default supabaseAdmin;
