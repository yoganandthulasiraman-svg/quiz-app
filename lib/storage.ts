export interface Badge {
  id: string
  label: string
  emoji: string
  earnedAt: string
  topic: string
  playerAge: number
}

export interface PlayerStats {
  totalQuizzes: number
  totalScore: number
  totalCorrect: number
  bestScore: number
  bestStreak: number
  badges: Badge[]
  recentTopics: string[]
}

export interface StorageData {
  players: {
    7: PlayerStats
    13: PlayerStats
  }
}

const DEFAULT_PLAYER: PlayerStats = {
  totalQuizzes: 0, totalScore: 0, totalCorrect: 0,
  bestScore: 0, bestStreak: 0, badges: [], recentTopics: [],
}

const KEY = 'quiz-challenge-v1'

function load(): StorageData {
  if (typeof window === 'undefined') return { players: { 7: { ...DEFAULT_PLAYER }, 13: { ...DEFAULT_PLAYER } } }
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { players: { 7: { ...DEFAULT_PLAYER }, 13: { ...DEFAULT_PLAYER } } }
    return JSON.parse(raw)
  } catch { return { players: { 7: { ...DEFAULT_PLAYER }, 13: { ...DEFAULT_PLAYER } } } }
}

function save(data: StorageData) {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function getPlayerStats(age: 7 | 13): PlayerStats {
  return load().players[age] ?? { ...DEFAULT_PLAYER }
}

export function saveQuizResult(age: 7 | 13, score: number, correct: number, streak: number, newBadges: Badge[], topic: string) {
  const data = load()
  const p = data.players[age] ?? { ...DEFAULT_PLAYER }
  p.totalQuizzes++
  p.totalScore += score
  p.totalCorrect += correct
  if (score > p.bestScore) p.bestScore = score
  if (streak > p.bestStreak) p.bestStreak = streak
  p.badges = [...p.badges, ...newBadges]
  p.recentTopics = [topic, ...p.recentTopics.filter(t => t !== topic)].slice(0, 6)
  data.players[age] = p
  save(data)
}

export function clearPlayerStats(age: 7 | 13) {
  const data = load()
  data.players[age] = { ...DEFAULT_PLAYER }
  save(data)
}
