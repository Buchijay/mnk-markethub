// src/lib/seedData.js
import { supabase } from './supabaseClient.js'

async function quickSeed() {
  // Add one product manually via code
  const { data, error } = await supabase
    .from('products')
    .insert([
      {
        title: 'Test Product',
        description: 'Added from VS Code',
        price: 29.99,
        status: 'active'
      }
    ])
  
  if (error) console.error('Error:', error)
  else console.log('Product added!', data)
}

quickSeed()