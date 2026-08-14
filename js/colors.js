const COLORS_STORAGE_KEY = 'imageColorsSettings';
const MAG_SIZE = 120;
const MAG_SOURCE_PX = 12;

const PALETTE_COUNT_OPTIONS = [
    { value: '6', label: '6 colors' },
    { value: '8', label: '8 colors' },
    { value: '12', label: '12 colors' }
];

const COLOR_FORMAT_OPTIONS = [
    { value: 'hex', label: 'HEX' },
    { value: 'rgb', label: 'RGB' },
    { value: 'hsl', label: 'HSL' }
];

const paletteCountRoot = document.getElementById('paletteCount');
const colorFormatRoot = document.getElementById('colorFormat');
const pickedSwatch = document.getElementById('pickedSwatch');
const pickedValue = document.getElementById('pickedValue');
const copyColorBtn = document.getElementById('copyColorBtn');
const paletteGrid = document.getElementById('paletteGrid');
const dropZone = document.getElementById('dropZone');
const addImagesBtn = document.getElementById('addImagesBtn');
const fileInput = document.getElementById('fileInput');
const mainContent = document.querySelector('.tool-main-content');
const colorWorkspace = document.getElementById('colorWorkspace');
const activeImageTitle = document.getElementById('activeImageTitle');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const removeActiveBtn = document.getElementById('removeActiveBtn');
const colorStage = document.getElementById('colorStage');
const stageImage = document.getElementById('stageImage');
const stageMarker = document.getElementById('stageMarker');
const colorThumbnails = document.getElementById('colorThumbnails');
const colorMagnifier = document.getElementById('colorMagnifier');
const magnifierCanvas = document.getElementById('magnifierCanvas');
const colorFullscreen = document.getElementById('colorFullscreen');
const colorFullscreenBackdrop = document.getElementById('colorFullscreenBackdrop');
const fullscreenCloseBtn = document.getElementById('fullscreenCloseBtn');
const fullscreenTitle = document.getElementById('fullscreenTitle');
const fullscreenStage = document.getElementById('fullscreenStage');
const fullscreenImage = document.getElementById('fullscreenImage');
const fullscreenMarker = document.getElementById('fullscreenMarker');
const fullscreenSwatch = document.getElementById('fullscreenSwatch');
const fullscreenColorValue = document.getElementById('fullscreenColorValue');

const paletteCount = initCustomSelect(paletteCountRoot, PALETTE_COUNT_OPTIONS, '8');
const colorFormat = initCustomSelect(colorFormatRoot, COLOR_FORMAT_OPTIONS, 'hex');

let selectedFiles = [];
let previewUrls = [];
let naturalSizes = [];
let palettes = [];
let pickedColors = [];
let sourceCanvases = [];
let activeIndex = -1;
let fullscreenOpen = false;
let activePickerTarget = null;

function isSupportedFormat(mimeType) {
    return FORMAT_OPTIONS.some(option => option.value === mimeType);
}

function rgbToHex(r, g, b) {
    return `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`;
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

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function formatColor(color, format = colorFormat.value) {
    if (!color) return '—';
    const { r, g, b } = color;
    if (format === 'hex') return rgbToHex(r, g, b).toUpperCase();
    if (format === 'rgb') return `rgb(${r}, ${g}, ${b})`;
    const { h, s, l } = rgbToHsl(r, g, b);
    return `hsl(${h}, ${s}%, ${l}%)`;
}

function colorKey(color) {
    return `${color.r},${color.g},${color.b}`;
}

function cacheImageCanvas(index, img) {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0);
    sourceCanvases[index] = canvas;
}

function extractPaletteFromCanvas(canvas, count) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const maxSide = 80;
    const scale = Math.min(1, maxSide / Math.max(canvas.width, canvas.height));
    const sample = document.createElement('canvas');
    sample.width = Math.max(1, Math.round(canvas.width * scale));
    sample.height = Math.max(1, Math.round(canvas.height * scale));
    sample.getContext('2d').drawImage(canvas, 0, 0, sample.width, sample.height);

    const { data } = sample.getContext('2d').getImageData(0, 0, sample.width, sample.height);
    const buckets = new Map();

    for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < 128) continue;
        const r = Math.round(data[i] / 20) * 20;
        const g = Math.round(data[i + 1] / 20) * 20;
        const b = Math.round(data[i + 2] / 20) * 20;
        const key = `${r},${g},${b}`;
        buckets.set(key, (buckets.get(key) || 0) + 1);
    }

    return [...buckets.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, count)
        .map(([key]) => {
            const [r, g, b] = key.split(',').map(Number);
            return { r, g, b };
        });
}

function getImagePoint(img, wrap, clientX, clientY) {
    const rect = img.getBoundingClientRect();
    if (
        clientX < rect.left || clientX > rect.right ||
        clientY < rect.top || clientY > rect.bottom
    ) {
        return null;
    }

    const wrapRect = wrap.getBoundingClientRect();
    const x = Math.floor(((clientX - rect.left) / rect.width) * img.naturalWidth);
    const y = Math.floor(((clientY - rect.top) / rect.height) * img.naturalHeight);

    return {
        x: Math.max(0, Math.min(img.naturalWidth - 1, x)),
        y: Math.max(0, Math.min(img.naturalHeight - 1, y)),
        displayX: clientX - wrapRect.left,
        displayY: clientY - wrapRect.top
    };
}

function readPixelFromCanvas(canvas, x, y) {
    const pixel = canvas.getContext('2d', { willReadFrequently: true })
        .getImageData(x, y, 1, 1).data;
    return { r: pixel[0], g: pixel[1], b: pixel[2], a: pixel[3] };
}

function updateUploadActions() {
    const hasFiles = selectedFiles.length > 0;
    dropZone.classList.toggle('has-images', hasFiles);
    mainContent.classList.toggle('has-images', hasFiles);
    colorWorkspace.classList.toggle('hidden', !hasFiles);
    fullscreenBtn.disabled = !hasFiles || activeIndex < 0;
    removeActiveBtn.disabled = activeIndex < 0;
}

function saveSettings() {
    localStorage.setItem(COLORS_STORAGE_KEY, JSON.stringify({
        paletteCount: paletteCount.value,
        colorFormat: colorFormat.value
    }));
}

function loadSettings() {
    try {
        const saved = JSON.parse(localStorage.getItem(COLORS_STORAGE_KEY));
        if (!saved) return;
        if (saved.paletteCount && paletteCount.hasOption(saved.paletteCount)) {
            paletteCount.value = saved.paletteCount;
        }
        if (saved.colorFormat && colorFormat.hasOption(saved.colorFormat)) {
            colorFormat.value = saved.colorFormat;
        }
    } catch (_) {}
}

function updatePickedDisplay(index = activeIndex) {
    const color = index >= 0 ? pickedColors[index] : null;
    const cssColor = color ? `rgb(${color.r}, ${color.g}, ${color.b})` : 'transparent';
    pickedSwatch.style.background = cssColor;
    pickedValue.textContent = color ? formatColor(color) : 'Click the image to pick a color';
    copyColorBtn.disabled = !color;

    if (fullscreenOpen) {
        fullscreenSwatch.style.background = cssColor;
        fullscreenColorValue.textContent = color ? formatColor(color) : '—';
    }
}

function renderSidebar() {
    const palette = activeIndex >= 0 ? palettes[activeIndex] : [];
    updatePickedDisplay();

    if (!palette || palette.length === 0) {
        paletteGrid.innerHTML = '<div class="palette-empty">Upload an image to extract its palette</div>';
        return;
    }

    const activeColor = activeIndex >= 0 ? pickedColors[activeIndex] : null;
    paletteGrid.innerHTML = palette.map(color => {
        const isActive = activeColor && colorKey(activeColor) === colorKey(color);
        return `
            <button
                type="button"
                class="palette-swatch${isActive ? ' active' : ''}"
                style="background: rgb(${color.r}, ${color.g}, ${color.b})"
                title="${formatColor(color)}"
                data-r="${color.r}"
                data-g="${color.g}"
                data-b="${color.b}"
            ></button>
        `;
    }).join('');
}

function placeMarker(marker, point) {
    if (!marker || !point) return;
    marker.classList.remove('hidden');
    marker.style.left = `${point.displayX}px`;
    marker.style.top = `${point.displayY}px`;
}

function pickColor(index, color, markerPos, markerEl) {
    pickedColors[index] = color;
    if (markerEl && markerPos) placeMarker(markerEl, markerPos);
    if (index === activeIndex) {
        updatePickedDisplay();
        renderSidebar();
    }
}

function renderThumbnails() {
    colorThumbnails.innerHTML = selectedFiles.map((file, index) => `
        <button type="button" class="color-thumb${index === activeIndex ? ' active' : ''}" data-index="${index}" title="${file.name}">
            <img src="${previewUrls[index]}" alt="">
            <div class="color-thumb-meta">${file.name}</div>
        </button>
    `).join('');
}

function renderActiveStage() {
    if (activeIndex < 0 || !previewUrls[activeIndex]) {
        stageImage.removeAttribute('src');
        activeImageTitle.textContent = 'Select an image';
        fullscreenBtn.disabled = true;
        removeActiveBtn.disabled = true;
        return;
    }

    const file = selectedFiles[activeIndex];
    stageImage.src = previewUrls[activeIndex];
    activeImageTitle.textContent = file.name;
    fullscreenBtn.disabled = false;

    if (fullscreenOpen) {
        fullscreenImage.src = previewUrls[activeIndex];
        fullscreenTitle.textContent = file.name;
    }

    renderThumbnails();
}

function setActiveIndex(index) {
    activeIndex = index;
    renderActiveStage();
    renderSidebar();
}

function hideMagnifier() {
    colorMagnifier.classList.add('hidden');
    activePickerTarget = null;
}

function positionMagnifier(clientX, clientY) {
    const offset = 24;
    const size = colorMagnifier.offsetWidth || MAG_SIZE;
    let left = clientX + offset;
    let top = clientY + offset;

    if (left + size > window.innerWidth - 8) left = clientX - size - offset;
    if (top + size > window.innerHeight - 8) top = clientY - size - offset;

    colorMagnifier.style.left = `${Math.max(8, left)}px`;
    colorMagnifier.style.top = `${Math.max(8, top)}px`;
}

function updateMagnifier(clientX, clientY, target) {
    const { img, wrap, index } = target;
    if (!img?.complete || !sourceCanvases[index]) {
        hideMagnifier();
        return;
    }

    const point = getImagePoint(img, wrap, clientX, clientY);
    if (!point) {
        hideMagnifier();
        return;
    }

    const source = sourceCanvases[index];
    const ctx = magnifierCanvas.getContext('2d');
    const half = MAG_SOURCE_PX / 2;
    const sx = Math.max(0, Math.min(source.width - MAG_SOURCE_PX, point.x - half));
    const sy = Math.max(0, Math.min(source.height - MAG_SOURCE_PX, point.y - half));

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, MAG_SIZE, MAG_SIZE);
    ctx.drawImage(source, sx, sy, MAG_SOURCE_PX, MAG_SOURCE_PX, 0, 0, MAG_SIZE, MAG_SIZE);

    activePickerTarget = { ...target, lastPoint: point };
    colorMagnifier.classList.remove('hidden');
    positionMagnifier(clientX, clientY);
}

function onPickerMove(event, target) {
    updateMagnifier(event.clientX, event.clientY, target);
}

function onPickerClick(event, target) {
    const { img, wrap, index, marker } = target;
    if (!img?.complete || !sourceCanvases[index]) return;

    const point = getImagePoint(img, wrap, event.clientX, event.clientY);
    if (!point) return;

    const color = readPixelFromCanvas(sourceCanvases[index], point.x, point.y);
    if (color.a < 10) return;

    if (index !== activeIndex) setActiveIndex(index);
    pickColor(index, color, point, marker);
}

function openFullscreen() {
    if (activeIndex < 0) return;
    fullscreenOpen = true;
    fullscreenImage.src = previewUrls[activeIndex];
    fullscreenTitle.textContent = selectedFiles[activeIndex].name;
    colorFullscreen.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    updatePickedDisplay();
}

function closeFullscreen() {
    fullscreenOpen = false;
    colorFullscreen.classList.add('hidden');
    document.body.style.overflow = '';
    hideMagnifier();
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
        naturalSizes.push({ width: 0, height: 0 });
        palettes.push([]);
        pickedColors.push(null);
        sourceCanvases.push(null);
        loadPreview(file, index);
    });

    updateUploadActions();
}

function loadPreview(file, index) {
    const reader = new FileReader();
    reader.onload = (e) => {
        previewUrls[index] = e.target.result;

        const img = new Image();
        img.onload = () => {
            naturalSizes[index] = { width: img.width, height: img.height };
            cacheImageCanvas(index, img);
            palettes[index] = extractPaletteFromCanvas(sourceCanvases[index], parseInt(paletteCount.value, 10));
            if (activeIndex < 0) setActiveIndex(index);
            else renderThumbnails();
            if (index === activeIndex) renderActiveStage();
            renderSidebar();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function refreshPalettes() {
    const count = parseInt(paletteCount.value, 10);
    selectedFiles.forEach((_, index) => {
        if (!sourceCanvases[index]) return;
        palettes[index] = extractPaletteFromCanvas(sourceCanvases[index], count);
    });
    renderSidebar();
}

function removeFile(index) {
    selectedFiles.splice(index, 1);
    previewUrls.splice(index, 1);
    naturalSizes.splice(index, 1);
    palettes.splice(index, 1);
    pickedColors.splice(index, 1);
    sourceCanvases.splice(index, 1);

    if (fullscreenOpen && activeIndex === index) closeFullscreen();

    if (activeIndex === index) {
        activeIndex = selectedFiles.length > 0 ? Math.min(index, selectedFiles.length - 1) : -1;
    } else if (activeIndex > index) {
        activeIndex -= 1;
    }

    renderThumbnails();
    renderActiveStage();
    updateUploadActions();
    renderSidebar();
}

async function copyText(text) {
    try {
        await navigator.clipboard.writeText(text);
    } catch (_) {
        const input = document.createElement('textarea');
        input.value = text;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
    }
}

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

paletteCountRoot.addEventListener('change', () => {
    saveSettings();
    refreshPalettes();
});

colorFormatRoot.addEventListener('change', () => {
    saveSettings();
    updatePickedDisplay();
    renderSidebar();
});

paletteGrid.addEventListener('click', (e) => {
    const swatch = e.target.closest('.palette-swatch');
    if (!swatch || activeIndex < 0) return;
    const color = {
        r: parseInt(swatch.dataset.r, 10),
        g: parseInt(swatch.dataset.g, 10),
        b: parseInt(swatch.dataset.b, 10)
    };
    pickColor(activeIndex, color);
});

colorThumbnails.addEventListener('click', (e) => {
    const thumb = e.target.closest('.color-thumb');
    if (!thumb) return;
    setActiveIndex(parseInt(thumb.dataset.index, 10));
});

fullscreenBtn.addEventListener('click', openFullscreen);
removeActiveBtn.addEventListener('click', () => {
    if (activeIndex >= 0) removeFile(activeIndex);
});
fullscreenCloseBtn.addEventListener('click', closeFullscreen);
colorFullscreenBackdrop.addEventListener('click', closeFullscreen);

colorStage.addEventListener('pointermove', (e) => {
    if (activeIndex < 0) return;
    onPickerMove(e, { img: stageImage, wrap: colorStage, marker: stageMarker, index: activeIndex });
});

colorStage.addEventListener('pointerleave', hideMagnifier);

colorStage.addEventListener('pointerdown', (e) => {
    if (activeIndex < 0) return;
    e.preventDefault();
    onPickerClick(e, { img: stageImage, wrap: colorStage, marker: stageMarker, index: activeIndex });
});

fullscreenStage.addEventListener('pointermove', (e) => {
    if (!fullscreenOpen || activeIndex < 0) return;
    onPickerMove(e, { img: fullscreenImage, wrap: fullscreenStage, marker: fullscreenMarker, index: activeIndex });
});

fullscreenStage.addEventListener('pointerleave', hideMagnifier);

fullscreenStage.addEventListener('pointerdown', (e) => {
    if (!fullscreenOpen || activeIndex < 0) return;
    e.preventDefault();
    onPickerClick(e, { img: fullscreenImage, wrap: fullscreenStage, marker: fullscreenMarker, index: activeIndex });
});

copyColorBtn.addEventListener('click', async () => {
    const color = activeIndex >= 0 ? pickedColors[activeIndex] : null;
    if (!color) return;
    await copyText(formatColor(color));
    const label = copyColorBtn.querySelector('span') || copyColorBtn;
    const original = label.textContent;
    label.textContent = 'Copied!';
    setTimeout(() => { label.textContent = original; }, 1200);
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && fullscreenOpen) closeFullscreen();
});

loadSettings();
updateUploadActions();
renderSidebar();
