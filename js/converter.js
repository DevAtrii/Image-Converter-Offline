const STORAGE_KEY = 'imageConverterFormats';
const OVERRIDE_ON_DROP_KEY = 'imageConverterOverrideOnDrop';
const dropZone = document.getElementById('dropZone');
const addImagesBtn = document.getElementById('addImagesBtn');
const fileInput = document.getElementById('fileInput');
const preview = document.getElementById('preview');
const mainContent = document.querySelector('.tool-main-content');
const convertOnlyBtn = document.getElementById('convertOnlyBtn');
const convertBtn = document.getElementById('convertBtn');
const downloadBtn = document.getElementById('downloadBtn');
const progress = document.getElementById('progress');
const selectActions = document.getElementById('selectActions');
const resultsCard = document.getElementById('resultsCard');
const resultsList = document.getElementById('resultsList');
const acceptHint = document.getElementById('acceptHint');
let selectedFiles = [];
let previewUrls = [];
let pendingDownloads = [];
const conversionResults = new Map();

const fromFormatRoot = document.getElementById('fromFormat');
const toFormatRoot = document.getElementById('toFormat');
const fromFormat = initCustomSelect(fromFormatRoot, FORMAT_OPTIONS, 'image/png');
const toFormat = initCustomSelect(toFormatRoot, FORMAT_OPTIONS, 'image/webp');
const maxSize = document.getElementById('maxSize');
const qualityRoot = document.getElementById('quality');
const quality = initCustomSlider(qualityRoot, { min: 1, max: 100, value: 90, step: 1 });
const qualityValue = document.getElementById('qualityValue');
const overrideOnDropToggle = document.getElementById('overrideOnDropToggle');

function getConvertedFileName(file) {
    const extension = toFormat.value.split('/')[1];
    return file.name.substring(0, file.name.lastIndexOf('.')) + '.' + extension;
}

function updateUploadActions() {
    const hasFiles = selectedFiles.length > 0;
    convertOnlyBtn.disabled = !hasFiles;
    convertBtn.disabled = !hasFiles;
    dropZone.classList.toggle('has-images', hasFiles);
    mainContent.classList.toggle('has-images', hasFiles);
}

function resetPendingDownload() {
    pendingDownloads = [];
    downloadBtn.classList.add('hidden');
}

function saveFormats() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        from: fromFormat.value,
        to: toFormat.value
    }));
}

function loadSavedFormats() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (saved?.from && fromFormat.hasOption(saved.from)) {
            fromFormat.value = saved.from;
        }
        if (saved?.to && toFormat.hasOption(saved.to)) {
            toFormat.value = saved.to;
        }
    } catch (_) {}
    updateAcceptHint();
    fileInput.accept = fromFormat.value;
}

function updateAcceptHint() {
    acceptHint.textContent = `Accepts ${formatLabel(fromFormat.value)} files`;
}

function isSupportedFormat(mimeType) {
    return FORMAT_OPTIONS.some(option => option.value === mimeType);
}

function loadOverrideOnDrop() {
    const saved = localStorage.getItem(OVERRIDE_ON_DROP_KEY);
    return saved === null ? true : saved === 'true';
}

function saveOverrideOnDrop(enabled) {
    localStorage.setItem(OVERRIDE_ON_DROP_KEY, String(enabled));
}

function applyFromFormatSideEffects(clearFiles = true) {
    fileInput.accept = fromFormat.value;
    updateAcceptHint();

    if (!clearFiles) return;

    selectedFiles = [];
    conversionResults.clear();
    resetPendingDownload();
    updatePreview();
    updateResults();
    updateUploadActions();
    selectActions.classList.add('hidden');
}

function setFromFormat(mimeType, { save = true, clearFiles = true, triggerChange = false } = {}) {
    if (!fromFormat.hasOption(mimeType)) return false;
    fromFormat.setValue(mimeType, triggerChange);
    if (save) saveFormats();
    applyFromFormatSideEffects(clearFiles);
    return true;
}

loadSavedFormats();
overrideOnDropToggle.checked = loadOverrideOnDrop();
overrideOnDropToggle.addEventListener('change', () => {
    saveOverrideOnDrop(overrideOnDropToggle.checked);
});

qualityRoot.addEventListener('input', () => {
    qualityValue.textContent = `${quality.value}%`;
});

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
    handleFiles(e.dataTransfer.files, { fromDrop: true });
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
    handleFiles(e.dataTransfer.files, { fromDrop: true });
});

fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
    fileInput.value = '';
});

fromFormatRoot.addEventListener('change', () => {
    saveFormats();
    applyFromFormatSideEffects(true);
});

toFormatRoot.addEventListener('change', () => {
    saveFormats();
    conversionResults.clear();
    resetPendingDownload();
    updatePreview();
    updateResults();
});

function handleFiles(files, { fromDrop = false } = {}) {
    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    let selectedFormat = fromFormat.value;

    if (fromDrop && overrideOnDropToggle.checked) {
        const supportedDrop = fileList.filter(file => isSupportedFormat(file.type));
        if (supportedDrop.length > 0) {
            const droppedType = supportedDrop[0].type;
            if (droppedType !== selectedFormat) {
                setFromFormat(droppedType, { clearFiles: true });
                selectedFormat = droppedType;
            }
        }
    }

    const validFiles = fileList.filter(file => file.type === selectedFormat);
    const unsupportedCount = fileList.length - validFiles.length;

    if (unsupportedCount > 0) {
        alert(`Please select only ${formatLabel(selectedFormat)} files`);
    }

    if (validFiles.length === 0) return;

    selectedFiles = [...selectedFiles, ...validFiles];
    resetPendingDownload();
    updatePreview();
    updateUploadActions();
    selectActions.classList.toggle('hidden', selectedFiles.length === 0);
}

function getSizeMeta(index) {
    const file = selectedFiles[index];
    const result = conversionResults.get(index);
    const original = formatFileSize(file.size);
    if (!result) {
        return `<div class="preview-size">${original}</div>`;
    }
    const savings = file.size > result.convertedSize
        ? ` (−${Math.round((1 - result.convertedSize / file.size) * 100)}%)`
        : '';
    return `
        <div class="preview-size">${original} → ${formatFileSize(result.convertedSize)}${savings}</div>
        <div class="preview-size converted">Converted</div>
    `;
}

function updatePreview() {
    preview.innerHTML = '';
    previewUrls = new Array(selectedFiles.length);
    selectedFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewUrls[index] = e.target.result;
            const div = document.createElement('div');
            div.className = 'preview-item';
            div.dataset.index = index;
            div.innerHTML = `
                <input type="checkbox" class="preview-checkbox select-image" data-index="${index}">
                <img src="${e.target.result}" alt="${file.name}" data-index="${index}">
                <div class="preview-actions">
                    <button class="btn btn-success btn-icon btn-sm" type="button" title="Convert & download" onclick="convertAndDownloadSingle(${index})">
                        ${icon('download', 14)}
                    </button>
                    <button class="btn btn-destructive btn-icon btn-sm" type="button" title="Remove" onclick="removeFile(${index})">
                        ${icon('x', 14)}
                    </button>
                </div>
                <div class="preview-meta">
                    <div class="preview-name" title="${file.name}">${file.name}</div>
                    ${getSizeMeta(index)}
                </div>
            `;
            div.querySelector('img').addEventListener('click', () => openGallery(index));
            preview.appendChild(div);
        };
        reader.readAsDataURL(file);
    });
}

function refreshPreviewMeta(index) {
    const item = preview.querySelector(`.preview-item[data-index="${index}"]`);
    if (!item) return;
    const meta = item.querySelector('.preview-meta');
    const file = selectedFiles[index];
    meta.innerHTML = `
        <div class="preview-name" title="${file.name}">${file.name}</div>
        ${getSizeMeta(index)}
    `;
}

function recordConversion(index, convertedSize) {
    conversionResults.set(index, { convertedSize });
    refreshPreviewMeta(index);
    updateResults();
}

function updateResults() {
    if (conversionResults.size === 0) {
        resultsCard.classList.add('hidden');
        resultsList.innerHTML = '';
        return;
    }

    resultsCard.classList.remove('hidden');
    resultsList.innerHTML = '';

    conversionResults.forEach((result, index) => {
        const file = selectedFiles[index];
        if (!file) return;

        const before = formatFileSize(file.size);
        const after = formatFileSize(result.convertedSize);
        const savings = file.size > result.convertedSize
            ? `<span class="result-savings">−${Math.round((1 - result.convertedSize / file.size) * 100)}%</span>`
            : '';

        const item = document.createElement('div');
        item.className = 'result-item';
        item.innerHTML = `
            <span class="result-name" title="${file.name}">${file.name}</span>
            <span class="result-sizes">
                ${before}
                <span class="arrow">→</span>
                <span class="after">${after}</span>
                ${savings}
            </span>
        `;
        resultsList.appendChild(item);
    });
}

function removeFile(index) {
    selectedFiles.splice(index, 1);
    conversionResults.clear();
    resetPendingDownload();
    updatePreview();
    updateResults();
    updateUploadActions();
    selectActions.classList.toggle('hidden', selectedFiles.length === 0);
}

async function convertAndDownloadSingle(index) {
    const file = selectedFiles[index];
    try {
        const { blob, originalSize, convertedSize } = await convertImage(file);
        recordConversion(index, convertedSize);
        downloadSingleFile(blob, getConvertedFileName(file));
    } catch (error) {
        console.error('Conversion failed:', error);
        alert('Conversion failed. Please try again.');
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

async function convertAllFiles() {
    const downloads = [];
    for (let index = 0; index < selectedFiles.length; index++) {
        const file = selectedFiles[index];
        const { blob, convertedSize } = await convertImage(file);
        recordConversion(index, convertedSize);
        downloads.push({ blob, fileName: getConvertedFileName(file) });
    }
    return downloads;
}

function downloadConvertedFiles(downloads) {
    if (downloads.length === 1) {
        downloadSingleFile(downloads[0].blob, downloads[0].fileName);
        return;
    }

    const zip = new JSZip();
    downloads.forEach(({ blob, fileName }) => zip.file(fileName, blob));
    return zip.generateAsync({ type: 'blob' }).then(downloadZip);
}

convertOnlyBtn.addEventListener('click', async () => {
    progress.classList.add('active');
    convertOnlyBtn.disabled = true;
    convertBtn.disabled = true;

    try {
        pendingDownloads = await convertAllFiles();
        downloadBtn.classList.remove('hidden');
    } catch (error) {
        console.error('Conversion failed:', error);
        alert('Conversion failed. Please try again.');
    }

    progress.classList.remove('active');
    updateUploadActions();
});

downloadBtn.addEventListener('click', async () => {
    if (pendingDownloads.length === 0) return;

    downloadBtn.disabled = true;
    try {
        await downloadConvertedFiles(pendingDownloads);
    } catch (error) {
        console.error('Download failed:', error);
        alert('Download failed. Please try again.');
    }
    downloadBtn.disabled = false;
});

convertBtn.addEventListener('click', async () => {
    progress.classList.add('active');
    convertOnlyBtn.disabled = true;
    convertBtn.disabled = true;

    try {
        const downloads = await convertAllFiles();
        pendingDownloads = downloads;
        await downloadConvertedFiles(downloads);
        downloadBtn.classList.remove('hidden');
    } catch (error) {
        console.error('Conversion failed:', error);
        alert('Conversion failed. Please try again.');
    }

    progress.classList.remove('active');
    updateUploadActions();
});

async function convertImage(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onerror = () => reject(new Error('Failed to load image'));

        img.onload = async () => {
            let currentQuality = quality.value / 100;
            let canvas = document.createElement('canvas');
            let ctx = canvas.getContext('2d');

            let width = img.width;
            let height = img.height;

            canvas.width = width;
            canvas.height = height;

            if (toFormat.value === 'image/jpeg') {
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, width, height);
            }

            ctx.drawImage(img, 0, 0, width, height);

            let blob = await new Promise(r => canvas.toBlob(r, toFormat.value, currentQuality));

            while (blob.size > maxSize.value * 1024 && currentQuality > 0.1) {
                currentQuality -= 0.1;
                width *= 0.9;
                height *= 0.9;

                canvas.width = width;
                canvas.height = height;

                if (toFormat.value === 'image/jpeg') {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, width, height);
                }

                ctx.drawImage(img, 0, 0, width, height);
                blob = await new Promise(r => canvas.toBlob(r, toFormat.value, currentQuality));
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

function downloadZip(blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fromExt = fromFormat.value.split('/')[1];
    const toExt = toFormat.value.split('/')[1];
    a.download = `converted-${fromExt}-to-${toExt}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function selectAllImages() {
    document.querySelectorAll('.select-image').forEach(checkbox => {
        checkbox.checked = true;
    });
    document.getElementById('convertSelectedBtn').disabled = false;
}

function deselectAllImages() {
    document.querySelectorAll('.select-image').forEach(checkbox => {
        checkbox.checked = false;
    });
    document.getElementById('convertSelectedBtn').disabled = true;
}

function getSelectedIndexes() {
    return Array.from(document.querySelectorAll('.select-image:checked'))
        .map(checkbox => parseInt(checkbox.dataset.index));
}

async function convertSelected() {
    const indexes = getSelectedIndexes();
    if (indexes.length === 0) return;

    progress.classList.add('active');
    document.getElementById('convertSelectedBtn').disabled = true;

    try {
        if (indexes.length === 1) {
            const index = indexes[0];
            const { blob, convertedSize } = await convertImage(selectedFiles[index]);
            recordConversion(index, convertedSize);
            downloadSingleFile(blob, getConvertedFileName(selectedFiles[index]));
        } else {
            const zip = new JSZip();
            const promises = indexes.map(async (index) => {
                const file = selectedFiles[index];
                const { blob, convertedSize } = await convertImage(file);
                recordConversion(index, convertedSize);
                zip.file(getConvertedFileName(file), blob);
            });

            await Promise.all(promises);
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            downloadZip(zipBlob);
        }
    } catch (error) {
        console.error('Conversion failed:', error);
        alert('Conversion failed. Please try again.');
    }

    progress.classList.remove('active');
    document.getElementById('convertSelectedBtn').disabled = false;
}

document.addEventListener('change', (e) => {
    if (e.target.classList.contains('select-image')) {
        const hasChecked = document.querySelector('.select-image:checked');
        document.getElementById('convertSelectedBtn').disabled = !hasChecked;
    }
});

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
let galleryPinchStartDistance = 0;
let galleryPinchStartScale = 1;
let galleryPanStart = null;
let gallerySwipeStart = null;
let galleryLastTap = 0;

const GALLERY_MIN_SCALE = 1;
const GALLERY_MAX_SCALE = 5;
const GALLERY_SWIPE_THRESHOLD = 60;

function clampGalleryScale(value) {
    return Math.min(GALLERY_MAX_SCALE, Math.max(GALLERY_MIN_SCALE, value));
}

function getTouchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
}

function resetGalleryTransform() {
    galleryScale = 1;
    galleryTranslateX = 0;
    galleryTranslateY = 0;
    applyGalleryTransform();
}

function applyGalleryTransform() {
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
    const url = previewUrls[galleryIndex];
    if (!file || !url) return;

    galleryImage.src = url;
    galleryImage.alt = file.name;
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

function toggleGalleryZoom(clientX, clientY) {
    if (galleryScale > 1) {
        resetGalleryTransform();
    } else {
        setGalleryZoom(2.5, clientX, clientY);
    }
}

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
    toggleGalleryZoom(e.clientX, e.clientY);
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

    if (galleryPanStart?.pointerId === e.pointerId) {
        galleryPanStart = null;
    }
    if (gallerySwipeStart?.pointerId === e.pointerId) {
        gallerySwipeStart = null;
    }

    if (galleryViewport.hasPointerCapture(e.pointerId)) {
        galleryViewport.releasePointerCapture(e.pointerId);
    }
});

galleryViewport.addEventListener('pointercancel', (e) => {
    galleryImageWrap.classList.remove('no-transition');
    galleryViewport.classList.remove('is-dragging');
    galleryPanStart = null;
    gallerySwipeStart = null;
});

galleryViewport.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
        galleryPinchStartDistance = getTouchDistance(e.touches);
        galleryPinchStartScale = galleryScale;
        galleryPanStart = null;
        gallerySwipeStart = null;
        galleryImageWrap.classList.add('no-transition');
    } else if (e.touches.length === 1) {
        const now = Date.now();
        if (now - galleryLastTap < 300) {
            e.preventDefault();
            toggleGalleryZoom(e.touches[0].clientX, e.touches[0].clientY);
            galleryLastTap = 0;
        } else {
            galleryLastTap = now;
        }
    }
}, { passive: false });

galleryViewport.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
        e.preventDefault();
        const distance = getTouchDistance(e.touches);
        const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        const nextScale = galleryPinchStartScale * (distance / galleryPinchStartDistance);
        setGalleryZoom(nextScale, midX, midY);
    }
}, { passive: false });

galleryViewport.addEventListener('touchend', () => {
    galleryImageWrap.classList.remove('no-transition');
    galleryPinchStartDistance = 0;
});

document.addEventListener('keydown', (e) => {
    if (galleryDialog.classList.contains('hidden')) return;

    if (e.key === 'Escape') {
        closeGallery();
    } else if (e.key === 'ArrowLeft') {
        showGalleryImage(galleryIndex - 1);
    } else if (e.key === 'ArrowRight') {
        showGalleryImage(galleryIndex + 1);
    } else if (e.key === '+' || e.key === '=') {
        const rect = galleryViewport.getBoundingClientRect();
        setGalleryZoom(galleryScale + 0.25, rect.left + rect.width / 2, rect.top + rect.height / 2);
    } else if (e.key === '-') {
        const rect = galleryViewport.getBoundingClientRect();
        setGalleryZoom(galleryScale - 0.25, rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
});

