# AGENTS.md

## Commands
- **Dev Server**: `npm run dev`
- **Build**: `npm run build`
- **Preview**: `npm run preview`

## Architecture & Stack
- **Frontend**: React 18, React Router DOM, Tailwind CSS (via custom CSS/classes), Lucide React.
- **Backend**: Firebase Auth & Firestore (initialized in `src/firebase.js`).
- **PWA**: Configured via `vite-plugin-pwa` in `vite.config.js`.

## Gotchas & Conventions
- **Environment**: Uses Vite env variables (`import.meta.env.VITE_FIREBASE_*`) defined in `.env`.
- **Routing & State**: React Router in `src/App.jsx`, context providers in `src/context/`, domain hooks in `src/hooks/`.
- **Styling**: Standard Tailwind/CSS classes applied directly in JSX components under `src/components/` and `src/pages/`.
