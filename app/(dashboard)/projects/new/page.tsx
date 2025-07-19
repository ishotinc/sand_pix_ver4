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