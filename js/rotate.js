const ROTATE_STORAGE_KEY = 'imageRotateSettings';

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
const rotateAllCwBtn = document.getElementById('rotateAllCwBtn');
const rotateAllCcwBtn = document.getElementById('rotateAllCcwBtn');
const flipAllHBtn = document.getElementById('flipAllHBtn');
const flipAllVBtn = document.getElementById('flipAllVBtn');
const resetAllBtn = document.getElementById('resetAllBtn');
const angleSliderRoot = document.getElementById('angleSlider');
const angleInput = document.getElementById('angleInput');
const activeRotateLabel = document.getElementById('activeRotateLabel');
const applyAngleAllBtn = document.getElementById('applyAngleAllBtn');
const rotateSelectActions = document.getElementById('rotateSelectActions');
const selectAllRotateBtn = document.getElementById('selectAllRotateBtn');
const deselectAllRotateBtn = document.getElementById('deselectAllRotateBtn');
const rotateSelectionCount = document.getElementById('rotateSelectionCount');

const ROTATE_FORMAT_OPTIONS = [
    { value: 'original', label: 'Same as Original' },
    ...FORMAT_OPTIONS
];

const exportFormat = initCustomSelect(exportFormatRoot, ROTATE_FORMAT_OPTIONS, 'original');
const angleSlider = initCustomSlider(angleSliderRoot, { min: 0, max: 360, value: 0, step: 1 });

let selectedFiles = [];
let imageStates = [];
let naturalSizes = [];
let previewUrls = [];
let pendingDownloads = [];
let activeIndex = -1;
let selectedSet = new Set();

function isSupportedFormat(mimeType) {
    return FORMAT_OPTIONS.some(option => option.value === mimeType);
}

function normalizeAngle(angle) {
    return ((angle % 360) + 360) % 360;
}

function getRotatedBounds(width, height, angleDeg) {
    const rad = (angleDeg * Math.PI) / 180;
    const cos = Math.abs(Math.cos(rad));
    const sin = Math.abs(Math.sin(rad));
    return {
        width: Math.ceil(width * cos + height * sin),
        height: Math.ceil(width * sin + height * cos)
    };
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
    const { angle, flipH, flipV } = state;
    const scaleX = flipH ? -1 : 1;
    const scaleY = flipV ? -1 : 1;
    return `rotate(${angle}deg) scale(${scaleX}, ${scaleY})`;
}

function hasVisualTransform(state) {
    return state.angle !== 0 || state.flipH || state.flipV;
}

function createDefaultState() {
    return { angle: 0, flipH: false, flipV: false };
}

function getBatchIndices() {
    if (selectedSet.size > 0) {
        return Array.from(selectedSet).sort((a, b) => a - b);
    }
    return selectedFiles.map((_, index) => index);
}

function pruneSelectedSet() {
    selectedSet.forEach((index) => {
        if (index >= selectedFiles.length) selectedSet.delete(index);
    });
}

function updateSelectionUI() {
    pruneSelectedSet();

    const total = selectedFiles.length;
    const count = selectedSet.size;
    rotateSelectActions.classList.toggle('hidden', total === 0);

    if (total === 0) {
        rotateSelectionCount.textContent = '';
        return;
    }

    rotateSelectionCount.textContent = count > 0
        ? `${count} of ${total} selected`
        : `All ${total} images (batch)`;

    preview.querySelectorAll('.preview-item').forEach((item) => {
        const index = parseInt(item.dataset.index, 10);
        const isSelected = selectedSet.has(index);
        item.classList.toggle('preview-item-selected', isSelected);
        const checkbox = item.querySelector('.rotate-select-image');
        if (checkbox) checkbox.checked = isSelected;
    });
}

function selectAllImages() {
    selectedFiles.forEach((_, index) => selectedSet.add(index));
    updateSelectionUI();
}

function deselectAllImages() {
    selectedSet.clear();
    updateSelectionUI();
}

function setImageSelected(index, selected) {
    if (selected) selectedSet.add(index);
    else selectedSet.delete(index);
    updateSelectionUI();
}

function remapSelectedSet(removedIndex) {
    const next = new Set();
    selectedSet.forEach((index) => {
        if (index < removedIndex) next.add(index);
        else if (index > removedIndex) next.add(index - 1);
    });
    selectedSet = next;
}

function updateUploadActions() {
    const hasFiles = selectedFiles.length > 0;
    exportOnlyBtn.disabled = !hasFiles;
    exportBtn.disabled = !hasFiles;
    applyAngleAllBtn.disabled = activeIndex < 0;
    dropZone.classList.toggle('has-images', hasFiles);
    mainContent.classList.toggle('has-images', hasFiles);
    updateSelectionUI();
}

function resetPendingDownload() {
    pendingDownloads = [];
    downloadBtn.classList.add('hidden');
}

function saveSettings() {
    localStorage.setItem(ROTATE_STORAGE_KEY, JSON.stringify({
        format: exportFormat.value,
        targetSize: targetSizeInput.value
    }));
}

function loadSettings() {
    try {
        const saved = JSON.parse(localStorage.getItem(ROTATE_STORAGE_KEY));
        if (!saved) return;
        if (saved.format && exportFormat.hasOption(saved.format)) {
            exportFormat.value = saved.format;
        }
        if (saved.targetSize) targetSizeInput.value = saved.targetSize;
    } catch (_) {}
}

function syncAngleControls(index = activeIndex) {
    if (index < 0) {
        angleSlider.value = 0;
        angleInput.value = 0;
        activeRotateLabel.textContent = '(no image)';
        return;
    }

    const angle = imageStates[index].angle;
    angleSlider.value = angle;
    angleInput.value = angle;
    activeRotateLabel.textContent = `(${selectedFiles[index].name})`;
}

function setActiveIndex(index) {
    activeIndex = index;
    preview.querySelectorAll('.preview-item').forEach((item, i) => {
        item.classList.toggle('rotate-active', i === index);
    });
    syncAngleControls(index);
    updateUploadActions();
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
        imageStates.push(createDefaultState());
        naturalSizes.push({ width: 0, height: 0 });
        previewUrls.push(null);
        selectedSet.add(index);
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
            if (activeIndex < 0) setActiveIndex(index);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function getDimensionBadge(index) {
    const natural = naturalSizes[index];
    if (!natural?.width) return '';

    const state = imageStates[index];
    const bounds = getRotatedBounds(natural.width, natural.height, state.angle);

    if (!hasVisualTransform(state)) {
        return `
            <div class="preview-dimensions" title="Image dimensions">
                ${formatDimensions(bounds.width, bounds.height)}
            </div>
        `;
    }

    return `
        <div class="preview-dimensions" title="Output dimensions">
            ${formatDimensions(natural.width, natural.height)}
            <span class="arrow">→</span>
            ${formatDimensions(bounds.width, bounds.height)}
            · ${state.angle}°
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
    const hasAngle = state.angle !== 0;

    item.classList.toggle('rotate-active', index === activeIndex);
    item.classList.toggle('preview-item-selected', selectedSet.has(index));

    item.innerHTML = `
        <input type="checkbox" class="preview-checkbox rotate-select-image" data-index="${index}" aria-label="Select ${file.name}"${selectedSet.has(index) ? ' checked' : ''}>
        <div class="preview-image-wrap${hasVisualTransform(state) ? ' has-transform' : ''}${hasAngle ? ' has-angle' : ''}" data-select-index="${index}">
            <img src="${url}" alt="${file.name}" style="transform: ${getPreviewTransformStyle(state)}">
            <div class="preview-transforms">
                <button class="btn btn-outline btn-icon btn-sm" type="button" title="Rotate 90° clockwise" onclick="rotateImage(${index})">
                    ${icon('rotate-cw', 14)}
                </button>
                <button class="btn btn-outline btn-icon btn-sm" type="button" title="Rotate 90° counter-clockwise" onclick="rotateImageCCW(${index})">
                    ${icon('rotate-ccw', 14)}
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

    const wrap = item.querySelector('.preview-image-wrap');
    wrap.addEventListener('click', (e) => {
        if (e.target.closest('button') || e.target.closest('.preview-checkbox')) return;
        setActiveIndex(index);
    });

    const checkbox = item.querySelector('.rotate-select-image');
    checkbox.addEventListener('click', (e) => e.stopPropagation());
    checkbox.addEventListener('change', () => setImageSelected(index, checkbox.checked));
}

function updatePreviewTransform(index) {
    const item = preview.querySelector(`.preview-item[data-index="${index}"]`);
    if (!item) return;

    const state = imageStates[index];
    const wrap = item.querySelector('.preview-image-wrap');
    const img = wrap?.querySelector('img');
    if (!wrap || !img) return;

    wrap.classList.toggle('has-transform', hasVisualTransform(state));
    wrap.classList.toggle('has-angle', state.angle !== 0);
    img.style.transform = getPreviewTransformStyle(state);
    refreshPreviewMeta(index);

    if (index === activeIndex) syncAngleControls(index);
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

function setImageAngle(index, angle) {
    imageStates[index].angle = normalizeAngle(angle);
    updatePreviewTransform(index);
    resetPendingDownload();
}

function rotateImage(index) {
    setImageAngle(index, imageStates[index].angle + 90);
}

function rotateImageCCW(index) {
    setImageAngle(index, imageStates[index].angle - 90);
}

function flipImageH(index) {
    imageStates[index].flipH = !imageStates[index].flipH;
    updatePreviewTransform(index);
    resetPendingDownload();
}

function flipImageV(index) {
    imageStates[index].flipV = !imageStates[index].flipV;
    updatePreviewTransform(index);
    resetPendingDownload();
}

function resetImage(index) {
    imageStates[index] = createDefaultState();
    updatePreviewTransform(index);
    resetPendingDownload();
}

function applyToBatch(transformFn) {
    getBatchIndices().forEach(index => transformFn(index));
    resetPendingDownload();
}

function removeFile(index) {
    selectedSet.delete(index);
    remapSelectedSet(index);

    selectedFiles.splice(index, 1);
    imageStates.splice(index, 1);
    naturalSizes.splice(index, 1);
    previewUrls.splice(index, 1);

    if (activeIndex === index) {
        activeIndex = selectedFiles.length > 0 ? Math.min(index, selectedFiles.length - 1) : -1;
    } else if (activeIndex > index) {
        activeIndex -= 1;
    }

    resetPendingDownload();
    rebuildPreview();
    syncAngleControls();
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
    a.download = 'rotated-images.zip';
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
            const { angle, flipH, flipV } = state;
            const bounds = getRotatedBounds(img.width, img.height, angle);
            const mimeType = getOutputMimeType(file);
            const maxBytes = parseInt(targetSizeInput.value, 10) * 1024;

            const canvas = document.createElement('canvas');
            canvas.width = bounds.width;
            canvas.height = bounds.height;
            const ctx = canvas.getContext('2d');

            if (mimeType === 'image/jpeg') {
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, bounds.width, bounds.height);
            }

            ctx.save();
            ctx.translate(bounds.width / 2, bounds.height / 2);
            ctx.rotate((angle * Math.PI) / 180);
            ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
            ctx.drawImage(img, -img.width / 2, -img.height / 2);
            ctx.restore();

            let currentQuality = mimeType === 'image/png' || mimeType === 'image/gif' ? 1 : 0.92;

            const renderBlob = () => new Promise((resolveBlob) => {
                canvas.toBlob(resolveBlob, mimeType, currentQuality);
            });

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
        const { blob } = await processImage(file, imageStates[index]);
        downloads.push({ blob, fileName: getOutputFileName(file) });
    }
    return downloads;
}

async function exportSingle(index) {
    try {
        const { blob } = await processImage(selectedFiles[index], imageStates[index]);
        downloadSingleFile(blob, getOutputFileName(selectedFiles[index]));
    } catch (error) {
        console.error('Export failed:', error);
        alert('Export failed. Please try again.');
    }
}

function applyAngleFromControls(angle) {
    if (activeIndex < 0) return;
    setImageAngle(activeIndex, angle);
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

exportFormatRoot.addEventListener('change', saveSettings);
targetSizeInput.addEventListener('input', saveSettings);

angleSliderRoot.addEventListener('input', () => {
    angleInput.value = angleSlider.value;
    applyAngleFromControls(angleSlider.value);
});

angleSliderRoot.addEventListener('change', () => {
    angleInput.value = angleSlider.value;
    applyAngleFromControls(angleSlider.value);
});

angleInput.addEventListener('input', () => {
    const value = parseInt(angleInput.value, 10);
    if (!Number.isFinite(value)) return;
    const angle = normalizeAngle(value);
    angleSlider.value = angle;
    applyAngleFromControls(angle);
});

applyAngleAllBtn.addEventListener('click', () => {
    if (activeIndex < 0) return;
    const angle = imageStates[activeIndex].angle;
    getBatchIndices().forEach(index => setImageAngle(index, angle));
    resetPendingDownload();
});

selectAllRotateBtn.addEventListener('click', selectAllImages);
deselectAllRotateBtn.addEventListener('click', deselectAllImages);

rotateAllCwBtn.addEventListener('click', () => applyToBatch(rotateImage));
rotateAllCcwBtn.addEventListener('click', () => applyToBatch(rotateImageCCW));
flipAllHBtn.addEventListener('click', () => applyToBatch(flipImageH));
flipAllVBtn.addEventListener('click', () => applyToBatch(flipImageV));
resetAllBtn.addEventListener('click', () => applyToBatch(resetImage));

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
window.rotateImageCCW = rotateImageCCW;
window.flipImageH = flipImageH;
window.flipImageV = flipImageV;
window.removeFile = removeFile;
window.exportSingle = exportSingle;

loadSettings();
updateUploadActions();
syncAngleControls();
