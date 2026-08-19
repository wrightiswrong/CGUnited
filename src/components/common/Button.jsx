import { motion } from 'framer-motion';
import { soundEngine } from '../../audio/soundEngine.js';

const VARIANTS = {
  primary: {
    background: 'linear-gradient(135deg, var(--cg-blue) 0%, var(--cg-blue-light) 100%)',
    color: '#fff',
    boxShadow: '0 10px 30px rgba(31, 111, 214, 0.35)',
  },
  ghost: {
    background: 'rgba(255,255,255,0.08)',
    color: '#fff',
    boxShadow: 'none',
    border: '1px solid rgba(255,255,255,0.25)',
  },
  light: {
    background: '#fff',
    color: 'var(--cg-navy)',
    boxShadow: 'var(--shadow-md)',
  },
};

export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'lg',
  disabled = false,
  playSound = true,
  className = '',
  style = {},
  ...rest
}) {
  const padding = size === 'lg' ? '20px 40px' : size === 'md' ? '14px 28px' : '10px 18px';
  const fontSize = size === 'lg' ? 22 : size === 'md' ? 17 : 15;

  return (
    <motion.button
      className={`tap-target ${className}`}
      whileTap={{ scale: disabled ? 1 : 0.96 }}
      whileHover={disabled ? {} : { scale: 1.02 }}
      onClick={(e) => {
        if (disabled) return;
        if (playSound) soundEngine.click();
        onClick?.(e);
      }}
      disabled={disabled}
      style={{
        ...VARIANTS[variant],
        padding,
        fontSize,
        fontWeight: 700,
        border: VARIANTS[variant].border ?? 'none',
        borderRadius: 999,
        opacity: disabled ? 0.45 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        justifyContent: 'center',
        ...style,
      }}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
