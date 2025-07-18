# Phase 3: Core Swipe Experience

## Duration: 4-6 days

## Objectives
- Build the Tinder-like swipe interface
- Implement swipe gesture detection and animations
- Load and display design preference images
- Calculate scores based on user swipes
- Transition to project creation after 12 swipes

## Prerequisites
- Phase 1 & 2 completed
- User authentication working
- 12 swipe images placed in `/public/images/swipe/`

## Tasks

### 1. Install Swipe Dependencies

```bash
npm install framer-motion react-use-gesture
npm install -D @types/react
```

### 2. Create Swipe Types

#### 2.1 Swipe Types (`src/types/swipe.ts`)
```typescript
export interface SwipeImage {
  id: number
  title: string
  description: string
  visual_hints: string
  path: string
  scores: SwipeScores
}

export interface SwipeScores {
  warm_score: number
  cool_score: number
  mono_score: number
  vivid_score: number
  friendly_score: number
  professional_score: number
  creative_score: number
  minimal_score: number
  energetic_score: number
  trustworthy_score: number
  luxurious_score: number
  approachable_score: number
}

export interface SwipeConfig {
  version: string
  images: SwipeImage[]
}

export type SwipeDirection = 'left' | 'right'

export interface SwipeResult {
  imageId: number
  direction: SwipeDirection
}
```

### 3. Create Swipe Store

#### 3.1 Zustand Store (`src/store/swipeStore.ts`)
```typescript
import { create } from 'zustand'
import { SwipeResult, SwipeScores } from '@/types/swipe'

interface SwipeState {
  currentIndex: number
  swipeResults: SwipeResult[]
  finalScores: SwipeScores | null
  
  addSwipeResult: (result: SwipeResult) => void
  calculateFinalScores: (images: any[]) => SwipeScores
  resetSwipe: () => void
}

const initialScores: SwipeScores = {
  warm_score: 0,
  cool_score: 0,
  mono_score: 0,
  vivid_score: 0,
  friendly_score: 0,
  professional_score: 0,
  creative_score: 0,
  minimal_score: 0,
  energetic_score: 0,
  trustworthy_score: 0,
  luxurious_score: 0,
  approachable_score: 0,
}

export const useSwipeStore = create<SwipeState>((set, get) => ({
  currentIndex: 0,
  swipeResults: [],
  finalScores: null,

  addSwipeResult: (result) => {
    set((state) => ({
      swipeResults: [...state.swipeResults, result],
      currentIndex: state.currentIndex + 1,
    }))
  },

  calculateFinalScores: (images) => {
    const { swipeResults } = get()
    const scores = { ...initialScores }

    swipeResults.forEach((result) => {
      if (result.direction === 'right') {
        const image = images.find((img) => img.id === result.imageId)
        if (image) {
          Object.keys(image.scores).forEach((key) => {
            scores[key as keyof SwipeScores] += image.scores[key]
          })
        }
      }
    })

    set({ finalScores: scores })
    return scores
  },

  resetSwipe: () => {
    set({
      currentIndex: 0,
      swipeResults: [],
      finalScores: null,
    })
  },
}))
```

### 4. Create Swipe Components

#### 4.1 Swipe Card Component (`src/components/swipe/SwipeCard.tsx`)
```typescript
'use client'

import { motion, useMotionValue, useTransform } from 'framer-motion'
import { useDrag } from 'react-use-gesture'
import { useState } from 'react'
import Image from 'next/image'
import { SwipeImage } from '@/types/swipe'

interface SwipeCardProps {
  image: SwipeImage
  onSwipe: (direction: 'left' | 'right') => void
  isActive: boolean
}

export function SwipeCard({ image, onSwipe, isActive }: SwipeCardProps) {
  const [isLeaving, setIsLeaving] = useState(false)
  
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-30, 30])
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0])

  const bind = useDrag(({ down, movement: [mx, my], velocity }) => {
    if (!isActive) return

    const trigger = velocity > 0.2
    const dir = mx > 0 ? 'right' : 'left'

    if (!down && trigger && Math.abs(mx) > 100) {
      setIsLeaving(true)
      onSwipe(dir)
    } else {
      x.set(down ? mx : 0)
      y.set(down ? my : 0)
    }
  })

  if (!isActive && !isLeaving) return null

  return (
    <motion.div
      {...bind()}
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{
        x,
        y,
        rotate,
        opacity,
      }}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className="relative w-full h-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Image Container */}
        <div className="relative h-2/3 bg-gray-100">
          <Image
            src={image.path}
            alt={image.title}
            fill
            className="object-cover"
            priority
          />
          
          {/* Swipe Indicators */}
          <motion.div
            className="absolute top-8 left-8 bg-green-500 text-white px-6 py-3 rounded-full font-bold text-2xl rotate-[-20deg]"
            style={{
              opacity: useTransform(x, [0, 100], [0, 1]),
            }}
          >
            LIKE
          </motion.div>
          
          <motion.div
            className="absolute top-8 right-8 bg-red-500 text-white px-6 py-3 rounded-full font-bold text-2xl rotate-[20deg]"
            style={{
              opacity: useTransform(x, [-100, 0], [1, 0]),
            }}
          >
            NOPE
          </motion.div>
        </div>

        {/* Card Content */}
        <div className="p-6">
          <h3 className="text-2xl font-bold mb-2">{image.title}</h3>
          <p className="text-gray-600 mb-4">{image.description}</p>
          <p className="text-sm text-gray-500 italic">{image.visual_hints}</p>
        </div>
      </div>
    </motion.div>
  )
}
```

#### 4.2 Swipe Container Component (`src/components/swipe/SwipeContainer.tsx`)
```typescript
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { SwipeCard } from './SwipeCard'
import { useSwipeStore } from '@/store/swipeStore'
import { SwipeConfig, SwipeImage } from '@/types/swipe'
import { Button } from '@/components/ui/Button'

export function SwipeContainer() {
  const router = useRouter()
  const [config, setConfig] = useState<SwipeConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const { currentIndex, addSwipeResult, calculateFinalScores, resetSwipe } = useSwipeStore()

  useEffect(() => {
    loadSwipeConfig()
  }, [])

  const loadSwipeConfig = async () => {
    try {
      const response = await fetch('/swipe-config.json')
      const data = await response.json()
      setConfig(data)
    } catch (error) {
      console.error('Failed to load swipe config:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!config) return

    const currentImage = config.images[currentIndex]
    addSwipeResult({
      imageId: currentImage.id,
      direction,
    })

    // Check if all swipes completed
    if (currentIndex === config.images.length - 1) {
      const scores = calculateFinalScores(config.images)
      // Navigate to project creation with scores
      router.push('/projects/new/setup')
    }
  }

  const handleSkip = () => {
    handleSwipe('left')
  }

  const handleLike = () => {
    handleSwipe('right')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading design preferences...</p>
        </div>
      </div>
    )
  }

  if (!config || config.images.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">Failed to load swipe images</p>
      </div>
    )
  }

  const progress = ((currentIndex / config.images.length) * 100).toFixed(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-6">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Design Preferences</h1>
            <span className="text-gray-600">{currentIndex + 1} / {config.images.length}</span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-[#4285F4] to-[#EA4335] h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Swipe Area */}
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="relative w-full max-w-lg h-[600px]">
          <AnimatePresence>
            {config.images.map((image, index) => (
              <SwipeCard
                key={image.id}
                image={image}
                onSwipe={handleSwipe}
                isActive={index === currentIndex}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="max-w-lg mx-auto flex justify-center gap-4">
          <button
            onClick={handleSkip}
            className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
            aria-label="Skip"
          >
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <button
            onClick={handleLike}
            className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
            aria-label="Like"
          >
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
```

### 5. Create Swipe Page

#### 5.1 New Project Swipe Page (`src/app/(dashboard)/projects/new/page.tsx`)
```typescript
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SwipeContainer } from '@/components/swipe/SwipeContainer'
import { useSwipeStore } from '@/store/swipeStore'
import { useAuth } from '@/hooks/useAuth'

export default function NewProjectSwipePage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const resetSwipe = useSwipeStore((state) => state.resetSwipe)

  useEffect(() => {
    // Reset swipe state when component mounts
    resetSwipe()
  }, [resetSwipe])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
      </div>
    )
  }

  return <SwipeContainer />
}
```

### 6. Create Project Setup Page (Post-Swipe)

#### 6.1 Project Setup Page (`src/app/(dashboard)/projects/new/setup/page.tsx`)
```typescript
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useSwipeStore } from '@/store/swipeStore'
import { useAuth } from '@/hooks/useAuth'

type ProjectFormData = {
  serviceName: string
  redirectUrl: string
  purpose: 'product' | 'service' | 'brand' | 'lead' | 'event'
  serviceDescription: string
}

const purposeOptions = [
  { value: 'product', label: 'Product Sales Page' },
  { value: 'service', label: 'Service Introduction Page' },
  { value: 'brand', label: 'Corporate Brand LP' },
  { value: 'lead', label: 'Document Request Page' },
  { value: 'event', label: 'Event Recruitment Page' },
]

export default function ProjectSetupPage() {
  const router = useRouter()
  const supabase = createClient()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const finalScores = useSwipeStore((state) => state.finalScores)
  const { register, handleSubmit, formState: { errors } } = useForm<ProjectFormData>()

  useEffect(() => {
    // Redirect if no swipe scores
    if (!finalScores) {
      router.push('/projects/new')
    }
  }, [finalScores, router])

  const onSubmit = async (data: ProjectFormData) => {
    if (!user || !finalScores) return

    setLoading(true)
    setError(null)

    try {
      // Create project with initial data
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          service_name: data.serviceName,
          redirect_url: data.redirectUrl,
          purpose: data.purpose,
          service_description: data.serviceDescription,
          swipe_scores: finalScores,
        })
        .select()
        .single()

      if (projectError) throw projectError

      // Navigate to project edit page for generation
      router.push(`/projects/${project.id}?generate=true`)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!finalScores) {
    return null
  }

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)]">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-2">Almost There!</h1>
          <p className="text-gray-600 mb-8">
            Tell us about your project to generate the perfect landing page.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Service Name"
              placeholder="My Awesome Service"
              error={errors.serviceName?.message}
              {...register('serviceName', {
                required: 'Service name is required',
                maxLength: {
                  value: 100,
                  message: 'Service name must be less than 100 characters'
                }
              })}
            />

            <Input
              label="Redirect URL (Where should the CTA button lead?)"
              type="url"
              placeholder="https://example.com/signup"
              error={errors.redirectUrl?.message}
              {...register('redirectUrl', {
                required: 'Redirect URL is required',
                pattern: {
                  value: /^https?:\/\/.+/,
                  message: 'Please enter a valid URL starting with http:// or https://'
                }
              })}
            />

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Landing Page Purpose
              </label>
              <select
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                {...register('purpose', { required: 'Please select a purpose' })}
              >
                <option value="">Select purpose...</option>
                {purposeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.purpose && (
                <p className="mt-1 text-sm text-[var(--error)]">{errors.purpose.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Service Description
              </label>
              <textarea
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                rows={4}
                placeholder="Describe your service in a few sentences..."
                {...register('serviceDescription', {
                  required: 'Service description is required',
                  maxLength: {
                    value: 500,
                    message: 'Description must be less than 500 characters'
                  }
                })}
              />
              {errors.serviceDescription && (
                <p className="mt-1 text-sm text-[var(--error)]">{errors.serviceDescription.message}</p>
              )}
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-[var(--error)] text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="gradient"
              size="lg"
              loading={loading}
              className="w-full"
            >
              Generate Landing Page
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
```

### 7. Update Complete Swipe Config

Update the `/public/swipe-config.json` with all 12 images:

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
    },
    {
      "id": 2,
      "title": "Professional Tone",
      "description": "\"Providing professional solutions\" \"Rich track record\"",
      "visual_hints": "Experts in suits, data graphs, angular design, logical composition",
      "path": "/images/swipe/professional-tone.jpg",
      "scores": {
        "warm_score": 0,
        "cool_score": 1,
        "mono_score": 0,
        "vivid_score": 0,
        "friendly_score": 0,
        "professional_score": 1,
        "creative_score": 0,
        "minimal_score": 0,
        "energetic_score": 0,
        "trustworthy_score": 1,
        "luxurious_score": 0,
        "approachable_score": 0
      }
    },
    {
      "id": 3,
      "title": "Innovative Tone",
      "description": "\"Transforming the industry with next-generation technology\" \"Innovation\"",
      "visual_hints": "Futuristic graphics, technology feel, geometric patterns, advanced visuals",
      "path": "/images/swipe/innovative-tone.jpg",
      "scores": {
        "warm_score": 0,
        "cool_score": 1,
        "mono_score": 0,
        "vivid_score": 1,
        "friendly_score": 0,
        "professional_score": 0,
        "creative_score": 1,
        "minimal_score": 0,
        "energetic_score": 1,
        "trustworthy_score": 0,
        "luxurious_score": 0,
        "approachable_score": 0
      }
    },
    {
      "id": 4,
      "title": "Trustworthy Tone",
      "description": "\"20 years of solid track record since founding\" \"Safe and reliable\"",
      "visual_hints": "Historic buildings, stable composition, traditional design, proof of trust",
      "path": "/images/swipe/trustworthy-tone.jpg",
      "scores": {
        "warm_score": 0,
        "cool_score": 0,
        "mono_score": 0,
        "vivid_score": 0,
        "friendly_score": 0,
        "professional_score": 1,
        "creative_score": 0,
        "minimal_score": 0,
        "energetic_score": 0,
        "trustworthy_score": 1,
        "luxurious_score": 0,
        "approachable_score": 0
      }
    },
    {
      "id": 5,
      "title": "Warm Colors (Orange/Red)",
      "description": "Mailchimp-style warm orange base",
      "visual_hints": "Warm orange, active and friendly impression",
      "path": "/images/swipe/warm-colors.jpg",
      "scores": {
        "warm_score": 1,
        "cool_score": 0,
        "mono_score": 0,
        "vivid_score": 1,
        "friendly_score": 1,
        "professional_score": 0,
        "creative_score": 0,
        "minimal_score": 0,
        "energetic_score": 1,
        "trustworthy_score": 0,
        "luxurious_score": 0,
        "approachable_score": 1
      }
    },
    {
      "id": 6,
      "title": "Cool Colors (Blue/Navy)",
      "description": "Facebook-style trustworthy blue base",
      "visual_hints": "Calm blue, reliability and stability",
      "path": "/images/swipe/cool-colors.jpg",
      "scores": {
        "warm_score": 0,
        "cool_score": 1,
        "mono_score": 0,
        "vivid_score": 0,
        "friendly_score": 0,
        "professional_score": 1,
        "creative_score": 0,
        "minimal_score": 0,
        "energetic_score": 0,
        "trustworthy_score": 1,
        "luxurious_score": 0,
        "approachable_score": 0
      }
    },
    {
      "id": 7,
      "title": "Monochrome (White/Gray/Black)",
      "description": "Apple-style sophisticated grayscale",
      "visual_hints": "Minimal and luxurious monotone",
      "path": "/images/swipe/monochrome.jpg",
      "scores": {
        "warm_score": 0,
        "cool_score": 0,
        "mono_score": 1,
        "vivid_score": 0,
        "friendly_score": 0,
        "professional_score": 1,
        "creative_score": 0,
        "minimal_score": 1,
        "energetic_score": 0,
        "trustworthy_score": 0,
        "luxurious_score": 1,
        "approachable_score": 0
      }
    },
    {
      "id": 8,
      "title": "Vivid (Bright Green/Pink)",
      "description": "Spotify-style high saturation colors",
      "visual_hints": "Bright and eye-catching colors",
      "path": "/images/swipe/vivid-colors.jpg",
      "scores": {
        "warm_score": 0,
        "cool_score": 0,
        "mono_score": 0,
        "vivid_score": 1,
        "friendly_score": 0,
        "professional_score": 0,
        "creative_score": 1,
        "minimal_score": 0,
        "energetic_score": 1,
        "trustworthy_score": 0,
        "luxurious_score": 0,
        "approachable_score": 0
      }
    },
    {
      "id": 9,
      "title": "Pastel (Light Pink/Light Blue)",
      "description": "Notion-style gentle pastels",
      "visual_hints": "Soft and gentle colors",
      "path": "/images/swipe/pastel-colors.jpg",
      "scores": {
        "warm_score": 1,
        "cool_score": 0,
        "mono_score": 0,
        "vivid_score": 0,
        "friendly_score": 1,
        "professional_score": 0,
        "creative_score": 0,
        "minimal_score": 1,
        "energetic_score": 0,
        "trustworthy_score": 0,
        "luxurious_score": 0,
        "approachable_score": 1
      }
    },
    {
      "id": 10,
      "title": "High Information Density Layout",
      "description": "Densely packed information layout",
      "visual_hints": "Amazon product page style rich composition",
      "path": "/images/swipe/high-density.jpg",
      "scores": {
        "warm_score": 0,
        "cool_score": 0,
        "mono_score": 0,
        "vivid_score": 0,
        "friendly_score": 0,
        "professional_score": 1,
        "creative_score": 0,
        "minimal_score": 0,
        "energetic_score": 0,
        "trustworthy_score": 1,
        "luxurious_score": 0,
        "approachable_score": 0
      }
    },
    {
      "id": 11,
      "title": "Asymmetric Layout",
      "description": "Left-right asymmetry, dynamic placement",
      "visual_hints": "Medium-style creative composition",
      "path": "/images/swipe/asymmetric.jpg",
      "scores": {
        "warm_score": 0,
        "cool_score": 0,
        "mono_score": 0,
        "vivid_score": 0,
        "friendly_score": 0,
        "professional_score": 0,
        "creative_score": 1,
        "minimal_score": 0,
        "energetic_score": 1,
        "trustworthy_score": 0,
        "luxurious_score": 0,
        "approachable_score": 0
      }
    },
    {
      "id": 12,
      "title": "Photo-centric Decoration",
      "description": "Effective placement of product photos",
      "visual_hints": "Visual-focused layout",
      "path": "/images/swipe/photo-centric.jpg",
      "scores": {
        "warm_score": 0,
        "cool_score": 0,
        "mono_score": 0,
        "vivid_score": 0,
        "friendly_score": 0,
        "professional_score": 0,
        "creative_score": 0,
        "minimal_score": 0,
        "energetic_score": 0,
        "trustworthy_score": 0,
        "luxurious_score": 1,
        "approachable_score": 0
      }
    }
  ]
}
```

## Verification Checklist
- [ ] Swipe interface loads all 12 images
- [ ] Swipe gestures work smoothly (drag and release)
- [ ] Visual feedback shows for like/nope
- [ ] Progress bar updates correctly
- [ ] Action buttons (X and ❤️) work
- [ ] Scores calculate correctly based on likes only
- [ ] After 12 swipes, redirects to setup page
- [ ] Setup form validates all fields
- [ ] Project creates with swipe scores saved
- [ ] Redirects to project edit page after creation

## Next Steps
After completing Phase 3, proceed to Phase 4: AI-Powered Landing Page Generation