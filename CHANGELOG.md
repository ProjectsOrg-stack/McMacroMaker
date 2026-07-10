# Changelog

## [0.2.0] - 2026-07-10

### Added
- **Redesigned editor page** with responsive two-column layout (Monaco editor + controls panel)
- **`useBridge` hook** — centralized bridge connection management with status tracking, ping, and sequence execution
- **`useMacros` hook** — centralized macro CRUD over localStorage with typed interfaces
- **DSL parser** (`lib/parser.ts`) — extracted and improved with comment support (`#` lines ignored)
- **New UI components**: EditorHeader, BridgeStatus, ActionButtons, OnboardPanel, ExecutionLog, MacroExamplesTab
- **ExecutionLog** with color-coded entries, level filters (All/Info/Error/Success), auto-scroll, clear, and download
- **Bridge status indicator** with live connection state (Disconnected/Connecting/Connected/Not Available)
- **Non-blocking onboarding** — bridge setup instructions shown as a collapsible panel, not a blocking modal
- **Macro examples tab** — clickable DSL examples that insert into the editor
- **DSL reference** — collapsible in-page reference for all commands
- **Design tokens** in tailwind.config.js (primary, success, danger, surface, muted, panel, codeBg colors + Inter font)
- **Full type definitions** (`lib/types.ts`) for BridgeMessage, MacroStep, Macro, LogEntry
- **Bridge class improvements** — constructor accepts URL, added `offMessage()` for handler cleanup
- **Test suite** with Vitest: parser tests, Bridge class tests, ExecutionLog + BridgeStatus component tests (28 tests)
- **Environment variables**: `NEXT_PUBLIC_BRIDGE_URL`, `NEXT_PUBLIC_DEMO_MODE`
- **Accessibility**: aria-labels, aria-live log region, keyboard-accessible controls, focus rings

### Changed
- Editor page completely rewritten from single-file to modular component architecture
- Bridge instance now accepts custom URL via constructor (defaults to env var or `ws://127.0.0.1:8080`)
- localStorage key format unchanged (`macros:<userId>`) — no migration needed

### Fixed
- Bridge `onMessage` runtime guard no longer needed — typed hook handles all bridge communication
- Log entries now have structured levels (info/success/error/warn) instead of plain strings
