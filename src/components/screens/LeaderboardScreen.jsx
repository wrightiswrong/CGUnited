import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Icon from '../common/Icon.jsx';
import Button from '../common/Button.jsx';
import { useGameActions, useGameState } from '../../state/GameContext.jsx';
import { playerRepository } from '../../storage/index.js';

export default function LeaderboardScreen() {
  const { player, score } = useGameState();
  const { reset } = useGameActions();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    playerRepository
      .getLeaderboard(10)
      .then((data) => {
        if (!cancelled) setRows(data);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message || 'Could not load the leaderboard.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Play Again should land the next visitor on the true Welcome/attract
  // screen, not skip ahead — reset() alone already sets screen: WELCOME.
  const playAgain = () => {
    reset();
  };

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 20,
        padding: '32px 40px',
        minHeight: 0,
      }}
    >
      <div style={{ textAlign: 'center', flexShrink: 0 }}>
        <Icon name="trophy" size={40} style={{ color: 'var(--cg-amber)' }} />
        <h1 style={{ color: 'var(--cg-text)', fontSize: 32, fontWeight: 800, margin: '8px 0 0' }}>Today’s Leaderboard</h1>
      </div>

      {/* Scrolls independently of the header/button so a full 10-row board
          never pushes Play Again out of view or off the bottom of the
          screen — same fix as the Select & Insure product list. */}
      <div
        style={{
          width: '100%',
          maxWidth: 520,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          flex: '1 1 auto',
          minHeight: 0,
          overflowY: 'auto',
          padding: '4px 4px',
        }}
      >
        {loading && <div style={{ color: 'var(--cg-text-muted)', textAlign: 'center' }}>Loading…</div>}
        {loadError && <div style={{ color: 'var(--cg-red)', textAlign: 'center' }}>{loadError}</div>}
        {!loading &&
          !loadError &&
          rows.map((row, i) => {
            const isYou = row.email === player.email && row.score === score;
            return (
              <motion.div
                key={`${row.email}-${row.playedAt}`}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '12px 18px',
                  borderRadius: 14,
                  background: isYou ? 'rgba(0,149,200,0.1)' : 'var(--cg-card-bg)',
                  border: isYou ? '1.5px solid var(--cg-caribbean)' : '1.5px solid var(--cg-card-border)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    background: i < 3 ? 'var(--cg-amber)' : 'var(--cg-bg-light)',
                    color: i < 3 ? 'var(--cg-navy)' : 'var(--cg-text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: 14,
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </div>
                <div style={{ flex: 1, color: 'var(--cg-text)', fontWeight: 600 }}>
                  {row.name || 'Player'} {isYou && <span style={{ color: 'var(--cg-caribbean)' }}>(You)</span>}
                </div>
                <div style={{ color: 'var(--cg-text)', fontWeight: 800 }}>{row.score.toFixed(1)}%</div>
              </motion.div>
            );
          })}
        {!loading && !loadError && rows.length === 0 && (
          <div style={{ color: 'var(--cg-text-muted)', textAlign: 'center' }}>Be the first on the board!</div>
        )}
      </div>

      <Button size="lg" onClick={playAgain} style={{ flexShrink: 0 }}>
        Play Again
      </Button>
    </div>
  );
}
