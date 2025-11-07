# Multi-GPT API

This NestJS service powers the multi-gpt experience by orchestrating simultaneous requests to OpenAI (ChatGPT), Google Gemini, and Anthropic Claude. A single POST reaches every provider in parallel, normalizes their payloads, and returns a side-by-side bundle that includes the answer text, token usage, and any provider-specific error messages. It is a thin, strongly-typed layer designed to keep API keys on the server, deliver consistent latency, and make the frontend renderer trivial.

## Highlights

- **Parallel fan-out** – runs all selected providers concurrently to minimize perceived latency even when a single model stalls.
- **Unified contract** – enforces a shared DTO, trims prompts, validates model choices, and always returns predictable metadata for rendering.
- **Token-aware responses** – surfaces tokens used and remaining (when available) so you can keep an eye on costs in real time.
- **Guardrails built in** – rejects empty prompts, deduplicates model selections, and logs provider failures without crashing the request.

## Architecture in a Nutshell

```
Client ➜ POST /models/query ➜ ModelsController ➜ ModelsService ➜ Providers (OpenAI, Gemini, Claude)
```

`ModelsService` is where the fan-out happens. Each provider gets its own handler with:

- centralized API key retrieval via `ConfigService`
- custom error formatting so upstream issues become human-readable
- configurable defaults (`MAX_TOKENS`, `GEMINI_MODEL`, `CLAUDE_MODEL`)

## API Reference

- **Endpoint:** `POST /models/query`
- **Payload:**

```json
{
  "prompt": "Explain the difference between RAG and fine-tuning.",
  "models": ["openai", "gemini", "claude"]
}
```

- **Response:**

```json
{
  "prompt": "Explain the difference between RAG and fine-tuning.",
  "results": [
    { "id": "openai", "text": "...", "tokensUsed": 542, "tokensRemaining": 1790 },
    { "id": "gemini", "text": "...", "tokensUsed": 501 },
    { "id": "claude", "error": "Claude: Model overload right now." }
  ]
}
```

Errors are reported per provider, so one flaky API never prevents the others from returning value.

## Getting Started

### Prerequisites

- Node.js ≥ 20
- npm ≥ 9

### Environment variables

Create a `.env` file (or configure your secret manager) with:

```
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
CLAUDE_API_KEY=...
# Optional
GEMINI_MODEL=gemini-1.5-flash-latest
CLAUDE_MODEL=claude-3-5-sonnet-20240620
MAX_TOKENS=800
```

### Install & run

```bash
npm install
npm run start:dev
```

The API listens on `http://localhost:3000`. The `/` route returns a quick health-check string, while `/models/query` performs the multi-model request.

### Test suite

```bash
npm test        # unit tests
npm run test:e2e
npm run test:cov
```

## Deployment Notes

The service is stateless, so you can scale it horizontally. Keep API keys in your secrets manager, and configure `MAX_TOKENS` per environment to control costs. Because every outbound call is pure HTTP, the app runs anywhere Node.js is available—Docker, Render, Fly.io, AWS, etc.

---

If you are browsing the repository for the first time, start the backend with the instructions above and then open the React frontend (see `frontend/README.md`) to enjoy synchronized responses from the industry’s top conversational models. The combination showcases how the same prompt can produce wildly different insights—and gives you the tooling to compare them instantly.
