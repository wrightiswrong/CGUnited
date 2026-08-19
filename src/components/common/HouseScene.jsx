import { motion } from 'framer-motion';

/**
 * The "Your Protected Life" visual: each insured product becomes a literal
 * piece of a house scene — Home is the walls/roof at the center, Vehicle adds
 * a garage + car, Business adds a storefront annex, Travel adds a suitcase and
 * path, Boat adds a dock, Personal Accident adds a shield over the door.
 * Anything not insured either shows a dashed placeholder (Home) or simply
 * doesn't appear yet (everything else) — so the scene visibly "builds up" as
 * coverage is added.
 *
 * A sun, drifting clouds, and a grassy landscaped foreground (bushes,
 * flowers, texture blades) are always present as ambient scenery so the
 * scene reads as a real illustrated neighborhood rather than a bare product
 * diagram, even before any coverage is chosen. Once Home is insured, a
 * chimney with rising smoke puffs and a paved walkway to the door are added
 * for extra warmth and detail.
 *
 * Every shape uses a gradient fill, a soft blurred ground shadow, and added
 * line detail (window mullions, roof shingle lines, awning stripes, wheel
 * hubs, hull shading) instead of flat single-color silhouettes — makes the
 * scene read as an actual illustration rather than placeholder icons.
 *
 * All entrance animations are one-time (no `repeat: Infinity`), matching the
 * fix that avoided the headless-Chromium crash we hit with continuously-
 * looping bubble animations elsewhere in the app.
 */
export default function HouseScene({ insuredKeys = [] }) {
  const has = (key) => insuredKeys.includes(key);
  const showHome = has('home');
  const showVehicle = has('vehicle');
  const showBusiness = has('business');
  const showTravel = has('travel');
  const showBoat = has('boat');
  const showPersonal = has('personal');

  const pop = (delay = 0) => ({
    initial: { opacity: 0, scale: 0.7 },
    animate: { opacity: 1, scale: 1 },
    transition: { delay, duration: 0.45, ease: [0.34, 1.56, 0.64, 1] },
  });

  const drift = (delay = 0) => ({
    initial: { opacity: 0, x: -12 },
    animate: { opacity: 1, x: 0 },
    transition: { delay, duration: 0.8, ease: 'easeOut' },
  });

  const puff = (delay = 0) => ({
    initial: { opacity: 0, y: 8, scale: 0.6 },
    animate: { opacity: 0.75, y: 0, scale: 1 },
    transition: { delay, duration: 0.6, ease: 'easeOut' },
  });

  return (
    <div
      style={{
        background: '#f4f8fd',
        borderRadius: 24,
        boxShadow: 'var(--shadow-lg)',
        padding: 12,
        width: '100%',
        maxWidth: 460,
      }}
    >
      <svg viewBox="0 0 400 300" width="100%" role="img" aria-label="Your protected life, illustrated as a house">
        <defs>
          <linearGradient id="hs-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e7f0fc" />
            <stop offset="100%" stopColor="#f4f8fd" />
          </linearGradient>
          <radialGradient id="hs-sun" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fff6d8" />
            <stop offset="55%" stopColor="#ffdf7e" />
            <stop offset="100%" stopColor="#f5b942" />
          </radialGradient>
          <linearGradient id="hs-grass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#b7e0ae" />
            <stop offset="100%" stopColor="#8fce85" />
          </linearGradient>
          <linearGradient id="hs-bush" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5fae63" />
            <stop offset="100%" stopColor="#3f8a49" />
          </linearGradient>
          <linearGradient id="hs-wall" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2a5a9c" />
            <stop offset="100%" stopColor="#123563" />
          </linearGradient>
          <linearGradient id="hs-roof" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1ec2f0" />
            <stop offset="100%" stopColor="#0077a8" />
          </linearGradient>
          <linearGradient id="hs-chimney" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#9a5a44" />
            <stop offset="100%" stopColor="#6e3c2c" />
          </linearGradient>
          <linearGradient id="hs-path" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#eef2f7" />
            <stop offset="100%" stopColor="#d3dce6" />
          </linearGradient>
          <linearGradient id="hs-garage" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1a4a82" />
            <stop offset="100%" stopColor="#0d2549" />
          </linearGradient>
          <linearGradient id="hs-car" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2fd0ff" />
            <stop offset="100%" stopColor="#0087bd" />
          </linearGradient>
          <linearGradient id="hs-business" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#123a72" />
            <stop offset="100%" stopColor="#08203f" />
          </linearGradient>
          <linearGradient id="hs-boat" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3a6cb4" />
            <stop offset="100%" stopColor="#123563" />
          </linearGradient>
          <linearGradient id="hs-shield" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38d68f" />
            <stop offset="100%" stopColor="#1fb673" />
          </linearGradient>
          <linearGradient id="hs-amber" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffc862" />
            <stop offset="100%" stopColor="#f5a524" />
          </linearGradient>
          <filter id="hs-shadow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" />
          </filter>
          <filter id="hs-soft" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.4" />
          </filter>
        </defs>

        <rect x="0" y="0" width="400" height="300" fill="url(#hs-sky)" />

        {/* Ambient sky scenery: sun + drifting clouds, always present so the
            scene has life and warmth from the very first screen. */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
          <g transform="translate(46,40)">
            <circle r="20" fill="url(#hs-sun)" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <line
                key={deg}
                x1={0}
                y1={0}
                x2={0}
                y2={-28}
                stroke="#ffdf7e"
                strokeWidth={3}
                strokeLinecap="round"
                opacity={0.55}
                transform={`rotate(${deg}) translate(0,-24)`}
              />
            ))}
          </g>
        </motion.g>
        <motion.g {...drift(0.1)}>
          <g transform="translate(288,52)" opacity="0.9">
            <ellipse cx="0" cy="6" rx="26" ry="12" fill="#ffffff" />
            <circle cx="-14" cy="0" r="12" fill="#ffffff" />
            <circle cx="10" cy="-3" r="15" fill="#ffffff" />
            <circle cx="26" cy="4" r="10" fill="#ffffff" />
          </g>
        </motion.g>
        <motion.g {...drift(0.2)}>
          <g transform="translate(345,86)" opacity="0.75">
            <ellipse cx="0" cy="4" rx="17" ry="8" fill="#ffffff" />
            <circle cx="-9" cy="0" r="8" fill="#ffffff" />
            <circle cx="8" cy="-2" r="9.5" fill="#ffffff" />
          </g>
        </motion.g>

        {/* Grassy foreground strip (replaces a plain ground line) with a
            darker top edge for definition, plus scattered bushes/flowers and
            short texture blades so the base of the scene feels landscaped
            rather than empty, regardless of what's insured yet. */}
        <rect x="0" y="258" width="400" height="42" fill="url(#hs-grass)" />
        <line x1="0" y1="258" x2="400" y2="258" stroke="#6fb567" strokeWidth={2} opacity="0.6" />
        {[8, 24, 40, 56, 340, 356, 372, 388].map((x, i) => (
          <line
            key={x}
            x1={x}
            y1={262}
            x2={x + (i % 2 === 0 ? -3 : 3)}
            y2={252}
            stroke="#6fb567"
            strokeWidth={2}
            strokeLinecap="round"
            opacity="0.7"
          />
        ))}
        <motion.g {...pop(0.05)}>
          <g transform="translate(18,258)">
            <ellipse cx="0" cy="10" rx="20" ry="6" fill="rgba(10,30,60,0.1)" filter="url(#hs-shadow)" />
            <circle cx="-8" cy="2" r="10" fill="url(#hs-bush)" />
            <circle cx="8" cy="4" r="12" fill="url(#hs-bush)" />
            <circle cx="0" cy="-4" r="9" fill="url(#hs-bush)" />
            <circle cx="-10" cy="-2" r="3" fill="#f5a524" opacity="0.9" />
            <circle cx="14" cy="2" r="3" fill="#e5484d" opacity="0.9" />
          </g>
        </motion.g>
        <motion.g {...pop(0.12)}>
          <g transform="translate(378,262)">
            <ellipse cx="0" cy="8" rx="16" ry="5" fill="rgba(10,30,60,0.1)" filter="url(#hs-shadow)" />
            <circle cx="-6" cy="1" r="8" fill="url(#hs-bush)" />
            <circle cx="6" cy="2" r="9.5" fill="url(#hs-bush)" />
            <circle cx="8" cy="-3" r="2.6" fill="#ffe082" opacity="0.95" />
            <circle cx="-8" cy="-2" r="2.6" fill="#f0625f" opacity="0.9" />
          </g>
        </motion.g>

        {/* Vehicle: garage + car, left of the house */}
        {showVehicle && (
          <motion.g {...pop(0)}>
            <ellipse cx="80" cy="263" rx="48" ry="7" fill="rgba(10,30,60,0.18)" filter="url(#hs-shadow)" />
            <polygon points="40,205 80,176 120,205" fill="url(#hs-roof)" />
            <rect x="45" y="205" width="70" height="55" rx="4" fill="url(#hs-garage)" />
            <rect x="52" y="214" width="56" height="34" rx="3" fill="#08203f" />
            <line x1="52" y1="223" x2="108" y2="223" stroke="#2a5ea8" strokeWidth="1.4" opacity="0.7" />
            <line x1="52" y1="232" x2="108" y2="232" stroke="#2a5ea8" strokeWidth="1.4" opacity="0.7" />
            <line x1="52" y1="241" x2="108" y2="241" stroke="#2a5ea8" strokeWidth="1.4" opacity="0.7" />
            <g transform="translate(35,224)">
              <rect x="0" y="20" width="66" height="18" rx="7" fill="url(#hs-car)" />
              <polygon points="14,20 22,6 44,6 52,20" fill="url(#hs-car)" />
              <polygon points="17,19 23,9 43,9 49,19" fill="#dff3ff" opacity="0.85" />
              <circle cx="14" cy="40" r="6.5" fill="#0a2340" />
              <circle cx="14" cy="40" r="2.6" fill="#9fc2dd" />
              <circle cx="52" cy="40" r="6.5" fill="#0a2340" />
              <circle cx="52" cy="40" r="2.6" fill="#9fc2dd" />
              <circle cx="4" cy="26" r="2" fill="#ffe9a8" />
            </g>
          </motion.g>
        )}

        {/* Home: walls + roof (anchor of the scene) */}
        {showHome ? (
          <>
            {/* Paved walkway from the door down to the grass, laid before
                the house itself so the door visually sits at its head. */}
            <motion.g {...pop(0.08)}>
              <rect x="190" y="262" width="20" height="9" rx="2" fill="url(#hs-path)" />
              <rect x="188" y="274" width="24" height="9" rx="2" fill="url(#hs-path)" />
              <rect x="190" y="286" width="20" height="9" rx="2" fill="url(#hs-path)" />
            </motion.g>
            <motion.g {...pop(0.05)}>
              <ellipse cx="200" cy="263" rx="72" ry="8" fill="rgba(10,30,60,0.18)" filter="url(#hs-shadow)" />
              <polygon points="130,150 200,95 270,150" fill="url(#hs-roof)" />
              <line x1="145" y1="140" x2="185" y2="112" stroke="#0092c9" strokeWidth="1.5" opacity="0.5" />
              <line x1="160" y1="149" x2="200" y2="121" stroke="#0092c9" strokeWidth="1.5" opacity="0.5" />
              <line x1="200" y1="149" x2="200" y2="96" stroke="#0092c9" strokeWidth="1.2" opacity="0.35" />
              <rect x="140" y="150" width="120" height="110" rx="4" fill="url(#hs-wall)" />
              <rect x="140" y="150" width="120" height="8" fill="#0a2549" opacity="0.35" />
              <rect x="185" y="200" width="30" height="60" fill="#eaf2fb" />
              <rect x="185" y="200" width="30" height="60" fill="none" stroke="#c3d6ef" strokeWidth="1.5" />
              <circle cx="209" cy="230" r="1.6" fill="#8a97ac" />
              <rect x="152" y="175" width="24" height="24" fill="#eaf2fb" />
              <line x1="164" y1="175" x2="164" y2="199" stroke="#c3d6ef" strokeWidth="1.5" />
              <line x1="152" y1="187" x2="176" y2="187" stroke="#c3d6ef" strokeWidth="1.5" />
              <rect x="224" y="175" width="24" height="24" fill="#eaf2fb" />
              <line x1="236" y1="175" x2="236" y2="199" stroke="#c3d6ef" strokeWidth="1.5" />
              <line x1="224" y1="187" x2="248" y2="187" stroke="#c3d6ef" strokeWidth="1.5" />
              {/* Small wall-mounted lantern beside the door for extra detail. */}
              <circle cx="178" cy="214" r="4" fill="url(#hs-amber)" />
              <line x1="178" y1="207" x2="178" y2="210" stroke="#5a6577" strokeWidth="2" />
            </motion.g>

            {/* Chimney + rising smoke puffs — only once Home is protected,
                the biggest single "detail" upgrade to the illustration. */}
            <motion.g {...pop(0.14)}>
              <rect x="221" y="99" width="17" height="42" fill="url(#hs-chimney)" />
              <rect x="218" y="96" width="23" height="6" fill="#5c3020" />
            </motion.g>
            <motion.g {...puff(0.5)}>
              <circle cx="229" cy="88" r="6" fill="#fff" filter="url(#hs-soft)" />
            </motion.g>
            <motion.g {...puff(0.75)}>
              <circle cx="235" cy="74" r="8" fill="#fff" filter="url(#hs-soft)" opacity="0.85" />
            </motion.g>
            <motion.g {...puff(1.0)}>
              <circle cx="240" cy="58" r="10" fill="#fff" filter="url(#hs-soft)" opacity="0.7" />
            </motion.g>
          </>
        ) : (
          <g stroke="#b7c4dc" strokeWidth={3} strokeDasharray="6 6" fill="none">
            <rect x="140" y="150" width="120" height="110" rx="4" />
            <polygon points="130,150 200,95 270,150" />
            <text
              x="200"
              y="215"
              textAnchor="middle"
              fill="#b7c4dc"
              fontSize="12"
              fontFamily="Verdana"
              strokeWidth={0}
            >
              Home not protected
            </text>
          </g>
        )}

        {/* Personal Accident: shield above the door */}
        {showPersonal && (
          <motion.g {...pop(0.1)}>
            <g transform="translate(186,120)">
              <path
                d="M14,2 L28,8 L28,20 C28,30 21,36 14,39 C7,36 0,30 0,20 L0,8 Z"
                fill="#0a2340"
                opacity="0.22"
              />
              <path
                d="M14,0 L28,6 L28,18 C28,28 21,34 14,37 C7,34 0,28 0,18 L0,6 Z"
                fill="url(#hs-shield)"
              />
              <path
                d="M8,17 L12,21 L20,11"
                stroke="#fff"
                strokeWidth={3}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          </motion.g>
        )}

        {/* Business: small storefront annex, right of the house */}
        {showBusiness && (
          <motion.g {...pop(0.1)}>
            <g transform="translate(270,190)">
              <ellipse cx="27" cy="72" rx="34" ry="6" fill="rgba(10,30,60,0.18)" filter="url(#hs-shadow)" />
              <rect x="0" y="20" width="55" height="50" fill="url(#hs-business)" />
              <rect x="0" y="8" width="55" height="14" fill="var(--cg-caribbean, #0095C8)" />
              <line x1="6" y1="8" x2="6" y2="22" stroke="#08608a" strokeWidth="1.5" opacity="0.5" />
              <line x1="16" y1="8" x2="16" y2="22" stroke="#08608a" strokeWidth="1.5" opacity="0.5" />
              <line x1="26" y1="8" x2="26" y2="22" stroke="#08608a" strokeWidth="1.5" opacity="0.5" />
              <line x1="36" y1="8" x2="36" y2="22" stroke="#08608a" strokeWidth="1.5" opacity="0.5" />
              <line x1="46" y1="8" x2="46" y2="22" stroke="#08608a" strokeWidth="1.5" opacity="0.5" />
              <rect x="18" y="40" width="20" height="30" fill="#eaf2fb" />
              <line x1="28" y1="40" x2="28" y2="70" stroke="#c3d6ef" strokeWidth="1.4" />
              <rect x="-4" y="20" width="63" height="6" fill="var(--cg-amber, #f5a524)" />
            </g>
          </motion.g>
        )}

        {/* Travel: suitcase + dotted path from the door */}
        {showTravel && (
          <motion.g {...pop(0.15)}>
            <path
              d="M200,262 C 230,270 260,278 300,282"
              stroke="#9fb3d6"
              strokeWidth={3}
              strokeDasharray="2 8"
              fill="none"
            />
            <ellipse cx="312" cy="286" rx="22" ry="5" fill="rgba(10,30,60,0.15)" filter="url(#hs-shadow)" />
            <g transform="translate(295,268)">
              <rect x="0" y="6" width="34" height="26" rx="4" fill="url(#hs-amber)" />
              <line x1="0" y1="18" x2="34" y2="18" stroke="#c67f0e" strokeWidth="1.4" opacity="0.6" />
              <rect
                x="10"
                y="0"
                width="14"
                height="10"
                rx="2"
                fill="none"
                stroke="var(--cg-amber, #f5a524)"
                strokeWidth="3"
              />
            </g>
          </motion.g>
        )}

        {/* Boat: small dock, far right */}
        {showBoat && (
          <motion.g {...pop(0.2)}>
            <g transform="translate(330,225)">
              <ellipse cx="25" cy="52" rx="40" ry="6" fill="rgba(10,30,60,0.15)" filter="url(#hs-shadow)" />
              <rect x="-10" y="35" width="70" height="14" fill="#bcdff2" />
              <line x1="-10" y1="42" x2="60" y2="42" stroke="#8fc4e0" strokeWidth="1.4" opacity="0.6" />
              <path d="M0,35 L55,35 L46,20 L10,20 Z" fill="url(#hs-boat)" />
              <path d="M0,35 L55,35 L46,20 L10,20 Z" fill="none" stroke="#0a2549" strokeWidth="1" opacity="0.3" />
              <line x1="28" y1="20" x2="28" y2="4" stroke="#0a2b5e" strokeWidth="3" />
              <path d="M28,4 L40,10 L28,14 Z" fill="var(--cg-caribbean, #0095C8)" />
            </g>
          </motion.g>
        )}
      </svg>
    </div>
  );
}
