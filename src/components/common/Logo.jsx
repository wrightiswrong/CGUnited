import logoUrl from '../../assets/cg-united-logo.png';
import logoWhiteUrl from '../../assets/cg-united-logo-white.png';

/**
 * @param {{height?: number, className?: string, variant?: 'default'|'white'}} props
 * `variant="white"` uses the official all-white lockup for dark/navy
 * backgrounds (e.g. the Welcome screen), matching the CG United style guide.
 */
export default function Logo({ height = 48, className = '', variant = 'default' }) {
  return (
    <img
      src={variant === 'white' ? logoWhiteUrl : logoUrl}
      alt="CG United"
      height={height}
      className={className}
      style={{ height, width: 'auto', display: 'block' }}
      draggable={false}
    />
  );
}
