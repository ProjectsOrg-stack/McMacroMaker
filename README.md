# McMacroMaker

A scaffolded Next.js + TypeScript project for a Minecraft macro editor. This initial commit contains:

- Next.js app (app router)
- Tailwind CSS setup
- Supabase auth integration client (no keys committed)
- Monaco Editor integration
- LocalStorage-backed macros per user session
- Simple WebSocket client for a local Minecraft bridge (ws://localhost:8080)

Setup

1. Install dependencies:

   npm install

2. Create a `.env.local` file with:

   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

3. Run dev server:

   npm run dev

Supabase CORS / Redirects

Add `http://localhost:3000` and your production Vercel URL to the project's Allowed Origins and Redirect URLs in the Supabase dashboard (Auth → Settings → Redirect URLs and Project Settings → API → CORS).

Local Minecraft Bridge

This scaffold expects a local WebSocket bridge at ws://localhost:8080 that accepts a simple JSON protocol:

{ "command": "/say hello", "delayMs": 500 }

The frontend will send each command JSON as it runs the macro. You can implement the bridge later as a Node.js script that forwards to a Minecraft server/mod.

What's included

- README (this file)
- .env.example
- Minimal pages/components to sign in, view dashboard, edit and run macros

Next steps

- Review the scaffolded UI and auth flow
- Provide Supabase anon key in `.env.local`
- I can extend features (import/export ZIP, templates, execution history) on request
