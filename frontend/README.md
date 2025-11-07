# Multi-GPT Frontend

This Vite + React + Tailwind interface turns the multi-gpt API into a polished comparison cockpit. Type a single prompt and instantly review the outputs of ChatGPT (OpenAI), Gemini, and Claude in parallel. Each response card tracks token usage, highlights provider-specific errors, and can be toggled on or off to focus on the models that matter to you.

## Why it stands out

- **Side-by-side clarity** – identical prompt, synchronized layout, and responsive cards make differences jump off the page.
- **Fast feedback loop** – optimistic UI updates and clearly labeled loading states let you iterate on prompts without guesswork.
- **Cost visibility** – token counters (used vs. remaining) surface the “price” of each answer when providers expose that data.
- **Multilingual UX** – built-in i18n (English 🇺🇸 + Portuguese 🇧🇷) with a lightweight language switcher keeps the app globally friendly.
- **Error resilience** – even if one provider times out, the other cards still render so you never lose the rest of the comparison.

## Screenshots

Preview the exact experience visitors get, both on wide monitors and on phones:

| Desktop layout | Mobile layout |
| --- | --- |
| ![Desktop interface showing the three model responses](./src/assets/desktop.png) | ![Mobile interface with stacked response cards](./src/assets/mobile.png) |

## Stack

- React 18 + TypeScript
- Vite for bundling, TailwindCSS for styling
- i18next for localization
- Fetch-based API client that talks to the NestJS backend (`/models/query`)

## Getting started

### 1. Prerequisites

- Node.js ≥ 20
- npm ≥ 9
- Backend running at `http://localhost:3000` (or any other URL you provide)

### 2. Environment variable

Create a `.env` file in `frontend/` (or use your preferred secret manager) and point it to the backend:

```
VITE_API_BASE_URL=http://localhost:3000
```

If you omit it, the app defaults to `http://localhost:3000`.

### 3. Install & run

```bash
npm install
npm run dev
```

By default Vite serves the UI on `http://localhost:5173`. Open it in the browser, enter a prompt, select the models you want, and compare the answers instantly.

### 4. Build for production

```bash
npm run build
npm run preview   # optional smoke-test of the production bundle
```

## How it works

1. The user writes a prompt and chooses which providers to include.
2. The frontend validates the form, shows any global warnings (empty prompt, no model selected), and then calls the backend with `submitPrompt`.
3. Each response card updates independently, including loading states, token metrics, and provider-specific error banners.
4. A one-click reset clears the prompt, tokens, and messages so you can start fresh.

---

Pair this UI with the backend described in `backend/README.md` and you have a high-quality demo-ready tool for showcasing how today’s leading conversational models interpret the same question. It’s perfect for workshops, content creation, or simply honing your prompting skills. Enjoy the comparisons!
