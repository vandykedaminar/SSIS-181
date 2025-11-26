import { createClient } from '@supabase/supabase-js'

// 1. Paste the URL you copied from the "Project URL" section here:
const supabaseUrl = 'https://seqcjefslhhfwiptecby.supabase.co' 

// 2. Paste the long string you copied from the "anon public" section here:
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlcWNqZWZzbGhoZndpcHRlY2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNzEzMjcsImV4cCI6MjA3OTc0NzMyN30.h9fLPc-QOwnksrzBub-UnAE_Mt-O_-maOULrXkf7GtY'

export const supabase = createClient(supabaseUrl, supabaseKey)