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