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
- Not yet cloned to the Mac.
- Not yet connected as a Cowork Project on either machine.
- `package.json` name field is still the generic `"app"` — worth renaming
  once there's a real settled project name, not urgent.

## 2026-08-18 — Setup — Pushed to GitHub (wrightiswrong/CGUnited)

Repo initialized, committed (90 files, 7229 insertions), and pushed. Ran into
two setup snags first: no global git identity configured on this machine yet
(fixed with `git config --global user.email/user.name`), and `gh` CLI isn't
installed on Windows — unlike the Mac, Windows push auth goes through the
bundled Git Credential Manager instead, so the GitHub repo had to be created
via the website rather than `gh repo create`.

The originally-planned repo name (`cg-game-final`, new and empty) was never
actually created — Don instead pointed this at an existing repo,
**`wrightiswrong/CGUnited`**, which already had one commit on a `gh-pages`
branch (a deployed build of an earlier version: `index.html`, `assets/`,
plus the same `favicon.svg`/`icons.svg`/`texture-waves.svg` seen in this
repo's `public/`). This repo's full source pushed cleanly to a new `main`
branch — since `main` didn't already exist there, nothing on `gh-pages` was
touched or at risk. Both branches now coexist: `gh-pages` still serves
whatever was previously deployed, `main` is this repo's actual source.

**Remote is `https://github.com/wrightiswrong/CGUnited.git`, not
`cg-game-final`** — use this name in any future setup, cloning, or CI/deploy
config for this project.

**Still open:**
- Not yet connected as a Cowork Project on either machine.
- Whether `gh-pages` should eventually be redeployed from the current `main`
  source, or left as-is, hasn't been decided — don't touch that branch
  without asking. **Update:** confirmed in `PROJECT_HISTORY.md` that
  `gh-pages` is the actual live URL used at the CG United expo booth, not
  just an old build — treat it as production, not disposable.
- `package.json` name field is still the generic `"app"`.

## 2026-08-19 — Setup — Full project history reconstructed and committed

The original Cowork chat this project started in ("Expo booth insurance
game," still connected to the old `C:\Users\test\Desktop\CG Game Final`
path) was asked to reconstruct the entire project history from scratch,
since that context predates this repo's existence and was otherwise at risk
of being lost. It mined its own raw session transcript plus the actual
proposal/summary docx files and lead spreadsheet to produce a complete
account. Saved here as `PROJECT_HISTORY.md` — covers the full design
history (concept pivots, economy rebalances, branding sourcing), the
complete CG United commercial relationship (results, the licensing proposal
terms in full, payment structure, what's approved vs. still pending), and a
"facts that only existed in chat" section (exact game economy reasoning,
the offline kiosk's localStorage/Chrome-profile leaderboard gotcha, port
list rationale, pricing negotiation backstory).

Two concrete action items surfaced that Don should know about:
- **A GitHub personal access token used to originally push to GitHub Pages
  was flagged as worth revoking and was never confirmed done** — check
  github.com/settings/tokens.
- `README.md` in this repo is stale (still describes the earlier
  $10,000-vs-$12,000 economy, not the shipped $10,000-vs-$20,000 version) —
  low priority, but misleading if anyone reads it for current numbers.

**Still open:**
- GitHub PAT revocation — unconfirmed either way.
- `README.md` staleness — not fixed.
- The licensing proposal (US$13,600 recommended package) is finished but
  not yet sent to CG United; the cover email is drafted but not sent either.
- Six bonus project ideas pitched to CG United's contact Karen are
  unresponded-to.
- Physical kiosk machine folder cleanup at CG United's end was recommended,
  never confirmed done.

## 2026-08-18 — Setup — Cloned to Mac; business docs split out to Drive

Mac clone completed at `~/Dev/cg-game-final` (cloned from
`wrightiswrong/CGUnited`). Hit two snags, both resolved: the clone checked
out `gh-pages` by default (old deployed build, no `package.json`) — fixed
with `git checkout main` — and a stray untracked `package-lock.json` blocked
that checkout, removed since it wasn't tracked. `npm install` then completed
clean (71 packages; the 4 audit vulnerabilities are standard dependency
noise, not new).

Separately: the business documents that were committed alongside the code
(Business Value Summary, licensing proposal, lead spreadsheet, outreach
emails, mockup screenshots) moved out to Google Drive — they're client
material, not code, and belong in the same place as everything else
WrightWorks does with clients. Final location:
`Jamaica Consulting Biz` (Drive project) →
`WrightWorks Brand/Case Studies/CG United/`, alongside the existing
`CG-United-Build-Your-Future.md` writeup for the same case study.

**Still open:**
- **The duplicate copies of those files are still sitting in this repo's
  working directory and in git history** (from the initial commit, before
  the split) — couldn't be removed via Cowork's file access (permission
  restriction on this specific folder from that session). Don needs to
  delete them locally in Windows Explorer or PowerShell, then
  `git add -A && git commit -m "Remove business docs, moved to Drive" && git push`,
  and pull that removal down on the Mac afterward.
- Not yet connected as a Cowork Project on either machine.
- `gh-pages` redeploy decision still open.
- `package.json` name field is still the generic `"app"`.
