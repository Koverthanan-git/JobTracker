import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      applications: {
        Row: {
          id: string
          user_id: string
          job_title: string
          company: string
          location: string | null
          salary_range: string | null
          job_url: string | null
          stage_id: number
          date_applied: string
          notes: string | null
          resume_url: string | null
          cover_letter_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['applications']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['applications']['Insert']>
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          application_id: string | null
          title: string
          description: string | null
          due_date: string | null
          is_completed: boolean
          priority: 'Low' | 'Medium' | 'High'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['tasks']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['tasks']['Insert']>
      }
    }
  }
}
