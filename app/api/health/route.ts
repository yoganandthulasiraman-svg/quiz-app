import { NextResponse } from 'next/server'

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    console.error('Health check: GEMINI_API_KEY is not set')
    return NextResponse.json({ status: 'error', message: 'Service misconfigured.' }, { status: 503 })
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Say OK in one word' }] }],
        generationConfig: { maxOutputTokens: 5 },
      }),
    })
    if (!res.ok) {
      console.error('Health check: Gemini returned', res.status)
      return NextResponse.json({ status: 'error', message: 'AI service unavailable.' }, { status: 503 })
    }
    return NextResponse.json({ status: 'ok' })
  } catch (err) {
    console.error('Health check error:', err)
    return NextResponse.json({ status: 'error', message: 'AI service unreachable.' }, { status: 503 })
  }
}
