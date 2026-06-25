import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ridbqizyploghreuklmm.supabase.co'
const supabaseKey = 'sb_publishable_dv_acFtTRP9A2DZ6I1CHuA_2XZkhYxj'

export const supabase = createClient(supabaseUrl, supabaseKey)
