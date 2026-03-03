'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import toast from 'react-hot-toast'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { CAR_MAKES, NIGERIAN_STATES } from '@/lib/utils/constants'
import ImageUpload from '@/components/ImageUpload'
import type { Vehicle } from '@/lib/types/database.types'

export default function CreateVehiclePage() {
  const router = useRouter()
  const { profile, loading: authLoading } = useAuth()
  const [saving, setSaving] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [form, setForm] = useState({
    title: '', description: '', listing_type: 'sale', price: '',
    make: '', model: '', year: new Date().getFullYear().toString(),
    condition: 'foreign_used', transmission: 'automatic', fuel_type: 'petrol',
    mileage: '', color: '',
    state: '', city: '', area: '',
    status: 'draft',
  })

  useEffect(() => {
    if (!authLoading && !profile?.vendor) router.push('/vendor/register')
  }, [authLoading, profile, router])

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.price || !form.make) { toast.error('Title, make and price are required'); return }

    setSaving(true)
    try {
      const slug = generateSlug(form.title) + '-' + Date.now().toString(36)
      const { error } = await supabase.from('vehicles').insert({
        vendor_id: profile!.vendor!.id,
        title: form.title, slug,
        description: form.description || null,
        listing_type: form.listing_type as 'sale' | 'lease',
        price: parseFloat(form.price),
        make: form.make, model: form.model, year: parseInt(form.year),
        condition: form.condition as Vehicle['condition'],
        transmission: form.transmission as 'automatic' | 'manual',
        fuel_type: form.fuel_type as Vehicle['fuel_type'],
        mileage: form.mileage ? parseInt(form.mileage) : null,
        color: form.color || null,
        location: { state: form.state, city: form.city, area: form.area },
        status: form.status as 'draft' | 'active',
        images, features: {}, specifications: {}, documents: {},
        is_featured: false, is_negotiable: true, customs_cleared: true,
        views_count: 0, inquiries_count: 0, favorites_count: 0,
        test_drive_requests_count: 0, warranty_available: false,
        verification_status: 'pending',
      })
      if (error) throw error
      toast.success('Vehicle listed!')
      router.push('/vendor/vehicles')
    } catch (err: any) {
      toast.error(err.message || 'Failed to create vehicle listing')
    } finally { setSaving(false) }
  }

  if (authLoading || !profile?.vendor) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" /></div>
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link href="/vendor/vehicles" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"><ArrowLeft size={18} /> Back to Vehicles</Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">List New Vehicle</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Vehicle Details</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="e.g. 2023 Toyota Camry XSE" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Make *</label>
                <select value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
                  <option value="">Select make</option>
                  {CAR_MAKES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                <input type="text" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="e.g. Camry" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <select value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
                  <option value="new">Brand New</option><option value="foreign_used">Foreign Used</option>
                  <option value="nigerian_used">Nigerian Used</option><option value="accident_free">Accident Free</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transmission</label>
                <select value={form.transmission} onChange={(e) => setForm({ ...form, transmission: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
                  <option value="automatic">Automatic</option><option value="manual">Manual</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
                <select value={form.fuel_type} onChange={(e) => setForm({ ...form, fuel_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
                  <option value="petrol">Petrol</option><option value="diesel">Diesel</option>
                  <option value="electric">Electric</option><option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Vehicle Images</h2>
            <ImageUpload images={images} onChange={setImages} />
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Pricing & Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₦) *</label>
                <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mileage (km)</label>
                <input type="number" value={form.mileage} onChange={(e) => setForm({ ...form, mileage: e.target.value })} min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <select value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
                  <option value="">Select state</option>
                  {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button type="submit" disabled={saving}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <><Loader2 size={20} className="animate-spin" /> Saving...</> : <><Save size={20} /> Create Listing</>}
            </button>
            <Link href="/vendor/vehicles" className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
