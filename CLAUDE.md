# Quiz Challenge — Claude Code Context

## Project Overview

AI-powered quiz app for kids built with **Next.js 14 App Router**, TypeScript, and Tailwind CSS.
Uses **Google Gemini API** (`gemini-2.5-flash`) for question generation and follow-up Q&A.

**Players:** Two profiles — Dhruv (age 7) and Diya (age 13).
**Hosted:** Vercel. **Storage:** localStorage only (no backend DB).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + custom CSS (globals.css) |
| Fonts | Fredoka (display) + Nunito (body) |
| AI | Google Gemini API (`gemini-2.5-flash`) |
| Storage | localStorage via `lib/storage.ts` |
| Hosting | Vercel |

---

## Project Structure

```
quiz-app/
├── app/
│   ├── api/
│   │   ├── generate/route.ts   # POST — generates 8 quiz questions via Gemini
│   │   ├── explain/route.ts    # POST — answers follow-up questions via Gemini
│   │   └── health/route.ts     # GET — health check
│   ├── globals.css             # Global styles, fonts, design tokens
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Main page — orchestrates all screens
├── components/
│   ├── PlayerSelect.tsx        # Player profile selection screen
│   ├── TopicPicker.tsx         # Topic selection (16 presets + free text)
│   ├── QuizScreen.tsx          # Quiz engine — timer, answers, follow-up Q&A
│   ├── ResultsScreen.tsx       # End-of-quiz results + badge awards
│   └── BadgeHistory.tsx        # Trophy shelf — all badges per player
├── lib/
│   ├── storage.ts              # localStorage helpers for scores + badges
│   └── badges.ts               # Badge definitions and award logic
├── .env.local                  # GEMINI_API_KEY (never commit)
└── CLAUDE.md                   # This file
```

---

## Essential Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm run start    # Start production server
```

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `GEMINI_API_KEY` | Google Gemini API key — required for question generation |

Get a free key at: https://aistudio.google.com

---

## Key Conventions

- **API routes** are server-side only — API key is never exposed to the browser
- **Age-gating**: `playerAge === 7` or `playerAge === 13` controls question difficulty and timer
- **Timer**: 20s for age 7, 15s for age 13 — defined as `TIME_LIMIT` in `QuizScreen.tsx`
- **Questions**: Always 8 per quiz — 3 easy, 3 medium, 2 hard — returned as JSON array
- **Badges**: Defined in `lib/badges.ts`, awarded in `ResultsScreen.tsx`
- **Storage key**: `quiz-challenge-v1` in localStorage

---

## Scoring Logic

| Factor | Points |
|--------|--------|
| Correct — Easy | 10 pts |
| Correct — Medium | 20 pts |
| Correct — Hard | 30 pts |
| Speed bonus (proportional to time left) | 0–10 pts |

---

## Badge Conditions

| Badge | Condition |
|-------|-----------|
| 🏆 Perfect score | All 8 correct |
| ⭐ Star player | 75%+ correct |
| 🔥 Hot streak | 4+ in a row correct |
| 🎓 Topic expert | 6+ correct |
| ⚡ Speedster | 40+ total speed bonus points |
| 🌟 Quiz complete | Always awarded |

---

## Common Tasks

### Add a preset topic
Edit `components/TopicPicker.tsx` → `PRESET_TOPICS` array:
```ts
{ label: 'Coding', emoji: '💻' }
```

### Change timer duration
Edit `components/QuizScreen.tsx` → `TIME_LIMIT`:
```ts
const TIME_LIMIT = { 7: 20, 13: 15 }
```

### Add a badge
Edit `lib/badges.ts` → `BADGE_DEFS` array.

### Change number of questions
Edit `app/api/generate/route.ts` → update the prompt (change "8" and difficulty split).

---

## Rules

- Never commit `.env.local` — it contains the real API key
- Keep API routes server-side — never call Gemini directly from client components
- All new components go in `components/` and follow existing naming (PascalCase)
- Tailwind utility classes preferred; custom CSS only in `globals.css`
