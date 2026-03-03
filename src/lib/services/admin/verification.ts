// Approve a verification item
export async function approveVerificationItem(id: string, type: 'vendor' | 'property' | 'vehicle') {
  let table = ''
  switch (type) {
    case 'vendor': table = 'vendors'; break;
    case 'property': table = 'properties'; break;
    case 'vehicle': table = 'vehicles'; break;
    default: throw new Error('Invalid type')
  }
  const { error } = await supabaseAdmin
    .from(table)
    .update({ verification_status: 'approved', rejection_reason: null, verification_notes: null })
    .eq('id', id)
  if (error) throw error
}

// Reject a verification item
export async function rejectVerificationItem(id: string, type: 'vendor' | 'property' | 'vehicle', reason: string) {
  let table = ''
  switch (type) {
    case 'vendor': table = 'vendors'; break;
    case 'property': table = 'properties'; break;
    case 'vehicle': table = 'vehicles'; break;
    default: throw new Error('Invalid type')
  }
  const update: any = { verification_status: 'rejected' }
  if (type === 'vendor') update.rejection_reason = reason
  else update.verification_notes = reason
  const { error } = await supabaseAdmin
    .from(table)
    .update(update)
    .eq('id', id)
  if (error) throw error
}
import { getAdminClient } from '@/lib/supabase-server'\nimport { logger } from '@/lib/utils/logger'\n\nconst supabaseAdmin = getAdminClient()\n\nexport type VerificationItem = {
  id: string
  type: 'vendor' | 'product' | 'property' | 'vehicle'
  title: string
  submittedBy: string
  submittedDate: string
  status: 'pending' | 'approved' | 'flagged' | 'rejected'
  reason?: string
}

export const getVerificationQueue = async (filter: string = 'all'): Promise<VerificationItem[]> => {
  try {
    const items: VerificationItem[] = []

    const statusValues = (filter === 'all' ? ['pending', 'rejected'] : [filter === 'flagged' ? 'rejected' : filter]) as ('pending' | 'verified' | 'rejected')[]

    // Fetch pending vendors
    const { data: vendors } = await supabaseAdmin
      .from('vendors')
      .select('id, business_name, email, created_at, verification_status, rejection_reason')
      .in('verification_status', statusValues)
      .order('created_at', { ascending: false })
      .limit(20)

    if (vendors) {
      for (const v of vendors) {
        items.push({
          id: v.id,
          type: 'vendor',
          title: v.business_name,
          submittedBy: v.email || 'N/A',
          submittedDate: v.created_at,
          status: v.verification_status === 'rejected' ? 'flagged' : v.verification_status as 'pending' | 'approved',
          reason: v.rejection_reason || undefined,
        })
      }
    }

    // Fetch pending properties
    const { data: properties } = await supabaseAdmin
      .from('properties')
      .select('id, title, vendor_id, created_at, verification_status, verification_notes, vendors(business_name)')
      .in('verification_status', statusValues)
      .order('created_at', { ascending: false })
      .limit(20)

    if (properties) {
      for (const p of properties as unknown as Array<{ id: string; title: string; vendor_id: string; created_at: string; verification_status: string; verification_notes: string | null; vendors: { business_name: string } | null }>) {
        items.push({
          id: p.id,
          type: 'property',
          title: p.title,
          submittedBy: p.vendors?.business_name || 'Unknown vendor',
          submittedDate: p.created_at,
          status: p.verification_status === 'rejected' ? 'flagged' : p.verification_status as 'pending' | 'approved',
          reason: p.verification_notes || undefined,
        })
      }
    }

    // Fetch pending vehicles
    const { data: vehicles } = await supabaseAdmin
      .from('vehicles')
      .select('id, title, vendor_id, created_at, verification_status, verification_notes, vendors(business_name)')
      .in('verification_status', statusValues)
      .order('created_at', { ascending: false })
      .limit(20)

    if (vehicles) {
      for (const v of vehicles as unknown as Array<{ id: string; title: string; vendor_id: string; created_at: string; verification_status: string; verification_notes: string | null; vendors: { business_name: string } | null }>) {
        items.push({
          id: v.id,
          type: 'vehicle',
          title: v.title,
          submittedBy: v.vendors?.business_name || 'Unknown vendor',
          submittedDate: v.created_at,
          status: v.verification_status === 'rejected' ? 'flagged' : v.verification_status as 'pending' | 'approved',
          reason: v.verification_notes || undefined,
        })
      }
    }

    // Sort all items by date, newest first
    items.sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime())

    return items
  } catch (error) {
    logger.error('Error fetching verification queue:', error)
    throw error
  }
}
