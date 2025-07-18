# Phase 6: Monetization & Plan Enforcement

## Duration: 5-8 days

## Objectives
- Integrate Stripe payment processing
- Implement subscription management
- Enforce plan limits (projects and regenerations)
- Create upgrade flow with modal prompts
- Set up webhook handling for payment events

## Prerequisites
- Phases 1-5 completed
- Stripe account with products configured
- Test and production API keys

## Tasks

### 1. Configure Stripe Products

#### 1.1 Stripe Dashboard Setup
1. Create a product called "Sand-Pix Plus"
2. Set price to $20/month
3. Note the Price ID (starts with `price_`)
4. Configure webhook endpoint URL: `https://yourdomain.com/api/stripe/webhook`
5. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`

### 2. Create Stripe Client Configuration

#### 2.1 Stripe Server Client (`src/lib/stripe/server.ts`)
```typescript
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
})

export async function createCheckoutSession(
  userId: string,
  customerEmail: string,
  priceId: string
) {
  const session = await stripe.checkout.sessions.create({
    customer_email: customerEmail,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/projects?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/projects`,
    metadata: {
      userId,
    },
  })

  return session
}

export async function createPortalSession(customerId: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/projects`,
  })

  return session
}
```

#### 2.2 Stripe Client Component (`src/lib/stripe/client.ts`)
```typescript
import { loadStripe } from '@stripe/stripe-js'

export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)
```

### 3. Create Subscription Management Hooks

#### 3.1 Subscription Hook (`src/hooks/useSubscription.ts`)
```typescript
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './useAuth'

interface Subscription {
  plan_type: 'free' | 'plus'
  status: string
  current_period_end: string | null
  stripe_customer_id: string | null
}

export function useSubscription() {
  const { user } = useAuth()
  const supabase = createClient()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadSubscription()
    } else {
      setLoading(false)
    }
  }, [user])

  const loadSubscription = async () => {
    try {
      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user!.id)
        .single()

      setSubscription(data || { plan_type: 'free', status: 'active' } as any)
    } catch (error) {
      // If no subscription exists, user is on free plan
      setSubscription({ plan_type: 'free', status: 'active' } as any)
    } finally {
      setLoading(false)
    }
  }

  const checkProjectLimit = async (): Promise<boolean> => {
    if (!user) return false

    const { count } = await supabase
      .from('projects')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id)

    const limit = subscription?.plan_type === 'plus' ? 5 : 2
    return (count || 0) < limit
  }

  const checkRegenerationLimit = async (): Promise<{
    allowed: boolean
    remaining: number
    limit: number
  }> => {
    if (!user) return { allowed: false, remaining: 0, limit: 0 }

    const today = new Date().toISOString().split('T')[0]
    const { data: usage } = await supabase
      .from('regeneration_usage')
      .select('count')
      .eq('user_id', user.id)
      .eq('date', today)
      .single()

    const limit = subscription?.plan_type === 'plus' ? 50 : 10
    const currentCount = usage?.count || 0
    
    return {
      allowed: currentCount < limit,
      remaining: Math.max(0, limit - currentCount),
      limit
    }
  }

  return {
    subscription,
    loading,
    isPlusUser: subscription?.plan_type === 'plus',
    checkProjectLimit,
    checkRegenerationLimit,
    refresh: loadSubscription,
  }
}
```

### 4. Create Upgrade Components

#### 4.1 Upgrade Modal Component (`src/components/UpgradeModal.tsx`)
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  reason: 'project_limit' | 'regeneration_limit'
}

export function UpgradeModal({ isOpen, onClose, reason }: UpgradeModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
      })
      
      const { url } = await response.json()
      
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Upgrade error:', error)
      alert('Failed to start upgrade process')
    } finally {
      setLoading(false)
    }
  }

  const benefits = [
    '5 projects (vs 2)',
    '50 daily generations (vs 10)',
    'No Sandpix logo on published pages',
    'Priority support',
    'Cancel anytime',
  ]

  const title = reason === 'project_limit' 
    ? 'Project Limit Reached' 
    : 'Daily Generation Limit Reached'

  const description = reason === 'project_limit'
    ? "You've reached the maximum number of projects for the Free plan."
    : "You've used all your generations for today on the Free plan."

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
    >
      <div className="mt-6">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Upgrade to Plus</h3>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-3xl font-bold">$20</span>
            <span className="text-gray-600">/month</span>
          </div>
          
          <ul className="space-y-2">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleUpgrade}
            variant="gradient"
            size="lg"
            loading={loading}
            className="flex-1"
          >
            Upgrade Now
          </Button>
          <Button
            onClick={onClose}
            variant="secondary"
            size="lg"
            className="flex-1"
          >
            Maybe Later
          </Button>
        </div>
      </div>
    </Modal>
  )
}
```

#### 4.2 Pricing Page (`src/app/upgrade/page.tsx`)
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'

export default function UpgradePage() {
  const router = useRouter()
  const { user } = useAuth()
  const { subscription, isPlusUser } = useSubscription()
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
      })
      
      const { url } = await response.json()
      
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Upgrade error:', error)
      alert('Failed to start upgrade process')
    } finally {
      setLoading(false)
    }
  }

  const handleManageSubscription = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      })
      
      const { url } = await response.json()
      
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Portal error:', error)
      alert('Failed to open billing portal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/projects" className="text-xl font-semibold">
              Sand-Pix
            </Link>
            <Link href="/projects" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
              Back to Projects
            </Link>
          </div>
        </div>
      </nav>

      {/* Pricing */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600">
            Start free, upgrade when you need more
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Free</h2>
            <div className="mb-6">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-gray-600">/month</span>
            </div>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>2 projects</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>10 generations per day</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Sandpix logo on pages</span>
              </li>
            </ul>

            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              disabled
            >
              Current Plan
            </Button>
          </div>

          {/* Plus Plan */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-[var(--primary)] relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[var(--primary)] text-white px-4 py-1 rounded-full text-sm font-medium">
              POPULAR
            </div>
            
            <h2 className="text-2xl font-bold mb-4">Plus</h2>
            <div className="mb-6">
              <span className="text-4xl font-bold">$20</span>
              <span className="text-gray-600">/month</span>
            </div>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">5 projects</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">50 generations per day</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">No logo on pages</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Priority support</span>
              </li>
            </ul>

            {isPlusUser ? (
              <Button
                onClick={handleManageSubscription}
                variant="secondary"
                size="lg"
                loading={loading}
                className="w-full"
              >
                Manage Subscription
              </Button>
            ) : (
              <Button
                onClick={handleUpgrade}
                variant="gradient"
                size="lg"
                loading={loading}
                className="w-full"
              >
                Upgrade to Plus
              </Button>
            )}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <details className="bg-white rounded-lg p-6">
              <summary className="font-semibold cursor-pointer">Can I cancel anytime?</summary>
              <p className="mt-4 text-gray-600">
                Yes! You can cancel your subscription at any time from your billing portal. 
                You'll continue to have access until the end of your billing period.
              </p>
            </details>
            
            <details className="bg-white rounded-lg p-6">
              <summary className="font-semibold cursor-pointer">What happens to my projects if I downgrade?</summary>
              <p className="mt-4 text-gray-600">
                Your existing projects remain accessible. However, you'll need to delete projects 
                to get below the free plan limit before creating new ones.
              </p>
            </details>
            
            <details className="bg-white rounded-lg p-6">
              <summary className="font-semibold cursor-pointer">Do generations reset daily?</summary>
              <p className="mt-4 text-gray-600">
                Yes, generation counts reset at midnight UTC every day for both free and plus plans.
              </p>
            </details>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### 5. Create API Routes

#### 5.1 Checkout API (`src/app/api/stripe/checkout/route.ts`)
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCheckoutSession } from '@/lib/stripe/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if already subscribed
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('plan_type')
      .eq('user_id', user.id)
      .single()

    if (existingSub?.plan_type === 'plus') {
      return NextResponse.json({ error: 'Already subscribed' }, { status: 400 })
    }

    // Create checkout session
    const session = await createCheckoutSession(
      user.id,
      user.email!,
      process.env.NEXT_PUBLIC_STRIPE_PLUS_PRICE_ID!
    )

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
```

#### 5.2 Portal API (`src/app/api/stripe/portal/route.ts`)
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createPortalSession } from '@/lib/stripe/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get customer ID
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 })
    }

    // Create portal session
    const session = await createPortalSession(subscription.stripe_customer_id)

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Portal error:', error)
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    )
  }
}
```

#### 5.3 Webhook Handler (`src/app/api/stripe/webhook/route.ts`)
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')!

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any
        const userId = session.metadata.userId
        const customerId = session.customer

        // Create or update subscription record
        await supabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            plan_type: 'plus',
            stripe_customer_id: customerId,
            stripe_subscription_id: session.subscription,
            status: 'active',
            updated_at: new Date().toISOString(),
          })

        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as any
        
        // Update subscription status
        await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any
        
        // Downgrade to free plan
        await supabase
          .from('subscriptions')
          .update({
            plan_type: 'free',
            status: 'canceled',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)

        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any
        
        // Update subscription status
        await supabase
          .from('subscriptions')
          .update({
            status: 'past_due',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', invoice.customer)

        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
```

### 6. Update Project Creation with Limit Check

#### 6.1 Update New Project Page
Add limit checking to `src/app/(dashboard)/projects/new/setup/page.tsx`:

```typescript
// Add to imports
import { useSubscription } from '@/hooks/useSubscription'
import { UpgradeModal } from '@/components/UpgradeModal'

// Add to component
const { checkProjectLimit } = useSubscription()
const [showUpgradeModal, setShowUpgradeModal] = useState(false)

// Update onSubmit
const onSubmit = async (data: ProjectFormData) => {
  if (!user || !finalScores) return

  // Check project limit
  const canCreate = await checkProjectLimit()
  if (!canCreate) {
    setShowUpgradeModal(true)
    return
  }

  // ... rest of the function
}

// Add modal before closing div
<UpgradeModal
  isOpen={showUpgradeModal}
  onClose={() => setShowUpgradeModal(false)}
  reason="project_limit"
/>
```

### 7. Add Success Message After Upgrade

Update projects page to show success message:

```typescript
// In src/app/(dashboard)/projects/page.tsx
useEffect(() => {
  const upgraded = new URLSearchParams(window.location.search).get('upgraded')
  if (upgraded === 'true') {
    // Show success toast
    alert('Welcome to Sand-Pix Plus! You now have access to all premium features.')
    // Remove query param
    window.history.replaceState({}, '', '/projects')
  }
}, [])
```

## Verification Checklist
- [ ] Stripe products and prices configured correctly
- [ ] Checkout session creates successfully
- [ ] Payment redirects to Stripe checkout
- [ ] Webhook receives events from Stripe
- [ ] Subscription record updates in database
- [ ] Plan limits enforced for projects (2 vs 5)
- [ ] Plan limits enforced for regenerations (10 vs 50)
- [ ] Upgrade modal shows at limits
- [ ] Billing portal accessible for Plus users
- [ ] Downgrade handled correctly
- [ ] Free plan shows logo on public pages
- [ ] Plus plan removes logo
- [ ] Payment failures handled gracefully

## Testing Guidelines

### 1. Test Card Numbers
Use these Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires auth: `4000 0025 0000 3155`

### 2. Test Webhook Locally
Use Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### 3. Test Scenarios
1. **Free user hits project limit**: Should see upgrade modal
2. **Free user hits generation limit**: Should see upgrade modal
3. **Successful upgrade**: Should update database and redirect
4. **Cancel subscription**: Should downgrade to free
5. **Payment failure**: Should set status to past_due

## Security Considerations
1. Always verify webhook signatures
2. Check user authentication before processing payments
3. Use metadata to link Stripe customers to users
4. Never expose sensitive Stripe data to client
5. Implement proper error handling for all edge cases

## Next Steps
Congratulations! You've completed the Sand-Pix MVP implementation. 

### Post-MVP Considerations:
1. Add comprehensive error logging
2. Implement analytics tracking
3. Create admin dashboard
4. Add email notifications for subscription events
5. Implement the Alpha features from the requirements doc