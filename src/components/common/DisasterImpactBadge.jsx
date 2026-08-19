import { motion } from 'framer-motion';
import Icon from './Icon.jsx';

/**
 * Small, one-shot themed animation per disaster `category` (see
 * gameConfig.js) — plays once when the Damage Assessment screen reveals a
 * new outcome, in sync with soundEngine.disasterImpact(). Deliberately
 * finite (no `repeat: Infinity`) so it reads as "this just happened" rather
 * than a distracting idle loop sitting above the damage breakdown.
 */
export const CATEGORY_STYLE = {
  fire: {
    color: '#e5484d',
    ring: false,
    iconAnimate: { scale: [0.8, 1.18, 0.94, 1.08, 1], rotate: [0, -4, 3, -2, 0] },
    iconTransition: { duration: 0.7, ease: 'easeOut' },
  },
  water: {
    color: '#0095C8',
    ring: true,
    iconAnimate: { scale: [0.85, 1.08, 1] },
    iconTransition: { duration: 0.6, ease: 'easeOut' },
  },
  impact: {
    color: '#f5a524',
    ring: false,
    iconAnimate: { x: [0, -7, 7, -5, 4, 0], scale: [0.85, 1.05, 1] },
    iconTransition: { duration: 0.55, ease: 'easeOut' },
  },
  medical: {
    color: '#e5484d',
    ring: false,
    iconAnimate: { scale: [1, 1.16, 1, 1.12, 1] },
    iconTransition: { duration: 0.9, ease: 'easeInOut' },
  },
  business: {
    // Brand gray rather than brand navy — navy would blend invisibly into
    // the app's own navy background gradient.
    color: '#c8c8c8',
    ring: false,
    iconAnimate: { y: [-14, 3, 0] },
    iconTransition: { duration: 0.6, ease: 'easeOut' },
  },
  security: {
    color: '#e5484d',
    ring: true,
    iconAnimate: { scale: [0.9, 1.06, 1] },
    iconTransition: { duration: 0.5, ease: 'easeOut' },
  },
};

export default function DisasterImpactBadge({ disaster }) {
  if (!disaster) return null;
  const style = CATEGORY_STYLE[disaster.category] || CATEGORY_STYLE.impact;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <div
        style={{
          position: 'relative',
          width: 104,
          height: 104,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {style.ring && (
          <motion.div
            initial={{ scale: 0.7, opacity: 0.7 }}
            animate={{ scale: 1.8, opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: `3px solid ${style.color}`,
            }}
          />
        )}
        <div
          style={{
            width: 92,
            height: 92,
            borderRadius: '50%',
            background: `${style.color}2e`,
            border: `2.5px solid ${style.color}80`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: style.color,
          }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ ...style.iconAnimate, opacity: 1 }}
            transition={style.iconTransition}
          >
            <Icon name={disaster.icon} size={50} strokeWidth={2.1} />
          </motion.div>
        </div>
      </div>
      <div
        style={{
          color: 'var(--cg-text-muted)',
          fontSize: 15,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: 0.8,
        }}
      >
        {disaster.label}
      </div>
    </div>
  );
}
