# Image Converter & Resizer

**Live:** [devatrii.github.io/Image-Converter-Offline](https://devatrii.github.io/Image-Converter-Offline/) · **Resizer:** [resizer.html](https://devatrii.github.io/Image-Converter-Offline/resizer.html) · **Custom domain:** [atrii.dev](https://atrii.dev)

A fast, privacy-first image toolkit that runs entirely in your browser. Convert formats, resize, crop, rotate, flip, and batch export — with no uploads and no server processing.

## Tools

| Tool | Page | Description |
|------|------|-------------|
| **Image Converter** | [`index.html`](index.html) | Convert between WebP, PNG, JPEG, and GIF |
| **Image Resizer** | [`resizer.html`](resizer.html) | Resize by pixels or percentage, rotate, flip, and export |
| **Image Cropper** | [`crop.html`](crop.html) | Crop with aspect ratio presets, per-image editor, batch export |

Both tools share the same two-pane layout: **settings on the left**, **images on the right**.

---

## Image Converter

Convert images between WebP, PNG, JPEG, and GIF with full control over quality and output size.

### Features

- **100% offline** — all conversion happens locally in the browser
- **Batch conversion** — convert multiple images at once, download as a ZIP
- **Any-to-any formats** — WebP, PNG, JPEG, GIF
- **Quality & size controls** — quality slider and max output size (KB)
- **Before / after sizes** — see file size savings after conversion
- **Gallery preview** — full-screen view with pinch-to-zoom, pan, and swipe
- **Convert or Convert & Download** — preview results before downloading
- **Remembers settings** — last selected source/target formats saved in `localStorage`
- **Override on drop** — automatically switch source format when you drop a different file type

---

## Image Resizer

Resize, rotate, and flip images before export — ideal for batch prep and quick dimension changes.

### Features

- **Resize by size** — set width and/or height in pixels (aspect ratio preserved when one field is empty)
- **Resize by percentage** — scale from 1% to 200% with a slider
- **Per-image transforms** — rotate 90° and flip horizontal/vertical with live preview
- **Export formats** — PNG, WebP, JPEG, GIF, or **Same as Original** (keeps each file's type)
- **Target file size** — optional max output size in KB (works best with JPEG and WebP)
- **Batch export** — download single files or a ZIP
- **Reset controls** — quick reset for dimension and scale settings

---

## Image Cropper

Crop images with aspect ratio presets or freeform selection, then export in bulk.

### Features

- **Aspect ratios** — Free, 1:1, 4:3, 16:9, 3:2, 9:16
- **Per-image crop editor** — drag to move, resize crop box with live dimensions
- **Export formats** — PNG, WebP, JPEG, GIF, or Same as Original
- **Target file size** — optional max output size in KB
- **Batch export** — download single files or a ZIP

---

## Shared Features

- **Privacy first** — files never leave your device
- **Light & dark mode** — green-themed UI with theme toggle in the footer
- **PWA ready** — service worker caches assets for offline use
- **Clear cache** — one-click reset of service worker and cached pages after updates
- **Responsive layout** — sidebar + main panel on desktop, stacked on mobile

---

## Tech Stack

- **Vanilla HTML, CSS, and JavaScript** — no build step, no framework
- **[Lucide](https://lucide.dev/) icons** via [Iconify](https://iconify.design/)
- **[JSZip](https://stuk.github.io/jszip/)** for batch ZIP downloads
- **Canvas API** for image processing
- **Service worker** for offline caching

---

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/DevAtrii/Image-Converter-Offline.git
   cd Image-Converter-Offline
   ```

2. Open `index.html` or `resizer.html` in a browser, or serve the folder locally:

   ```bash
   npx serve .
   ```

No install or build required.

---

## Project Structure

```
├── index.html          # Image Converter page
├── resizer.html        # Image Resizer page
├── crop.html           # Image Cropper page
├── css/
│   ├── shared.css      # Design system, layout, shared components
│   ├── converter.css   # Converter-specific styles (gallery, etc.)
│   ├── resizer.css     # Resizer-specific styles (transforms, mode toggles)
│   └── crop.css        # Cropper-specific styles (crop dialog, aspect grid)
├── js/
│   ├── shared.js       # Theme, custom selects/sliders, utilities, service worker
│   ├── converter.js    # Conversion logic and gallery
│   ├── resizer.js      # Resize, rotate, flip, and export logic
│   └── crop.js         # Crop editor and export logic
├── sw.js               # Service worker (offline cache)
├── manifest.json       # PWA manifest
└── readme.md
```

---

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

---

## Service Worker

Cache name and precached URLs are defined in `sw.js`:

```js
const CACHE_NAME = 'atrii-image-converter-v5';
const urlsToCache = [
  '/',
  '/index.html',
  '/resizer.html',
  '/manifest.json',
  '/css/shared.css',
  // ...
];
```

After deploying an update, use **Clear Cache** in the app footer to wipe old caches and load the latest version.

---

## SEO

The site includes:

- `robots.txt` and `sitemap.xml` for crawlers
- Unique titles, meta descriptions, and canonical URLs per page
- Open Graph and Twitter Card tags
- JSON-LD structured data (`WebApplication` + `FAQPage`)
- Keyword-rich on-page content with internal links between tools

**After deploy, submit to Google:**

1. [Google Search Console](https://search.google.com/search-console) — add property `https://devatrii.github.io/Image-Converter-Offline/`
2. Submit sitemap: `https://devatrii.github.io/Image-Converter-Offline/sitemap.xml`
3. Request indexing for `/`, `/resizer.html`, and `/crop.html`

If you use a custom domain (`atrii.dev`), set it as the primary domain in Search Console and keep canonical URLs consistent.

---

## License

MIT — free to use, modify, and distribute. Credit appreciated.

## Connect

- [GitHub](https://github.com/DevAtrii/Image-Converter-Offline)
- [YouTube](https://www.youtube.com/@devatrii/videos)

Built by [Atrii](https://atrii.dev)
