import { useState } from 'react';
import { motion } from 'framer-motion';
import Icon from '../common/Icon.jsx';
import Button from '../common/Button.jsx';
import { useGameActions, useGameState } from '../../state/GameContext.jsx';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Loose phone validation: at least 7 digits once punctuation/spacing is
// stripped, so international formats, dashes, and parentheses all pass.
const PHONE_DIGITS_RE = /\d/g;

export default function ContactCaptureScreen() {
  const { player } = useGameState();
  const { setPlayer, next } = useGameActions();
  const [name, setName] = useState(player.name || '');
  const [email, setEmail] = useState(player.email || '');
  const [phone, setPhone] = useState(player.phone || '');
  const [touched, setTouched] = useState(false);

  const phoneDigitCount = (phone.match(PHONE_DIGITS_RE) || []).length;

  const nameError = touched && name.trim().length < 1 ? 'Please enter your name.' : null;
  const emailError = touched && !EMAIL_RE.test(email.trim()) ? 'Please enter a valid email.' : null;
  const phoneError = touched && phoneDigitCount < 7 ? 'Please enter a valid phone number.' : null;
  const canSubmit = name.trim().length > 0 && EMAIL_RE.test(email.trim()) && phoneDigitCount >= 7;

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (!canSubmit) return;
    setPlayer({ name: name.trim(), email: email.trim(), phone: phone.trim() });
    next();
  };

  const inputStyle = {
    width: '100%',
    padding: '14px 20px',
    fontSize: 18,
    borderRadius: 14,
    border: '1.5px solid var(--cg-card-border)',
    background: 'var(--cg-card-bg)',
    color: 'var(--cg-text)',
    boxShadow: 'var(--shadow-sm)',
    outline: 'none',
  };

  return (
    // Top-aligned scroller + margin:auto inner wrapper, same fix applied to
    // the other tall screens: guarantees every field and the submit button
    // stay reachable even if this ever ends up taller than the screen,
    // instead of the button getting clipped with no way to scroll to it.
    <div style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto' }}>
    <div style={{ margin: 'auto 0', width: '100%', display: 'flex', justifyContent: 'center', padding: '20px 40px' }}>
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 12 }}
      >
        <div style={{ textAlign: 'center', marginBottom: 4 }}>
          <h1 style={{ color: 'var(--cg-text)', fontSize: 'clamp(22px, 3.2vh, 30px)', fontWeight: 800, margin: 0 }}>Before You Spin</h1>
          <p style={{ color: 'var(--cg-text-muted)', fontSize: 14, marginTop: 6 }}>
            Enter your details to see your results and join today’s leaderboard.
          </p>
        </div>

        <div>
          <label htmlFor="name" style={{ color: 'var(--cg-text-muted)', fontSize: 13, fontWeight: 600 }}>
            Name
          </label>
          <input
            id="name"
            type="text"
            inputMode="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Smith"
            style={{ ...inputStyle, marginTop: 4, borderColor: nameError ? 'var(--cg-red)' : inputStyle.border }}
          />
          {nameError && <div style={{ color: 'var(--cg-red)', fontSize: 12, marginTop: 4 }}>{nameError}</div>}
        </div>

        <div>
          <label htmlFor="email" style={{ color: 'var(--cg-text-muted)', fontSize: 13, fontWeight: 600 }}>
            Email
          </label>
          <div style={{ position: 'relative', marginTop: 4 }}>
            <input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@email.com"
              style={{ ...inputStyle, paddingLeft: 46, borderColor: emailError ? 'var(--cg-red)' : inputStyle.border }}
            />
            <Icon
              name="mail"
              size={18}
              className=""
              style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--cg-text-faint)' }}
            />
          </div>
          {emailError && <div style={{ color: 'var(--cg-red)', fontSize: 12, marginTop: 4 }}>{emailError}</div>}
        </div>

        <div>
          <label htmlFor="phone" style={{ color: 'var(--cg-text-muted)', fontSize: 13, fontWeight: 600 }}>
            Phone Number
          </label>
          <div style={{ position: 'relative', marginTop: 4 }}>
            <input
              id="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 123-4567"
              style={{ ...inputStyle, paddingLeft: 46, borderColor: phoneError ? 'var(--cg-red)' : inputStyle.border }}
            />
            <Icon
              name="phone"
              size={18}
              className=""
              style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--cg-text-faint)' }}
            />
          </div>
          {phoneError && <div style={{ color: 'var(--cg-red)', fontSize: 12, marginTop: 4 }}>{phoneError}</div>}
        </div>

        <div
          style={{
            border: '1.5px solid var(--cg-navy)',
            borderRadius: 14,
            padding: '10px 16px',
            textAlign: 'center',
            background: 'var(--cg-card-bg)',
          }}
        >
          <div style={{ color: 'var(--cg-navy)', fontWeight: 700, fontSize: 11.5, letterSpacing: 0.3, marginBottom: 4 }}>
            DATA PROTECTION &amp; PRIVACY NOTICE
          </div>
          <div style={{ color: 'var(--cg-text-muted)', fontSize: 11.5, lineHeight: 1.4 }}>
            This Policy once cover is in effect, is subject to the requirements of the{' '}
            <strong style={{ color: 'var(--cg-navy)' }}>Data Protection Act (2020)</strong> and the{' '}
            <strong style={{ color: 'var(--cg-navy)' }}>Privacy Policy</strong> of{' '}
            <strong style={{ color: 'var(--cg-navy)' }}>CG United Insurance Ltd</strong>.
          </div>
        </div>

        <Button size="md" type="submit" style={{ marginTop: 4, alignSelf: 'center' }}>
          Spin the Wheel <Icon name="arrowRight" size={18} />
        </Button>
      </motion.form>
    </div>
    </div>
  );
}
