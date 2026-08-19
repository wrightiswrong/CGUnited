import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../common/Icon.jsx';
import Button from '../common/Button.jsx';
import OrbitStage from '../common/OrbitStage.jsx';
import AnimatedNumber from '../common/AnimatedNumber.jsx';
import { useGameActions, useGameState } from '../../state/GameContext.jsx';
import { PRODUCTS, STARTING_BUDGET } from '../../data/gameConfig.js';
import { soundEngine } from '../../audio/soundEngine.js';

export default function SelectInsureScreen() {
  const { insuredKeys, budget, error } = useGameState();
  const { toggleAsset, next } = useGameActions();
  const [openTooltip, setOpenTooltip] = useState(null);

  const handleToggle = (key) => {
    const wasInsured = insuredKeys.includes(key);
    toggleAsset(key);
    // Sound plays based on the *intended* transition; if it fails (insufficient
    // budget) the reducer leaves insuredKeys unchanged and sets `error`, so we
    // check after a microtask isn't necessary — errors are rare edge taps and
    // the error banner below gives clear feedback either way.
    if (wasInsured) soundEngine.deselect();
    else soundEngine.select();
  };

  const spentPct = Math.round(((STARTING_BUDGET - budget) / STARTING_BUDGET) * 100);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '32px 48px', position: 'relative', minHeight: 0 }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
          flexShrink: 0,
          background: 'var(--cg-navy)',
          borderRadius: 18,
          padding: '18px 28px',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div>
          <h1 style={{ color: '#fff', fontSize: 30, fontWeight: 800, margin: 0 }}>Select & Insure</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, margin: '4px 0 0' }}>
            Choose what matters most — your budget won’t cover everything.
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Budget remaining
          </div>
          <div style={{ color: '#fff', fontSize: 32, fontWeight: 800 }}>
            <AnimatedNumber value={budget} duration={0.4} />
          </div>
          <div
            style={{
              width: 180,
              height: 6,
              borderRadius: 999,
              background: 'rgba(255,255,255,0.2)',
              marginTop: 6,
              overflow: 'hidden',
            }}
          >
            <motion.div
              animate={{ width: `${spentPct}%` }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={{ height: '100%', background: 'var(--cg-caribbean)' }}
            />
          </div>
        </div>
      </header>

      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 40,
          marginTop: 8,
          minHeight: 0,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', flex: '0 0 auto' }}>
          <OrbitStage insuredKeys={insuredKeys} size={380} />
        </div>

        {/* Scrolls independently of header/footer so adding more product
            lines (now 8, was 6) never pushes the Continue button out of
            view or gets clipped by the app shell's overflow:hidden. */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            minWidth: 0,
            maxHeight: '100%',
            overflowY: 'auto',
            paddingRight: 4,
          }}
        >
          {PRODUCTS.map((product) => {
            const insured = insuredKeys.includes(product.key);
            const affordable = insured || product.premium <= budget;
            return (
              <div key={product.key} style={{ position: 'relative' }}>
                <motion.div
                  className="tap-target"
                  onClick={() => handleToggle(product.key)}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '12px 20px',
                    borderRadius: 18,
                    background: insured ? 'rgba(0,149,200,0.12)' : 'var(--cg-card-bg)',
                    border: insured ? '1.5px solid var(--cg-caribbean)' : '1.5px solid var(--cg-card-border)',
                    boxShadow: 'var(--shadow-sm)',
                    opacity: affordable ? 1 : 0.5,
                  }}
                >
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 16,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: insured ? 'var(--cg-navy)' : 'var(--cg-bg-light)',
                      color: insured ? '#fff' : 'var(--cg-navy)',
                      flexShrink: 0,
                    }}
                  >
                    <Icon name={product.icon} size={34} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: 'var(--cg-text)', fontWeight: 700, fontSize: 17 }}>{product.label}</div>
                    <div style={{ color: 'var(--cg-text-muted)', fontSize: 13 }}>
                      ${product.premium.toLocaleString()} premium
                    </div>
                  </div>
                  <button
                    className="tap-target"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenTooltip(openTooltip === product.key ? null : product.key);
                    }}
                    aria-label={`Why insure ${product.label}?`}
                    style={{
                      width: 30,
                      height: 30,
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
                    <Icon name="info" size={16} />
                  </button>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      border: insured ? 'none' : '2px solid var(--cg-card-border)',
                      background: insured ? 'var(--cg-green)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      flexShrink: 0,
                    }}
                  >
                    {insured && <Icon name="check" size={15} strokeWidth={2.4} />}
                  </div>
                </motion.div>

                <AnimatePresence>
                  {openTooltip === product.key && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.98 }}
                      transition={{ duration: 0.18 }}
                      style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: 6,
                        zIndex: 10,
                        width: 300,
                        padding: '12px 16px',
                        borderRadius: 12,
                        background: 'var(--cg-navy)',
                        color: '#fff',
                        fontSize: 14,
                        lineHeight: 1.4,
                        boxShadow: 'var(--shadow-lg)',
                      }}
                    >
                      {product.tagline}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Absolutely positioned so it floats above the footer instead of
          pushing it — the error toast appearing/disappearing must never
          shift or hide the Continue button. */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            style={{
              position: 'absolute',
              left: '50%',
              bottom: 96,
              transform: 'translateX(-50%)',
              zIndex: 20,
              padding: '10px 20px',
              borderRadius: 999,
              background: '#fff2f2',
              border: '1.5px solid rgba(229,72,77,0.4)',
              color: '#b3272b',
              fontSize: 14,
              fontWeight: 600,
              whiteSpace: 'nowrap',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <footer style={{ display: 'flex', justifyContent: 'center', paddingTop: 8, flexShrink: 0 }}>
        <Button size="lg" onClick={next}>
          Continue <Icon name="arrowRight" size={20} />
        </Button>
      </footer>
    </div>
  );
}
