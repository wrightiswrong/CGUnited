// ---------------------------------------------------------------------------
// Pure, testable game-logic functions. No DOM, no React — just numbers in,
// numbers out, so this can be unit-tested and reused (e.g. server-side) later.
// ---------------------------------------------------------------------------
import { DEDUCTIBLE, PRODUCTS_BY_KEY, STARTING_NET_WORTH, STARTING_BUDGET } from '../data/gameConfig.js';

/**
 * @param {string[]} insuredKeys - asset keys the player chose to insure
 * @param {object} disaster - a DISASTERS entry
 * @returns {{
 *   perAsset: Array<{asset:string,label:string,loss:number,insured:boolean,paid:number,saved:number}>,
 *   totalLoss: number,
 *   totalPaid: number,
 *   totalSaved: number,
 *   netWorthAfter: number,
 *   premiumsSpent: number,
 * }}
 */
export function computeOutcome(insuredKeys, disaster, premiumsSpent) {
  const insuredSet = new Set(insuredKeys);

  const perAsset = disaster.impacts.map((impact) => {
    const product = PRODUCTS_BY_KEY[impact.asset];
    const insured = insuredSet.has(impact.asset);
    const paid = insured ? Math.min(DEDUCTIBLE, impact.loss) : impact.loss;
    const saved = impact.loss - paid;
    return {
      asset: impact.asset,
      label: product ? product.label : impact.asset,
      loss: impact.loss,
      insured,
      paid,
      saved,
    };
  });

  const totalLoss = perAsset.reduce((s, a) => s + a.loss, 0);
  const totalPaid = perAsset.reduce((s, a) => s + a.paid, 0);
  const totalSaved = perAsset.reduce((s, a) => s + a.saved, 0);
  const netWorthAfter = STARTING_NET_WORTH - totalPaid;

  return { perAsset, totalLoss, totalPaid, totalSaved, netWorthAfter, premiumsSpent };
}

/**
 * "Protection Score" — a 0-100 blend of two things, so the leaderboard has
 * real spread instead of clustering at 0/50/100:
 *
 *  - Coverage Efficiency (80%): % of THIS round's actual damage your
 *    insurance covered. Keeps the wheel spin meaningful — good coverage that
 *    gets hit should score well. This is the main driver of spread: the
 *    disaster table spans small losses where the flat deductible really
 *    bites (as low as ~37.5% even when fully insured) up to catastrophic
 *    losses where it barely matters (~98%+), so real outcomes land all over
 *    the 0-100 range instead of clustering near a couple of values.
 *  - Portfolio Breadth (20%): % of your $10,000 budget you actually put to
 *    work, regardless of what the wheel lands on. Rewards smart, broad
 *    shopping even on a round where the disaster missed your coverage
 *    entirely, instead of scoring a flat 0 — kept as a smaller slice than
 *    before so it adds texture without flattening the outcome-driven spread.
 *
 * Displayed to one decimal place so scores read as real numbers rather than
 * round buckets.
 *
 * Leaderboard ties (same score) are broken elsewhere by whoever spent less
 * on premiums to get there — see LocalStoragePlayerRepository.bestSession.
 */
export function computeScore(outcome) {
  const coverageEfficiency =
    outcome.totalLoss > 0
      ? Math.max(0, Math.min(100, (outcome.totalSaved / outcome.totalLoss) * 100))
      : 100;

  const portfolioBreadth =
    STARTING_BUDGET > 0
      ? Math.max(0, Math.min(100, (outcome.premiumsSpent / STARTING_BUDGET) * 100))
      : 0;

  const blended = 0.8 * coverageEfficiency + 0.2 * portfolioBreadth;
  return Math.round(blended * 10) / 10; // one decimal place
}
