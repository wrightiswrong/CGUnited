import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Icon from '../common/Icon.jsx';
import Button from '../common/Button.jsx';
import DisasterImpactBadge, { CATEGORY_STYLE } from '../common/DisasterImpactBadge.jsx';
import { useGameActions, useGameState } from '../../state/GameContext.jsx';
import { soundEngine } from '../../audio/soundEngine.js';

/**
 * One-shot screen shake (a few quick, decaying x/y jolts) — extra impact to
 * match the bigger, more dramatic disaster sounds. Finite, not looped, so it
 * reads as "this just happened" rather than a distracting idle wobble.
 *
 * Keyed by disaster `category` so storm/water events (hurricane, flood,
 * storm at sea, major storm system — the ones with a continuous wind/water
 * bed in the sound) get a bigger, longer, more violent shake than a single
 * sharp impact like a car crash or break-in.
 */
const SHAKE_STYLE = {
  water: {
    animate: {
      x: [0, -20, 18, -16, 14, -11, 8, -6, 4, -2, 0],
      y: [0, 11, -10, 8, -7, 5, -4, 3, -2, 1, 0],
      rotate: [0, -1.6, 1.4, -1.1, 0.8, -0.5, 0.3, -0.15, 0],
    },
    transition: { duration: 0.95, ease: 'easeOut' },
  },
  default: {
    animate: {
      x: [0, -10, 9, -7, 5, -3, 0],
      y: [0, 4, -4, 3, -2, 1, 0],
    },
    transition: { duration: 0.55, ease: 'easeOut' },
  },
};

export default function DamageAssessmentScreen() {
  const state = useGameState();
  const { finalizeOutcome, next, reset } = useGameActions();
  const { outcome, error, disaster } = state;
  const startedRef = useRef(false);
  const [revealedCount, setRevealedCount] = useState(0);
  const [impactId, setImpactId] = useState(0);
  // Belt-and-suspenders on top of the finalizeOutcome try/catch fix: if
  // outcome still hasn't shown up after a few seconds for any reason we
  // haven't anticipated, treat it as stuck and offer a way out instead of
  // leaving staff with only "close and reopen the browser" as a fix (that
  // happened once live at the expo before this existed).
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    if (!state.outcome) {
      finalizeOutcome(state);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (outcome) return;
    const timer = setTimeout(() => setStuck(true), 8000);
    return () => clearTimeout(timer);
  }, [outcome]);

  useEffect(() => {
    if (!outcome) return;
    setRevealedCount(0);
    // Bump the impact key so the screen-shake + color-flash effect below
    // replays for this specific event (finite, not looped).
    setImpactId((n) => n + 1);
    // Dramatic "this just happened" sting, unique to this specific disaster
    // (not just its broad category) — plays once, right as the badge above
    // the heading animates in, ahead of the per-asset chimes.
    if (disaster) soundEngine.disasterImpact(disaster.key);
    const perAssetCount = outcome.perAsset.length;
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setRevealedCount(i);
      const asset = outcome.perAsset[i - 1];
      if (asset) {
        if (asset.insured) soundEngine.revealCovered();
        else soundEngine.revealUncovered();
      }
      if (i >= perAssetCount) clearInterval(interval);
    }, 750);
    return () => clearInterval(interval);
  }, [outcome, disaster]);

  if (!outcome) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '0 32px' }}>
        <div style={{ color: 'var(--cg-text)', fontSize: 18, textAlign: 'center', maxWidth: 480 }}>
          {error || (stuck ? 'This is taking longer than expected.' : 'Calculating…')}
        </div>
        {(error || stuck) && (
          <Button size="md" onClick={reset}>
            Restart
          </Button>
        )}
      </div>
    );
  }

  const allRevealed = revealedCount >= outcome.perAsset.length;
  const flashColor = (disaster && CATEGORY_STYLE[disaster.category]?.color) || CATEGORY_STYLE.impact.color;
  const shakeStyle = (disaster && SHAKE_STYLE[disaster.category]) || SHAKE_STYLE.default;

  return (
    <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
      {/* One-shot full-bleed color flash, tinted to the disaster's category
          color, timed with the impact sound/badge/shake — reads as extra
          "impact" without being distracting once it fades. */}
      <motion.div
        key={`flash-${impactId}`}
        initial={{ opacity: 0.32 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          inset: 0,
          background: flashColor,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <motion.div
        key={`shake-${impactId}`}
        initial={{ x: 0, y: 0, rotate: 0 }}
        animate={shakeStyle.animate}
        transition={shakeStyle.transition}
        style={{
          position: 'relative',
          zIndex: 1,
          flex: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          overflowY: 'auto',
        }}
      >
      {/* margin: auto 0 centers this when it fits, but (unlike
          justify-content: center on the scroller above) never makes any
          part of it unreachable if it's ever taller than the screen — see
          the same fix on ResultsScreen/DisasterWheelScreen. */}
      <div
        style={{
          margin: 'auto 0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 18,
          padding: '20px 40px',
          width: '100%',
        }}
      >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <DisasterImpactBadge disaster={disaster} />
        <h1 style={{ color: 'var(--cg-text)', fontSize: 'clamp(20px, 3vh, 30px)', fontWeight: 800, margin: 0, textAlign: 'center' }}>
          Damage Assessment
        </h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 560 }}>
        {outcome.perAsset.map((asset, i) => {
          const visible = i < revealedCount;
          return (
            <motion.div
              key={asset.asset}
              initial={{ opacity: 0, x: -20 }}
              animate={visible ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '10px 18px',
                borderRadius: 16,
                background: !visible
                  ? 'transparent'
                  : asset.insured
                  ? 'rgba(31,182,115,0.1)'
                  : 'rgba(229,72,77,0.1)',
                border: !visible
                  ? '1.5px solid transparent'
                  : asset.insured
                  ? '1.5px solid rgba(31,182,115,0.35)'
                  : '1.5px solid rgba(229,72,77,0.35)',
                boxShadow: visible ? 'var(--shadow-sm)' : 'none',
                minHeight: 54,
              }}
            >
              {visible && (
                <>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: '50%',
                      background: asset.insured ? 'var(--cg-green)' : 'var(--cg-red)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      flexShrink: 0,
                    }}
                  >
                    <Icon name={asset.insured ? 'check' : 'cross'} size={17} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: 'var(--cg-text)', fontWeight: 700, fontSize: 16 }}>{asset.label}</div>
                    <div style={{ color: 'var(--cg-text-muted)', fontSize: 12.5 }}>
                      {asset.insured ? 'Covered' : 'Not Protected'} &middot; ${asset.loss.toLocaleString()} in damage
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--cg-text)', fontWeight: 800, fontSize: 18 }}>
                      ${asset.paid.toLocaleString()}
                    </div>
                    <div style={{ color: 'var(--cg-text-faint)', fontSize: 11 }}>you pay</div>
                  </div>
                </>
              )}
            </motion.div>
          );
        })}
      </div>

      {allRevealed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
        >
          <p
            style={{
              color: 'var(--cg-text-faint)',
              fontSize: 12,
              fontStyle: 'italic',
              textAlign: 'center',
              maxWidth: 520,
              margin: 0,
            }}
          >
            This is a simplified demonstration for illustrative purposes only. Real insurance
            policies may include additional deductibles, exclusions, or fees not shown here.
          </p>
          <Button size="md" onClick={next}>
            See My Results <Icon name="arrowRight" size={18} />
          </Button>
        </motion.div>
      )}
      </div>
      </motion.div>
    </div>
  );
}
