import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lrerrxaaimqbuyqohwmp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyZXJyeGFhaW1xYnV5cW9od21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMTE1NDUsImV4cCI6MjA2Nzc4NzU0NX0.uha9a-Y32WFCr6V_qOWW-m_dUJN1kyeKfdHuRwnwW6Y'

export const supabase = createClient(supabaseUrl, supabaseKey)
