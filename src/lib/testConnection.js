// src/lib/testConnection.js
// Run this file to test Supabase connection
// Usage: node --experimental-modules src/lib/testConnection.js

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Testing Supabase Connection...')
console.log('URL:', supabaseUrl ? 'Set' : 'NOT SET')
console.log('Key:', supabaseAnonKey ? 'Set' : 'NOT SET')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables!')
  console.log('Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  try {
    // Test 1: Check if we can reach Supabase
    console.log('\n1. Testing basic connection...')
    const { data: authData, error: authError } = await supabase.auth.getSession()
    if (authError) {
      console.error('❌ Auth connection failed:', authError.message)
    } else {
      console.log('✅ Auth connection successful')
      console.log('   Session:', authData.session ? 'Active' : 'No active session')
    }

    // Test 2: Try to query the profiles table
    console.log('\n2. Testing database connection (profiles table)...')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)

    if (profilesError) {
      console.error('❌ Database query failed:', profilesError.message)
      console.log('   Code:', profilesError.code)
    } else {
      console.log('✅ Database connection successful')
      console.log('   Profiles found:', profiles?.length || 0)
    }

    // Test 3: Try to query the products table
    console.log('\n3. Testing products table...')
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id')
      .limit(1)

    if (productsError) {
      console.error('❌ Products query failed:', productsError.message)
    } else {
      console.log('✅ Products table accessible')
      console.log('   Products found:', products?.length || 0)
    }

    console.log('\n--- Connection Test Complete ---')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

testConnection()
