'use client'
import { PlayerStats } from '@/lib/storage'

interface Props {
  onSelect: (age: 7 | 13) => void
  stats7: PlayerStats
  stats13: PlayerStats
}

export default function PlayerSelect({ onSelect, stats7, stats13 }: Props) {
  return (
    <div className="animate-slide-up">
      <div className="text-center mb-10">
        <h1 className="font-display text-5xl font-bold mb-3" style={{ color: '#E9D5FF' }}>
          Quiz Challenge
        </h1>
        <p className="text-lg" style={{ color: 'rgba(255,255,255,0.6)' }}>
          AI-powered quizzes on anything you love
        </p>
      </div>

      <p className="font-display text-xl text-center mb-6" style={{ color: 'rgba(255,255,255,0.7)' }}>
        Who's playing today?
      </p>

      <div className="grid grid-cols-2 gap-5 max-w-xl mx-auto">
        <PlayerCard
          name="Dhruv"
          emoji="⭐"
          color="#A78BFA"
          bgColor="rgba(124,58,237,0.15)"
          borderColor="rgba(167,139,250,0.4)"
          stats={stats7}
          onSelect={() => onSelect(7)}
        />
        <PlayerCard
          name="Diya"
          emoji="💡"
          color="#34D399"
          bgColor="rgba(5,150,105,0.15)"
          borderColor="rgba(52,211,153,0.4)"
          stats={stats13}
          onSelect={() => onSelect(13)}
        />
      </div>
    </div>
  )
}

function PlayerCard({ name, emoji, color, bgColor, borderColor, stats, onSelect }: {
  name: string, emoji: string, color: string,
  bgColor: string, borderColor: string, stats: PlayerStats, onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className="p-6 rounded-2xl text-center transition-all duration-200 hover:scale-105 active:scale-95"
      style={{ background: bgColor, border: `1.5px solid ${borderColor}` }}
    >
      <div className="text-5xl mb-3">{emoji}</div>
      <div className="font-display text-xl font-semibold mb-4" style={{ color }}>{name}</div>
      {stats.totalQuizzes > 0 && (
        <div className="space-y-1.5">
          <div className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {stats.totalQuizzes} quizzes · {stats.totalScore} pts
          </div>
          <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {stats.badges.length} badge{stats.badges.length !== 1 ? 's' : ''} earned
          </div>
        </div>
      )}
      {stats.totalQuizzes === 0 && (
        <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>No quizzes yet</div>
      )}
    </button>
  )
}
