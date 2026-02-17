import { supabase } from './supabaseClient.js'

async function checkTableStructure() {
  console.log('🔍 Checking table structures...\n')
  
  const tables = ['products', 'vehicles', 'profiles', 'vendors', 'product_categories']
  
  for (const table of tables) {
    try {
      // Try to select a single row to see available columns
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`❌ ${table}:`, error.message)
      } else {
        console.log(`✅ ${table} exists`)
        
        // If we got data, show the columns
        if (data && data.length > 0) {
          console.log('   Columns:', Object.keys(data[0]).join(', '))
        } else {
          // If table is empty, we need another way to see structure
          console.log('   Table is empty - cannot detect columns')
          console.log('   Try adding a row manually in Supabase dashboard to see structure')
        }
      }
      console.log('---')
    } catch (err) {
      console.log(`❌ Error with ${table}:`, err.message)
    }
  }
}

checkTableStructure()