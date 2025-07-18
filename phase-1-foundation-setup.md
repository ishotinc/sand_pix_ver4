# Phase 1: Foundation & Backend Setup

## Duration: 2-3 days

## Objectives
- Initialize the project with all required technologies
- Set up Supabase backend services
- Design and implement the database schema
- Configure development environment
- Create the basic file structure

## Prerequisites
- Node.js 18+ installed
- Supabase account created
- Stripe account created (for API keys)
- Google AI Studio account (for Gemini API key)

## Tasks

### 1. Project Initialization

#### 1.1 Create Next.js Project
```bash
npx create-next-app@latest sand-pix-ver4 --typescript --tailwind --app
cd sand-pix-ver4
```

#### 1.2 Install Dependencies
```bash
# Core dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install zustand react-hook-form
npm install react-dnd react-dnd-html5-backend
npm install stripe @stripe/stripe-js

# Dev dependencies
npm install -D @types/node
```

### 2. Supabase Setup

#### 2.1 Create Supabase Project
1. Go to https://supabase.com and create a new project
2. Note down the project URL and anon key

#### 2.2 Database Schema
Create the following tables in Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table is automatically created by Supabase Auth

-- Profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  company_name TEXT,
  company_achievements TEXT,
  contact_info TEXT,
  personal_name TEXT,
  personal_bio TEXT,
  achievements TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free', 'plus')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT DEFAULT 'active',
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  service_name TEXT NOT NULL,
  redirect_url TEXT NOT NULL,
  purpose TEXT CHECK (purpose IN ('product', 'service', 'brand', 'lead', 'event')),
  service_description TEXT,
  main_copy TEXT,
  cta_text TEXT,
  service_achievements TEXT,
  custom_head TEXT,
  custom_body TEXT,
  swipe_scores JSONB,
  generated_html TEXT,
  is_published BOOLEAN DEFAULT false,
  regenerate_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Alpha version columns (prepared for future)
  hero_image_url TEXT,
  product_images JSONB,
  achievement_images JSONB,
  other_images JSONB
);

-- Daily regeneration tracking
CREATE TABLE regeneration_usage (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  count INTEGER DEFAULT 0,
  UNIQUE(user_id, date)
);

-- Create indexes for performance
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_regeneration_usage_user_date ON regeneration_usage(user_id, date);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE regeneration_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Profiles: Users can only see and edit their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Subscriptions: Users can only see their own subscription
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Projects: Users can only see and manage their own projects
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Regeneration usage: Users can only see their own usage
CREATE POLICY "Users can view own usage" ON regeneration_usage
  FOR SELECT USING (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 3. Environment Configuration

Create `.env.local` file:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_STRIPE_PLUS_PRICE_ID=price_xxxxx

# Google Gemini
GEMINI_API_KEY=your_gemini_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. File Structure Setup

Create the following directory structure:

```bash
mkdir -p src/app/{api,\(auth\),\(dashboard\),p}
mkdir -p src/app/api/{auth,projects,stripe}
mkdir -p src/app/\(auth\)/{login,register,verify-email}
mkdir -p src/app/\(dashboard\)/{projects,profile}
mkdir -p src/app/\(dashboard\)/projects/{new,\[id\]}
mkdir -p src/app/p/\[id\]
mkdir -p src/{components,lib,utils,types,hooks}
mkdir -p src/components/{swipe,editor,ui}
mkdir -p src/lib/{supabase,gemini,stripe}
mkdir -p public/images/swipe
```

### 5. Core Configuration Files

#### 5.1 Create Supabase Client (`src/lib/supabase/client.ts`)
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

#### 5.2 Create Supabase Server Client (`src/lib/supabase/server.ts`)
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle error in Server Component
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Handle error in Server Component
          }
        },
      },
    }
  )
}
```

#### 5.3 Create Type Definitions (`src/types/database.ts`)
```typescript
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
        }
        Update: {
          company_name?: string | null
          company_achievements?: string | null
          contact_info?: string | null
          personal_name?: string | null
          personal_bio?: string | null
          achievements?: string | null
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
        }
      }
      regeneration_usage: {
        Row: {
          id: string
          user_id: string
          date: string
          count: number
        }
      }
    }
  }
}
```

### 6. Create Swipe Configuration

Create `public/swipe-config.json`:
```json
{
  "version": "1.0.0",
  "images": [
    {
      "id": 1,
      "title": "Friendly Tone",
      "description": "\"Feel free to consult us♪\" \"Let's work hard together!\"",
      "visual_hints": "Staff smiling photos, hand-drawn style icons, soft rounded corners, warm expressions",
      "path": "/images/swipe/friendly-tone.jpg",
      "scores": {
        "warm_score": 1,
        "cool_score": 0,
        "mono_score": 0,
        "vivid_score": 0,
        "friendly_score": 1,
        "professional_score": 0,
        "creative_score": 0,
        "minimal_score": 0,
        "energetic_score": 0,
        "trustworthy_score": 0,
        "luxurious_score": 0,
        "approachable_score": 1
      }
    }
  ]
}
```
(Note: Add all 12 images as specified in the requirements)

### 7. Create Placeholder Swipe Images

For development, create placeholder images:
```bash
# Install ImageMagick if not already installed
# brew install imagemagick (on macOS)

# Create placeholder images
for img in friendly-tone professional-tone innovative-tone trustworthy-tone warm-colors cool-colors monochrome vivid-colors pastel-colors high-density asymmetric photo-centric; do
  convert -size 400x600 xc:gray -pointsize 30 -draw "text 50,300 '$img'" public/images/swipe/$img.jpg
done
```

## Verification Checklist
- [ ] Next.js project runs without errors
- [ ] Can connect to Supabase (test with a simple query)
- [ ] All tables created with proper RLS policies
- [ ] Environment variables properly configured
- [ ] File structure matches specification
- [ ] Swipe images accessible at `/images/swipe/`
- [ ] TypeScript types properly defined

## Next Steps
After completing Phase 1, proceed to Phase 2: User Authentication & Profile Management