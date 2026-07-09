# McMacroMaker

A scaffolded Next.js + TypeScript project for a Minecraft macro editor. This commit adds a local automation bridge that can simulate keyboard/mouse input and run macros directly in your Minecraft client.

What's new
- bridge/bridge-robotjs.js: a Node WebSocket bridge using robotjs that executes a small DSL (CHAT, KEY, MOUSE_MOVE, MOUSE_CLICK, SCROLL, DELAY). The bridge now responds to a ping message so the frontend can detect its presence and readiness.
- Updated editor to probe the bridge on load, show an onboarding modal with copyable install commands when the bridge is missing, and a demo mode to simulate macros without installing anything.

Important: macOS accessibility
- On macOS you must grant Accessibility permissions to the app that runs the bridge (Terminal or Node).
  1. Open System Settings → Privacy & Security → Accessibility.
  2. Add Terminal (or the app you use to run `node`) and toggle permission.
- You may also need to allow Input Monitoring or Screen Recording depending on macOS version.

How detection & onboarding works

- The frontend sends a ping: { "type": "ping" } to ws://127.0.0.1:8080.
- The bridge replies: { "event": "pong", "ready": true/false, "platform": "darwin" }
- If the bridge is missing or unreachable the app shows an onboarding modal with platform-specific install steps and a button to copy the commands.
- Demo mode lets users try the editor without installing anything — it simulates execution locally.

How to run the bridge (macOS / Windows / Linux)

1) Install Node.js (v18+ recommended).
2) cd bridge
3) npm install
   - On macOS you may need: xcode-select --install (install command line tools)
   - On Windows you may need build tools for native modules (Visual Studio C++ build tools)
4) Start the bridge:
   npm start
5) Grant Accessibility permissions on macOS when prompted (System Settings → Privacy & Security → Accessibility) for Terminal or your Node runtime.
6) Keep Minecraft in foreground (focused) while macros run, or ensure the macro moves/clicks to the correct coordinates.

Bridge DSL (one command per line)
- CHAT <text>
  - Types text and presses Enter (use for /say or commands)
- KEY TAP <key>
  - Taps a key (e.g., KEY TAP e)
- KEY DOWN <key>
  - Hold a key
- KEY UP <key>
  - Release a key
- MOUSE_MOVE <x> <y>
  - Move mouse to screen coordinates
- MOUSE_CLICK <left|right>
  - Click mouse
- SCROLL <dx> <dy>
  - Scroll wheel by delta
- DELAY <ms>
  - Pause for ms milliseconds

Example macro

CHAT /say Starting macro
DELAY 200
KEY TAP e
DELAY 100
MOUSE_MOVE 960 540
MOUSE_CLICK left
DELAY 500
CHAT /say Done

Security & anti-cheat warning
- Simulating inputs may be considered cheating on multiplayer servers. Use only where allowed (singleplayer or servers that permit automation).
- The bridge binds to localhost only and should not be exposed publicly. Do not run it on a network-accessible interface.

If robotjs install fails
- On macOS (Apple Silicon) you may need to install a compatible Node version and Xcode command line tools. If robotjs fails to build, tell me the error and I will switch the bridge to use nut.js instead.

Next steps I can take
- Add a small calibration UI/tool to the repo (click to capture coordinates).
- Replace robotjs with a nut.js-based bridge if robotjs installation causes trouble on your mac.
- Add an Electron wrapper so users can run the bridge as a single app with required permissions (more user-friendly).
- Add more advanced DSL features (variables, loops, conditions), templates, and macro previews.
