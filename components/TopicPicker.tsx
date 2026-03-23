'use client'
import { useState } from 'react'

const PRESET_TOPICS = [
  { label: 'Sports', emoji: '⚽' }, { label: 'Anime', emoji: '🎌' },
  { label: 'Art', emoji: '🎨' }, { label: 'Music', emoji: '🎵' },
  { label: 'Space', emoji: '🌌' }, { label: 'Animals', emoji: '🦁' },
  { label: 'Gaming', emoji: '🎮' }, { label: 'Movies', emoji: '🎬' },
  { label: 'Math', emoji: '🔢' }, { label: 'Science', emoji: '🔬' },
  { label: 'History', emoji: '🏛️' }, { label: 'Geography', emoji: '🌍' },
  { label: 'Cooking', emoji: '👨‍🍳' }, { label: 'Dinosaurs', emoji: '🦕' },
  { label: 'Superheroes', emoji: '🦸' }, { label: 'Nature', emoji: '🌿' },
]

const QUIZ_AGES = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]
const TIMER_OPTIONS = [10, 15, 20, 30, 45, 60]

interface Props {
  playerAge: 7 | 13
  recentTopics: string[]
  onBack: () => void
  onStart: (topic: string, quizAge: number, timerLimit: number) => void
}

export default function TopicPicker({ playerAge, recentTopics, onBack, onStart }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [custom, setCustom] = useState('')
  const [error, setError] = useState('')
  const [quizAge, setQuizAge] = useState<number>(playerAge)
  const [timerLimit, setTimerLimit] = useState<number>(playerAge === 7 ? 20 : 15)

  function pick(label: string) {
    setSelected(label === selected ? null : label)
    setError('')
  }

  function submit() {
    const topic = custom.trim() || selected
    if (!topic) { setError('Pick a topic or type one above!'); return }
    onStart(topic, quizAge, timerLimit)
  }

  return (
    <div className="animate-slide-up">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="btn-outline text-sm px-4 py-2">← Back</button>
        <div>
          <h2 className="font-display text-3xl font-bold" style={{ color: '#E9D5FF' }}>
            {playerAge === 7 ? '⭐ Dhruv' : '💡 Diya'}
          </h2>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Choose what to quiz on</p>
        </div>
      </div>

      {/* Quiz level */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
          Question level
        </label>
        <div className="flex flex-wrap gap-2">
          {QUIZ_AGES.map(age => (
            <button
              key={age}
              onClick={() => setQuizAge(age)}
              className="px-3 py-1.5 rounded-lg text-sm font-bold transition-all"
              style={{
                background: quizAge === age ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.07)',
                border: `1.5px solid ${quizAge === age ? 'rgba(167,139,250,0.7)' : 'rgba(255,255,255,0.12)'}`,
                color: quizAge === age ? '#E9D5FF' : 'rgba(255,255,255,0.5)',
              }}
            >
              Age {age}{age === playerAge ? ' ★' : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Timer */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
          Time per question
        </label>
        <div className="flex flex-wrap gap-2">
          {TIMER_OPTIONS.map(secs => (
            <button
              key={secs}
              onClick={() => setTimerLimit(secs)}
              className="px-3 py-1.5 rounded-lg text-sm font-bold transition-all"
              style={{
                background: timerLimit === secs ? 'rgba(245,158,11,0.35)' : 'rgba(255,255,255,0.07)',
                border: `1.5px solid ${timerLimit === secs ? 'rgba(252,211,77,0.6)' : 'rgba(255,255,255,0.12)'}`,
                color: timerLimit === secs ? '#FDE68A' : 'rgba(255,255,255,0.5)',
              }}
            >
              {secs}s
            </button>
          ))}
        </div>
      </div>

      {/* Custom search */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
          Search any topic
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={custom}
            onChange={e => { setCustom(e.target.value); setSelected(null); setError('') }}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="e.g. Minecraft, Taylor Swift, Formula 1..."
            className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold outline-none transition-all"
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1.5px solid rgba(255,255,255,0.15)',
              color: '#F1F0F5',
              fontFamily: 'var(--font-body)',
            }}
          />
        </div>
      </div>

      {/* Recent topics */}
      {recentTopics.length > 0 && (
        <div className="mb-5">
          <p className="text-xs font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>RECENT</p>
          <div className="flex flex-wrap gap-2">
            {recentTopics.map(t => (
              <button key={t} onClick={() => { setSelected(t); setCustom('') }}
                className={`topic-chip text-sm ${selected === t ? 'selected' : ''}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Preset grid */}
      <div className="mb-6">
        <p className="text-xs font-semibold mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>POPULAR TOPICS</p>
        <div className="flex flex-wrap gap-2">
          {PRESET_TOPICS.map(({ label, emoji }) => (
            <button key={label} onClick={() => { pick(label); setCustom('') }}
              className={`topic-chip ${selected === label && !custom ? 'selected' : ''}`}>
              <span>{emoji}</span> {label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm mb-4 font-semibold" style={{ color: '#F87171' }}>{error}</p>}

      {/* Selected preview */}
      {(custom.trim() || selected) && (
        <div className="mb-5 px-4 py-3 rounded-xl text-sm font-semibold"
          style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(167,139,250,0.35)', color: '#C4B5FD' }}>
          Quiz topic: <span style={{ color: '#EDE9FE' }}>{custom.trim() || selected}</span>
          {' '}· Age {quizAge} level · {timerLimit}s timer · 8 questions
        </div>
      )}

      <button onClick={submit} className="btn-primary w-full text-lg py-4">
        Generate my quiz ✨
      </button>
    </div>
  )
}
