// ---------------------------------------------------------------------------
// Build Your Future — core game configuration
// Single source of truth for products, budget, disasters, and the financial
// model used to compute results. Keeping all tunable numbers here means the
// game can be rebalanced without touching component or engine code.
// ---------------------------------------------------------------------------

/**
 * Fixed budget every player gets to spend on premiums (confirmed: fixed, not
 * randomized). Deliberately set to exactly half of TOTAL_PREMIUMS (20,000)
 * so players can only afford about half or less of everything on offer and
 * have to make real trade-offs.
 */
export const STARTING_BUDGET = 10000;

/** Simulated baseline net worth a disaster can chip away at. Purely illustrative. */
export const STARTING_NET_WORTH = 1000000;

/** Flat deductible a player still pays out-of-pocket for a protected asset that gets hit. */
export const DEDUCTIBLE = 5000;

/**
 * The CG United product lines players can insure.
 * `premium` is the cost to insure that asset for the session.
 * `icon` is a key resolved to an inline SVG in components/common/Icon.jsx.
 */
export const PRODUCTS = [
  {
    key: 'home',
    label: 'Home',
    icon: 'home',
    premium: 5000,
    tagline: 'Protects your house and belongings from fire, storm & flood damage.',
  },
  {
    key: 'vehicle',
    label: 'Vehicle',
    icon: 'vehicle',
    premium: 2500,
    tagline: 'Covers accident damage, theft, and liability on the road.',
  },
  {
    key: 'business',
    label: 'Business',
    icon: 'business',
    premium: 5000,
    tagline: 'Keeps your business running after interruption or property loss.',
  },
  {
    key: 'travel',
    label: 'Travel',
    icon: 'travel',
    premium: 2500,
    tagline: 'Covers medical emergencies and mishaps while you’re away.',
  },
  {
    key: 'boat',
    label: 'Boat',
    icon: 'boat',
    premium: 3300,
    tagline: 'Protects your vessel from storm damage and accidents on the water.',
  },
  {
    key: 'personal',
    label: 'Personal Accident',
    icon: 'personal',
    premium: 1700,
    tagline: 'Provides a payout if you’re injured and can’t work.',
  },
];

export const TOTAL_PREMIUMS = PRODUCTS.reduce((sum, p) => sum + p.premium, 0); // 20,000

export const PRODUCTS_BY_KEY = Object.fromEntries(PRODUCTS.map((p) => [p.key, p]));

/**
 * Real-world disaster events the wheel can land on. Each disaster hits one or
 * more asset categories for a specific loss amount. If the player insured
 * that asset, they only pay the flat DEDUCTIBLE instead of the full loss.
 *
 * `category` is a "vibe" grouping (independent of which specific assets get
 * hit) that drives the dramatic sound + small themed animation shown on the
 * Damage Assessment screen — see soundEngine.disasterImpact() and
 * DisasterImpactBadge.jsx.
 */
export const DISASTERS = [
  {
    key: 'hurricane',
    label: 'Hurricane',
    wheelLabel: 'Hurricane',
    icon: 'hurricane',
    category: 'water',
    description: 'A category 4 hurricane makes landfall overnight.',
    impacts: [
      { asset: 'home', loss: 150000 },
      { asset: 'boat', loss: 40000 },
    ],
  },
  {
    key: 'fire',
    label: 'House Fire',
    wheelLabel: 'House Fire',
    icon: 'fire',
    category: 'fire',
    description: 'An electrical fault sparks a fire in the kitchen.',
    impacts: [{ asset: 'home', loss: 120000 }],
  },
  {
    key: 'vehicle_accident',
    label: 'Vehicle Accident',
    wheelLabel: 'Vehicle Crash',
    icon: 'crash',
    category: 'impact',
    description: 'A collision on the highway totals your car and sends you to hospital.',
    impacts: [
      { asset: 'vehicle', loss: 25000 },
      { asset: 'personal', loss: 15000 },
    ],
  },
  {
    key: 'flood',
    label: 'Flash Flood',
    wheelLabel: 'Flash Flood',
    icon: 'flood',
    category: 'water',
    description: 'Torrential rain floods your street and your shop’s storeroom.',
    impacts: [
      { asset: 'home', loss: 80000 },
      { asset: 'business', loss: 60000 },
    ],
  },
  {
    key: 'medical_abroad',
    label: 'Medical Emergency Abroad',
    wheelLabel: 'Medical Abroad',
    icon: 'travel',
    category: 'medical',
    description: 'You fall ill on a trip and need emergency treatment overseas.',
    impacts: [{ asset: 'travel', loss: 50000 }],
  },
  {
    key: 'storm_boat',
    label: 'Storm Damage at Sea',
    wheelLabel: 'Storm at Sea',
    icon: 'boat',
    category: 'water',
    description: 'A sudden squall damages your boat while it’s out on the water.',
    impacts: [{ asset: 'boat', loss: 35000 }],
  },
  {
    key: 'business_interruption',
    label: 'Business Interruption',
    wheelLabel: 'Business Loss',
    icon: 'business',
    category: 'business',
    description: 'A supply chain failure shuts your business down for weeks.',
    impacts: [{ asset: 'business', loss: 100000 }],
  },
  {
    key: 'theft',
    label: 'Break-In & Theft',
    wheelLabel: 'Break-In',
    icon: 'mask',
    category: 'security',
    description: 'Burglars break in while you’re away, taking valuables and injuring no one — but shaking you up.',
    impacts: [
      { asset: 'home', loss: 20000 },
      { asset: 'personal', loss: 5000 },
    ],
  },
  {
    // Deliberately small loss relative to the flat $5,000 deductible, so even
    // a fully-insured player only gets partial credit — widens the low end
    // of the achievable Coverage Efficiency range (see resultsEngine.js).
    key: 'fender_bender',
    label: 'Minor Fender Bender',
    wheelLabel: 'Fender Bender',
    icon: 'vehicle',
    category: 'impact',
    description: 'A parking lot mishap leaves a dent and a repair bill.',
    impacts: [{ asset: 'vehicle', loss: 8000 }],
  },
  {
    // Deliberately huge loss relative to the deductible, so a fully-insured
    // player gets close to full credit — widens the high end of the range.
    key: 'wildfire',
    label: 'Catastrophic Wildfire',
    wheelLabel: 'Wildfire',
    icon: 'fire',
    category: 'fire',
    description: 'A fast-moving wildfire sweeps through the neighborhood, destroying homes in its path.',
    impacts: [{ asset: 'home', loss: 300000 }],
  },
  {
    // "Combo" disaster: hits 4 assets at once. Nobody can afford to insure
    // everything it touches on a $10,000 budget, so this naturally caps the
    // achievable score lower than single-asset disasters — widening the
    // overall spread rather than everyone converging on similar outcomes.
    key: 'storm_system',
    label: 'Major Storm System',
    wheelLabel: 'Storm System',
    icon: 'stormCloud',
    category: 'water',
    description: 'A slow-moving storm system batters the region for days, hitting property on every front.',
    impacts: [
      { asset: 'home', loss: 60000 },
      { asset: 'vehicle', loss: 15000 },
      { asset: 'boat', loss: 20000 },
      { asset: 'business', loss: 40000 },
    ],
  },
  {
    // Another combo, this time centered on the person rather than property.
    key: 'home_invasion',
    label: 'Violent Home Invasion',
    wheelLabel: 'Home Invasion',
    icon: 'brokenDoor',
    category: 'security',
    description: 'Armed intruders break in, causing both property damage and a serious injury.',
    impacts: [
      { asset: 'home', loss: 30000 },
      { asset: 'personal', loss: 20000 },
    ],
  },
];

export const DISASTERS_BY_KEY = Object.fromEntries(DISASTERS.map((d) => [d.key, d]));

/** Uniform random disaster pick (confirmed default: no weighting). */
export function pickRandomDisaster(rng = Math.random) {
  const idx = Math.floor(rng() * DISASTERS.length);
  return DISASTERS[Math.min(idx, DISASTERS.length - 1)];
}
