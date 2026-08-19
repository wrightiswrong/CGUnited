# CG Game Final (Build Your Future kiosk) — Agent Instructions

This is a Git repository, not a synced Drive folder. Moved here from
`C:\Users\test\Desktop\CG Game Final` on 2026-08-18 specifically so it could
be tracked in Git and reached from both machines the same way `xodus-phase0a`
already is — code doesn't belong in the Google Drive workspace (build output
and `node_modules` sync badly and are machine-specific).

This is the React/Vite kiosk experience behind the CG United Insurance
Jamaica "Build Your Future" case study referenced in the WrightWorks brand
work (`Jamaica Consulting Biz` project) — 71 completed plays, 60 qualified
leads, ~85% play-to-lead conversion, zero downtime, per that case study.

## Start of every session

```bash
git pull
```

If it reports conflicts, stop and show me — don't resolve them yourself.

**If you're a Cowork session running in Anthropic's cloud sandbox, this will
likely fail with a network/proxy error — that's expected.** Cloud Cowork
sessions have no outbound network access to GitHub by default; your file
access to this real folder (via the Claude Desktop app) still works normally.
If `git pull` fails this way:
- Don't treat it as a blocker. Check `git status` — if the tree is clean,
  what you can see is accurate even though you can't freshly verify against
  GitHub.
- Tell me plainly you couldn't verify freshness, and ask me to confirm I've
  pulled recently if it matters for what you're about to do.
- **Don't attempt `git push` either** — same failure. Prepare the commit (or
  tell me what you'd commit) and let me push it, or hand off to a Claude Code
  session, which usually has real network access.

**If you're Claude Code** (running natively), you most likely have real
network access — `git pull`/`git push` should work as written above.

## Before committing anything

- Never commit or push automatically.
- Run `git status` and `git diff`, show me both, and wait for my approval.
- Once approved: clear commit message, commit, then `git push` — unless
  you're a network-restricted Cowork session (see above), in which case
  commit locally and tell me the push still needs to happen.

## Never commit

- `.env`, `.env.local`, or anything else matching `.gitignore`
- Any file containing an API key, token, or credential — ask first if unsure

## Environment

- Node project (React 19 + Vite 5 + framer-motion). `node_modules/` and
  `dist/` are gitignored — never commit them, never try to sync them via
  Drive either.
- `npm install` then `npm run dev` to run locally; `npm run build` for the
  kiosk build; see `kiosk/launch-kiosk.bat` for the actual kiosk launch flow
  and `kiosk/offline/` for the offline-mode assets.
- Never write an absolute path (`C:\...` or `/Users/...`) into a committed
  file — paths differ between Windows and Mac.

## What's in this folder besides code

A handful of business documents live alongside the code (`Build Your Future -
Business Value Summary.docx`, the licensing/services proposal, lead-tracking
spreadsheet, outreach emails, mockup screenshots `pg-*.jpg`/`v*pg-*.jpg`).
These are small and harmless to keep versioned here, but they're client/
business material, not code — don't treat them as something to refactor or
reorganize without asking, and don't assume they're current; check with me
before quoting numbers from them in anything client-facing.

## Project log — keep this current

Maintain `PROJECT_LOG.md` at this repo's root. Read it first every session.
If you read it early in a long session and are about to append much later,
**re-read it immediately before appending** — another session (Cowork,
Claude Code, either machine) may have written to it since. Append only,
never rewrite prior entries.

**Entry format:**
```
## YYYY-MM-DD — Tool — Short title

What actually happened — factual and specific. What ran, what broke, what
the real result was.

**Still open:** what's unresolved, in priority order.
```
