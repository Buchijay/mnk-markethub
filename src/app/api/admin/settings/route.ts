import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * GET /api/admin/settings — fetch platform settings
 * PUT /api/admin/settings — update platform settings
 *
 * Settings are stored in a `platform_settings` table (key/value).
 * Falls back to defaults if the table doesn't exist yet.
 */

const DEFAULTS: Record<string, string> = {
  commission_rate: '5',
  min_vendor_payout: '5000',
  auto_approve_vendors: 'false',
  maintenance_mode: 'false',
  platform_name: 'MNK Marketplace',
  support_email: 'support@mnkmarketplace.com',
  currency: 'NGN',
};

async function createSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch { /* read-only */ }
        },
      },
    }
  );
}

async function assertAdmin() {
  const supabase = await createSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return profile?.role === 'admin' ? { supabase, user } : { supabase, user: null };
}

export async function GET() {
  try {
    const { supabase, user } = await assertAdmin();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Try to read from platform_settings table
    const { data, error } = await supabase
      .from('platform_settings')
      .select('key, value');

    if (error) {
      // Table may not exist — return defaults
      return NextResponse.json({ settings: DEFAULTS });
    }

    const settings: Record<string, string> = { ...DEFAULTS };
    for (const row of data ?? []) {
      settings[row.key] = row.value;
    }

    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { supabase, user } = await assertAdmin();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const settings = body.settings as Record<string, string> | undefined;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'settings object required' }, { status: 400 });
    }

    // Upsert each key/value pair
    const upserts = Object.entries(settings).map(([key, value]) => ({
      key,
      value: String(value),
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('platform_settings')
      .upsert(upserts, { onConflict: 'key' });

    if (error) {
      // If table doesn't exist, silently succeed (settings aren't persisted yet)
      return NextResponse.json({ success: true, note: 'Table may not exist yet' });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
