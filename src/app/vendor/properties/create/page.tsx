'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import toast from 'react-hot-toast'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { NIGERIAN_STATES } from '@/lib/utils/constants'
import ImageUpload from '@/components/ImageUpload'

export default function CreatePropertyPage() {
  const router = useRouter()
  const { profile, loading: authLoading } = useAuth()
  const [saving, setSaving] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [form, setForm] = useState({
    title: '', description: '', listing_type: 'sale', price: '',
    bedrooms: '', bathrooms: '', size_sqm: '',
    state: '', city: '', area: '', address: '',
    status: 'draft',
  })

  useEffect(() => {
    if (!authLoading && !profile?.vendor) router.push('/vendor/register')
  }, [authLoading, profile, router])

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.price) { toast.error('Title and price are required'); return }

    setSaving(true)
    try {
      const slug = generateSlug(form.title) + '-' + Date.now().toString(36)
      const { error } = await supabase.from('properties').insert({
        vendor_id: profile!.vendor!.id,
        title: form.title,
        slug,
        description: form.description || null,
        listing_type: form.listing_type as 'rent' | 'sale' | 'short_let',
        price: parseFloat(form.price),
        bedrooms: form.bedrooms ? parseInt(form.bedrooms) : null,
        bathrooms: form.bathrooms ? parseInt(form.bathrooms) : null,
        size_sqm: form.size_sqm ? parseFloat(form.size_sqm) : null,
        location: { state: form.state, city: form.city, area: form.area, address: form.address },
        status: form.status as 'draft' | 'active',
        images, amenities: [], features: {}, documents: {},
        is_featured: false, is_negotiable: true, views_count: 0,
        inquiries_count: 0, favorites_count: 0, inspection_requests_count: 0,
        verification_status: 'pending', service_charge: 0, legal_fees: 0, agency_fee: 0, caution_fee: 0,
      })
      if (error) throw error
      toast.success('Property listed!')
      router.push('/vendor/properties')
    } catch (err: any) {
      toast.error(err.message || 'Failed to create property')
    } finally { setSaving(false) }
  }

  if (authLoading || !profile?.vendor) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" /></div>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link href="/vendor/properties" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"><ArrowLeft size={18} /> Back to Properties</Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">List New Property</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Property Details</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="e.g. Luxury 3BR Apartment in Lekki" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Listing Type</label>
                <select value={form.listing_type} onChange={(e) => setForm({ ...form, listing_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                  <option value="sale">For Sale</option><option value="rent">For Rent</option><option value="short_let">Short Let</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₦) *</label>
                <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                <input type="number" value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                <input type="number" value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Property Images</h2>
            <ImageUpload images={images} onChange={setImages} />
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <select value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                  <option value="">Select state</option>
                  {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                <input type="text" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="e.g. Lekki Phase 1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button type="submit" disabled={saving}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <><Loader2 size={20} className="animate-spin" /> Saving...</> : <><Save size={20} /> Create Listing</>}
            </button>
            <Link href="/vendor/properties" className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
