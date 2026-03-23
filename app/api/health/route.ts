import { NextResponse } from 'next/server'

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    return NextResponse.json({
      status: 'error',
      problem: 'GEMINI_API_KEY is not set',
      fix: '1. Go to aistudio.google.com and sign in with your Google account\n2. Click "Get API key" → "Create API key"\n3. Copy the key into your .env.local file as GEMINI_API_KEY=AIza...\n4. Restart your dev server (Ctrl+C then npm run dev)\n5. On Vercel: add in Settings → Environment Variables then redeploy',
    })
  }

  if (!apiKey.startsWith('AIza')) {
    return NextResponse.json({
      status: 'warning',
      problem: 'API key does not look like a Gemini key (should start with AIza)',
      keyPreview: apiKey.substring(0, 8) + '...',
    })
  }

  // Quick ping to Gemini to verify the key works
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
    const data = await res.json()
    if (!res.ok) {
      return NextResponse.json({
        status: 'error',
        problem: 'API key is set but Gemini rejected it',
        httpStatus: res.status,
        detail: data?.error?.message || JSON.stringify(data),
        fix: 'Make sure you copied the full key from aistudio.google.com. The key should start with AIza and be about 39 characters long.',
      })
    }
    return NextResponse.json({
      status: 'ok',
      message: 'Gemini API key is valid and working!',
      model: 'gemini-2.5-flash',
      keyPreview: apiKey.substring(0, 8) + '...',
    })
  } catch (err) {
    return NextResponse.json({
      status: 'error',
      problem: 'Could not reach Gemini API',
      detail: err instanceof Error ? err.message : String(err),
      fix: 'Check your internet connection.',
    })
  }
}
