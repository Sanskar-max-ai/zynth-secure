import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xzegiqgjksqbyvsoklvh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6ZWdpcWdqa3NxYnl2c29rbHZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0OTU0ODYsImV4cCI6MjA5MDA3MTQ4Nn0.GxwO_TJUAKck_Elq83tSEo0Pm_O-Pbc51VvrYe5cl6s'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
  console.log('Checking for "patch" column in scan_issues...')
  
  // We try to select the column. If it doesn't exist, Supabase will return an error 42703 (column does not exist)
  const { data, error } = await supabase
    .from('scan_issues')
    .select('patch')
    .limit(1)

  if (error) {
    if (error.code === '42703') {
      console.error('❌ COLUMN MISSING: The "patch" column was NOT found in the database.')
    } else {
      console.error('⚠️ DB Error:', error.message)
      console.log('This might be due to RLS policies. Please check manually in Supabase.')
    }
  } else {
    console.log('✅ SUCCESS: The "patch" column exists and is accessible!')
  }
}

checkSchema()
