import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/global.css';
import App from './App.jsx';
import { listenForSyncRequests, syncFromSiblingPorts } from './storage/portSync.js';

// See portSync.js - only does anything on the offline kiosk's
// http://localhost:<port>/ setup, where the leaderboard can otherwise end
// up split across ports. No-op on the live GitHub Pages URL.
listenForSyncRequests();
syncFromSiblingPorts();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
