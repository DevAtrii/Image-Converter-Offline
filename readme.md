# Image Converter & Toolkit

**Live:** [devatrii.github.io/Image-Converter-Offline](https://devatrii.github.io/Image-Converter-Offline/) · **Custom domain:** [atrii.dev](https://atrii.dev)

A fast, privacy-first image toolkit that runs entirely in your browser. Convert formats, resize, crop, round corners, pick colors, rotate, flip, design app icons, turn SVG into rasters, and batch export — with no uploads and no server processing.

> **For contributors & AI agents:** see [`AGENT.md`](AGENT.md) for architecture, conventions, and a checklist for adding tools.

## Tools

| Tool | Page | Description |
|------|------|-------------|
| **Image Converter** | [`index.html`](index.html) | Convert between WebP, PNG, JPEG, and GIF |
| **Image Resizer** | [`resizer.html`](resizer.html) | Resize by pixels or percentage, rotate, flip, and export |
| **Image Cropper** | [`crop.html`](crop.html) | Crop with aspect ratio presets, per-image editor, batch export |
| **Corner Rounder** | [`corners.html`](corners.html) | Round corners, add custom borders, and export |
| **Color Picker** | [`colors.html`](colors.html) | Eyedropper, palette extraction, copy HEX/RGB/HSL |
| **Image Rotator** | [`rotate.html`](rotate.html) | Fine rotation, flip, batch selection, and export |
| **Icon Maker** | [`icon-maker.html`](icon-maker.html) | App icons from Iconify/text/image — Android + iOS ZIP |
| **SVG to Image** | [`svg-to-image.html`](svg-to-image.html) | SVG & Android Vector XML → PNG, WebP, JPEG, GIF |
| **Remove Colors** | [`remove-colors.html`](remove-colors.html) | Knock out picked colors — per-color threshold, PNG alpha |

All tools share the same two-pane layout: **settings on the left**, **preview on the right**. A centered tool nav bar links all nine pages.

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

## Corner Rounder & Border Tool

Round image corners with custom radius presets and add customizable borders before exporting.

### Features

- **Corner radius** — slider & numeric input (0px to 200px or 50% circle/pill)
- **Presets** — 0px, 16px, 32px, 64px, and Full
- **Individual corners** — select/toggle Top-Left, Top-Right, Bottom-Right, Bottom-Left
- **Borders** — custom width, styles (solid, dashed, dotted, double), and color swatches
- **Border position** — Outside Image (expand canvas) vs Inside Image
- **Background fill** — Transparent or solid color for JPEG/custom canvas fill
- **Export formats** — PNG, WebP, JPEG, GIF, or Same as Original
- **Batch export** — download single files or a ZIP

---

## Image Color Picker

Pick colors from images with an eyedropper, extract dominant palettes, and copy values in multiple formats.

### Features

- **Eyedropper** — click any pixel to sample its color
- **Magnifier** — circular loupe with crosshair for precise picking
- **Fullscreen picker** — large preview dialog for detailed sampling
- **Thumbnail strip** — switch between multiple images
- **Palette extraction** — auto-detect 6, 8, or 12 dominant colors
- **Color formats** — copy as HEX, RGB, or HSL
- **Per-image palettes** — click a thumbnail to activate and view its palette

---

## Image Rotator

Rotate and flip images with live preview, fine angle control, and batch export.

### Features

- **Fine rotation** — 0°–360° slider and numeric input on the selected image
- **Rotate 90°** — clockwise and counter-clockwise per image or in batch
- **Flip** — horizontal and vertical per image or in batch
- **Batch selection** — check images to transform; applies to all when none selected
- **Select all / deselect all** — quick selection controls below the preview grid
- **Apply angle to selection** — copy the active image's angle to selected images
- **Reset** — restore original orientation per image or in batch
- **Export formats** — PNG, WebP, JPEG, GIF, or Same as Original
- **Batch export** — download single files or a ZIP

---

## Icon Maker

Design Android and iOS app icons from an Iconify glyph, custom text, or an uploaded image — then export a full adaptive / asset-catalog ZIP.

### Features

- **Iconify picker** — browse all packs, search icons, remembers last selected pack
- **Text or image** — type a label or upload PNG/JPEG/WebP/GIF/SVG
- **Color** — tint icon, text, and image
- **Effects chain** — drop shadow, cast shadow, and liquid glass (compose in order, drag to reorder)
- **Background** — solid color, linear / radial / mesh gradient, or image
- **Badge** — text, colors, 6 positions, width and height
- **Google Fonts** — searchable family list plus weight/italic styles
- **Live previews** — Android and iOS home screens with the icon among other apps
- **Themed toggle** — Android monochrome / Material You style preview
- **ZIP export** — `android/res/mipmap-*` adaptive layers (foreground, background, monochrome, legacy) plus iOS `AppIcon` sizes and `Contents.json`

Iconify packs and Google Fonts need a network connection the first time. Files never upload to a server.

---

## SVG to Image

Convert SVG markup and Android Vector Drawable XML into PNG, WebP, JPEG, or GIF — paste code, drop files, or pick from disk.

### Features

- **Paste code** — SVG, `<vector>` XML, or raw path data
- **Drag & drop** — `.svg` and `.xml` (Android Vector Drawable)
- **Vector XML** — groups, clip paths, fills, strokes, linear/radial gradients
- **Output size** — native, presets (128–1024), custom width/height, scale %
- **Quality & size** — quality slider and optional max output KB
- **Batch ZIP** — convert many files, download one archive
- **Remembers settings** — format, quality, scale, and size in `localStorage`

---

## Remove Colors

Knock one or more colors out of a photo — pick with an eyedropper, type HEX, or use the color picker. Each color has its own threshold and edge softness.

### Features

- **Eyedropper** — click the photo (magnifier on hover), same idea as Color Picker
- **Enter color** — HEX / RGB or native color picker
- **Multiple colors** — add, disable, or delete independently
- **Per-color threshold & softness** — tight cut or faded edge
- **Match mode** — RGB (paint chips) or Hue (green screen / solid backdrop)
- **Hold Original** — compare before / after
- **Export** — PNG/WebP keep transparency; JPEG fills white; batch ZIP

---

## Shared Features

- **Privacy first** — files never leave your device
- **Light & dark mode** — green-themed UI with theme toggle in the footer
- **PWA ready** — service worker caches assets for offline use
- **Clear cache** — one-click reset of service worker and cached pages after updates
- **Responsive layout** — sidebar + main panel on desktop, stacked on mobile
- **Unified tool nav** — switch between all nine tools from any page

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

2. Open any tool page (`index.html`, `resizer.html`, etc.) in a browser, or serve the folder locally:

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
├── corners.html        # Corner Rounder & Border Tool page
├── colors.html         # Image Color Picker page
├── rotate.html         # Image Rotator page
├── icon-maker.html     # App Icon Maker page
├── svg-to-image.html   # SVG / Vector XML to raster
├── remove-colors.html  # Color knockout / chroma key
├── css/
│   ├── shared.css      # Design system, layout, shared components
│   ├── converter.css   # Converter-specific styles (gallery, etc.)
│   ├── resizer.css     # Resizer-specific styles (transforms, mode toggles)
│   ├── crop.css        # Cropper-specific styles (crop dialog, aspect grid)
│   ├── corners.css     # Corners & border specific styles
│   ├── colors.css      # Color picker styles
│   ├── rotate.css      # Rotator-specific styles
│   ├── icon-maker.css  # Icon maker (picker modal, home-screen mocks)
│   ├── svg-to-image.css
│   └── remove-colors.css
├── js/
│   ├── shared.js       # Theme, custom selects/sliders, utilities, service worker
│   ├── converter.js    # Conversion logic and gallery
│   ├── resizer.js      # Resize, rotate, flip, and export logic
│   ├── crop.js         # Crop editor and export logic
│   ├── corners.js      # Corner rounding, border, and export logic
│   ├── colors.js       # Color picker and palette logic
│   ├── rotate.js       # Rotate, flip, and export logic
│   ├── icon-maker.js   # Icon editor, effects, previews, ZIP export
│   ├── svg-to-image.js # SVG + Vector XML parse and raster export
│   └── remove-colors.js
├── sw.js               # Service worker (offline cache)
├── manifest.json       # PWA manifest
├── sitemap.xml         # SEO sitemap (all tool pages)
├── robots.txt
├── AGENT.md            # Architecture guide for contributors & AI agents
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
const CACHE_NAME = 'atrii-image-converter-v24';
const urlsToCache = [
  '/',
  '/index.html',
  '/resizer.html',
  '/crop.html',
  '/corners.html',
  '/colors.html',
  '/rotate.html',
  '/icon-maker.html',
  '/svg-to-image.html',
  '/remove-colors.html',
  '/manifest.json',
  '/css/shared.css',
  // ...
];
```

**Important:** bump `CACHE_NAME` and add new files to `urlsToCache` whenever you change static assets. See [`AGENT.md`](AGENT.md) for the full checklist.

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
3. Request indexing for `/`, `/resizer.html`, `/crop.html`, `/corners.html`, `/colors.html`, `/rotate.html`, `/icon-maker.html`, `/svg-to-image.html`, and `/remove-colors.html`

If you use a custom domain (`atrii.dev`), set it as the primary domain in Search Console and keep canonical URLs consistent.

---

## License

MIT — free to use, modify, and distribute. Credit appreciated.

## Connect

- [GitHub](https://github.com/DevAtrii/Image-Converter-Offline)
- [YouTube](https://www.youtube.com/@devatrii/videos)

Built by [Atrii](https://atrii.dev)
