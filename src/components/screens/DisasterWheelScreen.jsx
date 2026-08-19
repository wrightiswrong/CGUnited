import { useRef, useState } from 'react';
import { animate } from 'framer-motion';
import Icon from '../common/Icon.jsx';
import Button from '../common/Button.jsx';
import { useGameActions } from '../../state/GameContext.jsx';
import { DISASTERS } from '../../data/gameConfig.js';
import { soundEngine } from '../../audio/soundEngine.js';

const SEGMENT_ANGLE = 360 / DISASTERS.length;
// Shared with soundEngine.wheelSuspense() so the tension bed's rising drone
// and bunching pulses line up with exactly how long the wheel spins for.
const SPIN_DURATION = 4.2;
// Brand-palette wheel segments (Ocean Blue / Caribbean Blue + shades/tints of
// each) so all disasters read clearly and stay on-brand. The lightest
// segments get dark navy text instead of white for contrast.
const SEGMENT_COLORS = [
  '#1D4289',
  '#0095C8',
  '#14305f',
  '#3db3dd',
  '#0b2247',
  '#c8c8c8',
  '#2a5aa8',
  '#57c2e6',
  '#4a76c4',
  '#8fd4ef',
  '#1a5f8a',
  '#c5e8f5',
];
const LIGHT_SEGMENTS = new Set(['#3db3dd', '#c8c8c8', '#57c2e6', '#8fd4ef', '#c5e8f5']);
function segmentTextColor(color) {
  return LIGHT_SEGMENTS.has(color) ? '#0b2247' : '#ffffff';
}

/**
 * Wedge labels sit inside the SVG, which itself is spun by `wheelRotation`
 * degrees. A label's absolute on-screen angle is baseAngleDeg + wheelRotation
 * (rotations compose additively for orientation). If that absolute angle
 * would render the text upside-down, flip the label's own rotation by 180°
 * so it always reads right-side-up once the wheel stops.
 */
function labelRotationDeg(baseAngleDeg, wheelRotation) {
  let absolute = ((baseAngleDeg + wheelRotation) % 360 + 360) % 360;
  if (absolute > 180) absolute -= 360; // normalize to (-180, 180]
  const needsFlip = absolute > 90 || absolute < -90;
  return needsFlip ? baseAngleDeg + 180 : baseAngleDeg;
}

export default function DisasterWheelScreen() {
  const { spinWheel, next } = useGameActions();
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [landed, setLanded] = useState(null);
  const lastTickSegment = useRef(0);

  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);
    setLanded(null);
    soundEngine.transition();
    soundEngine.wheelSuspense(SPIN_DURATION);

    const disaster = spinWheel();
    const index = DISASTERS.findIndex((d) => d.key === disaster.key);
    const extraSpins = 6;
    const targetWithinCircle = 360 - (index * SEGMENT_ANGLE + SEGMENT_ANGLE / 2);
    const target = rotation - (rotation % 360) + extraSpins * 360 + targetWithinCircle;

    lastTickSegment.current = Math.floor(rotation / SEGMENT_ANGLE);

    animate(rotation, target, {
      duration: SPIN_DURATION,
      ease: [0.12, 0.67, 0.2, 1],
      onUpdate: (v) => {
        setRotation(v);
        const seg = Math.floor(v / SEGMENT_ANGLE);
        if (seg !== lastTickSegment.current) {
          lastTickSegment.current = seg;
          soundEngine.wheelTick();
        }
      },
      onComplete: () => {
        setSpinning(false);
        setLanded(disaster);
        soundEngine.wheelLand();
      },
    });
  };

  return (
    // Top-aligned scroller (not centered) + a margin:auto inner wrapper: if
    // this ever ends up taller than the actual screen, every part of it
    // stays reachable by scrolling instead of the bottom button being
    // clipped with no way to reach it — the same fix applied to
    // ResultsScreen after the top heading there was found unreachable on
    // the expo display. Sizes below are also trimmed down so it should fit
    // in one screen without needing to scroll at all on a typical display.
    <div style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto' }}>
    <div
      style={{
        margin: 'auto 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 20,
        padding: '20px 40px',
        width: '100%',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ color: 'var(--cg-text)', fontSize: 'clamp(22px, 3.4vh, 32px)', fontWeight: 800, margin: 0 }}>Spin For Your Disaster</h1>
        <p style={{ color: 'var(--cg-text-muted)', fontSize: 15, marginTop: 6 }}>
          Life is unpredictable. Let’s find out what happens next.
        </p>
      </div>

      <div style={{ position: 'relative', width: 300, height: 300 }}>
        {/* Pointer */}
        <div
          style={{
            position: 'absolute',
            top: -6,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '14px solid transparent',
            borderRight: '14px solid transparent',
            borderTop: '22px solid #fff',
            zIndex: 5,
            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))',
          }}
        />
        <svg
          viewBox="0 0 400 400"
          width={300}
          height={300}
          style={{ transform: `rotate(${rotation}deg)`, borderRadius: '50%', boxShadow: 'var(--shadow-lg)' }}
        >
          {DISASTERS.map((d, i) => {
            const startAngle = (i * SEGMENT_ANGLE - 90) * (Math.PI / 180);
            const endAngle = ((i + 1) * SEGMENT_ANGLE - 90) * (Math.PI / 180);
            const cx = 200;
            const cy = 200;
            const r = 198;
            const x1 = cx + r * Math.cos(startAngle);
            const y1 = cy + r * Math.sin(startAngle);
            const x2 = cx + r * Math.cos(endAngle);
            const y2 = cy + r * Math.sin(endAngle);
            const midAngle = (startAngle + endAngle) / 2;
            // Labels sit further out (0.80r) since wedges are narrower now
            // (12 segments instead of 10) — wedge width grows with radius, so
            // more room reduces bleed into neighboring segments.
            const lx = cx + (r * 0.8) * Math.cos(midAngle);
            const ly = cy + (r * 0.8) * Math.sin(midAngle);

            const segmentColor = SEGMENT_COLORS[i % SEGMENT_COLORS.length];

            return (
              <g key={d.key}>
                <path
                  d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 0 1 ${x2},${y2} Z`}
                  fill={segmentColor}
                  stroke="rgba(255,255,255,0.35)"
                  strokeWidth={1}
                />
                {/* Box is deliberately narrower than the wedge's width at
                    this radius (roomier at the outer edge than the inner
                    edge, since it's a wedge) so two- and three-word labels
                    wrap cleanly without spilling into neighboring segments.
                    Sized for 12 narrower wedges (30° each). An icon matching
                    the specific disaster sits above the text label — imagery
                    to offset the wheel's text-heavy labels, per feedback. */}
                <foreignObject x={lx - 30} y={ly - 27} width={60} height={54} style={{ overflow: 'visible' }}>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 2,
                      transform: `rotate(${labelRotationDeg((midAngle * 180) / Math.PI + 90, rotation)}deg)`,
                    }}
                  >
                    <Icon name={d.icon} size={18} strokeWidth={2} style={{ color: segmentTextColor(segmentColor) }} />
                    <div
                      style={{
                        color: segmentTextColor(segmentColor),
                        fontSize: 9,
                        fontWeight: 700,
                        textAlign: 'center',
                        lineHeight: 1.1,
                        wordBreak: 'keep-all',
                        overflowWrap: 'normal',
                      }}
                    >
                      {d.wheelLabel || d.label}
                    </div>
                  </div>
                </foreignObject>
              </g>
            );
          })}
          <circle cx="200" cy="200" r="34" fill="#fff" />
        </svg>
      </div>

      {!landed ? (
        <Button size="md" onClick={handleSpin} disabled={spinning}>
          {spinning ? 'Spinning…' : 'Tap to Spin'}
        </Button>
      ) : (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
          <div style={{ color: 'var(--cg-text)', fontSize: 20, fontWeight: 700 }}>
            It landed on: <span style={{ color: 'var(--cg-caribbean)' }}>{landed.label}</span>
          </div>
          <p style={{ color: 'var(--cg-text-muted)', fontSize: 14, maxWidth: 460 }}>{landed.description}</p>
          <Button size="md" onClick={next}>
            See What Happens <Icon name="arrowRight" size={18} />
          </Button>
        </div>
      )}
      </div>
    </div>
  );
}
