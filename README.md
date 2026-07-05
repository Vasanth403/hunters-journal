# Hunter's Journal

An RPG-themed daily productivity tracker — turn your real-life routine into a leveling system. Complete daily quests, earn EXP, level up, and fight bosses for keeping your streak alive.

## Features

- **Daily quests** across custom categories, each worth EXP
- **Leveling system** with a level-up overlay and streak-based EXP scaling
- **Weekly boss** fights tied to your consistency
- **Combat log** tracking your gains and penalties
- **Cloud sync** so your progress follows you across devices
- **Installable PWA** plus native Android builds via Capacitor

## Tech Stack

- [React 19](https://react.dev/) + [Vite 7](https://vite.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/) for styling
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Supabase](https://supabase.com/) for auth and cloud storage
- [Capacitor](https://capacitorjs.com/) for the mobile builds
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) for offline/installable support

## Getting Started

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and fill in your Supabase credentials.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm run mobile:android` | Build and open the Android project |

## License

Personal project — all rights reserved.
