import { STARTING_BUDGET, TOTAL_PREMIUMS, PRODUCTS_BY_KEY } from '../data/gameConfig.js';

export const SCREENS = Object.freeze({
  WELCOME: 'welcome',
  SELECT: 'select',
  PROTECTED_LIFE: 'protectedLife',
  CONTACT: 'contact',
  WHEEL: 'wheel',
  DAMAGE: 'damage',
  RESULTS: 'results',
  LEADERBOARD: 'leaderboard',
});

const SCREEN_ORDER = [
  SCREENS.WELCOME,
  SCREENS.SELECT,
  SCREENS.PROTECTED_LIFE,
  SCREENS.CONTACT,
  SCREENS.WHEEL,
  SCREENS.DAMAGE,
  SCREENS.RESULTS,
  SCREENS.LEADERBOARD,
];

export const initialState = {
  screen: SCREENS.WELCOME,
  insuredKeys: [],
  budget: STARTING_BUDGET,
  player: { name: '', email: '', phone: '' },
  disaster: null,
  outcome: null,
  score: 0,
  error: null,
  sessionId: null,
};

function spend(insuredKeys) {
  return insuredKeys.reduce((sum, key) => sum + (PRODUCTS_BY_KEY[key]?.premium ?? 0), 0);
}

export function gameReducer(state, action) {
  switch (action.type) {
    case 'GO_TO': {
      return { ...state, screen: action.screen, error: null };
    }
    case 'NEXT': {
      const idx = SCREEN_ORDER.indexOf(state.screen);
      const next = SCREEN_ORDER[Math.min(idx + 1, SCREEN_ORDER.length - 1)];
      return { ...state, screen: next, error: null };
    }
    case 'TOGGLE_ASSET': {
      const key = action.key;
      const already = state.insuredKeys.includes(key);
      let nextKeys;
      if (already) {
        nextKeys = state.insuredKeys.filter((k) => k !== key);
      } else {
        const product = PRODUCTS_BY_KEY[key];
        const wouldSpend = spend(state.insuredKeys) + (product?.premium ?? 0);
        if (wouldSpend > STARTING_BUDGET) {
          return { ...state, error: `Not enough budget left to add ${product?.label ?? key}.` };
        }
        nextKeys = [...state.insuredKeys, key];
      }
      return {
        ...state,
        insuredKeys: nextKeys,
        budget: STARTING_BUDGET - spend(nextKeys),
        error: null,
      };
    }
    case 'SET_PLAYER': {
      return { ...state, player: action.player, error: null };
    }
    case 'SET_DISASTER': {
      return { ...state, disaster: action.disaster };
    }
    case 'SET_OUTCOME': {
      return { ...state, outcome: action.outcome, score: action.score };
    }
    case 'SET_SESSION_ID': {
      return { ...state, sessionId: action.sessionId };
    }
    case 'SET_ERROR': {
      return { ...state, error: action.error };
    }
    case 'RESET': {
      return { ...initialState };
    }
    default:
      return state;
  }
}

export { SCREEN_ORDER };
