'use client'
import { PlayerStats } from '@/lib/storage'
import { BADGE_DEFS } from '@/lib/badges'

interface Props {
  stats7: PlayerStats
  stats13: PlayerStats
  onBack: () => void
}

function fmt(iso: string) {
  try { return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }) }
  catch { return '' }
}

function PlayerHistory({ stats, age, color }: { stats: PlayerStats, age: 7 | 13, color: string }) {
  const recentBadges = [...stats.badges].reverse().slice(0, 20)
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{age === 7 ? '⭐' : '💡'}</span>
        <div>
          <p className="font-display text-lg font-semibold" style={{ color }}>
            {age === 7 ? 'Dhruv' : 'Diya'}
          </p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {stats.totalQuizzes} quizzes · {stats.totalScore} total pts · {stats.badges.length} badges
          </p>
        </div>
      </div>

      {/* Lifetime stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: 'Best score', value: stats.bestScore },
          { label: 'Total correct', value: stats.totalCorrect },
          { label: 'Best streak', value: stats.bestStreak },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl p-3 text-center"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="font-display text-xl font-bold" style={{ color }}>{value}</div>
            <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</div>
          </div>
        ))}
      </div>

      {recentBadges.length === 0 ? (
        <p className="text-sm text-center py-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
          No badges yet — play a quiz to earn some!
        </p>
      ) : (
        <div className="space-y-2">
          {recentBadges.map((b, i) => {
            const def = BADGE_DEFS.find(d => b.label === d.label)
            return (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <span className="badge-chip text-xs"
                  style={{ background: def?.bg || '#F3F4F6', color: def?.color || '#1F2937', flexShrink: 0 }}>
                  {b.emoji} {b.label}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {b.topic}
                  </p>
                </div>
                <span className="text-xs flex-shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {fmt(b.earnedAt)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function BadgeHistory({ stats7, stats13, onBack }: Props) {
  return (
    <div className="animate-slide-up">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="btn-outline text-sm px-4 py-2">← Back</button>
        <h2 className="font-display text-2xl font-bold" style={{ color: '#E9D5FF' }}>Trophy shelf 🏅</h2>
      </div>

      <div className="space-y-6">
        <div className="card p-5">
          <PlayerHistory stats={stats7} age={7} color="#A78BFA" />
        </div>
        <div className="card p-5">
          <PlayerHistory stats={stats13} age={13} color="#34D399" />
        </div>
      </div>
    </div>
  )
}
