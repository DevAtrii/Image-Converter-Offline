const STORAGE_KEY = 'imageSvgToImageSettings';
const ANDROID_NS = 'http://schemas.android.com/apk/res/android';
const MAX_DIM = 8192;
const ACCEPT_EXT = /\.(svg|xml)$/i;

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
const svgCode = document.getElementById('svgCode');
const addCodeBtn = document.getElementById('addCodeBtn');
const clearCodeBtn = document.getElementById('clearCodeBtn');
const codeStatus = document.getElementById('codeStatus');
const outWidthInput = document.getElementById('outWidth');
const outHeightInput = document.getElementById('outHeight');
const maxSize = document.getElementById('maxSize');
const qualityValue = document.getElementById('qualityValue');
const scaleValue = document.getElementById('scaleValue');
const sizePresets = document.getElementById('sizePresets');
const selectAllBtn = document.getElementById('selectAllBtn');
const deselectAllBtn = document.getElementById('deselectAllBtn');
const convertSelectedBtn = document.getElementById('convertSelectedBtn');

const toFormatRoot = document.getElementById('toFormat');
const qualityRoot = document.getElementById('quality');
const scaleRoot = document.getElementById('scale');
const toFormat = initCustomSelect(toFormatRoot, FORMAT_OPTIONS, 'image/png');
const quality = initCustomSlider(qualityRoot, { min: 1, max: 100, value: 90, step: 1 });
const scale = initCustomSlider(scaleRoot, { min: 10, max: 400, value: 100, step: 1 });

let items = [];
let pendingDownloads = [];
const conversionResults = new Map();
let pasteCount = 0;
let gradSeq = 0;
let clipSeq = 0;

function escapeXml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function parseDim(raw) {
    if (raw == null || raw === '') return null;
    const n = parseFloat(String(raw).replace(/[^\d.eE+-]/g, ''));
    return Number.isFinite(n) && n > 0 ? n : null;
}

function androidAttr(el, name) {
    return el.getAttributeNS(ANDROID_NS, name)
        || el.getAttribute('android:' + name)
        || '';
}

function androidColorToSvg(color) {
    if (!color) return { hex: 'none', opacity: 1 };
    const raw = color.trim();
    const named = {
        '@android:color/transparent': { hex: 'none', opacity: 1 },
        '@android:color/white': { hex: '#FFFFFF', opacity: 1 },
        '@android:color/black': { hex: '#000000', opacity: 1 },
        '@android:color/holo_blue_dark': { hex: '#0099CC', opacity: 1 }
    };
    if (named[raw]) return named[raw];
    if (raw.startsWith('@') || raw.startsWith('?')) {
        return { hex: '#000000', opacity: 1 };
    }
    let hex = raw.startsWith('#') ? raw.slice(1) : raw;
    if (/^[0-9a-fA-F]{3}$/.test(hex)) {
        return { hex: '#' + hex.split('').map(c => c + c).join(''), opacity: 1 };
    }
    if (/^[0-9a-fA-F]{4}$/.test(hex)) {
        const a = parseInt(hex[0] + hex[0], 16) / 255;
        return {
            hex: '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3],
            opacity: a
        };
    }
    if (/^[0-9a-fA-F]{6}$/.test(hex)) {
        return { hex: '#' + hex, opacity: 1 };
    }
    if (/^[0-9a-fA-F]{8}$/.test(hex)) {
        return { hex: '#' + hex.slice(2), opacity: parseInt(hex.slice(0, 2), 16) / 255 };
    }
    return { hex: raw, opacity: 1 };
}

function findGradient(el, attrName) {
    for (const child of el.children) {
        if (child.localName.toLowerCase() !== 'attr') continue;
        const name = child.getAttribute('name') || '';
        if (name !== attrName && name !== attrName.replace(/^android:/, '')) continue;
        for (const g of child.children) {
            if (g.localName.toLowerCase() === 'gradient') return g;
        }
    }
    return null;
}

function gradientToSvg(gradEl, defs) {
    const id = 'g' + (++gradSeq);
    const type = (androidAttr(gradEl, 'type') || 'linear').toLowerCase();
    const tileMap = { clamp: 'pad', repeat: 'repeat', mirror: 'reflect' };
    const tile = tileMap[androidAttr(gradEl, 'tileMode')] || 'pad';
    const stops = [...gradEl.children]
        .filter(c => c.localName.toLowerCase() === 'item')
        .map(item => {
            const off = androidAttr(item, 'offset') || '0';
            const col = androidColorToSvg(androidAttr(item, 'color'));
            return `<stop offset="${escapeXml(off)}" stop-color="${col.hex}" stop-opacity="${col.opacity}"/>`;
        })
        .join('');

    if (type === 'radial') {
        const cx = androidAttr(gradEl, 'centerX') || '0';
        const cy = androidAttr(gradEl, 'centerY') || '0';
        const r = androidAttr(gradEl, 'gradientRadius') || '1';
        defs.push(`<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${escapeXml(cx)}" cy="${escapeXml(cy)}" r="${escapeXml(r)}" spreadMethod="${tile}">${stops}</radialGradient>`);
    } else {
        const x1 = androidAttr(gradEl, 'startX') || '0';
        const y1 = androidAttr(gradEl, 'startY') || '0';
        const x2 = androidAttr(gradEl, 'endX') || '0';
        const y2 = androidAttr(gradEl, 'endY') || '0';
        defs.push(`<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${escapeXml(x1)}" y1="${escapeXml(y1)}" x2="${escapeXml(x2)}" y2="${escapeXml(y2)}" spreadMethod="${tile}">${stops}</linearGradient>`);
    }
    return `url(#${id})`;
}

function groupTransform(el) {
    const tx = parseFloat(androidAttr(el, 'translateX') || '0') || 0;
    const ty = parseFloat(androidAttr(el, 'translateY') || '0') || 0;
    const rot = parseFloat(androidAttr(el, 'rotation') || '0') || 0;
    const px = parseFloat(androidAttr(el, 'pivotX') || '0') || 0;
    const py = parseFloat(androidAttr(el, 'pivotY') || '0') || 0;
    const sx = androidAttr(el, 'scaleX');
    const sy = androidAttr(el, 'scaleY');
    const scaleX = sx === '' ? 1 : parseFloat(sx);
    const scaleY = sy === '' ? 1 : parseFloat(sy);
    const parts = [];
    if (tx || ty) parts.push(`translate(${tx} ${ty})`);
    if (rot) parts.push(`rotate(${rot} ${px} ${py})`);
    if (scaleX !== 1 || scaleY !== 1) {
        parts.push(`translate(${px} ${py}) scale(${scaleX} ${scaleY}) translate(${-px} ${-py})`);
    }
    return parts.join(' ');
}

function paintAttrs(el, defs, kind) {
    const attrName = kind === 'fill' ? 'android:fillColor' : 'android:strokeColor';
    const grad = findGradient(el, attrName);
    if (grad) return { value: gradientToSvg(grad, defs), opacity: 1 };
    const raw = androidAttr(el, kind === 'fill' ? 'fillColor' : 'strokeColor');
    if (!raw) return { value: 'none', opacity: 1 };
    const color = androidColorToSvg(raw);
    const extra = parseFloat(androidAttr(el, kind === 'fill' ? 'fillAlpha' : 'strokeAlpha') || '1');
    const alpha = color.opacity * (Number.isFinite(extra) ? extra : 1);
    return { value: color.hex, opacity: alpha };
}

function pathToSvg(el, defs, tint) {
    const d = androidAttr(el, 'pathData');
    if (!d) return '';
    const fill = paintAttrs(el, defs, 'fill');
    const stroke = paintAttrs(el, defs, 'stroke');
    const strokeWidth = androidAttr(el, 'strokeWidth');
    const fillType = (androidAttr(el, 'fillType') || 'nonZero').toLowerCase();
    const cap = androidAttr(el, 'strokeLineCap');
    const join = androidAttr(el, 'strokeLineJoin');
    const miter = androidAttr(el, 'strokeMiterLimit');

    let fillValue = fill.value;
    let strokeValue = stroke.value;
    if (tint && tint !== 'none') {
        if (fillValue !== 'none') fillValue = tint;
        if (strokeValue !== 'none') strokeValue = tint;
    }

    let attrs = ` d="${escapeXml(d)}" fill="${fillValue}"`;
    if (fillValue !== 'none' && fill.opacity < 0.999) attrs += ` fill-opacity="${fill.opacity}"`;
    if (fillType === 'evenodd') attrs += ' fill-rule="evenodd"';
    if (strokeValue !== 'none' && strokeWidth && parseFloat(strokeWidth) > 0) {
        attrs += ` stroke="${strokeValue}" stroke-width="${escapeXml(strokeWidth)}"`;
        if (stroke.opacity < 0.999) attrs += ` stroke-opacity="${stroke.opacity}"`;
        if (cap) attrs += ` stroke-linecap="${escapeXml(cap)}"`;
        if (join) attrs += ` stroke-linejoin="${escapeXml(join)}"`;
        if (miter) attrs += ` stroke-miterlimit="${escapeXml(miter)}"`;
    } else {
        attrs += ' stroke="none"';
    }
    return `<path${attrs}/>`;
}

function walkVector(el, defs, tint) {
    const tag = el.localName.toLowerCase();
    if (tag === 'path') return pathToSvg(el, defs, tint);
    if (tag === 'clip-path' || tag === 'clippath') return '';
    if (tag === 'group') {
        const clips = [...el.children].filter(c => {
            const n = c.localName.toLowerCase();
            return n === 'clip-path' || n === 'clippath';
        });
        let clipAttr = '';
        if (clips.length) {
            const id = 'c' + (++clipSeq);
            const paths = clips.map(c => {
                const d = androidAttr(c, 'pathData');
                return d ? `<path d="${escapeXml(d)}"/>` : '';
            }).join('');
            defs.push(`<clipPath id="${id}">${paths}</clipPath>`);
            clipAttr = ` clip-path="url(#${id})"`;
        }
        const transform = groupTransform(el);
        const tAttr = transform ? ` transform="${escapeXml(transform)}"` : '';
        const inner = [...el.children]
            .filter(c => {
                const n = c.localName.toLowerCase();
                return n !== 'clip-path' && n !== 'clippath';
            })
            .map(c => walkVector(c, defs, tint))
            .join('');
        return `<g${tAttr}${clipAttr}>${inner}</g>`;
    }
    return [...el.children].map(c => walkVector(c, defs, tint)).join('');
}

function vectorToSvg(vectorEl) {
    gradSeq = 0;
    clipSeq = 0;
    const vw = parseDim(androidAttr(vectorEl, 'viewportWidth')) || 24;
    const vh = parseDim(androidAttr(vectorEl, 'viewportHeight')) || 24;
    const width = parseDim(androidAttr(vectorEl, 'width')) || vw;
    const height = parseDim(androidAttr(vectorEl, 'height')) || vh;
    const alpha = parseFloat(androidAttr(vectorEl, 'alpha') || '1');
    const tintRaw = androidAttr(vectorEl, 'tint');
    const tint = tintRaw ? androidColorToSvg(tintRaw).hex : '';
    const defs = [];
    const body = walkVector(vectorEl, defs, tint);
    const opacity = Number.isFinite(alpha) && alpha < 0.999 ? ` opacity="${alpha}"` : '';
    const defsBlock = defs.length ? `<defs>${defs.join('')}</defs>` : '';
    return {
        svgText: `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${vw} ${vh}"${opacity}>${defsBlock}${body}</svg>`,
        width,
        height
    };
}

function sanitizeSvg(text) {
    return text
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
}

function parseXml(text) {
    const trimmed = text.replace(/^\uFEFF/, '').trim();
    const doc = new DOMParser().parseFromString(trimmed, 'application/xml');
    const err = doc.querySelector('parsererror');
    if (err) {
        const svgDoc = new DOMParser().parseFromString(trimmed, 'image/svg+xml');
        if (svgDoc.querySelector('parsererror')) {
            throw new Error(err.textContent.split('\n')[0] || 'Invalid XML');
        }
        return svgDoc;
    }
    return doc;
}

function findRoot(doc, names) {
    const root = doc.documentElement;
    if (!root) return null;
    const local = root.localName.toLowerCase();
    if (names.includes(local)) return root;
    for (const name of names) {
        const match = doc.getElementsByTagName(name)[0]
            || doc.getElementsByTagNameNS('*', name)[0];
        if (match) return match;
    }
    return null;
}

function ensureSvgSize(svgEl) {
    const vb = svgEl.getAttribute('viewBox');
    let vw = null;
    let vh = null;
    if (vb) {
        const p = vb.trim().split(/[\s,]+/).map(Number);
        if (p.length === 4 && p[2] > 0 && p[3] > 0) {
            vw = p[2];
            vh = p[3];
        }
    }
    let width = parseDim(svgEl.getAttribute('width'));
    let height = parseDim(svgEl.getAttribute('height'));
    const wRaw = svgEl.getAttribute('width') || '';
    const hRaw = svgEl.getAttribute('height') || '';
    if (wRaw.includes('%')) width = vw;
    if (hRaw.includes('%')) height = vh;
    width = width || vw || 512;
    height = height || vh || 512;
    if (!svgEl.getAttribute('width')) svgEl.setAttribute('width', String(width));
    if (!svgEl.getAttribute('height')) svgEl.setAttribute('height', String(height));
    if (!vb) svgEl.setAttribute('viewBox', `0 0 ${width} ${height}`);
    if (!svgEl.getAttribute('xmlns')) svgEl.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    return { width, height };
}

function wrapPathData(text) {
    const d = text.trim();
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#000" d="${escapeXml(d)}"/></svg>`;
}

function normalizeMarkup(text) {
    const raw = sanitizeSvg(text.replace(/^\uFEFF/, '').trim());
    if (!raw) throw new Error('Empty code');

    const looksPath = /^[Mm]\s*-?[\d.]/.test(raw) && !raw.includes('<');
    const source = looksPath ? wrapPathData(raw) : raw;

    if (!source.includes('<')) {
        throw new Error('Not SVG or Vector XML');
    }

    const hasTag = /<(svg|vector|path|animated-vector)\b/i.test(source);
    if (!hasTag) throw new Error('Not SVG or Vector XML');

    let wrapped = source;
    if (!/<(svg|vector|animated-vector)\b/i.test(source) && /<path\b/i.test(source)) {
        wrapped = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${source}</svg>`;
    }

    const doc = parseXml(wrapped);
    const vectorEl = findRoot(doc, ['vector']);
    if (vectorEl) {
        const converted = vectorToSvg(vectorEl);
        return { kind: 'vector', svgText: converted.svgText, width: converted.width, height: converted.height };
    }

    const animated = findRoot(doc, ['animated-vector']);
    if (animated) {
        const nested = animated.getElementsByTagName('vector')[0]
            || animated.getElementsByTagNameNS('*', 'vector')[0];
        if (!nested) throw new Error('animated-vector has no nested <vector>');
        const converted = vectorToSvg(nested);
        return { kind: 'vector', svgText: converted.svgText, width: converted.width, height: converted.height };
    }

    const svgEl = findRoot(doc, ['svg']);
    if (!svgEl) throw new Error('No <svg> or <vector> root');
    const size = ensureSvgSize(svgEl);
    if (!svgEl.getAttribute('xmlns')) {
        svgEl.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    }
    const serializer = new XMLSerializer();
    let svgText = serializer.serializeToString(svgEl);
    if (!svgText.includes('xmlns=')) {
        svgText = svgText.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    return { kind: 'svg', svgText, width: size.width, height: size.height };
}

function isAcceptableFile(file) {
    const name = file.name || '';
    const type = (file.type || '').toLowerCase();
    if (ACCEPT_EXT.test(name)) return true;
    if (type.includes('svg') || type.includes('xml')) return true;
    return false;
}

function readFileText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.onload = () => resolve(String(reader.result || ''));
        reader.readAsText(file);
    });
}

function makePreviewUrl(svgText) {
    return URL.createObjectURL(new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' }));
}

function revokeItem(item) {
    if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
}

function saveSettings() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        to: toFormat.value,
        quality: quality.value,
        scale: scale.value,
        maxSize: maxSize.value,
        width: outWidthInput.value,
        height: outHeightInput.value
    }));
}

function loadSettings() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (!saved) return;
        if (saved.to && toFormat.hasOption(saved.to)) toFormat.value = saved.to;
        if (saved.quality) quality.setValue(Number(saved.quality), false);
        if (saved.scale) scale.setValue(Number(saved.scale), false);
        if (saved.maxSize) maxSize.value = saved.maxSize;
        if (saved.width) outWidthInput.value = saved.width;
        if (saved.height) outHeightInput.value = saved.height;
    } catch (_) {}
    qualityValue.textContent = `${quality.value}%`;
    scaleValue.textContent = `${scale.value}%`;
    syncPresetButtons();
}

function syncPresetButtons() {
    const w = outWidthInput.value.trim();
    const h = outHeightInput.value.trim();
    const square = w && w === h ? w : (w && !h ? w : '');
    sizePresets.querySelectorAll('.svg-preset-btn').forEach(btn => {
        const size = btn.dataset.size;
        btn.classList.toggle('is-active', size === '' ? !w && !h : size === square && (!h || h === w));
    });
}

function updateUploadActions() {
    const hasItems = items.length > 0;
    convertOnlyBtn.disabled = !hasItems;
    convertBtn.disabled = !hasItems;
    dropZone.classList.toggle('has-images', hasItems);
    mainContent.classList.toggle('has-images', hasItems);
    selectActions.classList.toggle('hidden', !hasItems);
}

function resetPendingDownload() {
    pendingDownloads = [];
    downloadBtn.classList.add('hidden');
}

function setCodeStatus(message, kind) {
    codeStatus.textContent = message || '';
    codeStatus.classList.toggle('is-error', kind === 'error');
    codeStatus.classList.toggle('is-ok', kind === 'ok');
}

function getSizeMeta(index) {
    const item = items[index];
    const result = conversionResults.get(index);
    const original = formatFileSize(item.sourceSize);
    if (item.error) {
        return `<div class="preview-size">${escapeXml(item.error)}</div>`;
    }
    if (!result) {
        return `<div class="preview-size">${original} · ${Math.round(item.width)}×${Math.round(item.height)}</div>`;
    }
    const savings = item.sourceSize > result.convertedSize
        ? ` (−${Math.round((1 - result.convertedSize / item.sourceSize) * 100)}%)`
        : '';
    return `
        <div class="preview-size">${original} → ${formatFileSize(result.convertedSize)}${savings}</div>
        <div class="preview-size converted">Converted</div>
    `;
}

function updatePreview() {
    preview.innerHTML = '';
    items.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'preview-item' + (item.error ? ' is-error' : '');
        div.dataset.index = String(index);
        const kindLabel = item.error ? 'Error' : (item.kind === 'vector' ? 'Vector XML' : 'SVG');
        div.innerHTML = `
            <input type="checkbox" class="preview-checkbox select-image" data-index="${index}" ${item.error ? 'disabled' : ''}>
            <div class="preview-thumb-wrap">
                ${item.previewUrl ? `<img src="${item.previewUrl}" alt="${escapeXml(item.name)}">` : ''}
            </div>
            <div class="preview-actions">
                <button class="btn btn-success btn-icon btn-sm" type="button" data-action="download" data-index="${index}" title="Convert & download" ${item.error ? 'disabled' : ''}>
                    ${icon('download', 14)}
                </button>
                <button class="btn btn-destructive btn-icon btn-sm" type="button" data-action="remove" data-index="${index}" title="Remove">
                    ${icon('x', 14)}
                </button>
            </div>
            <div class="preview-meta">
                <div class="preview-name" title="${escapeXml(item.name)}">${escapeXml(item.name)}</div>
                <div class="preview-kind">${kindLabel}</div>
                ${getSizeMeta(index)}
            </div>
        `;
        preview.appendChild(div);
    });
    updateConvertSelectedState();
}

function refreshPreviewMeta(index) {
    const itemEl = preview.querySelector(`.preview-item[data-index="${index}"]`);
    if (!itemEl) return;
    const meta = itemEl.querySelector('.preview-meta');
    const item = items[index];
    const kindLabel = item.error ? 'Error' : (item.kind === 'vector' ? 'Vector XML' : 'SVG');
    meta.innerHTML = `
        <div class="preview-name" title="${escapeXml(item.name)}">${escapeXml(item.name)}</div>
        <div class="preview-kind">${kindLabel}</div>
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
        const item = items[index];
        if (!item) return;
        const before = formatFileSize(item.sourceSize);
        const after = formatFileSize(result.convertedSize);
        const savings = item.sourceSize > result.convertedSize
            ? `<span class="result-savings">−${Math.round((1 - result.convertedSize / item.sourceSize) * 100)}%</span>`
            : '';
        const row = document.createElement('div');
        row.className = 'result-item';
        row.innerHTML = `
            <span class="result-name" title="${escapeXml(item.name)}">${escapeXml(item.name)}</span>
            <span class="result-sizes">
                ${before}
                <span class="arrow">→</span>
                <span class="after">${after}</span>
                ${savings}
            </span>
        `;
        resultsList.appendChild(row);
    });
}

function outputExtension() {
    return toFormat.value.split('/')[1];
}

function getConvertedFileName(item) {
    const base = item.name.replace(/\.(svg|xml)$/i, '');
    return `${base}.${outputExtension()}`;
}

function uniqueName(name) {
    const existing = new Set(items.map(i => i.name.toLowerCase()));
    if (!existing.has(name.toLowerCase())) return name;
    const dot = name.lastIndexOf('.');
    const stem = dot > 0 ? name.slice(0, dot) : name;
    const ext = dot > 0 ? name.slice(dot) : '';
    let n = 2;
    while (existing.has(`${stem}-${n}${ext}`.toLowerCase())) n += 1;
    return `${stem}-${n}${ext}`;
}

async function addFromText(text, fileName, sourceSize) {
    const normalized = normalizeMarkup(text);
    const item = {
        name: uniqueName(fileName),
        kind: normalized.kind,
        svgText: normalized.svgText,
        width: normalized.width,
        height: normalized.height,
        sourceSize: sourceSize || new Blob([text]).size,
        previewUrl: makePreviewUrl(normalized.svgText),
        error: ''
    };
    items.push(item);
}

async function handleFiles(fileList) {
    const files = Array.from(fileList || []).filter(isAcceptableFile);
    const skipped = Array.from(fileList || []).length - files.length;
    if (skipped > 0 && files.length === 0) {
        alert('Drop .svg or Android Vector Drawable .xml files');
        return;
    }

    let failed = 0;
    for (const file of files) {
        try {
            const text = await readFileText(file);
            await addFromText(text, file.name, file.size);
        } catch (error) {
            failed += 1;
            items.push({
                name: uniqueName(file.name),
                kind: 'svg',
                svgText: '',
                width: 0,
                height: 0,
                sourceSize: file.size,
                previewUrl: '',
                error: error.message || 'Parse failed'
            });
        }
    }

    conversionResults.clear();
    resetPendingDownload();
    updatePreview();
    updateResults();
    updateUploadActions();
    if (failed && files.length === failed) {
        setCodeStatus(items[items.length - 1]?.error || 'Parse failed', 'error');
    }
}

function addFromCode() {
    const text = svgCode.value;
    setCodeStatus('');
    try {
        pasteCount += 1;
        const looksVector = /<vector\b/i.test(text);
        const name = looksVector ? `pasted-${pasteCount}.xml` : `pasted-${pasteCount}.svg`;
        addFromText(text, name, new Blob([text]).size).then(() => {
            conversionResults.clear();
            resetPendingDownload();
            updatePreview();
            updateResults();
            updateUploadActions();
            setCodeStatus('Added', 'ok');
        }).catch(error => {
            pasteCount -= 1;
            setCodeStatus(error.message || 'Invalid code', 'error');
        });
    } catch (error) {
        pasteCount -= 1;
        setCodeStatus(error.message || 'Invalid code', 'error');
    }
}

function removeItem(index) {
    revokeItem(items[index]);
    items.splice(index, 1);
    conversionResults.clear();
    resetPendingDownload();
    updatePreview();
    updateResults();
    updateUploadActions();
}

function clampDim(n) {
    return Math.max(1, Math.min(MAX_DIM, Math.round(n)));
}

function targetSize(item) {
    const scalePct = scale.value / 100;
    let width = item.width * scalePct;
    let height = item.height * scalePct;
    const ow = parseDim(outWidthInput.value);
    const oh = parseDim(outHeightInput.value);
    if (ow && oh) {
        width = ow * scalePct;
        height = oh * scalePct;
    } else if (ow) {
        const ratio = item.height / item.width;
        width = ow * scalePct;
        height = ow * ratio * scalePct;
    } else if (oh) {
        const ratio = item.width / item.height;
        height = oh * scalePct;
        width = oh * ratio * scalePct;
    }
    return { width: clampDim(width), height: clampDim(height) };
}

function loadSvgImage(svgText) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' }));
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to rasterize SVG'));
        };
        img.src = url;
    });
}

async function convertItem(item) {
    const img = await loadSvgImage(item.svgText);
    const mime = toFormat.value;
    let currentQuality = quality.value / 100;
    let { width, height } = targetSize(item);

    async function encode(w, h, q) {
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (mime === 'image/jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, w, h);
        }
        ctx.drawImage(img, 0, 0, w, h);
        const blob = await new Promise(r => canvas.toBlob(r, mime, q));
        if (!blob) throw new Error('Export failed');
        return blob;
    }

    let blob = await encode(width, height, currentQuality);
    const maxBytes = parseInt(maxSize.value, 10) * 1024;
    while (maxBytes > 0 && blob.size > maxBytes && currentQuality > 0.1) {
        currentQuality -= 0.1;
        width = clampDim(width * 0.9);
        height = clampDim(height * 0.9);
        blob = await encode(width, height, currentQuality);
    }
    return { blob, convertedSize: blob.size };
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
    a.download = `svg-to-${outputExtension()}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

async function downloadConvertedFiles(downloads) {
    if (downloads.length === 1) {
        downloadSingleFile(downloads[0].blob, downloads[0].fileName);
        return;
    }
    const zip = new JSZip();
    downloads.forEach(({ blob, fileName }) => zip.file(fileName, blob));
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadZip(zipBlob);
}

function convertibleIndexes(indexes) {
    return indexes.filter(i => items[i] && !items[i].error);
}

async function convertIndexes(indexes, { download } = { download: true }) {
    const valid = convertibleIndexes(indexes);
    if (valid.length === 0) throw new Error('No valid vectors to convert');
    const downloads = [];
    for (const index of valid) {
        const item = items[index];
        const { blob, convertedSize } = await convertItem(item);
        recordConversion(index, convertedSize);
        downloads.push({ blob, fileName: getConvertedFileName(item) });
    }
    if (download) await downloadConvertedFiles(downloads);
    return downloads;
}

async function convertAndDownloadSingle(index) {
    try {
        await convertIndexes([index], { download: true });
    } catch (error) {
        console.error('Conversion failed:', error);
        alert(error.message || 'Conversion failed. Please try again.');
    }
}

function getSelectedIndexes() {
    return Array.from(document.querySelectorAll('.select-image:checked'))
        .map(box => parseInt(box.dataset.index, 10));
}

function updateConvertSelectedState() {
    convertSelectedBtn.disabled = getSelectedIndexes().length === 0;
}

function setMainDragover(active) {
    mainContent.classList.toggle('is-dragover', active);
}

preview.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const index = parseInt(btn.dataset.index, 10);
    if (btn.dataset.action === 'remove') removeItem(index);
    if (btn.dataset.action === 'download') convertAndDownloadSingle(index);
});

preview.addEventListener('change', (e) => {
    if (e.target.classList.contains('select-image')) updateConvertSelectedState();
});

selectAllBtn.addEventListener('click', () => {
    document.querySelectorAll('.select-image:not(:disabled)').forEach(box => {
        box.checked = true;
    });
    updateConvertSelectedState();
});

deselectAllBtn.addEventListener('click', () => {
    document.querySelectorAll('.select-image').forEach(box => {
        box.checked = false;
    });
    updateConvertSelectedState();
});

convertSelectedBtn.addEventListener('click', async () => {
    const indexes = getSelectedIndexes();
    if (indexes.length === 0) return;
    progress.classList.add('active');
    convertSelectedBtn.disabled = true;
    try {
        await convertIndexes(indexes, { download: true });
    } catch (error) {
        console.error('Conversion failed:', error);
        alert(error.message || 'Conversion failed. Please try again.');
    }
    progress.classList.remove('active');
    updateConvertSelectedState();
});

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
    const text = e.dataTransfer.getData('text/plain');
    if ((!e.dataTransfer.files || e.dataTransfer.files.length === 0) && text && /<(svg|vector)\b/i.test(text)) {
        svgCode.value = text;
        addFromCode();
        return;
    }
    handleFiles(e.dataTransfer.files);
});

mainContent.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (items.length > 0) setMainDragover(true);
});
mainContent.addEventListener('dragleave', (e) => {
    if (!mainContent.contains(e.relatedTarget)) setMainDragover(false);
});
mainContent.addEventListener('drop', (e) => {
    if (e.target.closest('#dropZone') || e.target.closest('#svgCode')) return;
    e.preventDefault();
    setMainDragover(false);
    handleFiles(e.dataTransfer.files);
});

fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
    fileInput.value = '';
});

addCodeBtn.addEventListener('click', addFromCode);
clearCodeBtn.addEventListener('click', () => {
    svgCode.value = '';
    setCodeStatus('');
});

svgCode.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        addFromCode();
    }
});

document.addEventListener('paste', (e) => {
    const target = e.target;
    if (target && (target.closest('input') || target.closest('textarea'))) return;
    const text = e.clipboardData?.getData('text/plain') || '';
    if (!/<(svg|vector|path)\b/i.test(text) && !/^[Mm]\s*-?[\d.]/.test(text.trim())) return;
    e.preventDefault();
    svgCode.value = text;
    addFromCode();
});

convertOnlyBtn.addEventListener('click', async () => {
    progress.classList.add('active');
    convertOnlyBtn.disabled = true;
    convertBtn.disabled = true;
    try {
        pendingDownloads = await convertIndexes(items.map((_, i) => i), { download: false });
        downloadBtn.classList.remove('hidden');
    } catch (error) {
        console.error('Conversion failed:', error);
        alert(error.message || 'Conversion failed. Please try again.');
    }
    progress.classList.remove('active');
    updateUploadActions();
});

convertBtn.addEventListener('click', async () => {
    progress.classList.add('active');
    convertOnlyBtn.disabled = true;
    convertBtn.disabled = true;
    try {
        pendingDownloads = await convertIndexes(items.map((_, i) => i), { download: true });
        downloadBtn.classList.remove('hidden');
    } catch (error) {
        console.error('Conversion failed:', error);
        alert(error.message || 'Conversion failed. Please try again.');
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

toFormatRoot.addEventListener('change', () => {
    saveSettings();
    conversionResults.clear();
    resetPendingDownload();
    updatePreview();
    updateResults();
});

qualityRoot.addEventListener('input', () => {
    qualityValue.textContent = `${quality.value}%`;
});
qualityRoot.addEventListener('change', saveSettings);
scaleRoot.addEventListener('input', () => {
    scaleValue.textContent = `${scale.value}%`;
});
scaleRoot.addEventListener('change', saveSettings);
maxSize.addEventListener('change', saveSettings);
outWidthInput.addEventListener('input', () => {
    syncPresetButtons();
    saveSettings();
});
outHeightInput.addEventListener('input', () => {
    syncPresetButtons();
    saveSettings();
});

sizePresets.addEventListener('click', (e) => {
    const btn = e.target.closest('.svg-preset-btn');
    if (!btn) return;
    const size = btn.dataset.size;
    if (size) {
        outWidthInput.value = size;
        outHeightInput.value = size;
    } else {
        outWidthInput.value = '';
        outHeightInput.value = '';
    }
    syncPresetButtons();
    saveSettings();
});

loadSettings();
updateUploadActions();
