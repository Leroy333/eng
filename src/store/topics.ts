import { createStore } from 'effector'

export interface Topic {
  id: string
  name: string
  icon: string
  emoji: string
}

export const $topics = createStore<Topic[]>([
  { id: 'music', name: 'music', icon: '🎧', emoji: '🎵' },
  { id: 'cinema', name: 'cinema', icon: '🎬', emoji: '🎭' },
  { id: 'travel', name: 'travel', icon: '🚂', emoji: '✈️' },
  { id: 'animals', name: 'animals', icon: '🐕', emoji: '🐾' },
  { id: 'hobby', name: 'hobby', icon: '🎮', emoji: '🎯' },
  { id: 'weather', name: 'weather', icon: '☁️', emoji: '🌤️' }
])
