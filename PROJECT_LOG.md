# Project Log — CG Game Final (Build Your Future kiosk)

Running record of what happened on the code side of this project. See
`CLAUDE.md` for the full protocol — read this first every session, append
only, re-read immediately before appending if you read it earlier in a long
session.

---

## 2026-08-18 — Setup — Moved from Desktop to C:\Dev, prepped for Git

Originally lived at `C:\Users\test\Desktop\CG Game Final` — never inside the
Google Drive-mirrored folder, which is why it never showed up on the Mac.
Don moved it to `C:\Dev\CG Game Final` so it could follow the same pattern
already working for `xodus-phase0a`: tracked in Git, reachable from both
machines via GitHub rather than Drive.

Before the first commit:
- `.gitignore` already excluded `node_modules`/`dist` — added a pattern for
  stale `vite.config.js.timestamp-*.mjs` files (Vite regenerates one of
  these every `npm run dev` restart; found 12 already sitting in the repo
  root) and an explicit `.env`/`.env.local` exclusion.
- Wrote `CLAUDE.md` (agent instructions, same shape as `xodus-phase0a`'s)
  and this log.
- Left the business documents (Business Value Summary, licensing proposal,
  lead spreadsheet, outreach emails, mockup jpgs) in place rather than
  moving them elsewhere — small, harmless to version alongside the code,
  not something to reorganize without being asked.

This is the kiosk experience behind the CG United Insurance Jamaica "Build
Your Future" case study cited in the WrightWorks brand work.

**Still open:**
- Repo not yet `git init`'d — Don is running the init/commit/push commands
  himself (same reason as `xodus-phase0a`: needs his real GitHub auth, not
  available from inside a Cowork session).
- Not yet cloned to the Mac.
- Not yet connected as a Cowork Project on either machine.
- `package.json` name field is still the generic `"app"` — worth renaming
  once there's a real settled project name, not urgent.
