const CORNERS_STORAGE_KEY = 'imageCornersSettings';

// UI Element references
const radiusSliderRoot = document.getElementById('radiusSlider');
const radiusInput = document.getElementById('radiusInput');
const presetBtns = document.querySelectorAll('.preset-btn');
const cornerToggleBtns = document.querySelectorAll('.corner-toggle-btn');
const toggleAllCornersBtn = document.getElementById('toggleAllCornersBtn');

const borderWidthSliderRoot = document.getElementById('borderWidthSlider');
const borderWidthInput = document.getElementById('borderWidthInput');
const borderStyleRoot = document.getElementById('borderStyle');

const borderColorPicker = document.getElementById('borderColorPicker');
const borderColorHex = document.getElementById('borderColorHex');
const borderColorSwatches = document.querySelectorAll('#borderColorSwatches .swatch-btn');

const borderPosOutsideBtn = document.getElementById('borderPosOutsideBtn');
const borderPosInsideBtn = document.getElementById('borderPosInsideBtn');

const bgTransparentBtn = document.getElementById('bgTransparentBtn');
const bgColorBtn = document.getElementById('bgColorBtn');
const bgColorPickerSection = document.getElementById('bgColorPickerSection');
const bgColorPicker = document.getElementById('bgColorPicker');
const bgColorHex = document.getElementById('bgColorHex');
const bgColorSwatches = document.querySelectorAll('#bgColorSwatches .swatch-btn');

const exportFormatRoot = document.getElementById('exportFormat');
const targetSizeInput = document.getElementById('targetSize');
const dropZone = document.getElementById('dropZone');
const addImagesBtn = document.getElementById('addImagesBtn');
const fileInput = document.getElementById('fileInput');
const preview = document.getElementById('preview');
const progress = document.getElementById('progress');
const exportOnlyBtn = document.getElementById('exportOnlyBtn');
const exportBtn = document.getElementById('exportBtn');
const downloadBtn = document.getElementById('downloadBtn');
const mainContent = document.querySelector('.tool-main-content');

const BORDER_STYLE_OPTIONS = [
    { value: 'solid', label: 'Solid' },
    { value: 'dashed', label: 'Dashed' },
    { value: 'dotted', label: 'Dotted' },
    { value: 'double', label: 'Double' }
];

const CORNERS_FORMAT_OPTIONS = [
    { value: 'original', label: 'Same as Original' },
    ...FORMAT_OPTIONS
];

// Initialize Custom Selects & Sliders
const exportFormat = initCustomSelect(exportFormatRoot, CORNERS_FORMAT_OPTIONS, 'original');
const borderStyle = initCustomSelect(borderStyleRoot, BORDER_STYLE_OPTIONS, 'solid');

const radiusSlider = initCustomSlider(radiusSliderRoot, { min: 0, max: 200, value: 32, step: 1 });
const borderWidthSlider = initCustomSlider(borderWidthSliderRoot, { min: 0, max: 100, value: 0, step: 1 });

// Settings State
let isFullRadius = false;
let activeCorners = { tl: true, tr: true, br: true, bl: true };
let borderPosition = 'outside'; // 'outside' | 'inside'
let bgMode = 'transparent'; // 'transparent' | 'color'

let selectedFiles = [];
let naturalSizes = [];
let previewUrls = [];
let pendingDownloads = [];

function isSupportedFormat(mimeType) {
    return FORMAT_OPTIONS.some(option => option.value === mimeType);
}

function getOutputMimeType(file) {
    if (exportFormat.value === 'original') {
        return isSupportedFormat(file.type) ? file.type : 'image/png';
    }
    return exportFormat.value;
}

function getOutputFileName(file) {
    const mimeType = getOutputMimeType(file);
    const extension = mimeType.split('/')[1];
    const baseName = file.name.includes('.')
        ? file.name.substring(0, file.name.lastIndexOf('.'))
        : file.name;
    return `${baseName}-corners.${extension}`;
}

function updateUploadActions() {
    const hasFiles = selectedFiles.length > 0;
    exportOnlyBtn.disabled = !hasFiles;
    exportBtn.disabled = !hasFiles;
    dropZone.classList.toggle('has-images', hasFiles);
    mainContent.classList.toggle('has-images', hasFiles);
}

function resetPendingDownload() {
    pendingDownloads = [];
    downloadBtn.classList.add('hidden');
}

function saveSettings() {
    localStorage.setItem(CORNERS_STORAGE_KEY, JSON.stringify({
        radius: isFullRadius ? 'full' : radiusSlider.value,
        activeCorners,
        borderWidth: borderWidthSlider.value,
        borderStyle: borderStyle.value,
        borderColor: borderColorHex.value,
        borderPosition,
        bgMode,
        bgColor: bgColorHex.value,
        format: exportFormat.value,
        targetSize: targetSizeInput.value
    }));
}

function loadSettings() {
    try {
        const saved = JSON.parse(localStorage.getItem(CORNERS_STORAGE_KEY));
        if (!saved) return;

        if (saved.radius === 'full') {
            setPresetRadius('full');
        } else if (typeof saved.radius !== 'undefined') {
            setRadiusValue(parseInt(saved.radius, 10));
        }

        if (saved.activeCorners) {
            activeCorners = saved.activeCorners;
            updateCornerToggleUI();
        }

        if (typeof saved.borderWidth !== 'undefined') {
            setBorderWidthValue(parseInt(saved.borderWidth, 10));
        }

        if (saved.borderStyle && borderStyle.hasOption(saved.borderStyle)) {
            borderStyle.value = saved.borderStyle;
        }

        if (saved.borderColor) {
            updateBorderColor(saved.borderColor);
        }

        if (saved.borderPosition) {
            setBorderPosition(saved.borderPosition);
        }

        if (saved.bgMode) {
            setBgMode(saved.bgMode);
        }

        if (saved.bgColor) {
            updateBgColor(saved.bgColor);
        }

        if (saved.format && exportFormat.hasOption(saved.format)) {
            exportFormat.value = saved.format;
        }

        if (saved.targetSize) {
            targetSizeInput.value = saved.targetSize;
        }
    } catch (_) {}
}

// Corner Radius Logic
function setRadiusValue(val, updatePresetUI = true) {
    isFullRadius = false;
    val = Math.max(0, Math.min(200, val));
    radiusSlider.value = val;
    radiusInput.value = val;

    if (updatePresetUI) {
        presetBtns.forEach(btn => {
            const p = btn.dataset.preset;
            const active = (p !== 'full' && parseInt(p, 10) === val);
            btn.classList.toggle('active', active);
        });
    }

    saveSettings();
    refreshAllPreviews();
}

function setPresetRadius(preset) {
    if (preset === 'full') {
        isFullRadius = true;
        presetBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.preset === 'full'));
        radiusInput.value = '50%';
        saveSettings();
        refreshAllPreviews();
    } else {
        setRadiusValue(parseInt(preset, 10), true);
    }
}

function updateCornerToggleUI() {
    cornerToggleBtns.forEach(btn => {
        const corner = btn.dataset.corner;
        btn.classList.toggle('active', !!activeCorners[corner]);
    });
    const allActive = Object.values(activeCorners).every(Boolean);
    toggleAllCornersBtn.textContent = allActive ? 'Deselect All' : 'Select All';
}

function toggleCorner(corner) {
    activeCorners[corner] = !activeCorners[corner];
    updateCornerToggleUI();
    saveSettings();
    refreshAllPreviews();
}

function toggleAllCorners() {
    const allActive = Object.values(activeCorners).every(Boolean);
    activeCorners = { tl: !allActive, tr: !allActive, br: !allActive, bl: !allActive };
    updateCornerToggleUI();
    saveSettings();
    refreshAllPreviews();
}

// Border Logic
function setBorderWidthValue(val) {
    val = Math.max(0, Math.min(100, val));
    borderWidthSlider.value = val;
    borderWidthInput.value = val;
    saveSettings();
    refreshAllPreviews();
}

function setBorderPosition(pos) {
    borderPosition = pos;
    borderPosOutsideBtn.classList.toggle('active', pos === 'outside');
    borderPosInsideBtn.classList.toggle('active', pos === 'inside');
    borderPosOutsideBtn.setAttribute('aria-pressed', String(pos === 'outside'));
    borderPosInsideBtn.setAttribute('aria-pressed', String(pos === 'inside'));
    saveSettings();
    refreshAllPreviews();
}

function updateBorderColor(colorHex) {
    if (!colorHex.startsWith('#')) colorHex = '#' + colorHex;
    if (colorHex.length === 7) {
        borderColorPicker.value = colorHex;
        borderColorHex.value = colorHex.toUpperCase();

        borderColorSwatches.forEach(swatch => {
            swatch.classList.toggle('active', swatch.dataset.color.toLowerCase() === colorHex.toLowerCase());
        });

        saveSettings();
        refreshAllPreviews();
    }
}

// Background Color Logic
function setBgMode(mode) {
    bgMode = mode;
    bgTransparentBtn.classList.toggle('active', mode === 'transparent');
    bgColorBtn.classList.toggle('active', mode === 'color');
    bgTransparentBtn.setAttribute('aria-pressed', String(mode === 'transparent'));
    bgColorBtn.setAttribute('aria-pressed', String(mode === 'color'));

    bgColorPickerSection.classList.toggle('hidden', mode !== 'color');
    saveSettings();
    refreshAllPreviews();
}

function updateBgColor(colorHex) {
    if (!colorHex.startsWith('#')) colorHex = '#' + colorHex;
    if (colorHex.length === 7) {
        bgColorPicker.value = colorHex;
        bgColorHex.value = colorHex.toUpperCase();

        bgColorSwatches.forEach(swatch => {
            swatch.classList.toggle('active', swatch.dataset.color.toLowerCase() === colorHex.toLowerCase());
        });

        saveSettings();
        refreshAllPreviews();
    }
}

// Event Listeners for Controls
radiusSliderRoot.addEventListener('input', () => setRadiusValue(radiusSlider.value));
radiusInput.addEventListener('input', () => {
    const val = parseInt(radiusInput.value, 10);
    if (!isNaN(val)) setRadiusValue(val);
});

presetBtns.forEach(btn => {
    btn.addEventListener('click', () => setPresetRadius(btn.dataset.preset));
});

cornerToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => toggleCorner(btn.dataset.corner));
});
toggleAllCornersBtn.addEventListener('click', toggleAllCorners);

borderWidthSliderRoot.addEventListener('input', () => setBorderWidthValue(borderWidthSlider.value));
borderWidthInput.addEventListener('input', () => {
    const val = parseInt(borderWidthInput.value, 10);
    if (!isNaN(val)) setBorderWidthValue(val);
});

borderStyleRoot.addEventListener('change', () => {
    saveSettings();
    refreshAllPreviews();
});

borderColorPicker.addEventListener('input', (e) => updateBorderColor(e.target.value));
borderColorHex.addEventListener('input', (e) => updateBorderColor(e.target.value));
borderColorSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => updateBorderColor(swatch.dataset.color));
});

borderPosOutsideBtn.addEventListener('click', () => setBorderPosition('outside'));
borderPosInsideBtn.addEventListener('click', () => setBorderPosition('inside'));

bgTransparentBtn.addEventListener('click', () => setBgMode('transparent'));
bgColorBtn.addEventListener('click', () => setBgMode('color'));
bgColorPicker.addEventListener('input', (e) => updateBgColor(e.target.value));
bgColorHex.addEventListener('input', (e) => updateBgColor(e.target.value));
bgColorSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => updateBgColor(swatch.dataset.color));
});

exportFormatRoot.addEventListener('change', () => {
    saveSettings();
    refreshAllPreviews();
});
targetSizeInput.addEventListener('input', saveSettings);

// File input & Drag & Drop
addImagesBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
    fileInput.value = '';
});

dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    handleFiles(e.dataTransfer.files);
});

function handleFiles(files) {
    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    const validFiles = fileList.filter(file => isSupportedFormat(file.type));
    const unsupportedCount = fileList.length - validFiles.length;

    if (unsupportedCount > 0) {
        alert('Please select only PNG, WebP, JPEG, or GIF files.');
    }

    if (validFiles.length === 0) return;

    validFiles.forEach(file => {
        const index = selectedFiles.length;
        selectedFiles.push(file);
        naturalSizes.push({ width: 0, height: 0 });
        previewUrls.push(null);
        loadPreview(file, index);
    });

    resetPendingDownload();
    updateUploadActions();
}

function loadPreview(file, index) {
    const reader = new FileReader();
    reader.onload = (e) => {
        previewUrls[index] = e.target.result;
        const img = new Image();
        img.onload = () => {
            naturalSizes[index] = { width: img.width, height: img.height };
            renderPreviewItem(index);
            updatePreviewCanvas(index);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Canvas Rounded Rect Drawing Path Helper
function createRoundedRectPath(ctx, x, y, width, height, radii) {
    const { tl, tr, br, bl } = radii;
    ctx.beginPath();
    ctx.moveTo(x + tl, y);
    ctx.lineTo(x + width - tr, y);
    ctx.arcTo(x + width, y, x + width, y + tr, tr);
    ctx.lineTo(x + width, y + height - br);
    ctx.arcTo(x + width, y + height, x + width - br, y + height, br);
    ctx.lineTo(x + bl, y + height);
    ctx.arcTo(x, y + height, x, y + height - bl, bl);
    ctx.lineTo(x, y + tl);
    ctx.arcTo(x, y, x + tl, y, tl);
    ctx.closePath();
}

function calculateRadii(imgWidth, imgHeight) {
    const maxPossibleRadius = Math.min(imgWidth, imgHeight) / 2;
    let baseRadius = isFullRadius ? maxPossibleRadius : radiusSlider.value;
    baseRadius = Math.min(baseRadius, maxPossibleRadius);

    return {
        tl: activeCorners.tl ? baseRadius : 0,
        tr: activeCorners.tr ? baseRadius : 0,
        br: activeCorners.br ? baseRadius : 0,
        bl: activeCorners.bl ? baseRadius : 0
    };
}

function renderCornerCanvas(img, file) {
    const bw = borderWidthSlider.value;
    const isOutside = borderPosition === 'outside';
    const mimeType = getOutputMimeType(file);

    let canvasW = img.width;
    let canvasH = img.height;

    if (bw > 0 && isOutside) {
        canvasW += bw * 2;
        canvasH += bw * 2;
    }

    const canvas = document.createElement('canvas');
    canvas.width = canvasW;
    canvas.height = canvasH;
    const ctx = canvas.getContext('2d');

    // Fill Background if solid mode OR JPEG format
    const needsSolidBg = bgMode === 'color' || mimeType === 'image/jpeg';
    if (needsSolidBg) {
        const fillColor = bgMode === 'color' ? bgColorHex.value : '#FFFFFF';
        ctx.fillStyle = fillColor;
        ctx.fillRect(0, 0, canvasW, canvasH);
    }

    const imgX = (bw > 0 && isOutside) ? bw : 0;
    const imgY = (bw > 0 && isOutside) ? bw : 0;
    const imgW = img.width;
    const imgH = img.height;

    const radii = calculateRadii(imgW, imgH);

    // Save state for clipping
    ctx.save();
    createRoundedRectPath(ctx, imgX, imgY, imgW, imgH, radii);
    ctx.clip();
    ctx.drawImage(img, imgX, imgY, imgW, imgH);
    ctx.restore();

    // Draw Border if border width > 0
    if (bw > 0) {
        ctx.save();
        ctx.strokeStyle = borderColorHex.value;
        ctx.lineWidth = bw;

        const styleVal = borderStyle.value;
        if (styleVal === 'dashed') {
            ctx.setLineDash([bw * 3, bw * 2]);
        } else if (styleVal === 'dotted') {
            ctx.setLineDash([bw, bw]);
        } else {
            ctx.setLineDash([]);
        }

        if (styleVal === 'double' && bw >= 3) {
            const outerBw = bw / 3;
            const strokeOffset1 = isOutside ? (bw - outerBw / 2) : outerBw / 2;
            createRoundedRectPath(ctx, strokeOffset1, strokeOffset1, canvasW - strokeOffset1 * 2, canvasH - strokeOffset1 * 2, radii);
            ctx.lineWidth = outerBw;
            ctx.stroke();

            const strokeOffset2 = isOutside ? (outerBw / 2) : (bw - outerBw / 2);
            createRoundedRectPath(ctx, strokeOffset2, strokeOffset2, canvasW - strokeOffset2 * 2, canvasH - strokeOffset2 * 2, radii);
            ctx.stroke();
        } else {
            const strokeOffset = isOutside ? (bw / 2) : (bw / 2);
            const borderX = isOutside ? bw / 2 : bw / 2;
            const borderY = isOutside ? bw / 2 : bw / 2;
            const borderW = isOutside ? canvasW - bw : imgW - bw;
            const borderH = isOutside ? canvasH - bw : imgH - bw;

            createRoundedRectPath(ctx, borderX, borderY, borderW, borderH, radii);
            ctx.stroke();
        }

        ctx.restore();
    }

    return canvas;
}

function getDimensionBadge(index) {
    const natural = naturalSizes[index];
    if (!natural?.width) return '';

    const file = selectedFiles[index];
    const bw = borderWidthSlider.value;
    const isOutside = borderPosition === 'outside';

    let outW = natural.width;
    let outH = natural.height;
    if (bw > 0 && isOutside) {
        outW += bw * 2;
        outH += bw * 2;
    }

    return `
        <div class="preview-dimensions" title="Output dimensions">
            ${formatDimensions(natural.width, natural.height)}
            <span class="arrow">→</span>
            ${formatDimensions(outW, outH)}
        </div>
    `;
}

function formatDimensions(width, height) {
    return `${width} × ${height}`;
}

function renderPreviewItem(index) {
    const file = selectedFiles[index];
    const url = previewUrls[index];
    if (!file || !url) return;

    let item = preview.querySelector(`.preview-item[data-index="${index}"]`);

    if (!item) {
        item = document.createElement('div');
        item.className = 'preview-item';
        item.dataset.index = index;
        preview.appendChild(item);
    }

    item.innerHTML = `
        <div class="preview-corners-wrap" id="previewWrap_${index}">
            <div class="spinner"></div>
        </div>
        <div class="preview-actions">
            <button class="btn btn-success btn-icon btn-sm" type="button" title="Export & download" onclick="exportSingle(${index})">
                ${icon('download', 14)}
            </button>
            <button class="btn btn-destructive btn-icon btn-sm" type="button" title="Remove" onclick="removeFile(${index})">
                ${icon('x', 14)}
            </button>
        </div>
        <div class="preview-meta">
            <div class="preview-name" title="${file.name}">${file.name}</div>
            <div class="preview-size">${formatFileSize(file.size)}</div>
            ${getDimensionBadge(index)}
        </div>
    `;
}

function updatePreviewCanvas(index) {
    const file = selectedFiles[index];
    const wrap = document.getElementById(`previewWrap_${index}`);
    if (!file || !wrap) return;

    const img = new Image();
    img.onload = () => {
        const canvas = renderCornerCanvas(img, file);
        canvas.style.maxWidth = '100%';
        canvas.style.maxHeight = '100%';
        wrap.innerHTML = '';
        wrap.appendChild(canvas);
        wrap.onclick = () => openGallery(index);
        refreshPreviewMeta(index);
    };
    img.src = previewUrls[index];
}

function refreshPreviewMeta(index) {
    const item = preview.querySelector(`.preview-item[data-index="${index}"]`);
    if (!item) return;

    const file = selectedFiles[index];
    const meta = item.querySelector('.preview-meta');
    if (meta) {
        meta.innerHTML = `
            <div class="preview-name" title="${file.name}">${file.name}</div>
            <div class="preview-size">${formatFileSize(file.size)}</div>
            ${getDimensionBadge(index)}
        `;
    }
}

function refreshAllPreviews() {
    selectedFiles.forEach((_, index) => updatePreviewCanvas(index));
}

function removeFile(index) {
    selectedFiles.splice(index, 1);
    naturalSizes.splice(index, 1);
    previewUrls.splice(index, 1);
    resetPendingDownload();
    rebuildPreview();
    updateUploadActions();
}

function rebuildPreview() {
    preview.innerHTML = '';
    selectedFiles.forEach((file, index) => {
        if (previewUrls[index]) {
            renderPreviewItem(index);
            updatePreviewCanvas(index);
        } else {
            loadPreview(file, index);
        }
    });
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
    a.download = 'corners-images.zip';
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
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadZip(zipBlob);
}

async function processImage(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onerror = () => reject(new Error('Failed to load image'));
        img.onload = async () => {
            const mimeType = getOutputMimeType(file);
            const maxBytes = parseInt(targetSizeInput.value, 10) * 1024;
            const canvas = renderCornerCanvas(img, file);

            let currentQuality = (mimeType === 'image/png' || mimeType === 'image/gif') ? 1 : 0.92;

            const renderBlob = () => new Promise(res => canvas.toBlob(res, mimeType, currentQuality));
            let blob = await renderBlob();

            if (Number.isFinite(maxBytes) && maxBytes > 0 && blob.size > maxBytes) {
                while (blob.size > maxBytes && currentQuality > 0.1) {
                    currentQuality -= 0.1;
                    blob = await renderBlob();
                }
            }

            URL.revokeObjectURL(img.src);
            resolve({ blob });
        };
        img.src = URL.createObjectURL(file);
    });
}

async function processAllFiles() {
    const downloads = [];
    for (let index = 0; index < selectedFiles.length; index++) {
        const file = selectedFiles[index];
        const { blob } = await processImage(file);
        downloads.push({ blob, fileName: getOutputFileName(file) });
    }
    return downloads;
}

async function exportSingle(index) {
    const file = selectedFiles[index];
    try {
        const { blob } = await processImage(file);
        downloadSingleFile(blob, getOutputFileName(file));
    } catch (error) {
        console.error('Export failed:', error);
        alert('Failed to export image.');
    }
}

exportOnlyBtn.addEventListener('click', async () => {
    if (selectedFiles.length === 0) return;
    progress.classList.add('active');
    exportOnlyBtn.disabled = true;
    exportBtn.disabled = true;

    try {
        pendingDownloads = await processAllFiles();
        downloadBtn.classList.remove('hidden');
    } catch (error) {
        console.error('Export failed:', error);
        alert('Export failed. Please check your image files.');
    } finally {
        progress.classList.remove('active');
        updateUploadActions();
    }
});

exportBtn.addEventListener('click', async () => {
    if (selectedFiles.length === 0) return;
    progress.classList.add('active');
    exportOnlyBtn.disabled = true;
    exportBtn.disabled = true;

    try {
        pendingDownloads = await processAllFiles();
        downloadBtn.classList.remove('hidden');
        await downloadProcessedFiles(pendingDownloads);
    } catch (error) {
        console.error('Export failed:', error);
        alert('Export failed. Please check your image files.');
    } finally {
        progress.classList.remove('active');
        updateUploadActions();
    }
});

downloadBtn.addEventListener('click', () => {
    if (pendingDownloads.length > 0) {
        downloadProcessedFiles(pendingDownloads);
    }
});

// Gallery Modal Lightbox
const galleryDialog = document.getElementById('galleryDialog');
const galleryBackdrop = document.getElementById('galleryBackdrop');
const galleryImage = document.getElementById('galleryImage');
const galleryImageWrap = document.getElementById('galleryImageWrap');
const galleryViewport = document.getElementById('galleryViewport');
const galleryCounter = document.getElementById('galleryCounter');
const galleryTitle = document.getElementById('galleryTitle');
const galleryPrevBtn = document.getElementById('galleryPrevBtn');
const galleryNextBtn = document.getElementById('galleryNextBtn');
const galleryCloseBtn = document.getElementById('galleryCloseBtn');
const galleryZoomInBtn = document.getElementById('galleryZoomInBtn');
const galleryZoomOutBtn = document.getElementById('galleryZoomOutBtn');
const galleryResetZoomBtn = document.getElementById('galleryResetZoomBtn');

let galleryIndex = 0;
let galleryScale = 1;
let galleryTranslateX = 0;
let galleryTranslateY = 0;
let galleryPanStart = null;
let gallerySwipeStart = null;

const GALLERY_MIN_SCALE = 1;
const GALLERY_MAX_SCALE = 5;
const GALLERY_SWIPE_THRESHOLD = 60;

function clampGalleryScale(value) {
    return Math.min(GALLERY_MAX_SCALE, Math.max(GALLERY_MIN_SCALE, value));
}

function resetGalleryTransform() {
    galleryScale = 1;
    galleryTranslateX = 0;
    galleryTranslateY = 0;
    applyGalleryTransform();
}

function applyGalleryTransform() {
    if (!galleryImageWrap || !galleryViewport) return;
    galleryImageWrap.style.transform = `translate(${galleryTranslateX}px, ${galleryTranslateY}px) scale(${galleryScale})`;
    galleryViewport.classList.toggle('can-pan', galleryScale > 1);
}

function setGalleryZoom(nextScale, focalX, focalY) {
    const prevScale = galleryScale;
    galleryScale = clampGalleryScale(nextScale);

    if (galleryScale === 1) {
        galleryTranslateX = 0;
        galleryTranslateY = 0;
    } else if (focalX != null && focalY != null && prevScale !== galleryScale) {
        const rect = galleryViewport.getBoundingClientRect();
        const originX = focalX - rect.left - rect.width / 2 - galleryTranslateX;
        const originY = focalY - rect.top - rect.height / 2 - galleryTranslateY;
        const ratio = galleryScale / prevScale;
        galleryTranslateX -= originX * (ratio - 1);
        galleryTranslateY -= originY * (ratio - 1);
    }

    applyGalleryTransform();
}

function updateGalleryUI() {
    const file = selectedFiles[galleryIndex];
    if (!file || !previewUrls[galleryIndex]) return;

    const img = new Image();
    img.onload = () => {
        const canvas = renderCornerCanvas(img, file);
        galleryImage.src = canvas.toDataURL();
        galleryImage.alt = file.name;
    };
    img.src = previewUrls[galleryIndex];

    galleryTitle.textContent = file.name;
    galleryCounter.textContent = `${galleryIndex + 1} / ${selectedFiles.length}`;
    galleryPrevBtn.disabled = galleryIndex === 0;
    galleryNextBtn.disabled = galleryIndex === selectedFiles.length - 1;
}

function openGallery(index) {
    if (!previewUrls[index]) return;
    galleryIndex = index;
    resetGalleryTransform();
    updateGalleryUI();
    galleryDialog.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    galleryCloseBtn.focus();
}

function closeGallery() {
    galleryDialog.classList.add('hidden');
    document.body.style.overflow = '';
    galleryImage.src = '';
    resetGalleryTransform();
}

function showGalleryImage(index) {
    if (index < 0 || index >= selectedFiles.length || !previewUrls[index]) return;
    galleryIndex = index;
    resetGalleryTransform();
    updateGalleryUI();
}

if (galleryDialog) {
    galleryCloseBtn.addEventListener('click', closeGallery);
    galleryBackdrop.addEventListener('click', closeGallery);
    galleryPrevBtn.addEventListener('click', () => showGalleryImage(galleryIndex - 1));
    galleryNextBtn.addEventListener('click', () => showGalleryImage(galleryIndex + 1));

    galleryZoomInBtn.addEventListener('click', () => {
        const rect = galleryViewport.getBoundingClientRect();
        setGalleryZoom(galleryScale + 0.5, rect.left + rect.width / 2, rect.top + rect.height / 2);
    });
    galleryZoomOutBtn.addEventListener('click', () => {
        const rect = galleryViewport.getBoundingClientRect();
        setGalleryZoom(galleryScale - 0.5, rect.left + rect.width / 2, rect.top + rect.height / 2);
    });
    galleryResetZoomBtn.addEventListener('click', resetGalleryTransform);

    galleryImageWrap.addEventListener('dblclick', (e) => {
        if (galleryScale > 1) {
            resetGalleryTransform();
        } else {
            setGalleryZoom(2.5, e.clientX, e.clientY);
        }
    });

    galleryViewport.addEventListener('wheel', (e) => {
        if (galleryDialog.classList.contains('hidden')) return;
        e.preventDefault();
        setGalleryZoom(galleryScale + (e.deltaY < 0 ? 0.15 : -0.15), e.clientX, e.clientY);
    }, { passive: false });

    galleryViewport.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        galleryImageWrap.classList.add('no-transition');

        if (galleryScale > 1) {
            galleryPanStart = {
                pointerId: e.pointerId,
                x: e.clientX,
                y: e.clientY,
                translateX: galleryTranslateX,
                translateY: galleryTranslateY
            };
            galleryViewport.classList.add('is-dragging');
            galleryViewport.setPointerCapture(e.pointerId);
        } else {
            gallerySwipeStart = {
                pointerId: e.pointerId,
                x: e.clientX,
                y: e.clientY
            };
            galleryViewport.setPointerCapture(e.pointerId);
        }
    });

    galleryViewport.addEventListener('pointermove', (e) => {
        if (galleryPanStart?.pointerId === e.pointerId) {
            galleryTranslateX = galleryPanStart.translateX + (e.clientX - galleryPanStart.x);
            galleryTranslateY = galleryPanStart.translateY + (e.clientY - galleryPanStart.y);
            applyGalleryTransform();
        }
    });

    galleryViewport.addEventListener('pointerup', (e) => {
        galleryImageWrap.classList.remove('no-transition');
        galleryViewport.classList.remove('is-dragging');

        if (gallerySwipeStart?.pointerId === e.pointerId && galleryScale === 1) {
            const deltaX = e.clientX - gallerySwipeStart.x;
            const deltaY = e.clientY - gallerySwipeStart.y;
            if (Math.abs(deltaX) > GALLERY_SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY)) {
                showGalleryImage(galleryIndex + (deltaX < 0 ? 1 : -1));
            }
        }

        galleryPanStart = null;
        gallerySwipeStart = null;

        if (galleryViewport.hasPointerCapture(e.pointerId)) {
            galleryViewport.releasePointerCapture(e.pointerId);
        }
    });

    document.addEventListener('keydown', (e) => {
        if (galleryDialog.classList.contains('hidden')) return;
        if (e.key === 'Escape') closeGallery();
        else if (e.key === 'ArrowLeft') showGalleryImage(galleryIndex - 1);
        else if (e.key === 'ArrowRight') showGalleryImage(galleryIndex + 1);
    });
}

loadSettings();
updateCornerToggleUI();
updateUploadActions();
