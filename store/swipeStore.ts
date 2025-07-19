import { create } from 'zustand'
import { SwipeResult, SwipeScores, SwipeImage } from '@/types/swipe'

interface SwipeState {
  currentIndex: number
  swipeResults: SwipeResult[]
  finalScores: SwipeScores | null
  
  addSwipeResult: (result: SwipeResult) => void
  calculateFinalScores: (images: SwipeImage[]) => SwipeScores
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
            scores[key as keyof SwipeScores] += image.scores[key as keyof SwipeScores]
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