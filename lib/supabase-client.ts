// lib/supabase-client.ts – Zentrale Supabase-Client-Instanz

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

// Einzige Client-Instanz – wird überall wiederverwendet
export const supabase = createClient(supabaseUrl, supabaseKey)