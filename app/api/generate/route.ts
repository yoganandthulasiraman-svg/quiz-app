import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { topic, playerAge } = await req.json()

    // Input validation
    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return NextResponse.json({ error: 'Topic is required.' }, { status: 400 })
    }
    if (topic.length > 100) {
      return NextResponse.json({ error: 'Topic is too long.' }, { status: 400 })
    }
    if (typeof playerAge !== 'number' || playerAge < 7 || playerAge > 18) {
      return NextResponse.json({ error: 'Invalid age.' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Service unavailable.' }, { status: 500 })
    }

    const ageDesc =
      playerAge <= 8  ? `a ${playerAge}-year-old child (very simple words, short sentences, fun and playful tone, very basic concepts)` :
      playerAge <= 10 ? `a ${playerAge}-year-old child (simple words, friendly tone, straightforward concepts)` :
      playerAge <= 12 ? `a ${playerAge}-year-old pre-teen (clear language, engaging tone, moderate concepts)` :
      playerAge <= 14 ? `a ${playerAge}-year-old teenager (moderate vocabulary, engaging tone, mixed difficulty concepts)` :
      playerAge <= 16 ? `a ${playerAge}-year-old teenager (varied vocabulary, challenging concepts, some abstract thinking)` :
                        `a ${playerAge}-year-old young adult (sophisticated vocabulary, complex and nuanced concepts)`

    const prompt = `You are a fun quiz generator for kids. Generate exactly 8 multiple-choice quiz questions about: ${topic}.
The questions are for ${ageDesc}.

Structure: questions 1-3 easy, 4-6 medium, 7-8 hard.

Return ONLY a valid JSON array of 8 objects. Each object must have exactly these fields:
- "q": question string (keep it fun and engaging)
- "opts": array of exactly 4 short answer strings
- "ans": number 0-3, the index of the correct answer in opts
- "explain": a neutral 1-2 sentence explanation of WHY the correct answer is right (factual, no "you got it" or "correct!" praise — it is shown to players who answered wrong too)
- "funFact": one extra fun related fact the kid might enjoy (1 sentence)

IMPORTANT: Return raw JSON only. No markdown fences, no backticks, no explanation text before or after. Just the JSON array starting with [ and ending with ].`

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
      }),
    })

    if (!response.ok) {
      const errBody = await response.text()
      console.error('Gemini API error:', response.status, errBody)
      return NextResponse.json({
        error: `Gemini API returned ${response.status}. Check your API key at aistudio.google.com`,
      }, { status: 500 })
    }

    const data = await response.json()

    if (data.error) {
      return NextResponse.json({ error: data.error.message || 'Gemini API error' }, { status: 500 })
    }

    // gemini-2.5-flash is a thinking model — filter out thought parts, use the last text part
    const parts: Array<{ text?: string; thought?: boolean }> = data.candidates?.[0]?.content?.parts || []
    const textPart = parts.filter(p => !p.thought && p.text).pop()
    const text: string = textPart?.text || ''

    if (!text) {
      return NextResponse.json({ error: 'Empty response from Gemini. Please try again.' }, { status: 500 })
    }

    // Strip markdown fences, then extract the JSON array in case there's surrounding text
    const fenceStripped = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
    const arrayMatch = fenceStripped.match(/\[[\s\S]*\]/)
    const clean = arrayMatch ? arrayMatch[0] : fenceStripped

    let questions
    try {
      questions = JSON.parse(clean)
    } catch {
      console.error('JSON parse error. Raw text:', text)
      return NextResponse.json({ error: 'Could not parse quiz questions. Please try again.' }, { status: 500 })
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: 'Invalid questions format received.' }, { status: 500 })
    }

    return NextResponse.json({ questions })

  } catch (err) {
    console.error('Unhandled error in /api/generate:', err)
    return NextResponse.json({ error: 'Unexpected server error. Check server logs.' }, { status: 500 })
  }
}
