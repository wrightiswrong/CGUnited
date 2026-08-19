import { PlayerRepository } from './PlayerRepository.js';

// v2: bumped when the scoring formula changed from a raw dollar amount to a
// 0-100 Protection Score. Bumping the key means any old-format sessions
// (which would otherwise show nonsensical values like "121000%" once
// relabeled as a percentage) are simply never read again — no migration
// code needed, and nothing has to be manually cleared on kiosk machines.
const STORAGE_KEY = 'byf_players_v2';

function readAll() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (err) {
    // Corrupt data or storage unavailable (e.g. private browsing quota) —
    // fail soft rather than crashing the kiosk.
    console.error('[storage] failed to read players, starting fresh', err);
    return {};
  }
}

function writeAll(players) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
    return true;
  } catch (err) {
    console.error('[storage] failed to persist players', err);
    return false;
  }
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function csvEscape(value) {
  const str = String(value ?? '');
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

/**
 * Best session for a player: highest Protection Score wins; ties are
 * broken by whoever spent less on premiums to get there (rewards efficient,
 * targeted coverage over just buying everything).
 */
function bestSession(sessions) {
  return sessions.reduce((a, b) => {
    if (b.score !== a.score) return b.score > a.score ? b : a;
    return (b.premiumsSpent ?? Infinity) < (a.premiumsSpent ?? Infinity) ? b : a;
  }, sessions[0]);
}

export class LocalStoragePlayerRepository extends PlayerRepository {
  async getPlayerByEmail(email) {
    const players = readAll();
    return players[normalizeEmail(email)] ?? null;
  }

  async recordSession(playerInfo, session) {
    const key = normalizeEmail(playerInfo.email);
    if (!key) throw new Error('Cannot record a session without an email');

    const players = readAll();
    const existing = players[key];
    const now = Date.now();

    const record = existing
      ? {
          ...existing,
          name: playerInfo.name || existing.name,
          phone: playerInfo.phone || existing.phone || '',
          lastSeenAt: now,
          sessions: [...existing.sessions, session],
        }
      : {
          email: key,
          name: playerInfo.name || '',
          phone: playerInfo.phone || '',
          firstSeenAt: now,
          lastSeenAt: now,
          sessions: [session],
        };

    players[key] = record;
    const ok = writeAll(players);
    if (!ok) throw new Error('Could not save your result locally. Storage may be full.');
    return record;
  }

  async getAllPlayers() {
    const players = readAll();
    return Object.values(players);
  }

  async getLeaderboard(limit = 20) {
    const players = Object.values(readAll());
    const bestPerPlayer = players.map((p) => {
      const best = bestSession(p.sessions);
      return {
        name: p.name,
        email: p.email,
        score: best.score,
        premiumsSpent: best.premiumsSpent,
        playedAt: best.playedAt,
      };
    });
    bestPerPlayer.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (a.premiumsSpent ?? Infinity) - (b.premiumsSpent ?? Infinity);
    });
    return bestPerPlayer.slice(0, limit);
  }

  async exportCSV() {
    const players = Object.values(readAll());
    const header = ['name', 'email', 'phone', 'sessions_played', 'best_score', 'last_played'];
    const rows = players.map((p) => {
      const best = bestSession(p.sessions);
      return [
        p.name,
        p.email,
        p.phone || '',
        p.sessions.length,
        best.score,
        new Date(best.playedAt).toISOString(),
      ]
        .map(csvEscape)
        .join(',');
    });
    return [header.join(','), ...rows].join('\n');
  }

  async clearAll() {
    window.localStorage.removeItem(STORAGE_KEY);
  }

  /** Raw players keyed by email, as stored - used by portSync.js to answer
   * other same-machine ports' merge requests with this port's data. */
  async getRawPlayers() {
    return readAll();
  }

  /**
   * Folds another port's players object into this one, deduping sessions by
   * sessionId so repeat merges (this runs on every page load) never
   * double-count. Used by portSync.js: on the offline kiosk setup, the
   * local server can land on a different port between runs (e.g. if the
   * usual one was briefly stuck), and localStorage is partitioned per-port
   * even within the same Chrome profile - this is what stitches those
   * split-up sessions back into one combined leaderboard automatically,
   * instead of a player's earlier results silently going invisible.
   */
  async mergeFrom(remotePlayers) {
    if (!remotePlayers || typeof remotePlayers !== 'object') return;
    const local = readAll();
    let changed = false;

    for (const [email, remote] of Object.entries(remotePlayers)) {
      if (!remote || !Array.isArray(remote.sessions)) continue;
      const existing = local[email];

      if (!existing) {
        local[email] = remote;
        changed = true;
        continue;
      }

      const seen = new Set(existing.sessions.map((s) => s.sessionId));
      const newSessions = remote.sessions.filter((s) => !seen.has(s.sessionId));
      if (newSessions.length > 0) {
        existing.sessions = [...existing.sessions, ...newSessions];
        existing.firstSeenAt = Math.min(existing.firstSeenAt ?? Infinity, remote.firstSeenAt ?? Infinity);
        existing.lastSeenAt = Math.max(existing.lastSeenAt ?? 0, remote.lastSeenAt ?? 0);
        existing.name = existing.name || remote.name;
        existing.phone = existing.phone || remote.phone;
        changed = true;
      }
    }

    if (changed) writeAll(local);
  }
}
