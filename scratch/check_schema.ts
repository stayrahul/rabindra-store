import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function checkSchema() {
  const { data, error } = await supabase.from('products').select('*').limit(1)
  if (error) {
    console.error(error)
    return
  }
  console.log('Sample product:', data[0])
  console.log('inStock type:', typeof data[0]?.inStock)
}

checkSchema()
