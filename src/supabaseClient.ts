import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ctncnviebtufoqwwfsxb.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0bmNudmllYnR1Zm9xd3dmc3hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNzE3NjEsImV4cCI6MjA2NzY0Nzc2MX0.3wse2bxB-2A2-sYFSIcXlmqhJ_BjegYA_sY5qUzfveo'

export const supabase = createClient(supabaseUrl, supabaseKey)
