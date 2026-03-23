'use client'
import { useState, useEffect, useCallback } from 'react'
import PlayerSelect from '@/components/PlayerSelect'
import TopicPicker from '@/components/TopicPicker'
import QuizScreen from '@/components/QuizScreen'
import ResultsScreen from '@/components/ResultsScreen'
import BadgeHistory from '@/components/BadgeHistory'
import { getPlayerStats, saveQuizResult, PlayerStats } from '@/lib/storage'
import { computeBadges } from '@/lib/badges'
import type { Badge } from '@/lib/storage'

type Screen = 'player' | 'topic' | 'loading' | 'quiz' | 'results' | 'history'

interface Question {
  q: string; opts: string[]; ans: number; explain: string; funFact: string
}

interface QuizResult {
  score: number; correct: number; bestStreak: number; timeBonus: number; newBadges: Badge[]
}

const EMPTY_STATS: PlayerStats = {
  totalQuizzes: 0, totalScore: 0, totalCorrect: 0,
  bestScore: 0, bestStreak: 0, badges: [], recentTopics: [],
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>('player')
  const [playerAge, setPlayerAge] = useState<7 | 13>(7)
  const [quizAge, setQuizAge] = useState<number>(7)
  const [timerLimit, setTimerLimit] = useState<number>(20)
  const [topic, setTopic] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [result, setResult] = useState<QuizResult | null>(null)
  const [loadError, setLoadError] = useState('')
  const [stats7, setStats7] = useState<PlayerStats>(EMPTY_STATS)
  const [stats13, setStats13] = useState<PlayerStats>(EMPTY_STATS)

  const refreshStats = useCallback(() => {
    setStats7(getPlayerStats(7))
    setStats13(getPlayerStats(13))
  }, [])

  useEffect(() => { refreshStats() }, [refreshStats])

  async function generateQuiz(t: string, selectedQuizAge?: number, selectedTimerLimit?: number) {
    const ageForQuiz = selectedQuizAge ?? quizAge
    const limitForQuiz = selectedTimerLimit ?? timerLimit
    setTopic(t)
    setQuizAge(ageForQuiz)
    setTimerLimit(limitForQuiz)
    setScreen('loading')
    setLoadError('')
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: t, playerAge: ageForQuiz }),
      })
      const data = await res.json()
      if (!res.ok || !data.questions) {
        const msg = data?.error || ('Server error ' + res.status)
        throw new Error(msg)
      }
      setQuestions(data.questions)
      setScreen('quiz')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not generate quiz. Please try again.'
      setLoadError(msg)
      setScreen('topic')
    }
  }

  function handleComplete(score: number, correct: number, bestStreak: number, timeBonus: number) {
    const total = questions.length
    const newBadges = computeBadges(score, correct, total, bestStreak, timeBonus, topic, playerAge)
    saveQuizResult(playerAge, score, correct, bestStreak, newBadges, topic)
    refreshStats()
    setResult({ score, correct, bestStreak, timeBonus, newBadges })
    setScreen('results')
  }

  const currentStats = playerAge === 7 ? stats7 : stats13

  return (
    <main className="relative z-10 min-h-screen flex flex-col items-center justify-start py-10 px-4">
      <div className="w-full max-w-lg">
        {screen === 'player' && (
          <PlayerSelect
            stats7={stats7} stats13={stats13}
            onSelect={age => { setPlayerAge(age); setScreen('topic') }}
          />
        )}

        {screen === 'topic' && (
          <>
            {loadError && (
              <div className="mb-4 px-4 py-3 rounded-xl text-sm font-semibold"
                style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(248,113,113,0.3)', color: '#FCA5A5' }}>
                <strong>Error:</strong> {loadError}
              </div>
            )}
            <TopicPicker
              playerAge={playerAge}
              recentTopics={currentStats.recentTopics}
              onBack={() => setScreen('player')}
              onStart={(t, age, timer) => generateQuiz(t, age, timer)}
            />
          </>
        )}

        {screen === 'loading' && (
          <div className="text-center py-20 animate-fade-in">
            <div className="text-5xl mb-5" style={{ animation: 'spin 1s linear infinite' }}>⚙️</div>
            <p className="font-display text-2xl font-semibold mb-2" style={{ color: '#E9D5FF' }}>
              Generating your quiz...
            </p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Creating 8 questions about <span style={{ color: '#C4B5FD' }}>{topic}</span>
            </p>
          </div>
        )}

        {screen === 'quiz' && questions.length > 0 && (
          <QuizScreen
            questions={questions}
            topic={topic}
            playerAge={playerAge}
            quizAge={quizAge}
            timerLimit={timerLimit}
            onComplete={handleComplete}
          />
        )}

        {screen === 'results' && result && (
          <ResultsScreen
            score={result.score}
            correct={result.correct}
            total={questions.length}
            bestStreak={result.bestStreak}
            timeBonus={result.timeBonus}
            newBadges={result.newBadges}
            topic={topic}
            playerAge={playerAge}
            onPlayAgain={() => generateQuiz(topic)}
            onNewTopic={() => setScreen('topic')}
            onViewHistory={() => setScreen('history')}
          />
        )}

        {screen === 'history' && (
          <BadgeHistory
            stats7={stats7}
            stats13={stats13}
            onBack={() => setScreen('results')}
          />
        )}
      </div>

      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </main>
  )
}
