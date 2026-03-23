'use client'
import { Badge } from '@/lib/storage'
import { BADGE_DEFS } from '@/lib/badges'

interface Props {
  score: number
  correct: number
  total: number
  bestStreak: number
  timeBonus: number
  newBadges: Badge[]
  topic: string
  playerAge: 7 | 13
  onPlayAgain: () => void
  onNewTopic: () => void
  onViewHistory: () => void
}

export default function ResultsScreen({ score, correct, total, bestStreak, timeBonus, newBadges, topic, playerAge, onPlayAgain, onNewTopic, onViewHistory }: Props) {
  const pct = Math.round((correct / total) * 100)
  const emoji = pct === 100 ? '🏆' : pct >= 75 ? '⭐' : pct >= 50 ? '👍' : '💪'
  const message = pct === 100 ? 'Perfect score! You absolutely nailed it!'
    : pct >= 75 ? 'Amazing work! You really know your stuff!'
    : pct >= 50 ? 'Great effort! Keep practising!'
    : 'Every question teaches you something new — keep going!'

  return (
    <div className="animate-slide-up">
      {/* Hero result */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-3 animate-bounce-in">{emoji}</div>
        <h2 className="font-display text-4xl font-bold mb-2" style={{ color: '#E9D5FF' }}>
          {playerAge === 7 ? 'Great job! ⭐' : 'Quiz complete! 💡'}
        </h2>
        <p className="text-base font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>{message}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Score', value: score, color: '#A78BFA' },
          { label: 'Correct', value: `${correct}/${total}`, color: '#34D399' },
          { label: 'Best streak', value: bestStreak, color: '#F59E0B' },
          { label: 'Speed bonus', value: `+${timeBonus}`, color: '#60A5FA' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-3 text-center">
            <div className="font-display text-2xl font-bold" style={{ color }}>{value}</div>
            <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* New badges */}
      {newBadges.length > 0 && (
        <div className="card p-5 mb-5">
          <p className="font-display text-base font-semibold mb-3" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Badges earned this quiz
          </p>
          <div className="flex flex-wrap gap-2">
            {newBadges.map((b, i) => {
              const def = BADGE_DEFS.find(d => b.label === d.label)
              return (
                <span key={i} className="badge-chip animate-bounce-in"
                  style={{ animationDelay: `${i * 100}ms`, background: def?.bg || '#F3F4F6', color: def?.color || '#1F2937' }}>
                  {b.emoji} {b.label}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Topic */}
      <div className="text-center mb-6">
        <span className="text-sm px-3 py-1 rounded-full font-semibold"
          style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)' }}>
          Topic: {topic}
        </span>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button onClick={onPlayAgain} className="btn-primary w-full py-3 text-base">
          Play again — same topic
        </button>
        <button onClick={onNewTopic} className="btn-outline w-full py-3">
          Choose a new topic
        </button>
        <button onClick={onViewHistory}
          className="w-full py-3 text-sm font-semibold rounded-xl transition-all"
          style={{ color: 'rgba(255,255,255,0.4)', background: 'transparent' }}>
          View badge history →
        </button>
      </div>
    </div>
  )
}
