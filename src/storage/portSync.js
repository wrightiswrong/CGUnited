import { playerRepository } from './index.js';

// Same candidate port list as kiosk/offline/serve.ps1 - kept in sync
// manually since one is PowerShell and the other is the browser bundle.
const CANDIDATE_PORTS = [8787, 8788, 8789, 8790, 8791, 8850, 9090, 9191];
const REQUEST_TYPE = 'byf-request-players';
const RESPONSE_TYPE = 'byf-players-response';

/**
 * Only meaningful on the offline kiosk setup (http://localhost:<port>/).
 * The local server can land on a different port between launches (see
 * serve.ps1's port-preference comments), and localStorage is partitioned
 * per-port even inside the same Chrome profile - so a player's earlier
 * results can end up sitting invisibly on a port nothing is currently
 * pointed at. This quietly checks every other candidate port for game data
 * and merges anything found into this port's own leaderboard, so whichever
 * port the kiosk happens to be running on ends up with everything combined.
 * No-op on the live GitHub Pages URL, which only ever runs on one origin.
 */
export function syncFromSiblingPorts() {
  if (window.location.hostname !== 'localhost') return;
  const ownPort = Number(window.location.port);
  if (!ownPort) return;

  const frames = [];
  const cleanup = () => {
    frames.forEach((f) => f.remove());
    window.removeEventListener('message', onMessage);
  };

  function onMessage(event) {
    if (!event.data || event.data.type !== RESPONSE_TYPE) return;
    playerRepository.mergeFrom(event.data.players).catch(() => {});
  }

  window.addEventListener('message', onMessage);

  CANDIDATE_PORTS.filter((p) => p !== ownPort).forEach((port) => {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = `http://localhost:${port}/`;
    iframe.onload = () => {
      try {
        iframe.contentWindow.postMessage({ type: REQUEST_TYPE }, `http://localhost:${port}`);
      } catch {
        // That port likely isn't actually serving the game - ignore.
      }
    };
    document.body.appendChild(iframe);
    frames.push(iframe);
  });

  setTimeout(cleanup, 4000);
}

/** Every instance of the app listens so it can answer a sibling port's scan
 * request with its own locally-recorded sessions. */
export function listenForSyncRequests() {
  window.addEventListener('message', async (event) => {
    if (!event.data || event.data.type !== REQUEST_TYPE) return;
    const players = await playerRepository.getRawPlayers();
    event.source.postMessage({ type: RESPONSE_TYPE, players }, event.origin);
  });
}
