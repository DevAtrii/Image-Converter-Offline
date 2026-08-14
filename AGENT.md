# Agent Guide — Image Converter Offline

Quick orientation for AI agents working in this repo. Read this before exploring the full codebase.

## What this project is

A **vanilla HTML/CSS/JS** image toolkit that runs **100% in the browser** (no build step, no framework). Six tools share one design system and layout pattern. Deployed to GitHub Pages; custom domain `atrii.dev`.

| Live URL | `https://devatrii.github.io/Image-Converter-Offline/` |
| Repo | `https://github.com/DevAtrii/Image-Converter-Offline` |

**Supported input formats:** PNG, JPEG, WebP, GIF (all tools).

---

## Tools map

| Tool | HTML | JS | CSS | localStorage key |
|------|------|----|-----|----------------|
| Converter | `index.html` | `js/converter.js` | `css/converter.css` | `imageConverterFormats` |
| Resizer | `resizer.html` | `js/resizer.js` | `css/resizer.css` | `imageResizerSettings` |
| Cropper | `crop.html` | `js/crop.js` | `css/crop.css` | `imageCropSettings` |
| Corner Rounder | `corners.html` | `js/corners.js` | `css/corners.css` | `imageCornersSettings` |
| Color Picker | `colors.html` | `js/colors.js` | `css/colors.css` | `imageColorsSettings` |
| Rotator | `rotate.html` | `js/rotate.js` | `css/rotate.css` | `imageRotateSettings` |

**Shared:** `css/shared.css`, `js/shared.js`, `sw.js`, `manifest.json`, `sitemap.xml`, `robots.txt`

---

## Layout pattern (every tool page)

```
.container.tool-page
  .tool-nav-wrap > nav.tool-nav          ← 6 tool links, active page gets .active
  header.page-header.tool-page-header
  .tool-workspace
    aside.tool-sidebar > .tool-sidebar-inner
      .card (settings panels)
      .sidebar-actions (Export / Export & Download / Download)
    main.tool-main > .card.tool-main-card
      .tool-main-content
        #dropZone
        #preview (.preview.tool-preview)
        #progress
  section.seo-section
footer.site-footer                        ← theme toggle, clear cache
```

- **Desktop:** sidebar left, images right.
- **Mobile:** stacked; tool nav scrolls horizontally (`tool-nav-wrap` in `shared.css`).

### Tool nav (copy to every new page)

All six links, compact single-line format inside `tool-nav-wrap`:

Converter · Resizer · Crop · Corners · Colors · Rotate

Mark current page: `class="tool-nav-link active" aria-current="page"`.

---

## `js/shared.js` — shared utilities

Loaded on every page. Key exports/globals:

| Symbol | Purpose |
|--------|---------|
| `icon(name, size)` | Returns `<iconify-icon>` HTML for Lucide icons |
| `FORMAT_OPTIONS` | `[{ value: 'image/png', label: 'PNG' }, …]` |
| `initCustomSelect(root, options, defaultValue)` | Accessible custom dropdown; listen for `change` on root |
| `initCustomSlider(root, { min, max, value, step })` | Accessible range slider; `input` + `change` events |
| `formatFileSize(bytes)` | Human-readable size string |
| `formatLabel(mime)` | `'image/png'` → `'PNG'` |

Also handles: theme toggle (`imageConverterTheme`), footer year, **Clear Cache** button, service worker registration.

### Theme

- Class `dark` on `<html>` for dark mode.
- Inline script in `<head>` of each HTML page prevents flash of wrong theme.
- Primary green: `#15803d` (light), `#0a1510` (dark theme-color).

---

## Per-tool JS conventions

Each `js/*.js` file is self-contained (no modules). Typical state:

```js
let selectedFiles = [];      // File objects
let previewUrls = [];        // data URLs for thumbnails
// tool-specific state arrays/maps
```

### Common UI elements (IDs reused across tools)

| ID | Role |
|----|------|
| `dropZone` | Drag-and-drop + click to browse |
| `fileInput` | Hidden `<input type="file" multiple>` |
| `addImagesBtn` | Opens file picker |
| `preview` | Grid of `.preview-item` thumbnails |
| `exportOnlyBtn` | Process without download |
| `exportBtn` | Process + download (ZIP if multiple) |
| `downloadBtn` | Re-download last export batch |
| `exportFormat` | Custom select root for output MIME |
| `targetSize` | Optional max output KB |
| `progress` | Spinner overlay during processing |

### Export pipeline pattern

1. `processImage(file, state)` — Canvas API, returns `{ blob }`.
2. `getOutputMimeType(file)` — respects `exportFormat` + `'original'`.
3. `getOutputFileName(file)` — base name + correct extension.
4. Optional quality loop when `targetSize` set (JPEG/WebP).
5. Single file → direct download; multiple → **JSZip** (`jszip.min.js` CDN).

JPEG exports: fill white background before draw (transparency → white).

### Batch selection (Converter + Rotator)

- Checkbox: `.preview-checkbox` on each `.preview-item`.
- Converter: `selectAllImages()`, `deselectAllImages()`, `getSelectedIndexes()`.
- Rotator: `selectedSet` (Set), `getBatchIndices()` — selected indices, or **all** if none selected. Sidebar batch actions use `applyToBatch()`.

---

## `css/shared.css` — design system

CSS variables on `:root` / `.dark` (`--primary`, `--border`, `--radius`, etc.).

Key component classes: `.card`, `.btn`, `.btn-primary`, `.btn-outline`, `.form-group`, `.label`, `.input`, `.custom-select`, `.custom-slider`, `.preview`, `.preview-item`, `.preview-actions`, `.drop-zone`, `.badge`, `.seo-section`.

Tool-specific overrides go in `css/<tool>.css`, not shared.css, unless the change applies to all tools.

---

## Service worker (`sw.js`)

- Cache name: `atrii-image-converter-v9` (increment on asset changes).
- Precaches all HTML, CSS, JS, manifest, sitemap, robots, JSZip CDN.
- **After adding/changing static files:** bump `CACHE_NAME` and add new paths to `urlsToCache`.
- Users can clear via footer **Clear Cache** (unregisters SW + deletes caches + reloads).

---

## Adding a new tool — checklist

1. Create `tool.html`, `js/tool.js`, `css/tool.css`.
2. Copy page shell from an existing tool (head meta, nav, footer, script tags).
3. Add nav link to **all 6+ other HTML pages**.
4. Add URLs to `sw.js` (`urlsToCache`) and bump `CACHE_NAME`.
5. Add entry to `sitemap.xml`.
6. Update `readme.md` tools table + this file.
7. SEO: unique `<title>`, description, canonical, OG tags, JSON-LD `WebApplication`, `seo-section` with internal links.

---

## Tool-specific notes

### Converter (`converter.js`)
- Gallery lightbox with pinch-zoom (converter.css).
- `select-actions` bar for batch convert selected.
- `conversionResults` Map tracks before/after sizes.
- `OVERRIDE_ON_DROP_KEY` for auto-switching source format on drop.

### Resizer (`resizer.js`)
- Modes: pixel dimensions vs percentage scale.
- Per-image rotate/flip in preview (separate from Rotator tool).
- `naturalSizes` + computed output dimensions in badges.

### Cropper (`crop.js`)
- Aspect presets with shape icons; per-image crop dialog.
- Crop state: `{ x, y, width, height }` normalized or pixel — check `crop.js` for current structure.
- Preview centering uses tool-specific scale math in `crop.css`.

### Corners (`corners.js`)
- Sidebar split into 3 cards: Corner Settings, Border & Background, Export.
- Corner toggles per corner (tl/tr/bl/br); radius 0–200 or `full`.
- Border outside vs inside; background transparent vs solid.

### Colors (`colors.js`)
- Active image index; large preview stage + thumbnail strip.
- Eyedropper with circular magnifier; fullscreen picker dialog.
- Palette extraction (6/8/12 colors); copy HEX/RGB/HSL.

### Rotator (`rotate.js`)
- State per image: `{ angle, flipH, flipV }` (angle 0–360°).
- `activeIndex` for fine rotation slider; `selectedSet` for batch ops.
- `getRotatedBounds()` for dimension badges after rotation.

---

## External dependencies (CDN)

| Package | URL | Used for |
|---------|-----|----------|
| Iconify | `code.iconify.design/iconify-icon/2.3.0/iconify-icon.min.js` | Lucide icons |
| JSZip | `cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js` | Batch ZIP |
| Inter font | Google Fonts | Typography |

Icons in HTML: `<iconify-icon icon="lucide:name" width="14" height="14">`.  
Icons in JS: `icon('name', 14)`.

---

## Deployment

- GitHub Actions: `.github/workflows/pages.yml` — push to `main` deploys repo root.
- No build step. Test locally: `npx serve .` or open HTML files directly (SW needs HTTP).

---

## What agents should avoid

- **Do not commit** unless the user explicitly asks.
- **Do not add** a build step, framework, or npm dependencies without being asked.
- **Do not create** markdown files the user didn't request (except this file).
- **Minimize scope** — match existing patterns; tool CSS stays in tool files.
- **Bump SW cache** when changing cached assets.

---

## Quick file grep commands

```bash
# Find all tool nav blocks
rg 'tool-nav-wrap' *.html

# Find localStorage keys
rg 'STORAGE_KEY' js/

# Current SW cache version
rg 'CACHE_NAME' sw.js
```
