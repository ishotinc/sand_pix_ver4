'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'

type ProfileData = {
  company_name: string
  company_achievements: string
  contact_info: string
  personal_name: string
  personal_bio: string
  achievements: string
}

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const { register, handleSubmit, reset } = useForm<ProfileData>()

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') throw error

        if (data) {
          reset(data)
        }
      } catch (error) {
        console.error('Error loading profile:', error)
      }
    }
    
    if (user) {
      loadProfile()
    }
  }, [user, supabase, reset])

  const onSubmit = async (data: ProfileData) => {
    if (!user) return

    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...data,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'An error occurred' })
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)]">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-semibold">Profile Settings</h1>
            <div className="flex items-center gap-4">
              <Link href="/projects" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                Projects
              </Link>
              <Button onClick={handleSignOut} variant="secondary" size="sm">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-6">Company & Personal Information</h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Company Name"
                placeholder="Your Company Ltd."
                {...register('company_name')}
              />
              
              <Input
                label="Contact Information"
                placeholder="contact@company.com"
                {...register('contact_info')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Company Achievements
              </label>
              <textarea
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                rows={3}
                placeholder="Founded in 2020, 50+ employees, 1000+ clients..."
                {...register('company_achievements')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Personal Name"
                placeholder="John Doe"
                {...register('personal_name')}
              />
              
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Personal Bio
                </label>
                <textarea
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  rows={3}
                  placeholder="10+ years experience in..."
                  {...register('personal_bio')}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Achievements & Certifications
              </label>
              <textarea
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                rows={3}
                placeholder="ISO certified, Award winner..."
                {...register('achievements')}
              />
            </div>

            {message && (
              <div className={`p-3 rounded-lg text-sm ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-700' 
                  : 'bg-red-50 text-[var(--error)]'
              }`}>
                {message.text}
              </div>
            )}

            <Button
              type="submit"
              variant="gradient"
              size="lg"
              loading={loading}
              className="w-full"
            >
              Save Profile
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}