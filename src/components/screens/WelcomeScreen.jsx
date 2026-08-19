import { motion } from 'framer-motion';
import Logo from '../common/Logo.jsx';
import Button from '../common/Button.jsx';
import Icon from '../common/Icon.jsx';
import { useGameActions } from '../../state/GameContext.jsx';
import { STARTING_BUDGET } from '../../data/gameConfig.js';

export default function WelcomeScreen() {
  const { next, reset } = useGameActions();

  const start = () => {
    reset();
    // reset() re-mounts state at WELCOME; advance on the next tick so the
    // reset has applied before we move forward.
    setTimeout(() => next(), 0);
  };

  return (
    <div
      className="welcome-navy-bg"
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 28,
        padding: 40,
        textAlign: 'center',
      }}
    >
      {/* White card behind the logo so its official full-color lockup (black
          "CG", navy + Caribbean-blue swoosh, navy "UNITED") reads with exact,
          true brand colors against white — rather than the flattened
          all-white lockup — even while sitting on the navy hero background. */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: '#fff',
          borderRadius: 28,
          padding: '32px 48px',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <Logo height={130} variant="default" />
      </motion.div>

      {/* Idle "attract" cue so booth visitors walking by know this is an
          invitation to play, not just signage. A single gentle pulse is safe
          performance-wise (unlike the many-bubble infinite loops we removed
          from OrbitStage) since only one element animates here. */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: [1, 1.045, 1] }}
        transition={{
          opacity: { delay: 0.15, duration: 0.5 },
          scale: { delay: 0.7, duration: 1.8, repeat: Infinity, repeatDelay: 1.2, ease: 'easeInOut' },
        }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '9px 20px',
          borderRadius: 999,
          background: 'rgba(0,149,200,0.22)',
          border: '1.5px solid var(--cg-blue-light)',
          color: '#fff',
          fontWeight: 700,
          fontSize: 15,
          letterSpacing: 0.3,
        }}
      >
        <Icon name="shield" size={16} /> Step Right Up — Let’s Play a Game!
      </motion.div>

      <div>
        <h1
          style={{
            color: '#fff',
            fontSize: 56,
            fontWeight: 800,
            margin: 0,
            lineHeight: 1.05,
            letterSpacing: -1,
          }}
        >
          Build Your Future
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 20, marginTop: 16, maxWidth: 560 }}>
          You’ve got <strong style={{ color: '#fff' }}>${STARTING_BUDGET.toLocaleString()}</strong> to
          protect the life you’re building. Choose your coverage, spin for a real-world curveball, and
          see how much insurance saved you.
        </p>
      </div>

      <Button size="lg" onClick={start} style={{ marginTop: 12 }}>
        Tap to Start <Icon name="arrowRight" size={20} />
      </Button>

      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 8 }}>
        Takes about 60 seconds &middot; Powered by CG United
      </p>
    </div>
  );
}
