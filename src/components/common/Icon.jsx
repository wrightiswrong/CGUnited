// Hand-authored inline SVG line icons (currentColor) — headless/kiosk Chromium
// environments frequently lack a color-emoji font, so emoji render as blank
// boxes. SVGs sidestep that entirely and let icons match the brand palette.
const PATHS = {
  home: (
    <path d="M3 11.5 12 4l9 7.5M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
  ),
  vehicle: (
    <path d="M4 16V11l2-5h12l2 5v5M4 16a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0Zm13 0a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0ZM4 16h13M4 11h16" />
  ),
  business: (
    <path d="M4 21V7l6-3v17M10 21V11l6-2v12M4 21h16M14 21V9l6-2v14" />
  ),
  // A recognizable airplane silhouette (was an ambiguous sparkle/star shape
  // that read unclearly, especially at small badge sizes on the Damage
  // Assessment screen). Used by the Travel product and the "Medical
  // Emergency Abroad" disaster.
  travel: (
    <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5Z" />
  ),
  boat: (
    <path d="M3 14h18l-2 4.5a2 2 0 0 1-1.8 1.2H6.8A2 2 0 0 1 5 18.5L3 14ZM6 14V6.5L12 4v10M12 4l6 4.5v5.5" />
  ),
  personal: (
    <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0" />
  ),
  hurricane: (
    <path d="M12 4a8 8 0 1 0 6.9 12M12 4a4 4 0 0 1 4 4M12 4v4m0 12v-4m8-4h-4M4 12h4" />
  ),
  // Layered flame (outer + inner tongue) reads more like a real fire than a
  // single flat outline — used by both the House Fire and Wildfire disasters.
  fire: (
    <>
      <path d="M12 3s5 4.5 5 9a5 5 0 0 1-10 0c0-1.2.5-2 1-2.7.2 1 .9 1.7 1.7 1.7 0-3 .5-4.8 2.3-8Z" />
      <path d="M12 12.3c-.9 1.1-1.3 1.9-1.3 2.6a1.3 1.3 0 0 0 2.6 0c0-.7-.4-1.5-1.3-2.6Z" />
    </>
  ),
  // A literal half-submerged house (roofline sticking out of rising water)
  // reads much more clearly as "flood" than abstract decorative waves.
  flood: (
    <>
      <path d="M5 21h14M7 21v-8l5-4 5 4v8" />
      <path d="M10 21v-4h4v4" />
      <path d="M3 16.5c1.3 1.1 2.6 1.1 3.9 0s2.6-1.1 3.9 0 2.6 1.1 3.9 0 2.6-1.1 3.9 0 2.6 1.1 3.9 0" />
    </>
  ),
  // A classic burglar/bandit mask (band across the eyes + eye holes) —
  // instantly reads as "break-in" instead of reusing the plain home icon.
  mask: (
    <>
      <path d="M2 9.5c2.5-3 6.5-4.5 10-4.5s7.5 1.5 10 4.5c-1.1 1.6-2.2 2.7-3.3 3.4-1.7 1.1-4 1.6-6.7 1.6s-5-.5-6.7-1.6C4.2 12.2 3.1 11.1 2 9.5Z" />
      <circle cx="8.7" cy="9.6" r="1.5" />
      <circle cx="15.3" cy="9.6" r="1.5" />
    </>
  ),
  // A door frame with a jagged crack and a knob — forced/broken entry,
  // distinct from the plain mask used for a simple break-in.
  brokenDoor: (
    <>
      <path d="M6 2.5h12v19H6Z" />
      <path d="M12 2.5 9.5 9l3 2.2-2.3 3.6 3 4.7" />
      <circle cx="15" cy="13" r="0.9" />
    </>
  ),
  // Cloud + lightning bolt — a distinct "storm system" symbol, so it's not
  // confused with the Hurricane disaster's spiral icon.
  stormCloud: (
    <>
      <path d="M6.5 15a3.8 3.8 0 0 1 .4-7.6 5 5 0 0 1 9.6 1.6A3.3 3.3 0 0 1 16.3 15H6.5Z" />
      <path d="M13 14.5 10 19h3l-1.8 3.3" />
    </>
  ),
  // A car plus radiating impact lines — a bigger collision, distinct from
  // the plain vehicle icon used for a minor fender bender.
  crash: (
    <>
      <path d="M2 16.5V12l1.8-4.5h9.4L15 12v4.5M2 16.5a1.4 1.4 0 1 0 2.8 0 1.4 1.4 0 0 0-2.8 0Zm9.4 0a1.4 1.4 0 1 0 2.8 0 1.4 1.4 0 0 0-2.8 0ZM2 16.5h9.4M2 12h11.2" />
      <path d="M17 5.5l2-2m0 4.4 2.4-1M18.3 10.6l2.2 1.3" />
    </>
  ),
  budget: <path d="M3 7h18v12H3zM3 7l3-4h12l3 4M12 11v6m-3-3h6" />,
  shield: <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z" />,
  check: <path d="m5 13 4 4 10-10" />,
  cross: <path d="M6 6l12 12M18 6 6 18" />,
  mail: <path d="M4 6h16v12H4zM4 6l8 7 8-7" />,
  user: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0" />,
  trophy: (
    <path d="M8 4h8v5a4 4 0 0 1-8 0V4ZM8 6H4v2a4 4 0 0 0 4 3.9M16 6h4v2a4 4 0 0 1-4 3.9M10 17h4v2h-4zM8 21h8" />
  ),
  sound: <path d="M4 9v6h4l5 4V5L8 9H4Zm12.5-1.5a5 5 0 0 1 0 9" />,
  mute: <path d="M4 9v6h4l5 4V5L8 9H4Zm11 1 4 4m0-4-4 4" />,
  arrowRight: <path d="M5 12h14m-6-6 6 6-6 6" />,
  info: <path d="M12 8h.01M11 12h1v5h1M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />,
  phone: (
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
  ),
};

/**
 * @param {{name: keyof typeof PATHS, size?: number, className?: string, strokeWidth?: number}} props
 */
export default function Icon({ name, size = 24, className = '', strokeWidth = 1.8, style = {} }) {
  const path = PATHS[name];
  if (!path) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {path}
    </svg>
  );
}
