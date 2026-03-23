# Quiz Challenge

An AI-powered quiz app for kids, built with Next.js 14 and Google Gemini. Personalised for two players — **Dhruv** and **Diya** — with fully configurable question level, timer, and voice input.

---

## Features

- **Two player profiles** — Dhruv and Diya, each with their own scores, streaks, and badge history
- **Any topic** — 16 preset topics plus free-text search (Minecraft, Taylor Swift, Formula 1, anything)
- **AI-generated questions** — fresh unique questions every quiz via Gemini API
- **Question level selector** — choose difficulty from Age 7 to Age 18, independent of the player profile
- **Timer selector** — pick time per question: 10s, 15s, 20s, 30s, 45s, or 60s
- **Voice input** — ask follow-up questions by speaking instead of typing (Web Speech API)
- **3 difficulty levels** — Easy → Medium → Hard progression within each quiz
- **Neutral explanations** — every answer explained factually, regardless of whether you got it right or wrong
- **Ask more** — type or speak a follow-up question after each answer and get an age-appropriate response
- **Speed bonuses** — faster correct answers earn extra points
- **Persistent scores and badges** — stored in localStorage, survives browser refreshes
- **Trophy shelf** — full badge history with dates and topics per player

---

## Project Structure

```
quiz-app/
├── app/
│   ├── api/
│   │   ├── generate/route.ts   # Generates 8 quiz questions via Gemini
│   │   ├── explain/route.ts    # Answers follow-up questions via Gemini
│   │   └── health/route.ts     # Health check
│   ├── globals.css             # Global styles, fonts, design tokens
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Main page — orchestrates all screens
├── components/
│   ├── PlayerSelect.tsx        # Player profile selection (Dhruv / Diya)
│   ├── TopicPicker.tsx         # Topic, question level, and timer selection
│   ├── QuizScreen.tsx          # Quiz engine — timer, answers, voice Q&A
│   ├── ResultsScreen.tsx       # End-of-quiz results and badge awards
│   └── BadgeHistory.tsx        # Trophy shelf — all badges per player
├── lib/
│   ├── storage.ts              # localStorage helpers for scores and badges
│   ├── badges.ts               # Badge definitions and award logic
│   └── speech.d.ts             # Web Speech API type declarations
└── .env.local                  # GEMINI_API_KEY (never commit)
```

---

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Add your Gemini API key

```bash
cp .env.local.example .env.local
```

Open `.env.local` and set your key:

```
GEMINI_API_KEY=your_key_here
```

Get a free key at: https://aistudio.google.com

### 3. Run locally

```bash
npm run dev
```

Open http://localhost:3000

---

## Deploy to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/quiz-app.git
git branch -M main
git push -u origin main
```

### 2. Import to Vercel

1. Go to https://vercel.com/new
2. Import your `quiz-app` repository
3. Leave all settings as default — Vercel auto-detects Next.js
4. Click **Deploy**

### 3. Add your API key

1. In your Vercel project go to **Settings → Environment Variables**
2. Add `GEMINI_API_KEY` with your key value
3. Set Environment to Production, Preview, and Development
4. **Redeploy** the latest deployment

---

## How It Works

### Quiz flow

1. **Choose player** — Dhruv or Diya
2. **Configure quiz** — pick question level (Age 7–18), timer (10–60s), and topic
3. **Play** — 8 questions across Easy / Medium / Hard
4. **Review** — see explanation and fun fact after each answer, ask follow-ups by typing or voice
5. **Results** — score, badges earned, option to replay or pick a new topic

### Question generation (`/api/generate`)

Called when a topic is submitted. Sends the topic and chosen age level to Gemini (`gemini-2.5-flash`), which returns 8 questions as a structured JSON array. Questions are fully tailored to the selected age level — vocabulary, concepts, and tone scale continuously from age 7 (very simple, playful) through to age 18 (sophisticated, complex).

### Follow-up Q&A (`/api/explain`)

After each answer the player can type or speak any question. The API sends the original question, correct answer, topic, quiz age level, and the follow-up to Gemini, which responds in age-appropriate language matched to the selected quiz level.

### Gemini thinking model handling

`gemini-2.5-flash` is a thinking model — its response contains internal reasoning tokens (`thought: true`) followed by the actual output. Both API routes filter out thought parts and use the last non-thought text part to extract the response correctly.

### Scoring

| Factor | Points |
|--------|--------|
| Correct — Easy | 10 pts |
| Correct — Medium | 20 pts |
| Correct — Hard | 30 pts |
| Speed bonus (proportional to time left) | 0–10 pts |

### Badges

| Badge | Condition |
|-------|-----------|
| 🏆 Perfect score | All 8 correct |
| ⭐ Star player | 75%+ correct |
| 🔥 Hot streak | 4+ correct in a row |
| 🎓 Topic expert | 6+ correct |
| ⚡ Speedster | 40+ total speed bonus points |
| 🌟 Quiz complete | Always awarded |

### Storage

Scores and badges are stored in `localStorage` under the key `quiz-challenge-v1`. Data is per-browser — it persists between sessions on the same device but does not sync across devices.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + custom CSS |
| Fonts | Fredoka (display) + Nunito (body) |
| AI | Google Gemini API (`gemini-2.5-flash`) |
| Voice | Web Speech API (browser-native) |
| Storage | localStorage |
| Hosting | Vercel |

---

## Customisation

### Add a preset topic
Edit `components/TopicPicker.tsx` → `PRESET_TOPICS`:
```ts
{ label: 'Coding', emoji: '💻' }
```

### Change timer options
Edit `components/TopicPicker.tsx` → `TIMER_OPTIONS`:
```ts
const TIMER_OPTIONS = [10, 15, 20, 30, 45, 60]
```

### Change question level range
Edit `components/TopicPicker.tsx` → `QUIZ_AGES`:
```ts
const QUIZ_AGES = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]
```

### Add a badge
Edit `lib/badges.ts` → `BADGE_DEFS`:
```ts
{
  id: 'comeback',
  label: 'Comeback kid',
  emoji: '🔄',
  color: '#065F46',
  bg: '#D1FAE5',
  check: (_, correct, total) => correct === total,
}
```

### Change number of questions
Edit `app/api/generate/route.ts` — update the prompt to request a different number and adjust the difficulty split.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google Gemini API key from aistudio.google.com |

---

## Rules

- Never commit `.env.local`
- Keep all Gemini calls server-side — the API key must never reach the browser
- New components go in `components/` in PascalCase
- Tailwind utility classes preferred; custom CSS only in `globals.css`
