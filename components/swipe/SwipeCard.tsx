'use client'

import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useDrag } from '@use-gesture/react'
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
  const likeOpacity = useTransform(x, [0, 100], [0, 1])
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0])

  const bind = useDrag(({ down, movement: [mx, my], velocity: [vx] }) => {
    if (!isActive) return

    const trigger = Math.abs(vx) > 0.2
    const dir = mx > 0 ? 'right' : 'left'

    if (!down && trigger && Math.abs(mx) > 100) {
      setIsLeaving(true)
      // Animate card off screen
      animate(x, mx > 0 ? 300 : -300, {
        duration: 0.2,
        onComplete: () => onSwipe(dir)
      })
    } else {
      x.set(down ? mx : 0)
      y.set(down ? my : 0)
    }
  }, {
    filterTaps: true,
    rubberband: true
  })

  if (!isActive && !isLeaving) return null

  const dragProps = bind()

  return (
    <motion.div
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
      onPointerDown={dragProps.onPointerDown}
      onPointerMove={dragProps.onPointerMove}
      onPointerUp={dragProps.onPointerUp}
      onPointerCancel={dragProps.onPointerCancel}
      onPointerLeave={dragProps.onPointerLeave}
      onLostPointerCapture={dragProps.onLostPointerCapture}
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
              opacity: likeOpacity,
            }}
          >
            LIKE
          </motion.div>
          
          <motion.div
            className="absolute top-8 right-8 bg-red-500 text-white px-6 py-3 rounded-full font-bold text-2xl rotate-[20deg]"
            style={{
              opacity: nopeOpacity,
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