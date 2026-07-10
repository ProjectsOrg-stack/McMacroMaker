# McMacroMaker

A Minecraft macro editor and runner. Write macros in a simple DSL, test them in demo mode, or run them for real via a local automation bridge.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Running the Bridge

The bridge is a small Node.js WebSocket server that simulates keyboard/mouse input in your Minecraft client.

**One-liner install (macOS / Linux / Windows):**

```bash
cd bridge && npm install && npm start
```

**Requirements:**
- Node.js v18+ (v26 is supported)
- macOS: `xcode-select --install` for build tools
- Windows: Visual Studio C++ Build Tools if robotjs needs to compile

**Manual setup:**

```bash
cd bridge
npm install
npm start
```

The bridge listens on `ws://127.0.0.1:8080` (localhost only).

### macOS Accessibility Permissions

On macOS you must grant Accessibility permissions to the app running the bridge:

1. Open **System Settings > Privacy & Security > Accessibility**
2. Add **Terminal** (or whichever app runs `node`) and toggle it on
3. You may also need to enable **Input Monitoring** depending on macOS version

## Demo Mode

You can test macros without installing the bridge by enabling **Demo mode** in the editor. Demo mode simulates execution in the browser with timestamped logs.

## Macro DSL Reference

One command per line. Lines starting with `#` are comments.

| Command | Description |
|---|---|
| `CHAT <text>` | Type text and press Enter (use for `/say` or commands) |
| `KEY TAP <key>` | Tap a key (e.g., `KEY TAP e`) |
| `KEY DOWN <key>` | Hold a key down |
| `KEY UP <key>` | Release a key |
| `MOUSE_MOVE <x> <y>` | Move mouse to screen coordinates |
| `MOUSE_CLICK left\|right` | Click mouse button |
| `SCROLL <dx> <dy>` | Scroll wheel by delta |
| `DELAY <ms>` | Pause for milliseconds |

**Example macro:**

```
# Open inventory and click center
CHAT /say Starting macro
DELAY 200
KEY TAP e
DELAY 100
MOUSE_MOVE 960 540
MOUSE_CLICK left
DELAY 500
CHAT /say Done
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | — | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | — | Supabase anonymous key |
| `NEXT_PUBLIC_BRIDGE_URL` | `ws://127.0.0.1:8080` | Bridge WebSocket URL |
| `NEXT_PUBLIC_DEMO_MODE` | — | Set to `true` to default to demo mode |

Copy `.env.example` to `.env.local` and fill in your values.

## Tests

```bash
npm test          # run once
npm run test:watch # watch mode
```

Tests use Vitest with jsdom. Coverage includes:
- DSL parser (comments, delays, blank lines)
- Bridge class (connect, ping, send)
- UI components (ExecutionLog, BridgeStatus)

## Troubleshooting

| Problem | Solution |
|---|---|
| Bridge check shows "Not Available" | Make sure `npm start` is running in the bridge folder |
| `robotjs` fails to install | Run `xcode-select --install` on macOS. On Windows, install VS Build Tools. |
| Keyboard/mouse not working | Grant Accessibility permissions on macOS (System Settings > Privacy & Security) |
| `supabaseUrl is required` at build | This is expected without real Supabase credentials. The app works in demo mode without them. |

## Security & Anti-Cheat Warning

- Simulating inputs may be considered cheating on multiplayer servers. Use only where allowed (singleplayer or servers that permit automation).
- The bridge binds to localhost only and should not be exposed publicly.

## Tech Stack

- **Next.js 13** (App Router) + TypeScript
- **TailwindCSS** for styling
- **Monaco Editor** for macro editing
- **Supabase** for auth (optional)
- **Vitest** for testing
