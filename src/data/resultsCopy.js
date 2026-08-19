// ---------------------------------------------------------------------------
// Short "why insurance matters" passages shown on the Results screen.
// One is picked at random each time a player reaches their results, so the
// booth doesn't show the exact same line to back-to-back players, but every
// version sticks to the same core message: life is unpredictable, and
// insurance is how you stay protected against that unpredictability.
// Deliberately generic (not tied to the specific disaster just rolled) so it
// reads naturally regardless of what happened in that round.
// ---------------------------------------------------------------------------

export const RESULTS_PASSAGES = [
  'Life rarely gives warning. A single unexpected event — a storm, an accident, an illness — can undo years of careful saving in an instant. The right coverage doesn’t stop the unexpected from happening, but it stops it from derailing everything you’ve built.',
  'None of us can predict tomorrow. That’s exactly the point of insurance: it’s not about assuming the worst will happen, it’s about making sure you’re not starting from zero if it does.',
  'The disasters in this game are simplified, but the uncertainty behind them isn’t. Fires, accidents, storms, and emergencies don’t ask permission — they just happen. Insurance is how you stay standing when they do.',
  'Every dollar you didn’t spend on premiums today can feel like a win — until the day something goes wrong. Real protection means being ready before you need it, not after.',
  'You can’t schedule a flat tire, a kitchen fire, or a health scare. What you can control is whether you’re covered when one shows up. That’s the whole idea behind insurance.',
  'It’s easy to assume disaster happens to someone else — until it doesn’t. Insurance exists for exactly that gap between what we expect and what actually happens.',
  'The best time to think about coverage is before you need it, not during the emergency. A little planning now can mean the difference between a hard week and a devastating one.',
  'Unpredictable doesn’t mean unpreventable damage. While you can’t stop a storm or a break-in, you can make sure the financial hit doesn’t fall entirely on you.',
  'The wheel in this game decides what happens next. In real life, nothing decides for you — which is exactly why it pays to be ready for any outcome, not just the ones you expect.',
  'Most people don’t think about insurance until right after they needed it. By then, the choice has already been made for them. Getting covered early means the choice is still yours.',
  'A good year can turn into a hard one overnight. Insurance doesn’t change the odds of that happening — it changes what happens to you financially when it does.',
  'Savings can disappear in a single afternoon. A repair bill, a hospital visit, a totaled car — insurance is what keeps one bad moment from becoming a lasting setback.',
  'You plan for vacations, birthdays, and retirement. It’s just as worth planning for the things you hope never happen — because hoping isn’t a strategy, and coverage is.',
  'The gap between "that won’t happen to me" and "that just happened to me" is often a single afternoon. Insurance is how you close that gap before it opens.',
  'Nobody budgets for a disaster — that’s what makes it a disaster. Insurance is the one line item that’s there specifically for the moments you didn’t plan for.',
];

/** Uniform random passage pick (mirrors pickRandomDisaster in gameConfig.js). */
export function pickRandomPassage(rng = Math.random) {
  const idx = Math.floor(rng() * RESULTS_PASSAGES.length);
  return RESULTS_PASSAGES[Math.min(idx, RESULTS_PASSAGES.length - 1)];
}
