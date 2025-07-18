# Phase 5: Project Editing, Preview, and Publishing

## Duration: 4-6 days

## Objectives
- Create project list and management interface
- Build live preview functionality
- Implement direct editing capabilities
- Create publishing system
- Set up public page serving

## Prerequisites
- Phases 1-4 completed
- AI generation working
- Database schema ready

## Tasks

### 1. Create Project Types

#### 1.1 Project Types (`src/types/project.ts`)
```typescript
import { Database } from './database'

export type Project = Database['public']['Tables']['projects']['Row']
export type ProjectInsert = Database['public']['Tables']['projects']['Insert']
export type ProjectUpdate = Database['public']['Tables']['projects']['Update']

export interface ProjectWithSubscription extends Project {
  user_subscription?: {
    plan_type: 'free' | 'plus'
  }
}

export interface ProjectEditForm {
  main_copy: string
  cta_text: string
  service_achievements: string
  custom_head: string
  custom_body: string
}
```

### 2. Create Project List Page

#### 2.1 Projects List Page (`src/app/(dashboard)/projects/page.tsx`)
```typescript
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { Project } from '@/types/project'
import { formatDistanceToNow } from 'date-fns'

export default function ProjectsPage() {
  const router = useRouter()
  const supabase = createClient()
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<any>(null)

  useEffect(() => {
    if (user) {
      loadProjects()
      loadSubscription()
    }
  }, [user])

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error('Error loading projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSubscription = async () => {
    try {
      const { data } = await supabase
        .from('subscriptions')
        .select('plan_type')
        .eq('user_id', user!.id)
        .single()

      setSubscription(data)
    } catch (error) {
      console.error('Error loading subscription:', error)
    }
  }

  const handleDelete = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)

      if (error) throw error
      
      setProjects(projects.filter(p => p.id !== projectId))
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('Failed to delete project')
    }
  }

  const projectLimit = subscription?.plan_type === 'plus' ? 5 : 2
  const canCreateNew = projects.length < projectLimit

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)]">
      {/* Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-semibold">My Projects</h1>
            <div className="flex items-center gap-4">
              <Link href="/profile" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                Profile
              </Link>
              <Button
                onClick={() => supabase.auth.signOut()}
                variant="secondary"
                size="sm"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Your Landing Pages</h2>
              <p className="text-[var(--text-secondary)]">
                {projects.length} of {projectLimit} projects used
                {subscription?.plan_type === 'free' && ' (Free Plan)'}
                {subscription?.plan_type === 'plus' && ' (Plus Plan)'}
              </p>
            </div>
            <Button
              onClick={() => router.push('/projects/new')}
              variant="gradient"
              size="lg"
              disabled={!canCreateNew}
            >
              Create New Project
            </Button>
          </div>
          
          {!canCreateNew && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
              <p className="text-yellow-800">
                You've reached your project limit. 
                <Link href="/upgrade" className="ml-2 text-[var(--primary)] hover:underline">
                  Upgrade to Plus
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
            <p className="text-[var(--text-secondary)] mb-4">Create your first landing page</p>
            <Button
              onClick={() => router.push('/projects/new')}
              variant="gradient"
            >
              Get Started
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold truncate flex-1">
                      {project.service_name}
                    </h3>
                    {project.is_published && (
                      <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        Published
                      </span>
                    )}
                  </div>
                  
                  <p className="text-[var(--text-secondary)] text-sm mb-4 line-clamp-2">
                    {project.service_description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-[var(--text-tertiary)]">
                    <span>{formatDistanceToNow(new Date(project.created_at))} ago</span>
                    <span>{project.regenerate_count} generations</span>
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    <Button
                      onClick={() => router.push(`/projects/${project.id}`)}
                      variant="primary"
                      size="sm"
                      className="flex-1"
                    >
                      Edit
                    </Button>
                    {project.is_published && (
                      <Button
                        onClick={() => window.open(`/p/${project.id}`, '_blank')}
                        variant="secondary"
                        size="sm"
                      >
                        View
                      </Button>
                    )}
                    <Button
                      onClick={() => handleDelete(project.id)}
                      variant="secondary"
                      size="sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

Install date-fns:
```bash
npm install date-fns
```

### 3. Create Project Editor Components

#### 3.1 Preview Frame Component (`src/components/editor/PreviewFrame.tsx`)
```typescript
'use client'

import { useEffect, useRef } from 'react'

interface PreviewFrameProps {
  html: string
  className?: string
}

export function PreviewFrame({ html, className = '' }: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (iframeRef.current && html) {
      const iframe = iframeRef.current
      const doc = iframe.contentDocument || iframe.contentWindow?.document
      
      if (doc) {
        // Write HTML to iframe
        doc.open()
        doc.write(html)
        doc.close()

        // Add responsive viewport meta tag if not present
        if (!doc.querySelector('meta[name="viewport"]')) {
          const meta = doc.createElement('meta')
          meta.name = 'viewport'
          meta.content = 'width=device-width, initial-scale=1.0'
          doc.head.appendChild(meta)
        }

        // Inject preview styles
        const style = doc.createElement('style')
        style.textContent = `
          body {
            margin: 0;
            overflow-x: hidden;
          }
          /* Prevent links from navigating */
          a {
            pointer-events: none;
          }
        `
        doc.head.appendChild(style)
      }
    }
  }, [html])

  return (
    <iframe
      ref={iframeRef}
      className={`w-full h-full bg-white ${className}`}
      title="Landing Page Preview"
      sandbox="allow-scripts allow-same-origin"
    />
  )
}
```

#### 3.2 Project Editor Component (`src/components/editor/ProjectEditor.tsx`)
```typescript
'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Toast } from '@/components/ui/Toast'
import { ProjectEditForm } from '@/types/project'

interface ProjectEditorProps {
  project: any
  onSave: (data: ProjectEditForm) => Promise<void>
  onRegenerate: () => void
  isRegenerating?: boolean
}

export function ProjectEditor({ project, onSave, onRegenerate, isRegenerating }: ProjectEditorProps) {
  const [saving, setSaving] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState({ type: 'success' as any, text: '' })
  
  const { register, handleSubmit, reset } = useForm<ProjectEditForm>({
    defaultValues: {
      main_copy: project.main_copy || '',
      cta_text: project.cta_text || '',
      service_achievements: project.service_achievements || '',
      custom_head: project.custom_head || '',
      custom_body: project.custom_body || '',
    }
  })

  useEffect(() => {
    reset({
      main_copy: project.main_copy || '',
      cta_text: project.cta_text || '',
      service_achievements: project.service_achievements || '',
      custom_head: project.custom_head || '',
      custom_body: project.custom_body || '',
    })
  }, [project, reset])

  const onSubmit = async (data: ProjectEditForm) => {
    setSaving(true)
    try {
      await onSave(data)
      setToastMessage({ type: 'success', text: 'Project saved successfully!' })
      setShowToast(true)
    } catch (error) {
      setToastMessage({ type: 'error', text: 'Failed to save project' })
      setShowToast(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Direct Edit Elements</h3>
            <Button
              type="button"
              onClick={onRegenerate}
              variant="secondary"
              size="sm"
              loading={isRegenerating}
            >
              Regenerate
            </Button>
          </div>
          
          <div className="space-y-4">
            <Input
              label="Main Copy"
              placeholder="Your compelling headline here..."
              {...register('main_copy')}
            />
            
            <Input
              label="CTA Button Text"
              placeholder="Get Started"
              {...register('cta_text')}
            />
            
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Service Achievements
              </label>
              <textarea
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                rows={3}
                placeholder="List your key achievements..."
                {...register('service_achievements')}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Custom &lt;head&gt; Tag
              </label>
              <textarea
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent font-mono text-sm"
                rows={3}
                placeholder="<!-- Custom meta tags, scripts, etc. -->"
                {...register('custom_head')}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Custom &lt;body&gt; Tag
              </label>
              <textarea
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent font-mono text-sm"
                rows={3}
                placeholder="<!-- Custom scripts, analytics, etc. -->"
                {...register('custom_body')}
              />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          variant="gradient"
          size="lg"
          loading={saving}
          className="w-full"
        >
          Save Changes
        </Button>
      </form>

      <Toast
        message={toastMessage.text}
        type={toastMessage.type}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </>
  )
}
```

### 4. Create Project Edit Page

#### 4.1 Project Edit Page (`src/app/(dashboard)/projects/[id]/page.tsx`)
```typescript
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { PreviewFrame } from '@/components/editor/PreviewFrame'
import { ProjectEditor } from '@/components/editor/ProjectEditor'
import { useRegenerate } from '@/hooks/useRegenerate'
import { useAuth } from '@/hooks/useAuth'
import { Project, ProjectEditForm } from '@/types/project'

export default function ProjectEditPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const { user } = useAuth()
  
  const projectId = params.id as string
  const shouldGenerate = searchParams.get('generate') === 'true'
  
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [subscription, setSubscription] = useState<any>(null)
  
  const { regenerate, loading: regenerating } = useRegenerate(projectId, {
    onSuccess: (html) => {
      setProject(prev => prev ? { ...prev, generated_html: html } : null)
    },
    onError: (error) => {
      if (error.message.includes('limit')) {
        setShowLimitModal(true)
      }
    }
  })

  useEffect(() => {
    if (user && projectId) {
      loadProject()
      loadSubscription()
    }
  }, [user, projectId])

  useEffect(() => {
    if (shouldGenerate && project && !project.generated_html) {
      regenerate()
    }
  }, [shouldGenerate, project])

  const loadProject = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', user!.id)
        .single()

      if (error) throw error
      setProject(data)
    } catch (error) {
      console.error('Error loading project:', error)
      router.push('/projects')
    } finally {
      setLoading(false)
    }
  }

  const loadSubscription = async () => {
    try {
      const { data } = await supabase
        .from('subscriptions')
        .select('plan_type')
        .eq('user_id', user!.id)
        .single()

      setSubscription(data)
    } catch (error) {
      console.error('Error loading subscription:', error)
    }
  }

  const handleSave = async (data: ProjectEditForm) => {
    if (!project) return

    const { error } = await supabase
      .from('projects')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)

    if (error) throw error
    
    setProject({ ...project, ...data })
  }

  const handlePublish = async () => {
    if (!project) return

    const newStatus = !project.is_published
    
    const { error } = await supabase
      .from('projects')
      .update({
        is_published: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)

    if (!error) {
      setProject({ ...project, is_published: newStatus })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
      </div>
    )
  }

  if (!project) {
    return null
  }

  const isFreeUser = !subscription || subscription.plan_type === 'free'

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)]">
      {/* Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link href="/projects" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                ← Back to Projects
              </Link>
              <h1 className="text-xl font-semibold">{project.service_name}</h1>
            </div>
            <div className="flex items-center gap-3">
              {project.is_published && (
                <Button
                  onClick={() => window.open(`/p/${project.id}`, '_blank')}
                  variant="secondary"
                  size="sm"
                >
                  View Live
                </Button>
              )}
              <Button
                onClick={handlePublish}
                variant={project.is_published ? 'secondary' : 'gradient'}
                size="sm"
              >
                {project.is_published ? 'Unpublish' : 'Publish'}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Editor Panel */}
        <div className="w-1/3 bg-white overflow-y-auto">
          <div className="p-6">
            <ProjectEditor
              project={project}
              onSave={handleSave}
              onRegenerate={regenerate}
              isRegenerating={regenerating}
            />
          </div>
        </div>

        {/* Preview Panel */}
        <div className="flex-1 bg-gray-100 p-6">
          <div className="h-full bg-white rounded-lg shadow-lg overflow-hidden">
            {project.generated_html ? (
              <PreviewFrame html={project.generated_html} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500 mb-4">No landing page generated yet</p>
                  <Button
                    onClick={regenerate}
                    variant="gradient"
                    loading={regenerating}
                  >
                    Generate Landing Page
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Free Plan Notice */}
          {isFreeUser && project.is_published && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                Free plan: Your landing page will display a small Sandpix logo. 
                <Link href="/upgrade" className="ml-2 text-[var(--primary)] hover:underline">
                  Upgrade to remove
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Limit Reached Modal */}
      <Modal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        title="Generation Limit Reached"
        description="You've reached your daily generation limit."
        actions={[
          {
            label: 'Upgrade to Plus',
            onClick: () => router.push('/upgrade'),
            variant: 'gradient'
          },
          {
            label: 'Close',
            onClick: () => setShowLimitModal(false),
            variant: 'secondary'
          }
        ]}
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Free plan: 10 generations per day<br />
            Plus plan: 50 generations per day
          </p>
        </div>
      </Modal>
    </div>
  )
}
```

### 5. Create Public Page

#### 5.1 Public Landing Page (`src/app/p/[id]/page.tsx`)
```typescript
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function PublicLandingPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()
  
  // Get project (no auth required for public pages)
  const { data: project } = await supabase
    .from('projects')
    .select('generated_html, user_id')
    .eq('id', params.id)
    .single()

  if (!project || !project.generated_html) {
    notFound()
  }

  // Check if user is on free plan
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan_type')
    .eq('user_id', project.user_id)
    .single()

  const isFreeUser = !subscription || subscription.plan_type === 'free'
  
  let html = project.generated_html

  // Inject logo for free users
  if (isFreeUser) {
    const logoHtml = `
      <div style="position: fixed; bottom: 20px; right: 20px; z-index: 9999; background: white; padding: 10px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <a href="https://sandpix.com" target="_blank" style="display: flex; align-items: center; text-decoration: none; color: #333; font-size: 14px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style="margin-right: 8px;">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#4285F4"/>
            <path d="M2 17L12 22L22 17V7L12 12L2 7V17Z" fill="#EA4335"/>
          </svg>
          Powered by Sandpix
        </a>
      </div>
    `
    
    // Insert before closing body tag
    html = html.replace('</body>', `${logoHtml}</body>`)
  }

  return <div dangerouslySetInnerHTML={{ __html: html }} />
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()
  
  const { data: project } = await supabase
    .from('projects')
    .select('service_name, service_description')
    .eq('id', params.id)
    .single()

  if (!project) {
    return {
      title: 'Not Found',
    }
  }

  return {
    title: project.service_name,
    description: project.service_description,
  }
}
```

### 6. Create 404 Page

#### 6.1 Not Found Page (`src/app/not-found.tsx`)
```typescript
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-secondary)]">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-[var(--text-secondary)] mb-8">
          The page you're looking for doesn't exist or has been removed.
        </p>
        <Link href="/">
          <Button variant="gradient">
            Go Home
          </Button>
        </Link>
      </div>
    </div>
  )
}
```

### 7. Create API Route for Project Updates

#### 7.1 Project Update API (`src/app/api/projects/[id]/route.ts`)
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updates = await request.json()
    
    // Update project
    const { data, error } = await supabase
      .from('projects')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete project
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    )
  }
}
```

## Verification Checklist
- [ ] Project list displays all user projects
- [ ] Project count shows correctly with plan limits
- [ ] Create new project button disabled at limit
- [ ] Project cards show name, description, status
- [ ] Edit button navigates to project editor
- [ ] Delete button removes project with confirmation
- [ ] Preview frame displays generated HTML safely
- [ ] Editor form saves all fields correctly
- [ ] Regenerate button triggers new generation
- [ ] Publish/Unpublish toggle works
- [ ] Public page accessible at /p/[id]
- [ ] Free plan shows Sandpix logo
- [ ] 404 page shows for deleted projects
- [ ] View Live button opens public page

## Next Steps
After completing Phase 5, proceed to Phase 6: Monetization & Plan Enforcement