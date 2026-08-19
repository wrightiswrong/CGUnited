import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Icon from '../common/Icon.jsx';
import Button from '../common/Button.jsx';
import { playerRepository } from '../../storage/index.js';

export default function AdminPanel({ onClose }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmClear, setConfirmClear] = useState(false);

  const reload = () => {
    setLoading(true);
    playerRepository
      .getAllPlayers()
      .then((data) => setPlayers(data.sort((a, b) => b.lastSeenAt - a.lastSeenAt)))
      .finally(() => setLoading(false));
  };

  useEffect(reload, []);

  const handleExport = async () => {
    const csv = await playerRepository.exportCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `build-your-future-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleClear = async () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    await playerRepository.clearAll();
    setConfirmClear(false);
    reload();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 100,
        background: 'rgba(6,21,39,0.96)',
        display: 'flex',
        flexDirection: 'column',
        padding: 40,
        color: '#fff',
      }}
    >
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>Staff Admin — Leads & Leaderboard</h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', margin: '4px 0 0', fontSize: 14 }}>
            {players.length} player{players.length === 1 ? '' : 's'} captured on this device
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button variant="ghost" size="sm" onClick={handleExport}>
            Export CSV
          </Button>
          <Button variant="ghost" size="sm" onClick={handleClear} style={{ borderColor: 'rgba(229,72,77,0.5)', color: '#ffb3b5' }}>
            {confirmClear ? 'Confirm Clear All' : 'Clear All Data'}
          </Button>
          <Button variant="light" size="sm" onClick={onClose}>
            <Icon name="cross" size={16} /> Close
          </Button>
        </div>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.06)', textAlign: 'left' }}>
              {['Name', 'Email', 'Phone', 'Sessions', 'Best Score', 'Last Played'].map((h) => (
                <th key={h} style={{ padding: '10px 16px', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!loading &&
              players.map((p) => {
                const best = p.sessions.reduce((a, b) => (b.score > a.score ? b : a), p.sessions[0]);
                return (
                  <tr key={p.email} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <td style={{ padding: '10px 16px' }}>{p.name}</td>
                    <td style={{ padding: '10px 16px', color: 'rgba(255,255,255,0.7)' }}>{p.email}</td>
                    <td style={{ padding: '10px 16px', color: 'rgba(255,255,255,0.7)' }}>{p.phone || '—'}</td>
                    <td style={{ padding: '10px 16px' }}>{p.sessions.length}</td>
                    <td style={{ padding: '10px 16px', fontWeight: 700 }}>{best.score.toFixed(1)}%</td>
                    <td style={{ padding: '10px 16px', color: 'rgba(255,255,255,0.6)' }}>
                      {new Date(p.lastSeenAt).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
        {!loading && players.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>No plays recorded yet.</div>
        )}
      </div>
    </motion.div>
  );
}
