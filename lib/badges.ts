import type { Badge } from './storage'

export interface BadgeDef {
  id: string
  label: string
  emoji: string
  color: string
  bg: string
  check: (score: number, correct: number, total: number, streak: number, timeBonus: number) => boolean
}

export const BADGE_DEFS: BadgeDef[] = [
  { id: 'perfect', label: 'Perfect score', emoji: '🏆', color: '#92400E', bg: '#FEF3C7',
    check: (_, correct, total) => correct === total },
  { id: 'star', label: 'Star player', emoji: '⭐', color: '#1E3A8A', bg: '#DBEAFE',
    check: (_, correct, total) => correct / total >= 0.75 },
  { id: 'streak', label: 'Hot streak', emoji: '🔥', color: '#7C2D12', bg: '#FEE2E2',
    check: (_, __, ___, streak) => streak >= 4 },
  { id: 'expert', label: 'Topic expert', emoji: '🎓', color: '#065F46', bg: '#D1FAE5',
    check: (_, correct) => correct >= 6 },
  { id: 'speedster', label: 'Speedster', emoji: '⚡', color: '#4C1D95', bg: '#EDE9FE',
    check: (_, __, ___, ____, timeBonus) => timeBonus >= 40 },
  { id: 'first', label: 'Quiz complete', emoji: '🌟', color: '#1F2937', bg: '#F3F4F6',
    check: () => true },
]

export function computeBadges(score: number, correct: number, total: number, streak: number, timeBonus: number, topic: string, playerAge: number): Badge[] {
  const now = new Date().toISOString()
  return BADGE_DEFS
    .filter(b => b.check(score, correct, total, streak, timeBonus))
    .map(b => ({ id: b.id + '_' + Date.now(), label: b.label, emoji: b.emoji, earnedAt: now, topic, playerAge }))
}
