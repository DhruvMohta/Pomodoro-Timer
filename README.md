# Neon Lofi Focus

A Pomodoro-style study timer with a lofi music player and a retro neon interface, built with React, TypeScript, and Vite.

Live app: https://dhruvmohta.github.io/Pomodoro-Timer/

## Features

- **Pomodoro timer** — configurable focus, short break, and long break durations, with automatic switching between them.
- **Session tracking** — shows progress toward your next long break.
- **Music player** — a built-in lofi playlist with play/pause, skip, and volume control. You can also upload your own audio files or an entire folder.
- **Custom backgrounds** — upload a video to use as the background; the app pulls dominant colors from it and re-themes the UI accents to match.
- **Retro UI** — scanline and CRT-style visual effects, VT323 monospace font.

## Running locally

**Prerequisites:** Node.js

```bash
npm install
npm run dev
```

## Building for production

```bash
npm run build
```

Outputs a static build to `dist/`. The project deploys automatically to GitHub Pages via the workflow in `.github/workflows/deploy.yml` on every push to `main`.
