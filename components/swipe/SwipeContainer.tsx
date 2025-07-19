'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { SwipeCard } from './SwipeCard'
import { useSwipeStore } from '@/store/swipeStore'
import { SwipeConfig } from '@/types/swipe'

export function SwipeContainer() {
  const router = useRouter()
  const [config, setConfig] = useState<SwipeConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastAction, setLastAction] = useState<string>('')
  const containerRef = useRef<HTMLDivElement>(null)
  const { currentIndex, addSwipeResult, calculateFinalScores } = useSwipeStore()

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

    // Announce to screen readers
    setLastAction(`Card ${currentImage.title} swiped ${direction}`)

    // Check if all swipes completed
    if (currentIndex === config.images.length - 1) {
      calculateFinalScores(config.images)
      // Navigate to project creation with scores
      router.push('/projects/new/setup')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      handleSwipe('left')
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      handleSwipe('right')
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
      <div 
        ref={containerRef}
        className="flex items-center justify-center min-h-screen px-4"
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="region"
        aria-label="Swipeable cards"
        aria-roledescription="swipeable card deck"
      >
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
            aria-label="Skip card"
          >
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <button
            onClick={handleLike}
            className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
            aria-label="Like card"
          >
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Screen reader announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {lastAction}
      </div>
    </div>
  )
}