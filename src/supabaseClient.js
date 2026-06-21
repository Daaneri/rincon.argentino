import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jcdexakycfpnfymuukzt.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjZGV4YWt5Y2ZwbmZ5bXV1a3p0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5MTI2MTAsImV4cCI6MjA5NzQ4ODYxMH0.EnRJInoXF8ZjK4mhgrtF59ZfPBYmqpo4-slbbACFzlo'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)