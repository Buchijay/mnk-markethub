// Import the supabase client
import { supabase } from './supabaseClient.js'

async function checkAllTables() {
  console.log('🔍 Checking your Supabase tables...\n')

  // List of your actual tables from your screenshot
  const tables = [
    'profiles',
    'products', 
    'vehicles',
    'properties',
    'vendors',
    'orders',
    'order_items',
    'reviews',
    'favorites',
    'messages',
    'test_drive_requests',
    'admin_logs',
    'product_categories',
    'property_categories',
    'vehicle_categories',
    'vendor_verticals'
  ]

  for (const table of tables) {
    try {
      // Try to get a count of records
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        if (error.code === '42P01') { 
          console.log(`❌ Table '${table}' doesn't exist`)
        } else if (error.code === 'PGRST116') {
          console.log(`✅ ${table}: 0 records (table exists but empty)`)
        } else {
          console.log(`⚠️  Error checking ${table}:`, error.message)
        }
      } else {
        console.log(`✅ ${table}: ${count} records`)
      }
    } catch (err) {
      console.log(`❌ Failed to check ${table}:`, err.message)
    }
  }
  
  // Also check if there are any records in key tables
  console.log('\n📊 Sampling data from main tables...\n')
  
  const mainTables = ['profiles', 'products', 'vehicles', 'vendors']
  
  for (const table of mainTables) {
    try {
      const { data } = await supabase
        .from(table)
        .select('*')
        .limit(3)
      
      if (data && data.length > 0) {
        console.log(`📦 ${table} sample (${data.length} records):`)
        console.log(data)
        console.log('---')
      }
    } catch (err) {
      // Skip if error
    }
  }
}

// Run the function
checkAllTables()