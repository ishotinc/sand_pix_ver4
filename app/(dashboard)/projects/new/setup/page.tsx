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
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
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