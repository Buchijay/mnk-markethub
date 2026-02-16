// lib/hooks/useAuth.ts
'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile, Vendor } from '@/lib/types/database.types'

interface ProfileWithVendor extends Profile {
  vendor: Vendor | null
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<ProfileWithVendor | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('useAuth: Starting getUser')
    getUser()

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('useAuth: Auth state changed:', event, !!session?.user)
        if (session?.user) {
          setUser(session.user)
          await getProfile(session.user.id, session.user.email || '')
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
    console.log('useAuth: getUser called')
    const { data: { user } } = await supabase.auth.getUser()
    console.log('useAuth: getUser result:', !!user)
    setUser(user)
    if (user) {
      await getProfile(user.id, user.email || '')
    }
    setLoading(false)
  }

  async function getProfile(userId: string, email: string = '') {
    console.log('useAuth: getProfile called for:', userId)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      console.log('useAuth: getProfile result:', { data: !!data, error })
      
      if (error) {
        console.error('Error fetching profile:', error)
        
        // If profile doesn't exist, create a default one
        if (error.code === 'PGRST116') {
          await createDefaultProfile(userId, email)
          return
        }
        
        setProfile(null)
        return
      }
      
      // Fetch vendor data separately if user is a vendor
      let vendorData = null
      if (data && data.role === 'vendor') {
        try {
          const { data: vendor, error: vendorError } = await supabase
            .from('vendors')
            .select('*')
            .eq('user_id', userId)
            .single()
          
          if (vendorError) {
            console.error('Error fetching vendor data:', vendorError)
          } else {
            vendorData = vendor
          }
        } catch (error) {
          console.error('Unexpected error fetching vendor data:', error)
        }
      }
      
      setProfile({ ...data, vendor: vendorData } as ProfileWithVendor | null)
    } catch (error) {
      console.error('Unexpected error fetching profile:', error)
      setProfile(null)
    }
  }

  async function createDefaultProfile(userId: string, email: string) {
    try {
      const { data, error } = await (supabase
        .from('profiles')
        .insert({
          id: userId,
          email: email,
          full_name: '',
          phone: null,
          avatar_url: null,
          role: 'customer',
          is_active: true,
          email_verified: false,
          metadata: {},
        } as any)
        .select('*')
        .single() as any)
      
      if (error) {
        console.error('Error creating default profile:', error)
        setProfile(null)
        return
      }
      
      setProfile({ ...data, vendor: null } as ProfileWithVendor | null)
    } catch (error) {
      console.error('Unexpected error creating profile:', error)
      setProfile(null)
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    // Use window.location for navigation to ensure router is ready
    window.location.href = '/'
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