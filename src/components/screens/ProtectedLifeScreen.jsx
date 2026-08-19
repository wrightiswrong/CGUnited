import { motion } from 'framer-motion';
import Button from '../common/Button.jsx';
import Icon from '../common/Icon.jsx';
import HouseScene from '../common/HouseScene.jsx';
import { useGameActions, useGameState } from '../../state/GameContext.jsx';
import { PRODUCTS } from '../../data/gameConfig.js';

export default function ProtectedLifeScreen() {
  const { insuredKeys } = useGameState();
  const { next } = useGameActions();
  const protectedProducts = PRODUCTS.filter((p) => insuredKeys.includes(p.key));

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        padding: 40,
        textAlign: 'center',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{ display: 'flex', justifyContent: 'center', width: '100%' }}
      >
        <HouseScene insuredKeys={insuredKeys} />
      </motion.div>

      <div>
        <h1 style={{ color: 'var(--cg-text)', fontSize: 32, fontWeight: 800, margin: 0 }}>This Is Your Protected Life</h1>
        {protectedProducts.length > 0 ? (
          <p style={{ color: 'var(--cg-text-muted)', fontSize: 18, marginTop: 10, maxWidth: 560 }}>
            You’ve chosen to protect{' '}
            <strong style={{ color: 'var(--cg-text)' }}>
              {protectedProducts.map((p) => p.label).join(', ')}
            </strong>
            . Let’s see if it holds up.
          </p>
        ) : (
          <p style={{ color: 'var(--cg-text-muted)', fontSize: 18, marginTop: 10, maxWidth: 560 }}>
            You chose to go without coverage this round. Let’s see what happens.
          </p>
        )}
      </div>

      <Button size="lg" onClick={next}>
        What Could Go Wrong? <Icon name="arrowRight" size={20} />
      </Button>
    </div>
  );
}
