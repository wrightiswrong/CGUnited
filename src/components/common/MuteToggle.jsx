import Icon from './Icon.jsx';
import { useSound } from '../../audio/useSound.js';

export default function MuteToggle({ style = {} }) {
  const { muted, toggleMute } = useSound();
  return (
    <button
      className="tap-target"
      onClick={toggleMute}
      aria-label={muted ? 'Unmute sound' : 'Mute sound'}
      style={{
        width: 44,
        height: 44,
        borderRadius: '50%',
        border: '1px solid var(--cg-card-border)',
        background: 'var(--cg-card-bg)',
        color: 'var(--cg-navy)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      <Icon name={muted ? 'mute' : 'sound'} size={20} />
    </button>
  );
}
