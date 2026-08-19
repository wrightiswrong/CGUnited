import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../common/Icon.jsx';
import Button from '../common/Button.jsx';
import OrbitStage from '../common/OrbitStage.jsx';
import AnimatedNumber from '../common/AnimatedNumber.jsx';
import Confetti from '../common/Confetti.jsx';
import { useGameActions, useGameState } from '../../state/GameContext.jsx';
import { PRODUCTS } from '../../data/gameConfig.js';
import { pickRandomPassage } from '../../data/resultsCopy.js';
import { soundEngine } from '../../audio/soundEngine.js';

// A Protection Score at or above this reads as a genuinely strong result —
// triggers the confetti burst + celebratory chime. Below it gets a gentler,
// more subdued sound instead (not punishing, just less of a fanfare).
const CELEBRATE_THRESHOLD = 50;

export default function ResultsScreen() {
  const { outcome, score, insuredKeys, player } = useGameState();
  const { next } = useGameActions();
  const chimeFired = useRef(false);
  const [showScoreInfo, setShowScoreInfo] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  // Picked once per visit to this screen (not re-rolled on every re-render,
  // e.g. when the score-info tooltip toggles) so the same player sees a
  // consistent passage for their own result.
  const [passage] = useState(() => pickRandomPassage());

  useEffect(() => {
    return () => {
      chimeFired.current = false;
    };
  }, []);

  if (!outcome) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--cg-text)' }}>No results yet.</div>
      </div>
    );
  }

  const protectedProducts = PRODUCTS.filter((p) => insuredKeys.includes(p.key));
  const strongResult = score >= CELEBRATE_THRESHOLD;

  return (
    <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
      {celebrating && <Confetti />}
      {/* Outer scroller is top-aligned (not centered) so that if content is
          ever taller than the screen, every part of it stays reachable by
          scrolling — a flex container that's vertically *centered* instead
          pushes overflow off both edges and the top becomes unscrollable
          (exactly what was cutting off the heading on larger displays).
          The inner wrapper's `margin: auto 0` re-centers the content
          whenever it *does* fit, so short screens still look centered. */}
      <div
        style={{
          flex: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          overflowY: 'auto',
        }}
      >
      <div
        style={{
          margin: 'auto 0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          padding: '12px 40px',
          width: '100%',
        }}
      >
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ color: 'var(--cg-text)', fontSize: 'clamp(20px, 3vh, 30px)', fontWeight: 800, margin: 0 }}>
          {player.name ? `Nice work, ${player.name.split(' ')[0]}!` : 'Your Results'}
        </h1>
        <p style={{ color: 'var(--cg-text-muted)', fontSize: 14, marginTop: 4 }}>
          Here’s how your coverage held up.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        <OrbitStage insuredKeys={insuredKeys} size={170} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 260 }}>
          <StatCard
            label="Insurance saved you"
            value={outcome.totalSaved}
            color="var(--cg-green)"
            onComplete={() => {
              if (!chimeFired.current) {
                chimeFired.current = true;
                if (strongResult) {
                  soundEngine.cheerChime();
                  setCelebrating(true);
                } else {
                  soundEngine.sadTone();
                }
              }
            }}
          />
          <StatCard
            label="You paid out of pocket (your deductible)"
            value={outcome.totalPaid}
            color="var(--cg-red)"
          />
          <StatCard label="Premiums spent" value={outcome.premiumsSpent} color="var(--cg-blue-light)" />
          <div
            style={{
              position: 'relative',
              padding: '10px 18px',
              borderRadius: 16,
              background: 'var(--cg-card-bg)',
              border: '1.5px solid var(--cg-card-border)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ color: 'var(--cg-text-muted)', fontSize: 13, fontWeight: 600, textTransform: 'uppercase' }}>
                Your Protection Score
              </div>
              <button
                type="button"
                className="tap-target"
                onClick={() => setShowScoreInfo((v) => !v)}
                aria-label="How is the score calculated?"
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  border: 'none',
                  background: 'var(--cg-bg-light)',
                  color: 'var(--cg-text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon name="info" size={13} />
              </button>
            </div>
            <div style={{ color: 'var(--cg-text)', fontSize: 30, fontWeight: 800 }}>
              <AnimatedNumber value={score} duration={1.3} prefix="" decimals={1} formatter={(v) => `${v.toFixed(1)}%`} />
            </div>

            <AnimatePresence>
              {showScoreInfo && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.18 }}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: 8,
                    zIndex: 10,
                    width: 300,
                    padding: '14px 18px',
                    borderRadius: 12,
                    background: 'var(--cg-navy)',
                    color: '#fff',
                    fontSize: 13.5,
                    lineHeight: 1.5,
                    boxShadow: 'var(--shadow-lg)',
                  }}
                >
                  <strong>Protection Score</strong> — a blend of two things: 80% is
                  how much of this round’s actual damage your insurance covered, and
                  20% is how much of your $10,000 budget you put to work shopping for
                  coverage, regardless of what the wheel landed on. Ties on the
                  leaderboard go to whoever spent less on premiums to get there.
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {protectedProducts.length > 0 && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 560 }}>
          {protectedProducts.map((p) => (
            <div
              key={p.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                borderRadius: 999,
                background: 'rgba(31,182,115,0.12)',
                border: '1px solid rgba(31,182,115,0.35)',
                color: 'var(--cg-text)',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              <Icon name="check" size={14} style={{ color: 'var(--cg-green)' }} /> {p.label}
            </div>
          ))}
        </div>
      )}

      <div
        style={{
          maxWidth: 560,
          padding: '12px 20px',
          borderRadius: 16,
          background: 'var(--cg-card-bg)',
          border: '1.5px solid var(--cg-card-border)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <p
          style={{
            color: 'var(--cg-text-muted)',
            fontSize: 13,
            lineHeight: 1.4,
            fontStyle: 'italic',
            margin: 0,
            textAlign: 'center',
          }}
        >
          “{passage}”
        </p>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            padding: '8px 16px',
            borderRadius: 12,
            background: 'rgba(31,182,115,0.12)',
            border: '1px solid rgba(31,182,115,0.35)',
            color: 'var(--cg-text)',
            fontSize: 13,
            fontWeight: 600,
            textAlign: 'center',
          }}
        >
          Talk to a CG United representative at our booth today to find the right coverage for you.
        </div>
      </div>

      <Button size="md" onClick={next}>
        View Leaderboard <Icon name="arrowRight" size={18} />
      </Button>
      </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, onComplete }) {
  return (
    <div
      style={{
        padding: '10px 18px',
        borderRadius: 14,
        background: 'var(--cg-card-bg)',
        border: '1px solid var(--cg-card-border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div style={{ color: 'var(--cg-text-muted)', fontSize: 13 }}>{label}</div>
      <div style={{ color, fontSize: 22, fontWeight: 800 }}>
        <AnimatedNumber value={value} onComplete={onComplete} />
      </div>
    </div>
  );
}
