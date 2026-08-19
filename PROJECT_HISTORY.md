# Build Your Future / CG United — Project History

Reconstructed 2026-08-19 from the original "Expo booth insurance game" Cowork
chat (connected at the time to `C:\Users\test\Desktop\CG Game Final`, before
the code moved to this Git repo). This is the full commercial and design
history behind the game — read this once for context, then rely on
`CLAUDE.md` for working rules and `PROJECT_LOG.md` for the running session
log. Don't edit this file casually; it's a historical record.

---

## 1. What this project actually is

Don (operating as **White Owl Solutions**) built an interactive touchscreen
kiosk game, **Build Your Future**, for **CG United Insurance (Jamaica)**'s
booth at Expo 2026, working alongside Wright Productions & Rentals (the
event/booth organizer). The game teaches insurance literacy as entertainment:
a visitor gets a fixed budget, chooses which of CG United's real product
lines to insure, spins a disaster wheel, and sees how much money insurance
saved them versus what an uninsured loss would have cost.

It shipped and ran live at the CG United booth July 11–12, 2026 (2 days),
captured 71 plays and 60 unique leads, and performed well. That phase is
done.

The project is now in a **second, commercial phase**: converting the one-off
expo build into an owned, licensed, ongoing paid relationship with CG United.
A finalized licensing/services proposal (recommended package: **US$13,600**)
is ready but, as of 2026-08-19, **not yet sent** to CG United.

## 2. Major decisions, and why

**Concept:** CG United's own booth mockup originally featured a "Spin to
Win" prize wheel. Don built an early prototype, "Build Your Safety Net" (a
timed block-building house game), for early feedback — since fully
superseded. Final concept: choose which of six real CG United product lines
to insure within a budget, spin a disaster wheel, see the financial outcome.

**Visual direction:** deliberately "premium, minimalist, fast," benchmarked
against Apple, Duolingo, Cash App, Headspace, Stripe. The choice-visualization
mechanic went through three iterations (tappable shaped blocks → tappable
house segments → passive orbiting-icon "life dashboard") before landing.
Pet and Health/Life insurance were added then removed again, to stay aligned
to CG United's actual six product lines.

**Theme:** only the Welcome screen keeps the dark navy hero; every other
player-facing screen uses a light theme (`#eef3f9` background, white cards,
navy text) to match CG United's own proposal materials. The internal
Admin Panel was deliberately left dark — not player-facing, out of scope for
the re-theme.

**Branding:** CG United's exact colors and typography were pulled from their
official style guide PDF, not approximated: Ocean Blue `#1D4289`, Caribbean
Blue `#0095C8`, Black `#000000`, Gray `#c8c8c8`, Verdana Bold/Regular
(their own approved Gotham substitute). The logo was re-extracted from the
style guide PDF at high DPI, plus a pure-white lockup variant generated to
match their official "WHITE" logo variant.

**Game economy:** budget vs. total premiums went through several rebalances
— $10,000 vs $12,000 (~83% affordable) → $6,000 vs $12,000 (~50%, forced
trade-offs) → final: **$10,000 budget vs $20,000 total premiums**, same 50%
ratio, bigger numbers. Live in `src/data/gameConfig.js`.

**Scoring:** several models proposed (pure dollar-swing, bounded 0–100
"Coverage Efficiency Score," a blended model) before landing on the version
in `src/game/resultsEngine.js` — money saved minus premiums spent, normalized
into a score.

**Disaster wheel:** expanded iteratively to 12 segments across categories
(water, fire, impact, medical, business, security), each with a custom icon
and synthesized sound design.

**Technical architecture:** React 19 + Vite 5.4.11 + Framer Motion. All audio
is synthesized at runtime via the Web Audio API — zero external audio files,
no licensing questions. `vite.config.js` uses `base: './'` so the same build
works as both a GitHub Pages subpath deployment and an offline/localhost
deployment. No backend — persistence goes through a `PlayerRepository`
abstraction (`src/storage/PlayerRepository.js` interface,
`LocalStoragePlayerRepository.js` implementation), `localStorage` key
`byf_players_v2`. Swapping to a real backend means one new repository class
and one line changed in `storage/index.js`.

**Deployment, three-tiered:**
1. Primary: live GitHub Pages URL, opened in the kiosk's built-in browser.
2. Fallback: a Windows laptop running Chrome kiosk mode, same URL.
3. Offline backup: `kiosk/offline/` — a PowerShell HttpListener static file
   server plus a batch launcher forcing an isolated Chrome profile in
   `--kiosk` mode, zero internet dependency, meant to be copied via USB.

**Business strategy:** CG United's contact, Karen, sent a message bundling
two asks — reuse rights, and keeping Don involved as ongoing support. Rather
than picking one, the decision was a hybrid: sell CG United full one-time
ownership/usage rights, while positioning White Owl Solutions as their
preferred ongoing technical/implementation partner.

Pricing was calibrated against Jamaican developer rate benchmarks (~J$1,591–
2,088/hr, ~US$10–13/hr) and international interactive-kiosk industry
practice (hardware and software/content priced as separate line items).
Rejected pricing models: flat JMD platform fee (J$1.2M–1.8M), per-event
retainer (J$60K–120K), per-lead (J$800–1,500 per qualified lead). The
original expo build was delivered at an "introductory rate" given the
compressed first-engagement timeline — used to justify why the follow-on
proposal is priced significantly higher (implied cost-per-lead ~J$1,167 even
at the lower original price).

## 3. What's been built, and where it lives

**Code (this repo):** `src/` (full React/Vite source), `dist/` (build
output), `kiosk/launch-kiosk.bat` (online kiosk launcher →
https://wrightiswrong.github.io/CGUnited/), `kiosk/offline/` (offline kiosk
snapshot — manually refreshed, does not auto-update).

**⚠️ `README.md` in this repo is stale** — it still describes the earlier
$10,000-vs-$12,000 economy, not the final $10,000-vs-$20,000 rescale. Trust
`src/data/gameConfig.js`, not the README, for current numbers. Worth fixing,
not urgent.

**Live deployment:** https://wrightiswrong.github.io/CGUnited/ — this is the
`gh-pages` branch of this same repo, and it is the actual URL used at the
CG United expo booth and potentially still referenced by CG United. **Do not
touch, redeploy, or overwrite the `gh-pages` branch without explicit
confirmation from Don** — unlike a normal "old build," this one may still be
live/linked externally.

**Business/commercial materials:** moved to Google Drive on 2026-08-18 (see
`CLAUDE.md` for details) — `Jamaica Consulting Biz` project,
`WrightWorks Brand/Case Studies/CG United/`:
- `Build Your Future - Business Value Summary.docx`
- `Build Your Future - Licensing and Ongoing Services Proposal.docx`
  (finalized, dated August 4, 2026 — see Section 4 for full terms)
- `build-your-future-consolidated-leads.xlsx` (60 unique leads / 71 sessions)
- `Email to Karen - Leads and Contract.md` (earlier email, sent — accompanied
  the leads spreadsheet and a signed contract Don has outside this project)
- `Email to CG United - Proposal and Quote.md` (drafted 2026-08-19, cover
  email for the licensing proposal — **not yet sent**)

**Not in this project at all:** the original "Build Your Safety Net"
block-game prototype (HTML/JS, 32-second walkthrough video, game-spec
markdown) — predates the pivot to "Build Your Future," fully superseded,
apparently left in an earlier session's separate outputs folder. Not worth
chasing down unless historical reference is specifically needed.

## 4. Full CG United history

**Contact:** Karen, at CG United — exact title/role never established;
confirm before future formal correspondence.

**Delivered/run:** HUAWEI IdeaHub B3 touchscreen (HarmonyOS, Chromium-based
"HUAWEI Browser"), July 11–12, 2026.

**Results:**

| Metric | Value |
|---|---|
| Total plays/sessions | 71 |
| Unique leads captured | 60 (deduped from 61 raw signups, 3 CSV exports, 1 duplicate merged) |
| Players who returned for 2nd+ try | 9 |
| Average Protection Score | 58.3% |
| Leads scoring 80%+ | 36.7% |
| Leads with institutional email domains | 6 (banking, real estate, government, retail) |

**First round of deliverables:** leads spreadsheet + a signed/witnessed
contract (Don has this; its exact terms were never shared into this
conversation — if it materially differs from the new licensing proposal,
that hasn't been reconciled anywhere in this record). The accompanying email
also pitched six unbuilt/unagreed future project ideas: an embedded
website version for ongoing lead capture, gamified staff/agent training, a
"find your coverage gap" quiz, a financial literacy game series, a
new-agent-onboarding simulation, and white-labeled kiosk builds for other
trade shows.

**Second round — the licensing proposal** (`Build Your Future - Licensing
and Ongoing Services Proposal.docx`, dated August 4, 2026):

Investment summary:

| Item | Investment |
|---|---|
| Platform Rights and Handover (one time) | US$11,400 |
| Production Hardening | US$1,300 |
| Production Hardening Plus | US$2,200 |
| Configuration and Deployment Preparation (base) | US$900 |
| Installation and Logistics (indicative) | US$320–$1,900 |

Recommended initial package: Platform Rights and Handover + Production
Hardening Plus = **US$13,600**.

- **Platform Rights and Handover:** permanent rights across CG United's
  events/markets/projects, no renewal fee; source code, branding, deployment
  docs; right to commission future changes with White Owl Solutions as
  preferred partner.
- **Production Hardening (US$1,300):** reliability fixes, consistent
  leaderboard behavior, device fit, browser compatibility, basic docs.
- **Production Hardening Plus (US$2,200):** all of the above, plus wider
  device testing, a simple admin screen for CG United's own team (view
  sessions, export leaderboard, restart activations without White Owl
  Solutions), lead/score export, session recovery, staff training walkthrough,
  direct post-handover support.
- **Configuration and Deployment Preparation (US$900 base):** content/branding
  updates, one device test, one QA session, up to 2 revision rounds, up to 8
  hours remote support in standard business hours. Larger changes quoted
  separately.
- **Installation and Logistics (indicative):** Kingston/nearby US$320–$570;
  other Jamaican parishes US$500–$950; Caribbean/international US$950–$1,900
  (excludes travel/other costs). Reachable events: Don travels, CG
  United-covered expenses. International: vetted local technician
  subcontracted through White Owl Solutions.
- **Data ownership:** CG United owns all user/activity data. Returning users
  deduplicated by email. Data export available after each deployment in an
  agreed format. CG United approves consent/privacy language.
- **Key terms:** 10 business days acceptance testing after delivery; 30-day
  warranty from acceptance (or automatic if no defects reported); fees in
  USD; hardware/travel/venue/taxes excluded unless specifically listed.
- **Payment structure:** Platform Rights — 50% on approval, 50% on
  delivery/acceptance. Hardening (either tier) — 50% before work, 50% on
  delivery. Configuration/Deployment Prep — paid in full before work.
  Installation/Travel — deposit + approved costs before deployment, final
  reconciliation after.
- **Next steps per the document:** (1) CG United confirms preferred
  Hardening tier, (2) approves the commercial proposal, (3) White Owl
  Solutions prepares the final agreement and implementation schedule.

**Most recent action (2026-08-19):** drafted the cover email
(`Email to CG United - Proposal and Quote.md`) to send alongside the
proposal. Not yet sent — Don hadn't responded on tone/detail adjustments as
of this reconstruction.

## 5. What's still open

- **Whether/when CG United approves the licensing proposal**, and which
  Hardening tier they pick — the single biggest open item; everything
  downstream depends on it.
- Cover email not yet sent — needs Don's review first.
- Six bonus project ideas pitched to Karen earlier are unresponded-to — none
  agreed, scoped, or priced.
- Physical kiosk machine cleanup at CG United's end (consolidating duplicate
  kiosk folders — `game2`, `game3`, `test` — each with its own disconnected
  Chrome-profile leaderboard data) was recommended but never confirmed done.
  This already caused one real "leaderboard is empty" scare — the actual
  data turned out to be in the `test` folder copy, not the assumed-canonical
  `game3` copy.
- The signed/witnessed contract Don has exists entirely outside this
  project's record — if its terms differ from the new proposal, that hasn't
  been reconciled.
- **A GitHub personal access token used to originally push to GitHub Pages
  was flagged as worth revoking once no longer needed**
  (github.com/settings/tokens) — no confirmation this was ever done. Worth
  checking.
- Karen's exact title/role unconfirmed.

## 6. Facts and constraints that only existed in the original chat

- Exact economy: `STARTING_BUDGET = 10000`; premiums Home $5,000, Business
  $5,000, Boat $3,300, Vehicle $2,500, Travel $2,500, Personal Accident
  $1,700 (`TOTAL_PREMIUMS = 20000`); flat $5,000 deductible per affected,
  insured asset. Deliberately set at exactly half of total premiums, to
  force real trade-offs while keeping leaderboard scores comparable across
  sessions (budget is fixed, not randomized).
- CG United brand: Ocean Blue `#1D4289`, Caribbean Blue `#0095C8`, Black
  `#000000`, Gray `#c8c8c8`, Verdana Bold/Regular.
- Live URL: https://wrightiswrong.github.io/CGUnited/
- **Critical operational gotcha:** the offline kiosk's leaderboard/lead data
  lives inside a Chrome `--user-data-dir` profile folder that the launcher
  script creates inside `kiosk/offline` on whichever machine runs it (key
  `byf_players_v2`) — not in any shipped file. Deleting or overwriting that
  folder permanently destroys recorded leads; there's no other copy. Also:
  different local server ports are treated as separate storage origins by
  Chrome, which caused a real "leaderboard looks empty" incident even within
  the same Chrome profile.
- `serve.ps1` binds a fixed candidate port list (8787, 8788, 8789, 8790,
  8791, 8850, 9090, 9191) specifically so `portSync.js` can find and merge
  sessions recorded on a different port than the one currently being viewed.
- Pricing negotiation backstory (not in any client-facing document):
  Jamaican dev rate benchmarks (~J$1,591–2,088/hr, ~US$10–13/hr; senior devs
  ~J$4.95M/year); rejected pricing models (flat JMD fee, per-event retainer,
  per-lead); the "introductory rate" / ~J$1,167-implied-cost-per-lead framing
  used to justify pricing the follow-on proposal higher without it reading
  as an arbitrary hike to Karen.
- Business name for all CG United-facing material going forward: **White Owl
  Solutions** (not just "Don").
- Device used at the actual booth: HUAWEI IdeaHub B3.
