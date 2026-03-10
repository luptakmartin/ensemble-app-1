import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const { data, error } = await supabase.from('_test_connection').select('*').limit(1)

if (error && error.code === '42P01') {
  console.log('✅ Supabase client connected successfully (table does not exist, but auth worked)')
} else if (error) {
  console.error('❌ Connection failed:', error.message)
} else {
  console.log('✅ Connected, data:', data)
}