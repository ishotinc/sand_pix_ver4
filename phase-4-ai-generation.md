# Phase 4: AI-Powered Landing Page Generation

## Duration: 5-7 days

## Objectives
- Integrate Google Gemini API for HTML generation
- Implement prompt construction logic
- Create generation API endpoint
- Handle errors and implement retry logic
- Implement rollback for failed regenerations

## Prerequisites
- Phase 1-3 completed
- Gemini API key configured in environment
- Project creation flow working

## Tasks

### 1. Create Gemini Client

#### 1.1 Gemini Client Setup (`src/lib/gemini/client.ts`)
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export const geminiFlash = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash-exp',
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 16384,
    responseMimeType: 'text/plain',
  },
})

export async function generateLandingPage(prompt: string): Promise<string> {
  try {
    const result = await geminiFlash.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Extract HTML from response
    const htmlMatch = text.match(/<!DOCTYPE html>[\s\S]*<\/html>/i)
    if (!htmlMatch) {
      throw new Error('Invalid HTML response from AI')
    }
    
    return htmlMatch[0]
  } catch (error) {
    console.error('Gemini API error:', error)
    throw error
  }
}
```

Install the Gemini SDK:
```bash
npm install @google/generative-ai
```

### 2. Create Prompt Construction Logic

#### 2.1 Prompt Builder (`src/utils/promptBuilder.ts`)
```typescript
import { SwipeScores } from '@/types/swipe'
import { Database } from '@/types/database'

type ProfileData = Database['public']['Tables']['profiles']['Row']
type ProjectData = Database['public']['Tables']['projects']['Row']

export function buildLandingPagePrompt(
  projectData: Partial<ProjectData>,
  profileData: Partial<ProfileData>,
  swipeScores: SwipeScores
): string {
  // Convert swipe scores to formatted text
  const scoresText = Object.entries(swipeScores)
    .map(([key, value]) => `- ${key}: ${value}`)
    .join('\n')

  const DEFAULT_PROMPT = `
# 🚨 Absolute Compliance Items (Must Check Before Implementation)

## [STEP 1] Constraint Checklist - Must check the following before starting implementation
- [ ] Header is position: absolute (fixed prohibited)
- [ ] Header is completely transparent (background: transparent)
- [ ] Service name is placed in the upper left
- [ ] No external links (all button elements)
- [ ] Navigation to other pages is completely prohibited
- [ ] CTA button is for external URL guidance only
- [ ] Do not implement any form functionality

## [STEP 2] Required Output Format
<!DOCTYPE html>
<html>
<head>
[All CSS written in <style> tag]
</head>
<body>
[Complete HTML structure]
<script>
[All JavaScript written]
</script>
</body>
</html>

---

# 📋 Landing Page Creation Instructions

## Most Important Instructions
Create a highly visible landing page with design that exceeds limits using three.js, tailwind css, framer motion equivalent animations, and Heroicons CDN.
Animations should be flashy, but usability is top priority. Ensure text is perfectly readable on all devices.

## Design Style Instructions (Based on Swipe Scores)
Determine design style based on the following scores:
${scoresText}

## Page Content Information
### Service Information
- Service Name: ${projectData.service_name || ''}
- Service Content: ${projectData.service_description || ''}
- Main Copy: ${projectData.main_copy || 'Generate impactful catchphrase'}
- CTA Button Text: ${projectData.cta_text || 'Get Started'}
- Redirect URL: ${projectData.redirect_url || ''}
- Service Achievements: ${projectData.service_achievements || ''}

### Company/Personal Information
- Company Name: ${profileData.company_name || ''}
- Company Achievements: ${profileData.company_achievements || ''}
- Contact: ${profileData.contact_info || ''}
- Personal Name: ${profileData.personal_name || ''}
- Profile: ${profileData.personal_bio || ''}
- Achievements: ${profileData.achievements || ''}

### Custom Code
${projectData.custom_head ? 'Custom head content: ' + projectData.custom_head : ''}
${projectData.custom_body ? 'Custom body content: ' + projectData.custom_body : ''}

## Page Configuration by Purpose
${projectData.purpose === 'product' ? 'Product sales page configuration: Product introduction that increases purchase desire, price, features' : ''}
${projectData.purpose === 'service' ? 'Service introduction page configuration: Service value, benefits, case studies' : ''}
${projectData.purpose === 'brand' ? 'Corporate brand LP configuration: Corporate philosophy, achievements, reliability' : ''}
${projectData.purpose === 'lead' ? 'Document request page configuration: Document value, reason for free provision' : ''}
${projectData.purpose === 'event' ? 'Event recruitment page configuration: Event details, participation benefits, date and location' : ''}

## Page Content Information (*Absolutely No Omissions)
- [Editable information in project prompts]
  - Service name
  - Redirect URL
- [Information for direct editing in project prompts]

---

# 🎨 Design Specifications

## First View Specifications
### 🔴 Important Constraints (Reconfirmation)
- **Header**: position: absolute + completely transparent
- **Service Name**: Upper left placement
- **CTA**: Must be displayed in first view on both PC and SP
- **Animation**: Background only (content is static)

### Image Masking
- Semi-transparent overlay (50%-70% transparency)
- Text visibility is top priority

## Background Animation
- JavaScript implementation
- Full page support

## Responsive Typography
### Adopt Fluid Typography (clamp() function required)

#### Main Catchphrase (h1)
\`\`\`css
font-size: clamp(48px, 8vw, 72px); /* PC */
font-size: clamp(28px, 8vw, 44px); /* SP */
line-height: 1.05;
font-weight: 600;
letter-spacing: -0.02em;
background: linear-gradient(90deg, #0066CC 0%, #8A2BE2 50%, #FF6600 100%);
\`\`\`

#### Sub Catchphrase (h2)
\`\`\`css
font-size: clamp(16px, 3vw, 22px); /* PC */
font-size: clamp(14px, 4vw, 18px); /* SP */
line-height: 1.3;
color: #A1A1A6;
font-weight: 400;
\`\`\`

#### Body/Description Text (p)
\`\`\`css
font-size: clamp(18px, 2.5vw, 24px); /* PC */
font-size: clamp(16px, 3.5vw, 20px); /* SP */
line-height: 1.5;
color: #F2F2F7;
max-width: 600px; /* Center alignment */
\`\`\`

#### Caption/Note
\`\`\`css
font-size: clamp(14px, 2vw, 16px); /* PC */
font-size: clamp(12px, 3vw, 14px); /* SP */
line-height: 1.4;
color: #8E8E93;
\`\`\`

#### CTA Button Text
\`\`\`css
font-size: clamp(16px, 2vw, 18px); /* PC */
font-size: clamp(16px, 3vw, 18px); /* SP */
font-weight: 600;
white-space: nowrap; /* Always display in one line */
\`\`\`

## Responsive Rules
### Breakpoints
- 320px-768px: Mobile optimization
- 769px-1024px: Tablet optimization
- 1025px+: Desktop optimization

### Text Processing
- Apply \`overflow-wrap: break-word\` to all text

#### Visual Balance and Line Length
- Make the number of characters in each line as even as possible
- Avoid continuous lines that are too short or extremely long
- Avoid single words or particles of 2 full-width characters or less on a single line as much as possible

#### Implementation Priority
1. Combination of CSS \`word-break: keep-all\` + \`overflow-wrap: break-word\`
2. Explicitly insert \`<br>\` tags if unnatural line breaks occur (avoid overuse)
3. Apply \`white-space: nowrap\` so specific words or phrases are not split

### Line Length
- Line length of each text block in range that maximizes readability (about 50-75 half-width characters)
- Set \`max-width\` as needed

### Accessibility
- Minimum font size on mobile is 14px or more (compliance with accessibility guidelines)

## Padding
### Mobile Display
- Minimum side (left and right) padding (16px or 4vw)
- Characters and images displayed as large as possible on smartphone screens

### Between Sections
- Clear visual separation of information groups with vertical padding

## Visual Separation of Clickable and Non-clickable Elements
### Only Clickable Elements (CTA buttons, etc.)
- Shadow (box-shadow)
- Clear background color
- Clear border
- Large rounded corners (border-radius close to 50%)
- Combination of the above

### Non-clickable Text Blocks and Information Display Elements
- Do not use any of the above "button-like" designs
- Background color integrated with section background color or transparent

---

# 🔗 CTA Button/Link Specifications

## 🚨 Important Constraints (Third Confirmation)
- **All CTA buttons are for external URL guidance only**
- **Open in same tab setting**
- **Do not implement any form functionality**
- **Do not set any links to other pages**
- **Complete all information within one page**
- **Only one CTA button**

---

# 📄 Footer Specifications

## Required Elements
- Privacy Policy (modal window display)
- Specified Commercial Transaction Act (modal window display)
- ©[Dynamic update copyright display][company name] All Rights Reserved.

---

# 🎯 Other Design Rules

## Basic Rules
- No element in the LP should exceed the width (horizontal scroll occurrence prohibited)
- Do not add shadows to frames of non-clickable block elements
- Colors used for CTA buttons should not be used elsewhere in the LP except for CTA buttons
- Implement FAQ section in accordion format
- Text and background contrast ratio must meet WCAG standards
- Description with structured markup

---

# 🎨 Icon/Visual Element Selection Rules

## Basic Policy
- Use only visual elements that completely match the site's tone & manner, target audience, and industry characteristics
- Unicode emoji usage prohibited

## Industry/Service-specific Icon Guidelines
### BtoB/Consulting/Finance/Legal/Medical
- SVG icons (minimal design like Heroicons, Feather Icons)
- Outline style, monotone base
- Font Awesome Pro business icons
- Do not use any emojis

### BtoC/Retail/Service
- Moderately colorful SVG icons
- Solid style acceptable
- Icons matched to brand colors

### Entertainment/Creative
- Colorful icons, illustrations acceptable
- Emoji usage acceptable (but maintain consistency)

## Implementation Method Priority
1. Custom icons with SVG mask (mask-image)
2. Icon fonts like Font Awesome
3. Inline SVG
4. Emojis (casual only)

---

# 🔍 SEO×AIO Optimization Implementation

## Basic SEO Elements (Required)
- Title tag in "[Service Name] | [Value Proposition Keyword]" format within 32 characters, clearly reflecting search intent
- Meta description 120-160 characters with flow of "[Problem] → [Solution] → [Result]" for call to action
- H1 only one including service name + main value, H2-H6 hierarchical structure aligned with search intent
- Set canonical URL to prevent duplicate content
- Alt attributes for all images (product images in "[Product Name] showing [Feature]" format)

## Structured Data Implementation (AI Understanding Promotion)
- Implement WebPage schema + LP type-specific schema (Product/Service/Event/Organization) with JSON-LD
- Structure FAQ with microdata, clearly distinguish questions and answers
- Structure procedures/processes with HowTo schema (including number of steps, required time)
- Structure numerical data with Statistic schema (including source, update date)
- Define technical terms with DefinedTerm schema
- Describe contact information with structured data

## Technical SEO Implementation
### Core Web Vitals Support
- Deliver images in WebP format, width/height attributes required
- Lazy load images with loading="lazy"
- Preload/preconnect settings for important resources

---

# ✅ Final Checklist Before Implementation Completion

## [Required Confirmation Items]
- [ ] Is header position: absolute and transparent?
- [ ] Is service name placed in upper left?
- [ ] Are there no external links? (All button elements?)
- [ ] Are CTA buttons for external URL guidance only?
- [ ] Is form functionality not implemented?
- [ ] Is navigation to other pages completely prohibited?
- [ ] Is it the required HTML structure (CSS in head, HTML in body, JS in script)?
- [ ] Is responsive typography correctly implemented?
- [ ] Is it designed to prevent horizontal scrolling?
- [ ] Does it comply with accessibility guidelines?
- [ ] Are Unicode emojis not used at all?
- [ ] Are industry characteristics and constraints checked with highest priority?
`

  return DEFAULT_PROMPT
}
```

### 3. Create Generation API Endpoint

#### 3.1 Generation API Route (`src/app/api/projects/generate/route.ts`)
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateLandingPage } from '@/lib/gemini/client'
import { buildLandingPagePrompt } from '@/utils/promptBuilder'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId } = await request.json()
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 })
    }

    // Check regeneration limits
    const today = new Date().toISOString().split('T')[0]
    const { data: usage } = await supabase
      .from('regeneration_usage')
      .select('count')
      .eq('user_id', user.id)
      .eq('date', today)
      .single()

    // Get user's subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan_type')
      .eq('user_id', user.id)
      .single()

    const limit = subscription?.plan_type === 'plus' ? 50 : 10
    const currentCount = usage?.count || 0

    if (currentCount >= limit) {
      return NextResponse.json(
        { error: 'Daily generation limit reached', code: 'GENERATION_LIMIT_EXCEEDED' },
        { status: 429 }
      )
    }

    // Get project data
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // Build prompt
    const prompt = buildLandingPagePrompt(
      project,
      profile || {},
      project.swipe_scores as any
    )

    // Generate HTML with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 90000) // 90 seconds

    try {
      const generatedHtml = await generateLandingPage(prompt)
      clearTimeout(timeoutId)

      // Save generated HTML
      const { error: updateError } = await supabase
        .from('projects')
        .update({
          generated_html: generatedHtml,
          regenerate_count: project.regenerate_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)

      if (updateError) throw updateError

      // Update usage count
      await supabase
        .from('regeneration_usage')
        .upsert({
          user_id: user.id,
          date: today,
          count: currentCount + 1
        })

      return NextResponse.json({
        success: true,
        html: generatedHtml,
        remainingGenerations: limit - currentCount - 1
      })

    } catch (error: any) {
      clearTimeout(timeoutId)
      
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Generation timeout', code: 'GENERATION_TIMEOUT' },
          { status: 504 }
        )
      }
      
      throw error
    }

  } catch (error: any) {
    console.error('Generation error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to generate landing page',
        code: 'GENERATION_FAILED',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
```

### 4. Create Regeneration Hook

#### 4.1 Regeneration Hook (`src/hooks/useRegenerate.ts`)
```typescript
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface RegenerateOptions {
  onSuccess?: (html: string) => void
  onError?: (error: any) => void
}

export function useRegenerate(projectId: string, options?: RegenerateOptions) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>(null)

  const regenerate = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/projects/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed')
      }

      options?.onSuccess?.(data.html)
      router.refresh()
      
      return data
    } catch (err: any) {
      setError(err.message)
      options?.onError?.(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    regenerate,
    loading,
    error,
  }
}
```

### 5. Create Error Modal Component

#### 5.1 Modal Component (`src/components/ui/Modal.tsx`)
```typescript
'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Button } from './Button'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children?: React.ReactNode
  actions?: {
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary' | 'gradient'
  }[]
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  actions,
}: ModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  {title}
                </Dialog.Title>
                
                {description && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">{description}</p>
                  </div>
                )}

                {children && <div className="mt-4">{children}</div>}

                {actions && (
                  <div className="mt-6 flex gap-3 justify-end">
                    {actions.map((action, index) => (
                      <Button
                        key={index}
                        variant={action.variant || 'primary'}
                        onClick={action.onClick}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
```

Install Headless UI:
```bash
npm install @headlessui/react
```

### 6. Create Toast Notification Component

#### 6.1 Toast Component (`src/components/ui/Toast.tsx`)
```typescript
'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  isVisible: boolean
  onClose: () => void
  duration?: number
}

export function Toast({ message, type, isVisible, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  const colors = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  }

  const icons = {
    success: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 z-50"
        >
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${colors[type]} shadow-lg`}>
            {icons[type]}
            <p className="text-sm font-medium">{message}</p>
            <button
              onClick={onClose}
              className="ml-4 text-current opacity-50 hover:opacity-100"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

### 7. Create Error Handling Utilities

#### 7.1 Error Messages (`src/utils/errorMessages.ts`)
```typescript
export const errorMessages: Record<string, string> = {
  GENERATION_LIMIT_EXCEEDED: 'You have reached your daily generation limit. Please upgrade to Plus for more generations.',
  GENERATION_TIMEOUT: 'Generation took too long. Please try again with simpler content.',
  GENERATION_FAILED: 'Failed to generate landing page. Please try again.',
  INVALID_HTML: 'The generated content was invalid. Please try again.',
  UNAUTHORIZED: 'Please log in to continue.',
  PROJECT_NOT_FOUND: 'Project not found.',
}

export function getErrorMessage(code: string, fallback?: string): string {
  return errorMessages[code] || fallback || 'An unexpected error occurred.'
}
```

## Verification Checklist
- [ ] Gemini API client connects successfully
- [ ] Prompt builder creates complete prompts with all data
- [ ] Generation API endpoint authenticates users
- [ ] Daily generation limits are enforced correctly
- [ ] HTML is extracted properly from AI response
- [ ] Generated HTML is saved to database
- [ ] Regeneration count increments correctly
- [ ] Error handling shows appropriate messages
- [ ] Timeout works after 90 seconds
- [ ] Rollback preserves previous HTML on failure
- [ ] Usage tracking updates correctly

## Testing Guidelines

### 1. Test Prompt Generation
Create a test script to verify prompt output:
```typescript
// Test with sample data
const testPrompt = buildLandingPagePrompt(
  {
    service_name: 'Test Service',
    service_description: 'A test service',
    redirect_url: 'https://example.com',
    purpose: 'service'
  },
  {
    company_name: 'Test Company',
    company_achievements: '10 years in business'
  },
  {
    warm_score: 3,
    cool_score: 1,
    // ... other scores
  }
)
console.log(testPrompt)
```

### 2. Test Generation Limits
- Create a free user and verify 10 generation limit
- Create a plus user and verify 50 generation limit
- Verify limit resets at UTC midnight

### 3. Test Error Scenarios
- Invalid API key
- Network timeout
- Invalid HTML response
- Malformed prompt data

## Next Steps
After completing Phase 4, proceed to Phase 5: Project Editing, Preview, and Publishing