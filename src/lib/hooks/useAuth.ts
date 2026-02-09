// lib/hooks/useAuth.ts
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import type { Profile, Vendor } from '@/lib/types/database.types'

interface ProfileWithVendor extends Profile {
  vendor: Vendor | null
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<ProfileWithVendor | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    getUser()

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          await getProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  async function getUser() {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    if (user) {
      await getProfile(user.id)
    }
    setLoading(false)
  }

  async function getProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*, vendor:vendors(*)')
      .eq('id', userId)
      .single()
    setProfile(data as ProfileWithVendor | null)
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  return {
    user,
    profile,
    loading,
    signOut,
    isVendor: profile?.role === 'vendor',
    isAdmin: profile?.role === 'admin',
  }
}