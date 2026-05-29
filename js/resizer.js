const RESIZE_STORAGE_KEY = 'imageResizerSettings';

const modeSizeBtn = document.getElementById('modeSizeBtn');
const modePercentBtn = document.getElementById('modePercentBtn');
const sizePanel = document.getElementById('sizePanel');
const percentPanel = document.getElementById('percentPanel');
const widthInput = document.getElementById('widthInput');
const heightInput = document.getElementById('heightInput');
const percentSliderRoot = document.getElementById('percentSlider');
const percentValue = document.getElementById('percentValue');
const percentHint = document.getElementById('percentHint');
const resetSizeBtn = document.getElementById('resetSizeBtn');
const resetPercentBtn = document.getElementById('resetPercentBtn');
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

const RESIZER_FORMAT_OPTIONS = [
    { value: 'original', label: 'Same as Original' },
    ...FORMAT_OPTIONS
];

const exportFormat = initCustomSelect(exportFormatRoot, RESIZER_FORMAT_OPTIONS, 'original');
const percentSlider = initCustomSlider(percentSliderRoot, { min: 1, max: 200, value: 100, step: 1 });

let resizeMode = 'size';
let selectedFiles = [];
let imageStates = [];
let naturalSizes = [];
let previewUrls = [];
let pendingDownloads = [];

function isSupportedFormat(mimeType) {
    return FORMAT_OPTIONS.some(option => option.value === mimeType);
}

function getOrientedSize(width, height, rotation) {
    if (rotation % 2 === 1) {
        return { width: height, height: width };
    }
    return { width, height };
}

function getResizeMode() {
    return resizeMode;
}

function getTargetDimensions(naturalWidth, naturalHeight, rotation) {
    const oriented = getOrientedSize(naturalWidth, naturalHeight, rotation);

    if (getResizeMode() === 'percent') {
        const scale = percentSlider.value / 100;
        return {
            width: Math.max(1, Math.round(oriented.width * scale)),
            height: Math.max(1, Math.round(oriented.height * scale))
        };
    }

    const width = parseInt(widthInput.value, 10);
    const height = parseInt(heightInput.value, 10);

    if (width > 0 && height > 0) {
        return { width, height };
    }

    if (width > 0) {
        return {
            width,
            height: Math.max(1, Math.round(oriented.height * (width / oriented.width)))
        };
    }

    if (height > 0) {
        return {
            width: Math.max(1, Math.round(oriented.width * (height / oriented.height))),
            height
        };
    }

    return { width: oriented.width, height: oriented.height };
}

function formatDimensions(width, height) {
    return `${width} × ${height}`;
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

function getPreviewTransformStyle(state) {
    const { rotation, flipH, flipV } = state;
    const scaleX = flipH ? -1 : 1;
    const scaleY = flipV ? -1 : 1;
    return `rotate(${rotation * 90}deg) scale(${scaleX}, ${scaleY})`;
}

function hasVisualTransform(state) {
    return state.rotation !== 0 || state.flipH || state.flipV;
}

function updatePercentHint() {
    percentValue.textContent = `${percentSlider.value}%`;
    const hintText = percentHint.querySelector('span');
    if (hintText) {
        hintText.textContent = `Make my image ${percentSlider.value}% of original size`;
    }
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
    localStorage.setItem(RESIZE_STORAGE_KEY, JSON.stringify({
        mode: resizeMode,
        width: widthInput.value,
        height: heightInput.value,
        percent: percentSlider.value,
        format: exportFormat.value,
        targetSize: targetSizeInput.value
    }));
}

function loadSettings() {
    try {
        const saved = JSON.parse(localStorage.getItem(RESIZE_STORAGE_KEY));
        if (!saved) return;

        if (saved.mode === 'percent') {
            setResizeMode('percent');
        }

        if (saved.width) widthInput.value = saved.width;
        if (saved.height) heightInput.value = saved.height;
        if (saved.percent) percentSlider.value = saved.percent;
        if (saved.format && exportFormat.hasOption(saved.format)) {
            exportFormat.value = saved.format;
        }
        if (saved.targetSize) targetSizeInput.value = saved.targetSize;
    } catch (_) {}

    updatePercentHint();
}

function setResizeMode(mode) {
    resizeMode = mode;
    const isSize = mode === 'size';

    modeSizeBtn.classList.toggle('active', isSize);
    modePercentBtn.classList.toggle('active', !isSize);
    modeSizeBtn.setAttribute('aria-pressed', String(isSize));
    modePercentBtn.setAttribute('aria-pressed', String(!isSize));

    sizePanel.classList.toggle('hidden', !isSize);
    percentPanel.classList.toggle('hidden', isSize);

    saveSettings();
    refreshPreviewDimensions();
}

function refreshPreviewDimensions() {
    selectedFiles.forEach((_, index) => refreshPreviewMeta(index));
}

function resetSizeSettings() {
    widthInput.value = '';
    heightInput.value = '';
    saveSettings();
    refreshPreviewDimensions();
}

function resetPercentSettings() {
    percentSlider.value = 100;
    updatePercentHint();
    saveSettings();
    refreshPreviewDimensions();
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
        imageStates.push({ rotation: 0, flipH: false, flipV: false });
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
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function getDimensionBadge(index) {
    const natural = naturalSizes[index];
    if (!natural?.width) return '';

    const state = imageStates[index];
    const target = getTargetDimensions(natural.width, natural.height, state.rotation);
    const original = getOrientedSize(natural.width, natural.height, state.rotation);

    return `
        <div class="preview-dimensions" title="Output dimensions">
            ${formatDimensions(original.width, original.height)}
            <span class="arrow">→</span>
            ${formatDimensions(target.width, target.height)}
        </div>
    `;
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

    const state = imageStates[index];

    item.innerHTML = `
        <div class="preview-image-wrap${hasVisualTransform(state) ? ' has-transform' : ''}">
            <img src="${url}" alt="${file.name}" style="transform: ${getPreviewTransformStyle(state)}">
            <div class="preview-transforms">
                <button class="btn btn-outline btn-icon btn-sm" type="button" title="Rotate 90°" onclick="rotateImage(${index})">
                    ${icon('rotate-cw', 14)}
                </button>
                <button class="btn btn-outline btn-icon btn-sm" type="button" title="Flip horizontal" onclick="flipImageH(${index})">
                    ${icon('flip-horizontal', 14)}
                </button>
                <button class="btn btn-outline btn-icon btn-sm" type="button" title="Flip vertical" onclick="flipImageV(${index})">
                    ${icon('flip-vertical', 14)}
                </button>
            </div>
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

function updatePreviewTransform(index) {
    const item = preview.querySelector(`.preview-item[data-index="${index}"]`);
    if (!item) return;

    const state = imageStates[index];
    const wrap = item.querySelector('.preview-image-wrap');
    const img = wrap?.querySelector('img');
    if (!wrap || !img) return;

    wrap.classList.toggle('has-transform', hasVisualTransform(state));
    img.style.transform = getPreviewTransformStyle(state);
    refreshPreviewMeta(index);
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

function rotateImage(index) {
    imageStates[index].rotation = (imageStates[index].rotation + 1) % 4;
    updatePreviewTransform(index);
}

function flipImageH(index) {
    imageStates[index].flipH = !imageStates[index].flipH;
    updatePreviewTransform(index);
}

function flipImageV(index) {
    imageStates[index].flipV = !imageStates[index].flipV;
    updatePreviewTransform(index);
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
    a.download = 'resized-images.zip';
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

async function processImage(file, state) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onerror = () => reject(new Error('Failed to load image'));

        img.onload = async () => {
            const { rotation, flipH, flipV } = state;
            const oriented = getOrientedSize(img.width, img.height, rotation);
            const target = getTargetDimensions(img.width, img.height, rotation);
            const mimeType = getOutputMimeType(file);
            const maxBytes = parseInt(targetSizeInput.value, 10) * 1024;

            const orientedCanvas = document.createElement('canvas');
            orientedCanvas.width = oriented.width;
            orientedCanvas.height = oriented.height;
            const orientedCtx = orientedCanvas.getContext('2d');

            orientedCtx.save();
            orientedCtx.translate(oriented.width / 2, oriented.height / 2);
            orientedCtx.rotate((rotation * Math.PI) / 2);
            orientedCtx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
            orientedCtx.drawImage(img, -img.width / 2, -img.height / 2);
            orientedCtx.restore();

            let width = target.width;
            let height = target.height;
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

                ctx.drawImage(orientedCanvas, 0, 0, oriented.width, oriented.height, 0, 0, width, height);
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
            resolve({
                blob,
                originalSize: file.size,
                convertedSize: blob.size
            });
        };

        img.src = URL.createObjectURL(file);
    });
}

async function processAllFiles() {
    const downloads = [];

    for (let index = 0; index < selectedFiles.length; index++) {
        const file = selectedFiles[index];
        const { blob } = await processImage(file, imageStates[index]);
        downloads.push({ blob, fileName: getOutputFileName(file) });
    }

    return downloads;
}

async function exportSingle(index) {
    const file = selectedFiles[index];

    try {
        const { blob } = await processImage(file, imageStates[index]);
        downloadSingleFile(blob, getOutputFileName(file));
    } catch (error) {
        console.error('Export failed:', error);
        alert('Export failed. Please try again.');
    }
}

modeSizeBtn.addEventListener('click', () => setResizeMode('size'));
modePercentBtn.addEventListener('click', () => setResizeMode('percent'));
resetSizeBtn.addEventListener('click', resetSizeSettings);
resetPercentBtn.addEventListener('click', resetPercentSettings);

percentSliderRoot.addEventListener('input', () => {
    updatePercentHint();
    saveSettings();
    refreshPreviewDimensions();
});

percentSliderRoot.addEventListener('change', saveSettings);

widthInput.addEventListener('input', () => {
    saveSettings();
    refreshPreviewDimensions();
});

heightInput.addEventListener('input', () => {
    saveSettings();
    refreshPreviewDimensions();
});

exportFormatRoot.addEventListener('change', saveSettings);
targetSizeInput.addEventListener('change', saveSettings);

dropZone.addEventListener('click', () => fileInput.click());
addImagesBtn.addEventListener('click', () => fileInput.click());

function setMainDragover(active) {
    mainContent.classList.toggle('is-dragover', active);
}

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
    if (selectedFiles.length > 0) {
        setMainDragover(true);
    }
});

mainContent.addEventListener('dragleave', (e) => {
    if (!mainContent.contains(e.relatedTarget)) {
        setMainDragover(false);
    }
});

mainContent.addEventListener('drop', (e) => {
    if (e.target.closest('#dropZone')) return;
    e.preventDefault();
    setMainDragover(false);
    handleFiles(e.dataTransfer.files);
});

fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
    fileInput.value = '';
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

window.rotateImage = rotateImage;
window.flipImageH = flipImageH;
window.flipImageV = flipImageV;
window.removeFile = removeFile;
window.exportSingle = exportSingle;

loadSettings();
updateUploadActions();
