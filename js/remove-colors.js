const STORAGE_KEY = 'imageRemoveColorsSettings';
const MAG_SIZE = 120;
const MAG_SOURCE_PX = 12;
const PREVIEW_MAX = 900;
const RGB_MAX_DIST = 255 * Math.sqrt(3);

const dropZone = document.getElementById('dropZone');
const addImagesBtn = document.getElementById('addImagesBtn');
const fileInput = document.getElementById('fileInput');
const mainContent = document.querySelector('.tool-main-content');
const workspace = document.getElementById('workspace');
const activeImageTitle = document.getElementById('activeImageTitle');
const compareBtn = document.getElementById('compareBtn');
const removeActiveBtn = document.getElementById('removeActiveBtn');
const stage = document.getElementById('stage');
const previewCanvas = document.getElementById('previewCanvas');
const stageMarker = document.getElementById('stageMarker');
const thumbnails = document.getElementById('thumbnails');
const colorList = document.getElementById('colorList');
const colorEmpty = document.getElementById('colorEmpty');
const addColorPicker = document.getElementById('addColorPicker');
const addHexInput = document.getElementById('addHexInput');
const addColorBtn = document.getElementById('addColorBtn');
const matchModeEl = document.getElementById('matchMode');
const progress = document.getElementById('progress');
const exportOnlyBtn = document.getElementById('exportOnlyBtn');
const exportBtn = document.getElementById('exportBtn');
const downloadBtn = document.getElementById('downloadBtn');
const targetSizeInput = document.getElementById('targetSize');
const magnifier = document.getElementById('magnifier');
const magnifierCanvas = document.getElementById('magnifierCanvas');

const exportFormat = initCustomSelect(
    document.getElementById('exportFormat'),
    FORMAT_OPTIONS,
    'image/png'
);

let selectedFiles = [];
let previewUrls = [];
let sourceCanvases = [];
let activeIndex = -1;
let pendingDownloads = [];
let matchMode = 'rgb';
let showOriginal = false;
let previewTimer = 0;
let colorSeq = 0;
let colors = [];

function rgbToHex(r, g, b) {
    return `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`.toUpperCase();
}

function parseColor(raw) {
    if (!raw) return null;
    const s = String(raw).trim();
    let m = s.match(/^#?([0-9a-f]{3})$/i);
    if (m) {
        const [r, g, b] = m[1].split('').map(c => parseInt(c + c, 16));
        return { r, g, b };
    }
    m = s.match(/^#?([0-9a-f]{6})$/i);
    if (m) {
        return {
            r: parseInt(m[1].slice(0, 2), 16),
            g: parseInt(m[1].slice(2, 4), 16),
            b: parseInt(m[1].slice(4, 6), 16)
        };
    }
    m = s.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (m) {
        return {
            r: Math.min(255, parseInt(m[1], 10)),
            g: Math.min(255, parseInt(m[2], 10)),
            b: Math.min(255, parseInt(m[3], 10))
        };
    }
    return null;
}

function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    let h = 0;
    let s = 0;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            default: h = ((r - g) / d + 4) / 6; break;
        }
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
}

function rgbDist(r, g, b, color) {
    const dr = r - color.r;
    const dg = g - color.g;
    const db = b - color.b;
    return (Math.sqrt(dr * dr + dg * dg + db * db) / RGB_MAX_DIST) * 100;
}

function hueDist(r, g, b, color) {
    const p = rgbToHsl(r, g, b);
    const c = rgbToHsl(color.r, color.g, color.b);
    if (p.s < 10 && c.s < 10) return rgbDist(r, g, b, color);
    if (p.s < 10) return 100;
    let dh = Math.abs(p.h - c.h);
    if (dh > 180) dh = 360 - dh;
    return (dh / 180) * 100;
}

function colorDistance(r, g, b, color) {
    return matchMode === 'hue' ? hueDist(r, g, b, color) : rgbDist(r, g, b, color);
}

function removeAmount(dist, threshold, softness) {
    const hard = Math.max(0, threshold - softness);
    if (dist <= hard) return 1;
    if (dist >= threshold) return 0;
    const span = threshold - hard;
    return span <= 0 ? 1 : 1 - (dist - hard) / span;
}

function processImageData(imageData) {
    const active = colors.filter(c => c.enabled);
    if (active.length === 0) return imageData;
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const a = data[i + 3];
        if (a === 0) continue;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        let remove = 0;
        for (let c = 0; c < active.length; c++) {
            const color = active[c];
            const amt = removeAmount(
                colorDistance(r, g, b, color),
                color.threshold,
                color.softness
            );
            if (amt > remove) remove = amt;
            if (remove >= 1) break;
        }
        if (remove > 0) data[i + 3] = Math.round(a * (1 - remove));
    }
    return imageData;
}

function isSupportedFormat(mimeType) {
    return FORMAT_OPTIONS.some(option => option.value === mimeType);
}

function saveSettings() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        format: exportFormat.value,
        targetSize: targetSizeInput.value,
        matchMode,
        colors: colors.map(c => ({
            r: c.r,
            g: c.g,
            b: c.b,
            threshold: c.threshold,
            softness: c.softness,
            enabled: c.enabled
        }))
    }));
}

function loadSettings() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (!saved) return;
        if (saved.format && exportFormat.hasOption(saved.format)) exportFormat.value = saved.format;
        if (saved.targetSize) targetSizeInput.value = saved.targetSize;
        if (saved.matchMode === 'hue' || saved.matchMode === 'rgb') matchMode = saved.matchMode;
        if (Array.isArray(saved.colors)) {
            colors = saved.colors.map(c => ({
                id: 'c' + (++colorSeq),
                r: c.r,
                g: c.g,
                b: c.b,
                threshold: clamp(c.threshold, 0, 100, 28),
                softness: clamp(c.softness, 0, 50, 10),
                enabled: c.enabled !== false
            }));
        }
    } catch (_) {}
    syncMatchMode();
    renderColorList();
}

function clamp(n, min, max, fallback) {
    const v = Number(n);
    if (!Number.isFinite(v)) return fallback;
    return Math.min(max, Math.max(min, v));
}

function syncMatchMode() {
    matchModeEl.querySelectorAll('.rc-mode-btn').forEach(btn => {
        btn.classList.toggle('is-active', btn.dataset.mode === matchMode);
    });
}

function updateUploadActions() {
    const hasFiles = selectedFiles.length > 0;
    dropZone.classList.toggle('has-images', hasFiles);
    mainContent.classList.toggle('has-images', hasFiles);
    workspace.classList.toggle('hidden', !hasFiles);
    exportOnlyBtn.disabled = !hasFiles;
    exportBtn.disabled = !hasFiles;
    compareBtn.disabled = !hasFiles || activeIndex < 0;
    removeActiveBtn.disabled = activeIndex < 0;
}

function resetPendingDownload() {
    pendingDownloads = [];
    downloadBtn.classList.add('hidden');
}

function findDuplicate(r, g, b) {
    return colors.find(c => c.r === r && c.g === g && c.b === b);
}

function addColor(r, g, b, { flash = true } = {}) {
    const existing = findDuplicate(r, g, b);
    if (existing) {
        if (flash) flashColor(existing.id);
        return existing;
    }
    const color = {
        id: 'c' + (++colorSeq),
        r, g, b,
        threshold: 28,
        softness: 10,
        enabled: true
    };
    colors.push(color);
    addHexInput.value = rgbToHex(r, g, b);
    addColorPicker.value = rgbToHex(r, g, b);
    renderColorList();
    saveSettings();
    schedulePreview();
    return color;
}

function flashColor(id) {
    const row = colorList.querySelector(`[data-color-id="${id}"]`);
    if (!row) return;
    row.classList.add('is-flash');
    setTimeout(() => row.classList.remove('is-flash'), 600);
}

function removeColor(id) {
    colors = colors.filter(c => c.id !== id);
    renderColorList();
    saveSettings();
    schedulePreview();
}

function renderColorList() {
    if (colors.length === 0) {
        colorList.innerHTML = '<div class="rc-empty" id="colorEmpty">No colors yet. Click the image or add a HEX value.</div>';
        return;
    }
    colorList.innerHTML = colors.map(c => {
        const hex = rgbToHex(c.r, c.g, c.b);
        return `
            <div class="rc-color-card${c.enabled ? '' : ' is-disabled'}" data-color-id="${c.id}">
                <div class="rc-color-head">
                    <label class="color-input-wrap" title="Change color">
                        <input type="color" data-field="picker" value="${hex}" aria-label="Color">
                    </label>
                    <input class="input rc-color-hex" data-field="hex" value="${hex}" spellcheck="false" maxlength="20" aria-label="HEX">
                    <button class="btn btn-outline btn-icon btn-sm" type="button" data-field="toggle" title="${c.enabled ? 'Disable' : 'Enable'}">
                        ${icon(c.enabled ? 'eye' : 'eye-off', 14)}
                    </button>
                    <button class="btn btn-destructive btn-icon btn-sm" type="button" data-field="delete" title="Remove color">
                        ${icon('x', 14)}
                    </button>
                </div>
                <div class="rc-slider-row">
                    <span class="label">Threshold</span>
                    <input class="rc-range" type="range" data-field="threshold" min="0" max="100" value="${c.threshold}">
                    <span class="rc-slider-val" data-label="threshold">${c.threshold}</span>
                </div>
                <div class="rc-slider-row">
                    <span class="label">Softness</span>
                    <input class="rc-range" type="range" data-field="softness" min="0" max="50" value="${c.softness}">
                    <span class="rc-slider-val" data-label="softness">${c.softness}</span>
                </div>
            </div>
        `;
    }).join('');
}

function getColorFromRow(row) {
    return colors.find(c => c.id === row?.dataset.colorId);
}

function applyParsedColor(color, parsed) {
    color.r = parsed.r;
    color.g = parsed.g;
    color.b = parsed.b;
    const hex = rgbToHex(parsed.r, parsed.g, parsed.b);
    const row = colorList.querySelector(`[data-color-id="${color.id}"]`);
    if (!row) return;
    const picker = row.querySelector('[data-field="picker"]');
    const hexInput = row.querySelector('[data-field="hex"]');
    if (picker) picker.value = hex;
    if (hexInput && document.activeElement !== hexInput) hexInput.value = hex;
}

colorList.addEventListener('input', (e) => {
    const row = e.target.closest('[data-color-id]');
    const color = getColorFromRow(row);
    if (!color) return;
    const field = e.target.dataset.field;
    if (field === 'threshold') {
        color.threshold = Number(e.target.value);
        row.querySelector('[data-label="threshold"]').textContent = color.threshold;
        schedulePreview();
        saveSettings();
        return;
    }
    if (field === 'softness') {
        color.softness = Number(e.target.value);
        row.querySelector('[data-label="softness"]').textContent = color.softness;
        schedulePreview();
        saveSettings();
        return;
    }
    if (field === 'picker') {
        const parsed = parseColor(e.target.value);
        if (!parsed) return;
        applyParsedColor(color, parsed);
        schedulePreview();
        saveSettings();
        return;
    }
    if (field === 'hex') {
        const parsed = parseColor(e.target.value);
        if (!parsed) return;
        applyParsedColor(color, parsed);
        schedulePreview();
        saveSettings();
    }
});

colorList.addEventListener('change', (e) => {
    const row = e.target.closest('[data-color-id]');
    const color = getColorFromRow(row);
    if (!color) return;
    if (e.target.dataset.field === 'hex') {
        const parsed = parseColor(e.target.value);
        if (parsed) {
            applyParsedColor(color, parsed);
            e.target.value = rgbToHex(parsed.r, parsed.g, parsed.b);
        } else {
            e.target.value = rgbToHex(color.r, color.g, color.b);
        }
        saveSettings();
        schedulePreview();
    }
});

colorList.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-field]');
    if (!btn || (btn.dataset.field !== 'delete' && btn.dataset.field !== 'toggle')) return;
    const row = btn.closest('[data-color-id]');
    const color = getColorFromRow(row);
    if (!color) return;
    if (btn.dataset.field === 'delete') {
        removeColor(color.id);
        return;
    }
    color.enabled = !color.enabled;
    renderColorList();
    saveSettings();
    schedulePreview();
});

function syncAddInputs(fromPicker) {
    if (fromPicker) {
        const parsed = parseColor(addColorPicker.value);
        if (parsed) addHexInput.value = rgbToHex(parsed.r, parsed.g, parsed.b);
        return;
    }
    const parsed = parseColor(addHexInput.value);
    if (parsed) addColorPicker.value = rgbToHex(parsed.r, parsed.g, parsed.b);
}

addColorPicker.addEventListener('input', () => syncAddInputs(true));
addHexInput.addEventListener('input', () => syncAddInputs(false));
addHexInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        addFromInputs();
    }
});
addColorBtn.addEventListener('click', addFromInputs);

function addFromInputs() {
    const parsed = parseColor(addHexInput.value) || parseColor(addColorPicker.value);
    if (!parsed) {
        addHexInput.focus();
        return;
    }
    addColor(parsed.r, parsed.g, parsed.b);
}

matchModeEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.rc-mode-btn');
    if (!btn) return;
    matchMode = btn.dataset.mode;
    syncMatchMode();
    saveSettings();
    schedulePreview();
});

function cacheImageCanvas(index, img) {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0);
    sourceCanvases[index] = canvas;
}

function getCanvasPoint(canvasEl, wrap, clientX, clientY) {
    const rect = canvasEl.getBoundingClientRect();
    if (
        clientX < rect.left || clientX > rect.right ||
        clientY < rect.top || clientY > rect.bottom
    ) {
        return null;
    }
    const wrapRect = wrap.getBoundingClientRect();
    const source = sourceCanvases[activeIndex];
    if (!source) return null;
    const x = Math.floor(((clientX - rect.left) / rect.width) * source.width);
    const y = Math.floor(((clientY - rect.top) / rect.height) * source.height);
    return {
        x: Math.max(0, Math.min(source.width - 1, x)),
        y: Math.max(0, Math.min(source.height - 1, y)),
        displayX: clientX - wrapRect.left,
        displayY: clientY - wrapRect.top
    };
}

function readPixel(canvas, x, y) {
    const pixel = canvas.getContext('2d', { willReadFrequently: true }).getImageData(x, y, 1, 1).data;
    return { r: pixel[0], g: pixel[1], b: pixel[2], a: pixel[3] };
}

function hideMagnifier() {
    magnifier.classList.add('hidden');
}

function positionMagnifier(clientX, clientY) {
    const offset = 24;
    const size = magnifier.offsetWidth || MAG_SIZE;
    let left = clientX + offset;
    let top = clientY + offset;
    if (left + size > window.innerWidth - 8) left = clientX - size - offset;
    if (top + size > window.innerHeight - 8) top = clientY - size - offset;
    magnifier.style.left = `${Math.max(8, left)}px`;
    magnifier.style.top = `${Math.max(8, top)}px`;
}

function updateMagnifier(clientX, clientY) {
    const source = sourceCanvases[activeIndex];
    if (!source) {
        hideMagnifier();
        return;
    }
    const point = getCanvasPoint(previewCanvas, stage, clientX, clientY);
    if (!point) {
        hideMagnifier();
        return;
    }
    const ctx = magnifierCanvas.getContext('2d');
    const half = MAG_SOURCE_PX / 2;
    const sx = Math.max(0, Math.min(source.width - MAG_SOURCE_PX, point.x - half));
    const sy = Math.max(0, Math.min(source.height - MAG_SOURCE_PX, point.y - half));
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, MAG_SIZE, MAG_SIZE);
    ctx.drawImage(source, sx, sy, MAG_SOURCE_PX, MAG_SOURCE_PX, 0, 0, MAG_SIZE, MAG_SIZE);
    magnifier.classList.remove('hidden');
    positionMagnifier(clientX, clientY);
}

function schedulePreview() {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(renderPreview, 40);
}

function renderPreview() {
    if (activeIndex < 0 || !sourceCanvases[activeIndex]) return;
    const source = sourceCanvases[activeIndex];
    const scale = Math.min(1, PREVIEW_MAX / Math.max(source.width, source.height));
    const w = Math.max(1, Math.round(source.width * scale));
    const h = Math.max(1, Math.round(source.height * scale));
    previewCanvas.width = w;
    previewCanvas.height = h;
    const ctx = previewCanvas.getContext('2d', { willReadFrequently: true });
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(source, 0, 0, w, h);
    if (!showOriginal && colors.some(c => c.enabled)) {
        const imageData = ctx.getImageData(0, 0, w, h);
        processImageData(imageData);
        ctx.putImageData(imageData, 0, 0);
    }
}

function renderThumbnails() {
    thumbnails.innerHTML = selectedFiles.map((file, index) => `
        <button type="button" class="rc-thumb${index === activeIndex ? ' active' : ''}" data-index="${index}" title="${file.name}">
            <img src="${previewUrls[index] || ''}" alt="">
            <div class="rc-thumb-meta">${file.name}</div>
        </button>
    `).join('');
}

function setActiveIndex(index) {
    activeIndex = index;
    if (index < 0) {
        activeImageTitle.textContent = 'Select an image';
        compareBtn.disabled = true;
        removeActiveBtn.disabled = true;
        return;
    }
    activeImageTitle.textContent = selectedFiles[index].name;
    compareBtn.disabled = false;
    removeActiveBtn.disabled = false;
    renderThumbnails();
    renderPreview();
}

function loadPreview(file, index) {
    const reader = new FileReader();
    reader.onload = (e) => {
        previewUrls[index] = e.target.result;
        const img = new Image();
        img.onload = () => {
            cacheImageCanvas(index, img);
            if (activeIndex < 0) setActiveIndex(index);
            else renderThumbnails();
            if (index === activeIndex) renderPreview();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function handleFiles(files) {
    const fileList = Array.from(files);
    if (fileList.length === 0) return;
    const validFiles = fileList.filter(file => isSupportedFormat(file.type));
    if (fileList.length !== validFiles.length) {
        alert('Please select only PNG, WebP, JPEG, or GIF files.');
    }
    if (validFiles.length === 0) return;
    validFiles.forEach(file => {
        const index = selectedFiles.length;
        selectedFiles.push(file);
        previewUrls.push(null);
        sourceCanvases.push(null);
        loadPreview(file, index);
    });
    resetPendingDownload();
    updateUploadActions();
}

function removeActiveImage() {
    if (activeIndex < 0) return;
    selectedFiles.splice(activeIndex, 1);
    previewUrls.splice(activeIndex, 1);
    sourceCanvases.splice(activeIndex, 1);
    resetPendingDownload();
    if (selectedFiles.length === 0) {
        setActiveIndex(-1);
        updateUploadActions();
        return;
    }
    setActiveIndex(Math.min(activeIndex, selectedFiles.length - 1));
    updateUploadActions();
}

thumbnails.addEventListener('click', (e) => {
    const btn = e.target.closest('.rc-thumb');
    if (!btn) return;
    setActiveIndex(parseInt(btn.dataset.index, 10));
});

stage.addEventListener('pointermove', (e) => {
    if (activeIndex < 0) return;
    updateMagnifier(e.clientX, e.clientY);
});
stage.addEventListener('pointerleave', hideMagnifier);
stage.addEventListener('click', (e) => {
    const source = sourceCanvases[activeIndex];
    if (!source) return;
    const point = getCanvasPoint(previewCanvas, stage, e.clientX, e.clientY);
    if (!point) return;
    const color = readPixel(source, point.x, point.y);
    if (color.a < 10) return;
    stageMarker.classList.remove('hidden');
    stageMarker.style.left = `${point.displayX}px`;
    stageMarker.style.top = `${point.displayY}px`;
    addColor(color.r, color.g, color.b);
});

compareBtn.addEventListener('pointerdown', () => {
    showOriginal = true;
    compareBtn.classList.add('is-active');
    renderPreview();
});
['pointerup', 'pointerleave', 'pointercancel'].forEach(evt => {
    compareBtn.addEventListener(evt, () => {
        if (!showOriginal) return;
        showOriginal = false;
        compareBtn.classList.remove('is-active');
        renderPreview();
    });
});
removeActiveBtn.addEventListener('click', removeActiveImage);

dropZone.addEventListener('click', () => fileInput.click());
addImagesBtn.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
});
mainContent.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (selectedFiles.length > 0) mainContent.classList.add('is-dragover');
});
mainContent.addEventListener('dragleave', (e) => {
    if (!mainContent.contains(e.relatedTarget)) mainContent.classList.remove('is-dragover');
});
mainContent.addEventListener('drop', (e) => {
    if (e.target.closest('#dropZone')) return;
    e.preventDefault();
    mainContent.classList.remove('is-dragover');
    handleFiles(e.dataTransfer.files);
});
fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
    fileInput.value = '';
});

function outputExtension(mime) {
    return mime.split('/')[1];
}

function getOutputFileName(file) {
    const base = file.name.replace(/\.[^.]+$/, '');
    return `${base}-removed.${outputExtension(exportFormat.value)}`;
}

function downloadSingleFile(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function downloadZip(blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'removed-colors.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

async function downloadProcessedFiles(downloads) {
    if (downloads.length === 1) {
        downloadSingleFile(downloads[0].blob, downloads[0].fileName);
        return;
    }
    const zip = new JSZip();
    downloads.forEach(({ blob, fileName }) => zip.file(fileName, blob));
    downloadZip(await zip.generateAsync({ type: 'blob' }));
}

function processSourceCanvas(source) {
    const canvas = document.createElement('canvas');
    canvas.width = source.width;
    canvas.height = source.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(source, 0, 0);
    if (colors.some(c => c.enabled)) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        processImageData(imageData);
        ctx.putImageData(imageData, 0, 0);
    }
    return canvas;
}

async function processIndex(index) {
    const source = sourceCanvases[index];
    if (!source) throw new Error('Image not ready');
    const mime = exportFormat.value;
    const work = processSourceCanvas(source);
    if (mime === 'image/jpeg') {
        const flattened = document.createElement('canvas');
        flattened.width = work.width;
        flattened.height = work.height;
        const fctx = flattened.getContext('2d');
        fctx.fillStyle = '#FFFFFF';
        fctx.fillRect(0, 0, flattened.width, flattened.height);
        fctx.drawImage(work, 0, 0);
        return encodeCanvas(flattened, mime);
    }
    return encodeCanvas(work, mime);
}

async function encodeCanvas(canvas, mime) {
    let quality = mime === 'image/png' || mime === 'image/gif' ? 1 : 0.92;
    const render = () => new Promise(resolve => canvas.toBlob(resolve, mime, quality));
    let blob = await render();
    if (!blob) throw new Error('Export failed');
    const maxBytes = parseInt(targetSizeInput.value, 10) * 1024;
    if (Number.isFinite(maxBytes) && maxBytes > 0) {
        while (blob.size > maxBytes && quality > 0.1) {
            quality -= 0.1;
            blob = await render();
        }
    }
    return blob;
}

async function processAllFiles() {
    const downloads = [];
    for (let index = 0; index < selectedFiles.length; index++) {
        const blob = await processIndex(index);
        downloads.push({ blob, fileName: getOutputFileName(selectedFiles[index]) });
    }
    return downloads;
}

async function runExport(download) {
    if (selectedFiles.length === 0) return;
    progress.classList.add('active');
    exportOnlyBtn.disabled = true;
    exportBtn.disabled = true;
    try {
        pendingDownloads = await processAllFiles();
        if (download) await downloadProcessedFiles(pendingDownloads);
        downloadBtn.classList.remove('hidden');
    } catch (error) {
        console.error('Export failed:', error);
        alert(error.message || 'Export failed. Please try again.');
    }
    progress.classList.remove('active');
    updateUploadActions();
}

exportOnlyBtn.addEventListener('click', () => runExport(false));
exportBtn.addEventListener('click', () => runExport(true));
downloadBtn.addEventListener('click', async () => {
    if (pendingDownloads.length === 0) return;
    downloadBtn.disabled = true;
    try {
        await downloadProcessedFiles(pendingDownloads);
    } catch (error) {
        console.error('Download failed:', error);
        alert('Download failed. Please try again.');
    }
    downloadBtn.disabled = false;
});

document.getElementById('exportFormat').addEventListener('change', saveSettings);
targetSizeInput.addEventListener('change', saveSettings);

loadSettings();
updateUploadActions();
