import { createContext, useContext, useMemo, useReducer } from 'react';
import { gameReducer, initialState, SCREENS } from './gameReducer.js';
import { pickRandomDisaster, STARTING_BUDGET } from '../data/gameConfig.js';
import { computeOutcome, computeScore } from '../game/resultsEngine.js';
import { playerRepository } from '../storage/index.js';

const GameStateContext = createContext(null);
const GameActionsContext = createContext(null);

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const actions = useMemo(
    () => ({
      goTo: (screen) => dispatch({ type: 'GO_TO', screen }),
      next: () => dispatch({ type: 'NEXT' }),
      toggleAsset: (key) => dispatch({ type: 'TOGGLE_ASSET', key }),
      setPlayer: (player) => dispatch({ type: 'SET_PLAYER', player }),
      reset: () => dispatch({ type: 'RESET' }),

      /** Spin the wheel, pick a disaster, and store it (results computed after damage reveal). */
      spinWheel: () => {
        const disaster = pickRandomDisaster();
        dispatch({ type: 'SET_DISASTER', disaster });
        return disaster;
      },

      /**
       * Compute the financial outcome for the current disaster + selections,
       * persist the session to storage (keyed by email, appended), and store
       * the outcome in state for the results screen.
       *
       * The whole body is wrapped in try/catch: previously computeOutcome/
       * computeScore ran *before* any try block, so if either ever threw
       * (e.g. a missing/malformed `state.disaster`), the error escaped as a
       * silent unhandled promise rejection - SET_OUTCOME never fired,
       * SET_ERROR never fired either, and DamageAssessmentScreen was stuck
       * on "Calculating..." forever with no error shown and no way to
       * recover short of restarting the browser. That happened live at the
       * expo. Now any failure at all is caught and surfaced via SET_ERROR,
       * which DamageAssessmentScreen shows with a Restart button.
       */
      finalizeOutcome: async (state) => {
        try {
          if (!state.disaster) {
            throw new Error('No disaster was selected. Please restart.');
          }

          const premiumsSpent = STARTING_BUDGET - state.budget;
          const outcome = computeOutcome(state.insuredKeys, state.disaster, premiumsSpent);
          const score = computeScore(outcome);
          dispatch({ type: 'SET_OUTCOME', outcome, score });

          const session = {
            sessionId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            playedAt: Date.now(),
            insuredAssets: state.insuredKeys,
            premiumsSpent,
            budget: STARTING_BUDGET,
            disasterKey: state.disaster.key,
            totalLoss: outcome.totalLoss,
            totalPaid: outcome.totalPaid,
            totalSaved: outcome.totalSaved,
            score,
          };

          try {
            await playerRepository.recordSession(state.player, session);
            dispatch({ type: 'SET_SESSION_ID', sessionId: session.sessionId });
          } catch (err) {
            // Non-fatal: the outcome is already computed and shown, only the
            // leaderboard save failed.
            dispatch({ type: 'SET_ERROR', error: err.message || 'Could not save your result.' });
          }

          return { outcome, score };
        } catch (err) {
          dispatch({ type: 'SET_ERROR', error: err.message || 'Something went wrong computing your results.' });
          return null;
        }
      },
    }),
    [],
  );

  return (
    <GameStateContext.Provider value={state}>
      <GameActionsContext.Provider value={actions}>{children}</GameActionsContext.Provider>
    </GameStateContext.Provider>
  );
}

export function useGameState() {
  const ctx = useContext(GameStateContext);
  if (!ctx) throw new Error('useGameState must be used within GameProvider');
  return ctx;
}

export function useGameActions() {
  const ctx = useContext(GameActionsContext);
  if (!ctx) throw new Error('useGameActions must be used within GameProvider');
  return ctx;
}

export { SCREENS };
