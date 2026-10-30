# Move Duration Indicators in History Log

Add competitive insight to the 3D Wizard Chess Move History Log by measuring and displaying active player and AI thinking duration next to each move in the floating HUD drawer.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions were clarified and confirmed in Phase 1:

- **Timing Metric**: Active turn thinking time excluding animation playback (starts when turn activates, stops when move command is issued).
- **Badge Styling**: Subtle gold pill badge (`.move-duration-badge`) beside each move notation with monospace tabular numbers (e.g., `+2s`, `+14s`).
- **PGN Export**: Kept strictly clean and standard (no duration annotations in clipboard PGN).

---

## 1. Overview & Core Concept

- **What It Does**: Enhances the existing collapsible Move History Log drawer by appending a subtle timing badge beside each move (e.g., `e4` `+1s`, `d5` `+2s`).
- **Target Audience**: Competitive chess players and casual learners interested in assessing move speed, AI calculation time across difficulty tiers, and pacing analysis.
- **Key Value**: Provides instant tactical context on whether an opponent (or the Sanctum AI) played an instant book move or spent significant time calculating deep tactical branches.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Game Start / New Game**:
   - Clock resets (`turnStartTime = performance.now()`).
2. **Move Selection**:
   - Player or AI ponders their move.
   - Upon clicking or executing the move, thinking time $t_{\text{think}} = (\text{now} - \text{turnStartTime}) / 1000$ is captured.
3. **Move Logging**:
   - When the move completes and is logged to `#history-moves-list`, the move entry displays both the SAN notation and a styled duration badge:
     `1.  e4 [+1s]   e5 [+2s]`
4. **Subsequent Turn Start**:
   - Once animations settle and the board hands control to the opponent, `turnStartTime` is set afresh.
5. **PGN Copy**:
   - Clicking **Copy PGN** continues to copy clean standard algebraic notation (e.g. `1. e4 e5 2. Nf3 Nc6`) without timing noise.

### Visual Identity & Styling
- **Aesthetic Direction**: Gothic Sanctum dark obsidian glass aesthetic with warm gold accents.
- **Badge Anatomy**:
  - Pill enclosure (`rounded-full`, `px-1.5 py-0.5`).
  - Dark translucent gold background (`rgba(212, 175, 55, 0.14)`).
  - Delicate hairline gold border (`1px solid rgba(212, 175, 55, 0.32)`).
  - Crisp golden typography (`#f5d76e`, `0.68rem / 11px`, `tabular-nums font-mono`).
- **Duration Formatting**:
  - Less than 1 second: `+<1s`
  - 1s to 59s: `+Ns` (e.g., `+2s`, `+15s`)
  - 60s or more: `+Xm Ys` (e.g., `+1m 12s`)

---

## 3. Key Product Decisions & Trade-Offs

- **Excluding Animation Playback**:
  - *Chosen Approach*: Record duration at the start of `executeChessMove`, not after the 2-second melee strike and stone shatter physics complete.
  - *Why*: Reflects true cognitive thinking time and AI search duration without being skewed by animation distance or camera return tweens.
- **UI Display vs. PGN Clipboard**:
  - *Chosen Approach*: Badges rendered only in DOM tree; PGN generator omits tags unless explicitly requested.
  - *Why*: Guarantees 100% interoperability with external chess engines (Lichess, Chess.com, Stockfish) when pasting copied games.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────┐
│                   Turn Timing Cycle                    │
└────────────────────────────────────────────────────────┘
                           │
      resetChessBoard() / finishMove()
                           ▼
              ┌────────────────────────┐
              │ turnStartTime = now()  │
              └────────────────────────┘
                           │
           Player Think / AI Minimax Search
                           │
                           ▼
              ┌────────────────────────┐
              │ executeChessMove(...)  │
              │ durationSec =          │
              │  (now - start) / 1000  │
              └────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │ moveHistory.push({     │
              │   move: {              │
              │     ...,               │
              │     durationSec        │
              │   }                    │
              │ })                     │
              └────────────────────────┘
                           │
                  finishMove() -> UI Sync
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│               #history-moves-list DOM                  │
│                                                        │
│  <div class="history-row">                             │
│    <span class="history-turn-num">1.</span>            │
│    <span class="history-move-white">                   │
│      e4 <span class="move-duration-badge">+1s</span>   │
│    </span>                                             │
│    <span class="history-move-black">                   │
│      e5 <span class="move-duration-badge">+2s</span>   │
│    </span>                                             │
│  </div>                                                │
└────────────────────────────────────────────────────────┘
```

### Component & Engine Updates
1. **`src/wizardChessEngine.js`**:
   - Add state variable `currentTurnStartTime = performance.now()`.
   - Reset `currentTurnStartTime` inside `resetChessBoard(...)`.
   - Update `currentTurnStartTime` when `currentTurn` toggles inside `finishMove()`.
   - In `executeChessMove`, calculate `durationSec = Math.max(0.1, (performance.now() - currentTurnStartTime) / 1000)` and persist inside `moveHistory.push`.
   - Add `formatMoveDuration(sec)` helper.
   - Update `updateMoveHistoryLogUI()` to render `<span class="move-duration-badge">${formatMoveDuration(entry.move.durationSec)}</span>`.
2. **`src/styles.css`**:
   - Add `.move-duration-badge` styling with gold translucent pill, tabular numbers, and optical alignment.
   - Support dark mode and mobile sizing.
3. **`test/applet.test.mjs`**:
   - Add test assertion validating duration calculation, `.move-duration-badge` rendering in move log, and clean PGN export.

---

## 5. Verification Plan

- Run `node --test test/applet.test.mjs` to verify test suite passes.
- Run `lint_applet` (`tsc --noEmit`).
- Run `compile_applet` (`vite build`).
- Verify duration pill styling and PGN copy output.
