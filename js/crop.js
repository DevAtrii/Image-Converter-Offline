const CROP_STORAGE_KEY = 'imageCropSettings';

const ASPECT_OPTIONS = [
    { value: 'free', label: 'Free', iconClass: 'aspect-icon-free' },
    { value: '1:1', label: '1:1 Square', iconClass: 'aspect-icon-1-1' },
    { value: '4:3', label: '4:3', iconClass: 'aspect-icon-4-3' },
    { value: '16:9', label: '16:9', iconClass: 'aspect-icon-16-9' },
    { value: '3:2', label: '3:2', iconClass: 'aspect-icon-3-2' },
    { value: '9:16', label: '9:16 Portrait', iconClass: 'aspect-icon-9-16' }
];

const aspectGrid = document.getElementById('aspectGrid');
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

const cropDialog = document.getElementById('cropDialog');
const cropBackdrop = document.getElementById('cropBackdrop');
const cropCloseBtn = document.getElementById('cropCloseBtn');
const cropTitle = document.getElementById('cropTitle');
const cropStage = document.getElementById('cropStage');
const cropImage = document.getElementById('cropImage');
const cropBox = document.getElementById('cropBox');
const cropSizeLabel = document.getElementById('cropSizeLabel');
const cropResetBtn = document.getElementById('cropResetBtn');
const cropApplyBtn = document.getElementById('cropApplyBtn');

const CROP_FORMAT_OPTIONS = [
    { value: 'original', label: 'Same as Original' },
    ...FORMAT_OPTIONS
];

const exportFormat = initCustomSelect(exportFormatRoot, CROP_FORMAT_OPTIONS, 'original');

let aspectRatio = 'free';
let selectedFiles = [];
let imageStates = [];
let naturalSizes = [];
let previewUrls = [];
let pendingDownloads = [];

let activeCropIndex = -1;
let imageDisplayRect = { left: 0, top: 0, width: 0, height: 0 };
let displayScale = 1;
let dialogCrop = null;
let cropDrag = null;

function isSupportedFormat(mimeType) {
    return FORMAT_OPTIONS.some(option => option.value === mimeType);
}

function parseAspectRatio(value) {
    if (value === 'free') return null;
    const [w, h] = value.split(':').map(Number);
    return w / h;
}

function getCenteredCrop(naturalWidth, naturalHeight, ratioValue = aspectRatio) {
    const ratio = parseAspectRatio(ratioValue);
    if (!ratio) {
        return { x: 0, y: 0, width: naturalWidth, height: naturalHeight };
    }

    let cropW;
    let cropH;
    if (naturalWidth / naturalHeight > ratio) {
        cropH = naturalHeight;
        cropW = cropH * ratio;
    } else {
        cropW = naturalWidth;
        cropH = cropW / ratio;
    }

    return {
        x: (naturalWidth - cropW) / 2,
        y: (naturalHeight - cropH) / 2,
        width: cropW,
        height: cropH
    };
}

function clampCrop(rect, naturalWidth, naturalHeight, ratioValue = aspectRatio) {
    const ratio = parseAspectRatio(ratioValue);
    let { x, y, width, height } = rect;
    const minSize = 16;

    width = Math.max(minSize, Math.min(width, naturalWidth));
    height = Math.max(minSize, Math.min(height, naturalHeight));

    if (ratio) {
        if (width / height > ratio) {
            width = height * ratio;
        } else {
            height = width / ratio;
        }
        width = Math.min(width, naturalWidth);
        height = Math.min(height, naturalHeight);
    }

    x = Math.min(Math.max(0, x), naturalWidth - width);
    y = Math.min(Math.max(0, y), naturalHeight - height);

    return { x, y, width, height };
}

function formatDimensions(width, height) {
    return `${Math.round(width)} × ${Math.round(height)}`;
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
    return `${baseName}.${extension}`;
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
    localStorage.setItem(CROP_STORAGE_KEY, JSON.stringify({
        aspectRatio,
        format: exportFormat.value,
        targetSize: targetSizeInput.value
    }));
}

function loadSettings() {
    try {
        const saved = JSON.parse(localStorage.getItem(CROP_STORAGE_KEY));
        if (!saved) return;
        if (saved.aspectRatio) setAspectRatio(saved.aspectRatio, false);
        if (saved.format && exportFormat.hasOption(saved.format)) {
            exportFormat.value = saved.format;
        }
        if (saved.targetSize) targetSizeInput.value = saved.targetSize;
    } catch (_) {}
}

function renderAspectButtons() {
    aspectGrid.innerHTML = ASPECT_OPTIONS.map(option => `
        <button
            type="button"
            class="aspect-btn${option.value === aspectRatio ? ' active' : ''}"
            data-aspect="${option.value}"
            aria-pressed="${option.value === aspectRatio}"
        >
            <span class="aspect-icon ${option.iconClass}" aria-hidden="true"></span>
            <span class="aspect-label">${option.label}</span>
        </button>
    `).join('');
}

function setAspectRatio(value, applyToAll = true) {
    aspectRatio = value;
    renderAspectButtons();

    if (applyToAll) {
        selectedFiles.forEach((_, index) => {
            const natural = naturalSizes[index];
            if (!natural?.width) return;
            imageStates[index].crop = getCenteredCrop(natural.width, natural.height);
            refreshPreviewMeta(index);
            updatePreviewCrop(index);
        });
    }

    saveSettings();
}

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
        imageStates.push({ crop: null });
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
            imageStates[index].crop = getCenteredCrop(img.width, img.height);
            renderPreviewItem(index);
            schedulePreviewCrop(index);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function schedulePreviewCrop(index) {
    requestAnimationFrame(() => {
        updatePreviewCrop(index);
        requestAnimationFrame(() => updatePreviewCrop(index));
    });
}

function refreshAllPreviewCrops() {
    selectedFiles.forEach((_, index) => updatePreviewCrop(index));
}

function getCropPreviewStyles(natural, crop, containerSize) {
    const size = containerSize || 1;
    const scale = Math.max(size / crop.width, size / crop.height);

    return {
        width: `${natural.width * scale}px`,
        height: `${natural.height * scale}px`,
        left: `${-crop.x * scale + (size - crop.width * scale) / 2}px`,
        top: `${-crop.y * scale + (size - crop.height * scale) / 2}px`
    };
}

function applyCropPreviewStyles(img, styles) {
    img.style.width = styles.width;
    img.style.height = styles.height;
    img.style.left = styles.left;
    img.style.top = styles.top;
    img.style.transform = '';
}

function updatePreviewCrop(index) {
    const item = preview.querySelector(`.preview-item[data-index="${index}"]`);
    if (!item) return;

    const natural = naturalSizes[index];
    const crop = imageStates[index]?.crop;
    const wrap = item.querySelector('.crop-preview-wrap');
    const img = wrap?.querySelector('img');
    if (!natural?.width || !crop || !wrap || !img) return;

    const containerSize = wrap.clientWidth || wrap.getBoundingClientRect().width;
    if (!containerSize) return;

    applyCropPreviewStyles(img, getCropPreviewStyles(natural, crop, containerSize));
}

function getDimensionBadge(index) {
    const natural = naturalSizes[index];
    const crop = imageStates[index]?.crop;
    if (!natural?.width || !crop) return '';

    return `
        <div class="preview-dimensions" title="Crop output size">
            ${formatDimensions(natural.width, natural.height)}
            <span class="arrow">→</span>
            ${formatDimensions(crop.width, crop.height)}
        </div>
    `;
}

function renderPreviewItem(index) {
    const file = selectedFiles[index];
    const url = previewUrls[index];
    const crop = imageStates[index]?.crop;
    const natural = naturalSizes[index];
    if (!file || !url || !crop || !natural?.width) return;

    let item = preview.querySelector(`.preview-item[data-index="${index}"]`);
    if (!item) {
        item = document.createElement('div');
        item.className = 'preview-item';
        item.dataset.index = index;
        preview.appendChild(item);
    }

    item.innerHTML = `
        <div class="crop-preview-wrap">
            <img src="${url}" alt="${file.name}">
        </div>
        <div class="preview-actions">
            <button class="btn btn-outline btn-icon btn-sm" type="button" title="Edit crop" onclick="editCrop(${index})">
                ${icon('crop', 14)}
            </button>
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

function refreshPreviewMeta(index) {
    const item = preview.querySelector(`.preview-item[data-index="${index}"]`);
    if (!item) return;

    const file = selectedFiles[index];
    const meta = item.querySelector('.preview-meta');
    meta.innerHTML = `
        <div class="preview-name" title="${file.name}">${file.name}</div>
        <div class="preview-size">${formatFileSize(file.size)}</div>
        ${getDimensionBadge(index)}
    `;
}

function removeFile(index) {
    selectedFiles.splice(index, 1);
    imageStates.splice(index, 1);
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
        } else {
            loadPreview(file, index);
        }
    });
}

function updateImageDisplayRect() {
    const stageRect = cropStage.getBoundingClientRect();
    const imgRect = cropImage.getBoundingClientRect();
    imageDisplayRect = {
        left: imgRect.left - stageRect.left,
        top: imgRect.top - stageRect.top,
        width: imgRect.width,
        height: imgRect.height
    };
    displayScale = cropImage.naturalWidth / imgRect.width;
}

function displayRectToCrop(displayRect) {
    return clampCrop({
        x: (displayRect.left - imageDisplayRect.left) * displayScale,
        y: (displayRect.top - imageDisplayRect.top) * displayScale,
        width: displayRect.width * displayScale,
        height: displayRect.height * displayScale
    }, cropImage.naturalWidth, cropImage.naturalHeight);
}

function cropToDisplayRect(crop) {
    const scale = 1 / displayScale;
    return {
        left: imageDisplayRect.left + crop.x * scale,
        top: imageDisplayRect.top + crop.y * scale,
        width: crop.width * scale,
        height: crop.height * scale
    };
}

function renderDialogCropBox() {
    if (!dialogCrop) return;
    const rect = cropToDisplayRect(dialogCrop);
    cropBox.style.left = `${rect.left}px`;
    cropBox.style.top = `${rect.top}px`;
    cropBox.style.width = `${rect.width}px`;
    cropBox.style.height = `${rect.height}px`;
    cropSizeLabel.textContent = `${formatDimensions(dialogCrop.width, dialogCrop.height)} px`;
}

function openCropEditor(index) {
    const file = selectedFiles[index];
    const url = previewUrls[index];
    const crop = imageStates[index]?.crop;
    if (!file || !url || !crop) return;

    activeCropIndex = index;
    dialogCrop = { ...crop };
    cropTitle.textContent = file.name;
    cropImage.src = url;
    cropDialog.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    cropImage.onload = () => {
        updateImageDisplayRect();
        renderDialogCropBox();
    };

    if (cropImage.complete) {
        updateImageDisplayRect();
        renderDialogCropBox();
    }
}

function closeCropEditor(apply) {
    if (apply && activeCropIndex >= 0 && dialogCrop) {
        imageStates[activeCropIndex].crop = { ...dialogCrop };
        renderPreviewItem(activeCropIndex);
        schedulePreviewCrop(activeCropIndex);
    }

    cropDialog.classList.add('hidden');
    document.body.style.overflow = '';
    cropImage.src = '';
    activeCropIndex = -1;
    dialogCrop = null;
    cropDrag = null;
}

function resetDialogCrop() {
    if (activeCropIndex < 0) return;
    const natural = naturalSizes[activeCropIndex];
    dialogCrop = getCenteredCrop(natural.width, natural.height);
    renderDialogCropBox();
}

function onCropPointerMove(e) {
    if (!cropDrag || !dialogCrop) return;

    const dx = e.clientX - cropDrag.startX;
    const dy = e.clientY - cropDrag.startY;

    if (cropDrag.mode === 'move') {
        const next = cropToDisplayRect(cropDrag.startCrop);
        next.left += dx;
        next.top += dy;
        dialogCrop = displayRectToCrop(next);
    } else if (cropDrag.mode === 'resize') {
        const next = cropToDisplayRect(cropDrag.startCrop);
        next.width = Math.max(24, cropDrag.startRect.width + dx);
        next.height = Math.max(24, cropDrag.startRect.height + dy);
        dialogCrop = displayRectToCrop(next);
    }

    renderDialogCropBox();
}

function onCropPointerUp() {
    cropDrag = null;
    window.removeEventListener('pointermove', onCropPointerMove);
    window.removeEventListener('pointerup', onCropPointerUp);
}

function startCropDrag(e, mode) {
    if (!dialogCrop) return;
    e.preventDefault();
    e.stopPropagation();

    cropDrag = {
        mode,
        startX: e.clientX,
        startY: e.clientY,
        startCrop: { ...dialogCrop },
        startRect: cropToDisplayRect(dialogCrop)
    };

    window.addEventListener('pointermove', onCropPointerMove);
    window.addEventListener('pointerup', onCropPointerUp);
}

async function processImage(file, crop) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onerror = () => reject(new Error('Failed to load image'));

        img.onload = async () => {
            const mimeType = getOutputMimeType(file);
            const maxBytes = parseInt(targetSizeInput.value, 10) * 1024;
            const sx = Math.round(crop.x);
            const sy = Math.round(crop.y);
            const sw = Math.max(1, Math.round(crop.width));
            const sh = Math.max(1, Math.round(crop.height));

            let width = sw;
            let height = sh;
            let currentQuality = mimeType === 'image/png' || mimeType === 'image/gif' ? 1 : 0.92;

            const renderBlob = () => new Promise((resolveBlob) => {
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');

                if (mimeType === 'image/jpeg') {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, width, height);
                }

                ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);
                canvas.toBlob(resolveBlob, mimeType, currentQuality);
            });

            let blob = await renderBlob();

            if (Number.isFinite(maxBytes) && maxBytes > 0 && blob.size > maxBytes) {
                while (blob.size > maxBytes && currentQuality > 0.1) {
                    currentQuality -= 0.1;
                    blob = await renderBlob();
                }

                while (blob.size > maxBytes && width > 32 && height > 32) {
                    width = Math.max(32, Math.round(width * 0.9));
                    height = Math.max(32, Math.round(height * 0.9));
                    blob = await renderBlob();
                }
            }

            URL.revokeObjectURL(img.src);
            resolve({ blob, convertedSize: blob.size });
        };

        img.src = URL.createObjectURL(file);
    });
}

async function processAllFiles() {
    const downloads = [];
    for (let index = 0; index < selectedFiles.length; index++) {
        const file = selectedFiles[index];
        const { blob } = await processImage(file, imageStates[index].crop);
        downloads.push({ blob, fileName: getOutputFileName(file) });
    }
    return downloads;
}

async function exportSingle(index) {
    try {
        const { blob } = await processImage(selectedFiles[index], imageStates[index].crop);
        downloadSingleFile(blob, getOutputFileName(selectedFiles[index]));
    } catch (error) {
        console.error('Export failed:', error);
        alert('Export failed. Please try again.');
    }
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
    a.download = 'cropped-images.zip';
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

aspectGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-aspect]');
    if (!btn) return;
    setAspectRatio(btn.dataset.aspect);
});

exportFormatRoot.addEventListener('change', saveSettings);
targetSizeInput.addEventListener('change', saveSettings);

dropZone.addEventListener('click', () => fileInput.click());
addImagesBtn.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
});

mainContent.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (selectedFiles.length > 0) setMainDragover(true);
});

mainContent.addEventListener('dragleave', (e) => {
    if (!mainContent.contains(e.relatedTarget)) setMainDragover(false);
});

mainContent.addEventListener('drop', (e) => {
    if (e.target.closest('#dropZone')) return;
    e.preventDefault();
    setMainDragover(false);
    handleFiles(e.dataTransfer.files);
});

function setMainDragover(active) {
    mainContent.classList.toggle('is-dragover', active);
}

fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
    fileInput.value = '';
});

cropBox.addEventListener('pointerdown', (e) => {
    if (e.target.classList.contains('crop-handle')) {
        startCropDrag(e, 'resize');
    } else {
        startCropDrag(e, 'move');
    }
});

cropBackdrop.addEventListener('click', () => closeCropEditor(false));
cropCloseBtn.addEventListener('click', () => closeCropEditor(false));
cropResetBtn.addEventListener('click', resetDialogCrop);
cropApplyBtn.addEventListener('click', () => closeCropEditor(true));

window.addEventListener('resize', () => {
    if (cropDialog.classList.contains('hidden') || activeCropIndex < 0) return;
    updateImageDisplayRect();
    renderDialogCropBox();
});

exportOnlyBtn.addEventListener('click', async () => {
    progress.classList.add('active');
    exportOnlyBtn.disabled = true;
    exportBtn.disabled = true;
    try {
        pendingDownloads = await processAllFiles();
        downloadBtn.classList.remove('hidden');
    } catch (error) {
        console.error('Export failed:', error);
        alert('Export failed. Please try again.');
    }
    progress.classList.remove('active');
    updateUploadActions();
});

exportBtn.addEventListener('click', async () => {
    progress.classList.add('active');
    exportOnlyBtn.disabled = true;
    exportBtn.disabled = true;
    try {
        const downloads = await processAllFiles();
        pendingDownloads = downloads;
        await downloadProcessedFiles(downloads);
        downloadBtn.classList.remove('hidden');
    } catch (error) {
        console.error('Export failed:', error);
        alert('Export failed. Please try again.');
    }
    progress.classList.remove('active');
    updateUploadActions();
});

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

window.editCrop = openCropEditor;
window.removeFile = removeFile;
window.exportSingle = exportSingle;

renderAspectButtons();
loadSettings();
updateUploadActions();

if (typeof ResizeObserver !== 'undefined') {
    const previewResizeObserver = new ResizeObserver(() => refreshAllPreviewCrops());
    previewResizeObserver.observe(preview);
}
