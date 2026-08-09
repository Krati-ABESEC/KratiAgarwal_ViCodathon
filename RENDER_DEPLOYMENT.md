# Render deployment

This project is a full-stack TanStack Start application. Deploy the frontend and server API together as **one Render Web Service**.

## Render settings

- Runtime: **Node**
- Root Directory: leave blank when `package.json` is at repository root
- Build Command: `npm install --include=dev && npm run build`
- Start Command: `npm start`

## Required environment variable

Add this in Render → Environment:

`GEMINI_API_KEY=<your Google Gemini API key>`

Do **not** add `LOVABLE_API_KEY`. The application no longer uses the Lovable AI Gateway.

## Local verification

Use Node 20.19+ (Node 22 LTS is recommended):

```bash
npm install
npm run build
npm start
```

Then open the local URL shown by the server and test the interview flow.

The API health check is:

`GET /api/interview`

The interview endpoint is:

`POST /api/interview`

## Important

The Gemini key is server-only. Never prefix it with `VITE_` and never put it in client-side code.













