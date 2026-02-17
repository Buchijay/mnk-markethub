// src/app/api/admin/stats/route.js
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { verifyAdmin } from '@/lib/supabase-server';
import { adminStats } from '@/lib/services/admin.service';

// GET /api/admin/stats - Get dashboard statistics
export async function GET(request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { isAdmin } = await verifyAdmin(user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'overview';

    let result;

    switch (type) {
      case 'overview':
        result = await adminStats.getOverview();
        break;

      case 'activity':
        const limit = parseInt(searchParams.get('limit') || '20');
        result = await adminStats.getRecentActivity(limit);
        break;

      case 'sales':
        result = await adminStats.getSalesChartData();
        break;

      default:
        return NextResponse.json({ error: 'Invalid stats type' }, { status: 400 });
    }

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ data: result.data });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}