export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          company_name: string | null
          company_achievements: string | null
          contact_info: string | null
          personal_name: string | null
          personal_bio: string | null
          achievements: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          company_name?: string | null
          company_achievements?: string | null
          contact_info?: string | null
          personal_name?: string | null
          personal_bio?: string | null
          achievements?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          company_name?: string | null
          company_achievements?: string | null
          contact_info?: string | null
          personal_name?: string | null
          personal_bio?: string | null
          achievements?: string | null
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_type: 'free' | 'plus'
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          status: string
          current_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_type?: 'free' | 'plus'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status?: string
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          plan_type?: 'free' | 'plus'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status?: string
          current_period_end?: string | null
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          service_name: string
          redirect_url: string
          purpose: 'product' | 'service' | 'brand' | 'lead' | 'event' | null
          service_description: string | null
          main_copy: string | null
          cta_text: string | null
          service_achievements: string | null
          custom_head: string | null
          custom_body: string | null
          swipe_scores: Json | null
          generated_html: string | null
          is_published: boolean
          regenerate_count: number
          created_at: string
          updated_at: string
          // Alpha version columns (prepared for future)
          hero_image_url: string | null
          product_images: Json | null
          achievement_images: Json | null
          other_images: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          service_name: string
          redirect_url: string
          purpose?: 'product' | 'service' | 'brand' | 'lead' | 'event' | null
          service_description?: string | null
          main_copy?: string | null
          cta_text?: string | null
          service_achievements?: string | null
          custom_head?: string | null
          custom_body?: string | null
          swipe_scores?: Json | null
          generated_html?: string | null
          is_published?: boolean
          regenerate_count?: number
          created_at?: string
          updated_at?: string
          // Alpha version columns
          hero_image_url?: string | null
          product_images?: Json | null
          achievement_images?: Json | null
          other_images?: Json | null
        }
        Update: {
          user_id?: string
          service_name?: string
          redirect_url?: string
          purpose?: 'product' | 'service' | 'brand' | 'lead' | 'event' | null
          service_description?: string | null
          main_copy?: string | null
          cta_text?: string | null
          service_achievements?: string | null
          custom_head?: string | null
          custom_body?: string | null
          swipe_scores?: Json | null
          generated_html?: string | null
          is_published?: boolean
          regenerate_count?: number
          updated_at?: string
          // Alpha version columns
          hero_image_url?: string | null
          product_images?: Json | null
          achievement_images?: Json | null
          other_images?: Json | null
        }
      }
      regeneration_usage: {
        Row: {
          id: string
          user_id: string
          date: string
          count: number
        }
        Insert: {
          id?: string
          user_id: string
          date?: string
          count?: number
        }
        Update: {
          user_id?: string
          date?: string
          count?: number
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}