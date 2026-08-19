import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative base so the built assets resolve correctly whether the app is
  // served from a domain root or a subpath (e.g. GitHub Pages project sites
  // at username.github.io/repo-name/).
  base: './',
})
