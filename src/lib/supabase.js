// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
  console.error('Invalid Supabase URL:', supabaseUrl);
  throw new Error('Missing or invalid NEXT_PUBLIC_SUPABASE_URL');
}

if (!supabaseAnonKey) {
  console.error('Missing Supabase Anon Key');
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Authentication helper
export const auth = {
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },
  
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  }
};

// Products helper
export const products = {
  async getActive(limit = 10) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        vendor:vendor_id (
          id,
          business_name,
          logo_url
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    return { data, error };
  }
};

// Vendors helper
export const vendors = {
  async getApproved() {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('status', 'approved')
      .order('rating', { ascending: false });
    
    return { data, error };
  }
};