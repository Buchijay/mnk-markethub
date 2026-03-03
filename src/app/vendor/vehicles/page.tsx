'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Car, Plus, Search, Eye, Trash2 } from 'lucide-react'

interface VendorVehicle {
  id: string
  title: string
  slug: string
  make: string
  model: string
  year: number
  price: number
  status: string
  condition: string | null
  views_count: number
  inquiries_count: number
  created_at: string
}

export default function VendorVehiclesPage() {
  const router = useRouter()
  const { profile, loading: authLoading } = useAuth()
  const [vehicles, setVehicles] = useState<VendorVehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!authLoading && !profile?.vendor) router.push('/vendor/register')
  }, [authLoading, profile, router])

  useEffect(() => {
    if (profile?.vendor?.id) loadVehicles()
  }, [profile])

  const loadVehicles = async () => {
    setLoading(true)
    const { data } = await supabase.from('vehicles').select('*').eq('vendor_id', profile!.vendor!.id).order('created_at', { ascending: false })
    setVehicles((data || []) as VendorVehicle[])
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this vehicle listing?')) return
    const { error } = await supabase.from('vehicles').delete().eq('id', id)
    if (error) toast.error('Failed to delete')
    else { toast.success('Vehicle deleted'); setVehicles(vehicles.filter(v => v.id !== id)) }
  }

  const filtered = vehicles.filter(v =>
    v.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.make?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (authLoading || !profile?.vendor) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600" /></div>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Vehicles</h1>
            <p className="text-gray-600 mt-1">{filtered.length} listings</p>
          </div>
          <Link href="/vendor/vehicles/create" className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition">
            <Plus size={20} /> Add Vehicle
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input type="text" placeholder="Search vehicles..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto" /></div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Car size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No vehicles yet</h3>
            <p className="text-gray-500 mb-6">List your first vehicle</p>
            <Link href="/vendor/vehicles/create" className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2">
              <Plus size={20} /> Add Vehicle
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(v => (
              <div key={v.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{v.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${v.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{v.status}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{v.year} {v.make} {v.model} · {v.condition?.replace('_', ' ')}</p>
                  <p className="text-xl font-bold text-gray-900 mb-3">₦{v.price?.toLocaleString()}</p>
                  <div className="flex justify-between text-sm text-gray-500 mb-4">
                    <span>{v.views_count} views</span>
                    <span>{v.inquiries_count} inquiries</span>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/automotive/${v.slug}`} className="flex-1 text-center px-3 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100">View</Link>
                    <button onClick={() => handleDelete(v.id)} className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
