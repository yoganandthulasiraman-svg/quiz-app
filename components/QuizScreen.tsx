'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

interface Question {
  q: string
  opts: string[]
  ans: number
  explain: string
  funFact: string
}

interface Props {
  questions: Question[]
  topic: string
  playerAge: 7 | 13
  quizAge: number
  timerLimit: number
  onComplete: (score: number, correct: number, bestStreak: number, timeBonus: number) => void
}

const LEVEL_COLORS = ['#A78BFA', '#34D399', '#F59E0B']
const LEVEL_LABELS = ['Easy', 'Medium', 'Hard']
const OPT_LETTERS = ['A', 'B', 'C', 'D']

function getLevel(i: number) {
  if (i < 3) return 0
  if (i < 6) return 1
  return 2
}

export default function QuizScreen({ questions, topic, playerAge, quizAge, timerLimit, onComplete }: Props) {
  const [current, setCurrent] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [chosen, setChosen] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [timeLeft, setTimeLeft] = useState(timerLimit)
  const [timeBonus, setTimeBonus] = useState(0)
  const [totalTimeBonus, setTotalTimeBonus] = useState(0)
  const [showExplain, setShowExplain] = useState(false)
  const [askInput, setAskInput] = useState('')
  const [askAnswer, setAskAnswer] = useState('')
  const [askLoading, setAskLoading] = useState(false)
  const [timerAnim, setTimerAnim] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const recognitionRef = useRef<InstanceType<typeof window.SpeechRecognition> | null>(null)
  const limit = timerLimit
  const q = questions[current]
  const lvl = getLevel(current)

  const handleTimeout = useCallback(() => {
    if (answered) return
    setAnswered(true)
    setChosen(-1)
    setStreak(0)
    setShowExplain(true)
  }, [answered])

  useEffect(() => {
    setAnswered(false); setChosen(null); setShowExplain(false)
    setAskInput(''); setAskAnswer(''); setTimeLeft(limit)
    setTimerAnim(false)
    setTimeout(() => setTimerAnim(true), 50)
  }, [current, limit])

  useEffect(() => {
    if (answered) { if (timerRef.current) clearInterval(timerRef.current); return }
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current!); handleTimeout(); return 0 }
        return t - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [answered, current, handleTimeout])

  function answer(idx: number) {
    if (answered) return
    if (timerRef.current) clearInterval(timerRef.current)
    setAnswered(true); setChosen(idx)
    const ok = idx === q.ans
    const levelPts = (lvl + 1) * 10
    const speedPts = ok ? Math.round((timeLeft / limit) * 10) : 0
    const pts = ok ? levelPts + speedPts : 0
    if (ok) {
      setScore(s => s + pts)
      setCorrect(c => c + 1)
      setStreak(s => { const ns = s + 1; setBestStreak(b => Math.max(b, ns)); return ns })
      setTimeBonus(speedPts)
      setTotalTimeBonus(t => t + speedPts)
    } else {
      setStreak(0); setTimeBonus(0)
    }
    setShowExplain(true)
  }

  function toggleVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return

    if (isListening) {
      recognitionRef.current?.stop()
      return
    }

    const rec = new SR()
    rec.lang = 'en-US'
    rec.interimResults = false
    rec.maxAlternatives = 1

    rec.onstart = () => setIsListening(true)
    rec.onend = () => setIsListening(false)
    rec.onerror = () => setIsListening(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      const transcript: string = e.results[0][0].transcript
      setAskInput(transcript)
    }

    recognitionRef.current = rec
    rec.start()
  }

  async function askMore() {
    if (!askInput.trim() || askLoading) return
    setAskLoading(true); setAskAnswer('')
    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q.q, answer: q.opts[q.ans], topic, playerAge: quizAge, userQuestion: askInput }),
      })
      const data = await res.json()
      setAskAnswer(data.answer || 'Hmm, something went wrong!')
    } catch { setAskAnswer('Could not get an answer right now.') }
    setAskLoading(false)
  }

  function next() {
    if (current + 1 >= questions.length) onComplete(score, correct, bestStreak, totalTimeBonus)
    else setCurrent(c => c + 1)
  }

  const timerPct = (timeLeft / limit) * 100
  const timerClass = timeLeft <= 5 ? 'danger' : timeLeft <= 10 ? 'warning' : ''
  const total = questions.length

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="font-display text-sm font-semibold px-3 py-1 rounded-full"
            style={{ background: 'rgba(255,255,255,0.1)', color: LEVEL_COLORS[lvl] }}>
            {LEVEL_LABELS[lvl]}
          </span>
          <span className="font-display text-sm px-3 py-1 rounded-full"
            style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)' }}>
            {topic}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {streak >= 2 && !answered && (
            <span className="text-sm font-bold streak-flame" style={{ color: '#F59E0B' }}>
              🔥 {streak}
            </span>
          )}
          <span className="font-display text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {current + 1} / {total}
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="h-1.5 rounded-full mb-4" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${(current / total) * 100}%`, background: LEVEL_COLORS[lvl] }} />
      </div>

      {/* Timer */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <div
            className={`timer-bar ${timerClass}`}
            style={{
              width: `${timerPct}%`,
              transition: answered ? 'none' : 'width 1s linear',
            }}
          />
        </div>
        <span className="font-display text-sm font-bold min-w-[28px] text-right"
          style={{ color: timeLeft <= 5 ? '#F87171' : timeLeft <= 10 ? '#FCD34D' : 'rgba(255,255,255,0.5)' }}>
          {timeLeft}s
        </span>
      </div>

      {/* Score bar */}
      <div className="flex items-center justify-between mb-5 px-1">
        <span className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.4)' }}>SCORE</span>
        <span className="font-display text-lg font-bold" style={{ color: '#E9D5FF' }}>{score}</span>
      </div>

      {/* Question */}
      <div className="card p-6 mb-4">
        <div className="flex gap-3 mb-2">
          {[0, 1, 2].map(n => (
            <div key={n} className="w-2 h-2 rounded-full" style={{
              background: n <= lvl ? LEVEL_COLORS[lvl] : 'rgba(255,255,255,0.15)'
            }} />
          ))}
        </div>
        <p className="font-body text-lg font-bold leading-snug" style={{ color: '#F1F0F5' }}>
          {q.q}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3 mb-5">
        {q.opts.map((opt, i) => {
          let cls = 'answer-btn'
          if (answered) {
            if (i === q.ans) cls += ' correct'
            else if (i === chosen && chosen !== q.ans) cls += ' wrong'
            else cls += ' opacity-50'
          }
          return (
            <button key={i} className={cls} onClick={() => answer(i)} disabled={answered}
              style={{ animationDelay: `${i * 60}ms` }}>
              <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{
                  background: answered && i === q.ans ? 'rgba(52,211,153,0.3)'
                    : answered && i === chosen ? 'rgba(248,113,113,0.3)'
                    : 'rgba(255,255,255,0.1)',
                  color: answered && i === q.ans ? '#34D399'
                    : answered && i === chosen ? '#F87171'
                    : 'rgba(255,255,255,0.6)',
                }}>
                {OPT_LETTERS[i]}
              </span>
              {opt}
            </button>
          )
        })}
      </div>

      {/* Feedback & explanation */}
      {showExplain && (
        <div className="animate-slide-up space-y-3 mb-5">
          {/* Result */}
          <div className="rounded-xl px-4 py-3"
            style={{
              background: chosen === q.ans ? 'rgba(5,150,105,0.15)' : chosen === -1 ? 'rgba(245,158,11,0.15)' : 'rgba(220,38,38,0.15)',
              border: `1px solid ${chosen === q.ans ? 'rgba(52,211,153,0.3)' : chosen === -1 ? 'rgba(252,211,77,0.3)' : 'rgba(248,113,113,0.3)'}`,
            }}>
            <div className="flex items-center justify-between">
              <span className="font-display text-base font-bold"
                style={{ color: chosen === q.ans ? '#34D399' : chosen === -1 ? '#FCD34D' : '#F87171' }}>
                {chosen === q.ans ? '✓ Correct!' : chosen === -1 ? '⏱ Time\'s up!' : '✗ Not quite'}
              </span>
              {chosen === q.ans && timeBonus > 0 && (
                <span className="text-sm font-bold animate-bounce-in" style={{ color: '#FCD34D' }}>
                  ⚡ +{timeBonus} speed bonus
                </span>
              )}
            </div>
          </div>

          {/* Explanation */}
          <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-sm font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Why?</p>
            <p className="text-sm leading-relaxed" style={{ color: '#E2E0EA' }}>{q.explain}</p>
            {q.funFact && (
              <p className="text-xs mt-2 leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                💡 {q.funFact}
              </p>
            )}
          </div>

          {/* Ask more */}
          <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(167,139,250,0.2)' }}>
            <p className="text-sm font-bold mb-2" style={{ color: '#C4B5FD' }}>🤔 Want to know more?</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={askInput}
                onChange={e => setAskInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && askMore()}
                placeholder={isListening ? 'Listening...' : 'Ask a question about this...'}
                className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: `1px solid ${isListening ? 'rgba(248,113,113,0.6)' : 'rgba(255,255,255,0.15)'}`,
                  color: '#F1F0F5',
                  fontFamily: 'var(--font-body)',
                }}
              />
              {(typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) && (
                <button
                  onClick={toggleVoice}
                  title={isListening ? 'Stop recording' : 'Ask with voice'}
                  className="px-3 py-2 rounded-lg text-base transition-all"
                  style={{
                    background: isListening ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.07)',
                    border: `1px solid ${isListening ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.15)'}`,
                    animation: isListening ? 'pulse 1s infinite' : 'none',
                  }}>
                  {isListening ? '⏹' : '🎤'}
                </button>
              )}
              <button onClick={askMore} disabled={askLoading || !askInput.trim()}
                className="px-4 py-2 rounded-lg text-sm font-bold transition-all"
                style={{ background: 'rgba(124,58,237,0.4)', color: '#E9D5FF', border: '1px solid rgba(167,139,250,0.3)' }}>
                {askLoading ? '...' : 'Ask'}
              </button>
            </div>
            {askAnswer && (
              <div className="mt-3 text-sm leading-relaxed animate-slide-up" style={{ color: '#DDD6FE' }}>
                {askAnswer}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Next button */}
      {answered && (
        <button onClick={next} className="btn-primary w-full text-base py-3 animate-slide-up">
          {current + 1 >= total ? 'See my results 🏆' : 'Next question →'}
        </button>
      )}
    </div>
  )
}
