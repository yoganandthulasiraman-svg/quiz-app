import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { question, answer, topic, playerAge, userQuestion } = await req.json()

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 })

    const ageDesc =
      playerAge <= 8  ? `a ${playerAge}-year-old child (very simple words, short fun sentences)` :
      playerAge <= 10 ? `a ${playerAge}-year-old child (simple words, friendly and encouraging tone)` :
      playerAge <= 12 ? `a ${playerAge}-year-old pre-teen (clear language, relatable examples)` :
      playerAge <= 14 ? `a ${playerAge}-year-old teenager (clear, engaging language)` :
      playerAge <= 16 ? `a ${playerAge}-year-old teenager (confident tone, more depth and detail)` :
                        `a ${playerAge}-year-old young adult (articulate, detailed explanations)`

    const prompt = `You are a friendly quiz teacher answering a follow-up question from ${ageDesc}.

Quiz topic: ${topic}
Quiz question: "${question}"
Correct answer: "${answer}"
Student's follow-up question: "${userQuestion}"

Answer the student's follow-up question directly and specifically. Stay on topic. Use simple, age-appropriate language. Keep it to 2-4 sentences and end with one fun related fact.`

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
      }),
    })

    if (!response.ok) {
      console.error('Gemini API error in /api/explain:', response.status)
      return NextResponse.json({ error: 'API error' }, { status: 500 })
    }

    const data = await response.json()
    const parts: Array<{ text?: string; thought?: boolean }> = data.candidates?.[0]?.content?.parts || []
    const textPart = parts.filter(p => !p.thought && p.text).pop()
    const text: string = textPart?.text || ''
    return NextResponse.json({ answer: text })

  } catch (err) {
    console.error('Error in /api/explain:', err)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
