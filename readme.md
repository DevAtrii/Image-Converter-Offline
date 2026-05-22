# Image Converter

**Live:** [atrii.dev](https://atrii.dev) · **GitHub Pages:** [devatrii.github.io/Image-Converter-Offline](https://devatrii.github.io/Image-Converter-Offline/)

A fast, privacy-first image converter that runs entirely in your browser. Convert between WebP, PNG, JPEG, and GIF without uploading files to a server.

## Features

- **100% offline** — all conversion happens locally in the browser
- **Batch conversion** — convert multiple images at once, download as ZIP
- **Format support** — WebP, PNG, JPEG, GIF (any-to-any)
- **Quality & size controls** — adjust quality slider and max output size (KB)
- **Before / after sizes** — see file size savings after conversion
- **Gallery preview** — tap an image to open full-screen view with pinch-to-zoom, pan, and swipe
- **Convert or Convert & Download** — preview results before downloading
- **Remembers settings** — last selected source/target formats saved in `localStorage`
- **Light & dark mode** — green-themed UI with theme toggle in footer
- **PWA ready** — service worker caches assets for offline use
- **Clear cache** — one-click reset of service worker and cached pages

## Tech

- Vanilla HTML, CSS, and JavaScript — no build step
- [Lucide](https://lucide.dev/) icons via [Iconify](https://iconify.design/)
- [JSZip](https://stuk.github.io/jszip/) for batch ZIP downloads
- Service worker for offline caching

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/DevAtrii/Image-Converter-Offline.git
   cd Image-Converter-Offline
   ```

2. Open `index.html` in a browser, or serve the folder with any static file server:

   ```bash
   npx serve .
   ```

No install or build required.

## Project Structure

```
├── index.html      # App UI and conversion logic
├── sw.js           # Service worker (offline cache)
├── manifest.json   # PWA manifest
└── readme.md
```

## Deployment

### GitHub Pages (automatic)

Pushes to `main` deploy via [GitHub Actions](.github/workflows/pages.yml).

1. In the repo, go to **Settings → Pages**
2. Set **Source** to **GitHub Actions**
3. Push to `main` — the workflow uploads the repo root as the site

The site is published at:

`https://devatrii.github.io/Image-Converter-Offline/`

### Custom domain

To serve at a root domain (e.g. `atrii.dev`), point DNS to GitHub Pages and add the domain under **Settings → Pages → Custom domain**.

## Service Worker

Cache name and precached URLs are defined in `sw.js`:

```js
const CACHE_NAME = 'atrii-image-converter-v2';
const urlsToCache = ['/', '/index.html', '/manifest.json', ...];
```

Use **Clear Cache** in the app footer to wipe caches and re-register the service worker after updates.

## License

MIT — free to use, modify, and distribute. Credit appreciated.

## Connect

- [GitHub](https://github.com/DevAtrii/Image-Converter-Offline)
- [YouTube](https://www.youtube.com/@devatrii/videos)

Built by [Atrii](https://atrii.dev)
