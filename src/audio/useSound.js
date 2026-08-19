import { useCallback, useEffect, useState } from 'react';
import { soundEngine } from './soundEngine.js';

/**
 * React entry point to the sound engine. Also wires the required
 * "unlock on first user gesture" behavior once per app lifetime.
 */
export function useSound() {
  const [muted, setMutedState] = useState(soundEngine.isMuted());

  useEffect(() => {
    const unlock = () => soundEngine.unlock();
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  const toggleMute = useCallback(() => {
    const next = soundEngine.toggleMuted();
    setMutedState(next);
  }, []);

  return { muted, toggleMute, play: soundEngine };
}
