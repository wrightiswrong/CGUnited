import { motion } from 'framer-motion';

// Brand colors + the functional green/amber/red + white so the burst reads as
// festive without going off-palette.
const COLORS = ['#1D4289', '#0095C8', '#1fb673', '#f5a524', '#e5484d', '#ffffff'];

/** Gently falling piece, raining down from above across the full width. */
function makeFallPiece(seed) {
  const startX = Math.random() * 100; // percent across the container width
  const isStreamer = Math.random() < 0.25; // occasional bigger ribbon piece
  const size = isStreamer ? 14 + Math.random() * 10 : 7 + Math.random() * 9;
  const color = COLORS[seed % COLORS.length];
  const delay = Math.random() * 0.7;
  const duration = 2.6 + Math.random() * 1.8;
  const rotate = (Math.random() - 0.5) * 1440;
  const drift = (Math.random() - 0.5) * 220;
  const shape = Math.random() < 0.3 ? 'circle' : 'rect';
  return { startX, size, color, delay, duration, rotate, drift, shape };
}

/**
 * Cannon-style piece launched from a bottom corner, arcing up and out before
 * falling — a classic party-popper trajectory (keyframed y/x rather than a
 * simple straight fall) layered under the raining pieces above for extra
 * "just went off" drama.
 */
function makeBurstPiece(seed, side) {
  const size = 7 + Math.random() * 8;
  const color = COLORS[seed % COLORS.length];
  const delay = Math.random() * 0.25;
  const duration = 2.2 + Math.random() * 1.3;
  const rotate = (Math.random() - 0.5) * 1440;
  const peakHeight = -(220 + Math.random() * 200);
  const outward = side === 'left' ? 70 + Math.random() * 240 : -(70 + Math.random() * 240);
  const settle = outward * 1.4;
  const shape = Math.random() < 0.3 ? 'circle' : 'rect';
  return { side, size, color, delay, duration, rotate, peakHeight, outward, settle, shape };
}

/**
 * One-shot confetti burst — plays once when a player's Protection Score is
 * 50% or higher on the Results screen, paired with `soundEngine.cheerChime()`.
 * Mixes gently-raining pieces (full width, top-down) with a pair of
 * corner "cannon" bursts that arc up and outward before falling, for a much
 * bigger, denser, more celebratory moment than a single falling layer.
 * Finite (every piece animates once and fades out, nothing loops), matching
 * this project's convention against continuously-looping animations.
 */
export default function Confetti({ fallCount = 70, burstCount = 40 }) {
  const fallPieces = Array.from({ length: fallCount }, (_, i) => makeFallPiece(i));
  const burstPieces = Array.from({ length: burstCount }, (_, i) =>
    makeBurstPiece(i, i % 2 === 0 ? 'left' : 'right')
  );

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 30,
      }}
      aria-hidden="true"
    >
      {fallPieces.map((p, i) => (
        <motion.div
          key={`fall-${i}`}
          initial={{ y: -30, x: 0, rotate: 0, opacity: 1 }}
          animate={{ y: 640, x: p.drift, rotate: p.rotate, opacity: [1, 1, 1, 0] }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
          style={{
            position: 'absolute',
            top: 0,
            left: `${p.startX}%`,
            width: p.size,
            height: p.shape === 'circle' ? p.size : p.size * 0.4,
            background: p.color,
            borderRadius: p.shape === 'circle' ? '50%' : 2,
          }}
        />
      ))}
      {burstPieces.map((p, i) => (
        <motion.div
          key={`burst-${i}`}
          initial={{ y: 0, x: 0, rotate: 0, opacity: 1 }}
          animate={{
            y: [0, p.peakHeight, 640],
            x: [0, p.outward, p.settle],
            rotate: p.rotate,
            opacity: [1, 1, 1, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            times: [0, 0.32, 1],
            ease: ['easeOut', 'easeIn'],
          }}
          style={{
            position: 'absolute',
            bottom: 0,
            [p.side]: 0,
            width: p.size,
            height: p.shape === 'circle' ? p.size : p.size * 0.4,
            background: p.color,
            borderRadius: p.shape === 'circle' ? '50%' : 2,
          }}
        />
      ))}
    </div>
  );
}
