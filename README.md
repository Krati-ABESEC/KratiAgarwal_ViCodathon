# Adaptive AI Interviewer

A full-stack TanStack Start application for adaptive technical interviews. The application personalizes interview questions from a candidate's curriculum progress, maintains multi-turn context, adapts difficulty, and produces a structured recruiter-style feedback report.

## Stack

- React + TanStack Start + TanStack Router
- Vite + Nitro (Node.js production server)
- Gemini API (server-side only)
- Tailwind CSS

## Local development

Use Node.js 20.19+ (Node 22 LTS recommended).

```bash
npm install
npm run dev
```

Create a local `.env` file with:

```env
GEMINI_API_KEY=your_google_gemini_api_key
```

Never expose this key with a `VITE_` prefix or commit it to GitHub.

## Production build

```bash
npm install --include=dev
npm run build
npm start
```

The production server is generated at `.output/server/index.mjs`.

## Render deployment

Deploy this repository as **one Render Web Service**. The frontend and `/api/interview` server route are part of the same TanStack Start application.

- Runtime: Node
- Build Command: `npm install --include=dev && npm run build`
- Start Command: `npm start`
- Environment variable: `GEMINI_API_KEY`

See [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) for the deployment checklist.

## API

Health check:

```text
GET /api/interview
```

Interview endpoint:

```text
POST /api/interview
```
