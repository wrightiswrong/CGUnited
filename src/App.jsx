import { useState, Component } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { GameProvider, useGameState, SCREENS } from './state/GameContext.jsx';
import MuteToggle from './components/common/MuteToggle.jsx';
import AdminPanel from './components/screens/AdminPanel.jsx';

import WelcomeScreen from './components/screens/WelcomeScreen.jsx';
import SelectInsureScreen from './components/screens/SelectInsureScreen.jsx';
import ProtectedLifeScreen from './components/screens/ProtectedLifeScreen.jsx';
import ContactCaptureScreen from './components/screens/ContactCaptureScreen.jsx';
import DisasterWheelScreen from './components/screens/DisasterWheelScreen.jsx';
import DamageAssessmentScreen from './components/screens/DamageAssessmentScreen.jsx';
import ResultsScreen from './components/screens/ResultsScreen.jsx';
import LeaderboardScreen from './components/screens/LeaderboardScreen.jsx';

const SCREEN_COMPONENTS = {
  [SCREENS.WELCOME]: WelcomeScreen,
  [SCREENS.SELECT]: SelectInsureScreen,
  [SCREENS.PROTECTED_LIFE]: ProtectedLifeScreen,
  [SCREENS.CONTACT]: ContactCaptureScreen,
  [SCREENS.WHEEL]: DisasterWheelScreen,
  [SCREENS.DAMAGE]: DamageAssessmentScreen,
  [SCREENS.RESULTS]: ResultsScreen,
  [SCREENS.LEADERBOARD]: LeaderboardScreen,
};

function ScreenRouter() {
  const { screen } = useGameState();
  const ActiveScreen = SCREEN_COMPONENTS[screen] ?? WelcomeScreen;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={screen}
        className="screen"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <ActiveScreen />
      </motion.div>
    </AnimatePresence>
  );
}

function ErrorBoundaryFallback({ error, onReset }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        background: 'var(--cg-navy)',
        color: '#fff',
        padding: 40,
        textAlign: 'center',
      }}
    >
      <h1 style={{ fontSize: 28 }}>Something went wrong</h1>
      <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: 480 }}>{error?.message || 'An unexpected error occurred.'}</p>
      <button
        className="tap-target"
        onClick={onReset}
        style={{
          padding: '14px 32px',
          borderRadius: 999,
          border: 'none',
          background: 'var(--cg-blue)',
          color: '#fff',
          fontWeight: 700,
          fontSize: 18,
        }}
      >
        Restart
      </button>
    </div>
  );
}

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <ErrorBoundaryFallback
          error={this.state.error}
          onReset={() => {
            this.setState({ error: null });
            window.location.reload();
          }}
        />
      );
    }
    return this.props.children;
  }
}

function AppShell() {
  const [adminOpen, setAdminOpen] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [lastTap, setLastTap] = useState(0);

  const handleCornerTap = () => {
    const now = Date.now();
    const withinWindow = now - lastTap < 2500;
    const nextCount = withinWindow ? tapCount + 1 : 1;
    setTapCount(nextCount);
    setLastTap(now);
    if (nextCount >= 5) {
      setAdminOpen(true);
      setTapCount(0);
    }
  };

  return (
    <div className="app-shell">
      <ScreenRouter />
      <MuteToggle style={{ position: 'absolute', top: 24, right: 24, zIndex: 40 }} />
      {/* Invisible hotspot in the bottom-left corner: tap 5x within 2.5s to open staff admin view. */}
      <div
        onClick={handleCornerTap}
        style={{ position: 'absolute', bottom: 0, left: 0, width: 64, height: 64, zIndex: 40 }}
        aria-hidden="true"
      />
      {adminOpen && <AdminPanel onClose={() => setAdminOpen(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <GameProvider>
        <AppShell />
      </GameProvider>
    </ErrorBoundary>
  );
}
