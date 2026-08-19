import { motion } from 'framer-motion';
import Icon from './Icon.jsx';
import { PRODUCTS } from '../../data/gameConfig.js';

/**
 * The "life dashboard" visual: a house at the center with each product line
 * orbiting around it as a bubble. Protected assets glow and are colored;
 * unprotected ones sit dim/greyed out. Purely presentational — driven by
 * whatever `insuredKeys` the caller passes in (used on both the Select &
 * Insure screen and the Results "Final Portrait").
 */
export default function OrbitStage({ insuredKeys = [], size = 420, interactiveKey = null, onBubbleClick = null }) {
  const radius = size * 0.42;
  const center = size / 2;
  const bubbleSize = size * 0.16;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      {/* Center house */}
      <div
        style={{
          position: 'absolute',
          left: center,
          top: center,
          transform: 'translate(-50%, -50%)',
          width: size * 0.34,
          height: size * 0.34,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 30%, #ffffff 0%, #eaf4ff 60%, #d6e9fb 100%)',
          boxShadow: '0 20px 50px rgba(10,34,64,0.35), inset 0 0 0 1px rgba(255,255,255,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--cg-navy)',
        }}
      >
        <Icon name="home" size={size * 0.14} strokeWidth={1.6} />
      </div>

      {PRODUCTS.map((product, i) => {
        const angle = (i / PRODUCTS.length) * Math.PI * 2 - Math.PI / 2;
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);
        const protected_ = insuredKeys.includes(product.key);
        const interactive = interactiveKey === product.key || !!onBubbleClick;

        return (
          <motion.div
            key={product.key}
            className={onBubbleClick ? 'tap-target' : ''}
            onClick={() => onBubbleClick?.(product.key)}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: protected_ ? 1.06 : 1 }}
            transition={{
              opacity: { delay: i * 0.06, duration: 0.4 },
              scale: { delay: i * 0.06, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] },
            }}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              transform: 'translate(-50%, -50%)',
              width: bubbleSize,
              height: bubbleSize,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              background: protected_
                ? 'linear-gradient(135deg, var(--cg-blue) 0%, var(--cg-blue-light) 100%)'
                : 'var(--cg-card-bg)',
              color: protected_ ? '#fff' : 'var(--cg-text-faint)',
              boxShadow: protected_ ? '0 10px 26px rgba(31,111,214,0.45)' : 'var(--shadow-sm)',
              border: protected_ ? 'none' : '1.5px dashed var(--cg-card-border)',
            }}
            title={product.label}
          >
            <Icon name={product.icon} size={bubbleSize * 0.42} />
          </motion.div>
        );
      })}
    </div>
  );
}
