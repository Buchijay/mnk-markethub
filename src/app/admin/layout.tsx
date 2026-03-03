'use client'

import { ReactNode, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AdminNav from "@/components/admin/AdminNav"
import { useAuth } from "@/lib/hooks/useAuth"

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, profile, loading, isAdmin } = useAuth()
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/login?redirect=/admin')
      } else if (!isAdmin) {
        router.push('/?error=unauthorized')
      } else {
        setAuthorized(true)
      }
    }
  }, [user, profile, loading, isAdmin, router])

  if (loading || !authorized) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">{loading ? 'Loading...' : 'Checking permissions...'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminNav />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
