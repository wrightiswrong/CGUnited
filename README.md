# Build Your Future — CG United Expo Game

A production-quality touchscreen kiosk game built for the CG United Expo 2026 booth.
Players get a fixed budget to insure the parts of their life that matter, spin a wheel
for a real-world disaster, and see exactly how much insurance saved them.

## Quick start

```bash
npm install
npm run dev       # local dev server with hot reload, http://localhost:5173
npm run build     # production build -> dist/
npm run preview   # serve the production build locally to test it, http://localhost:4173
```

For the actual kiosk, deploy the contents of `dist/` to any static file host (a USB-connected
mini PC running a local static server, Netlify/Vercel, or an internal web server all work —
the app makes no server-side calls). Open it full-screen in the browser (F11 / kiosk mode) on
the touchscreen.

## How the game flows

Welcome → Select & Insure → Your Protected Life (scene) → Contact Capture → Disaster Wheel →
Damage Assessment → Results → Leaderboard. A hidden staff panel (tap the bottom-left corner of
the screen 5 times within ~2.5 seconds) lets you export all captured leads as a CSV or clear
test data before the expo opens.

## Architecture

```
src/
  data/            Single source of truth for game numbers: products, premiums, disasters,
                   budget, deductible. Change balancing here — nothing else needs to know.
  game/            Pure functions (no React, no DOM) that turn a disaster + a player's
                   selections into a financial outcome and a score. Easy to unit test.
  state/           One React context + reducer driving the whole game (current screen,
                   selections, budget, disaster, outcome). Screens read from it via
                   useGameState()/useGameActions() instead of passing props around.
  storage/         Storage abstraction. `PlayerRepository` is the interface every backend
                   must satisfy; `LocalStoragePlayerRepository` is the concrete
                   implementation used today. `storage/index.js` is the single place that
                   wires up which one is active — swapping to Firebase/Supabase/a real API
                   later means writing one new class and changing one import, nothing else
                   in the app changes.
  audio/           All sound is synthesized at runtime with the Web Audio API (soft tones/
                   chimes built from oscillators + envelopes) — no external audio files, no
                   licensing concerns. `useSound()` handles the required "unlock on first
                   user gesture" browser rule and exposes a mute toggle.
  components/
    common/        Reusable pieces: Icon (hand-drawn inline SVGs — no emoji, so it never
                   renders as tofu boxes on kiosk hardware with no color-emoji font),
                   Button, Logo, AnimatedNumber (count-up), OrbitStage (the house + orbiting
                   product bubbles visual used on both the Select screen and Results).
    screens/       One component per screen in the flow, plus AdminPanel.
```

### Data model (current balancing)

- Budget: **$10,000 fixed** every session (not randomized — keeps the leaderboard comparable).
- Six product lines: Home ($3,000), Vehicle ($1,500), Business ($3,000), Travel ($1,500),
  Boat ($2,000), Personal Accident ($1,000) — $12,000 total if you bought everything, so
  budget forces real trade-offs.
- Eight possible disasters, each hitting one or more asset categories for a real-dollar loss.
  Uniformly random (no weighting) when the wheel is spun.
- If an asset was insured, the player only pays a flat **$5,000 deductible** per affected
  asset instead of the full loss.
- Score = (money saved by being insured) − (premiums spent). Rewards smart, targeted coverage
  over "buy everything" or "buy nothing."

All of the above lives in `src/data/gameConfig.js` — rebalancing the game is a data change,
not a code change.

### Data storage & leads

Every completed session is saved locally in the browser (`localStorage`), keyed by the
player's email. Playing again with the same email appends a new session to that player's
existing record rather than creating a duplicate — `firstSeenAt` is preserved, `lastSeenAt`
and the session list grow. The leaderboard and staff CSV export both read from this store.

Because storage is fully abstracted behind `PlayerRepository`, moving to a shared/cloud
backend later (so leads sync across multiple kiosk screens, or into a CRM) only requires
writing one new repository class — no screen or game-logic code needs to change.

### Error handling

- A top-level error boundary catches any render crash and offers a one-tap restart instead
  of a blank screen.
- Storage failures (e.g. full/unavailable localStorage) surface as a friendly inline message
  rather than crashing the game.
- The budget/selection logic rejects invalid states (spending more than the budget) with a
  clear inline error instead of allowing an inconsistent state.

## Extending it later

- **New product line or disaster:** add an entry to `src/data/gameConfig.js`. Icons are
  looked up by key in `src/components/common/Icon.jsx` — add a new SVG path there if needed.
  Everything else (selection list, orbit stage, wheel, damage assessment) picks it up
  automatically.
- **New storage backend:** implement `PlayerRepository` (see `src/storage/PlayerRepository.js`
  for the required shape) and swap the export in `src/storage/index.js`.
- **New screen:** add it to the `SCREENS` enum and `SCREEN_ORDER` in
  `src/state/gameReducer.js`, then register the component in `SCREEN_COMPONENTS` in
  `src/App.jsx`.
