const STORAGE_KEY = 'imageIconMakerSettings';
const PACK_KEY = 'imageIconMakerIconPack';
const ALL_PACKS_KEY = '__all__';
const MASTER = 1024;
const PREVIEW = 320;
const MONO_COLOR = '#14532d';

const DEFAULT_HEART_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;

const FALLBACK_FONTS = [
    { family: 'Inter', weights: [400, 500, 600, 700, 800, 900], styles: ['normal', 'italic'] },
    { family: 'Roboto', weights: [100, 300, 400, 500, 700, 900], styles: ['normal', 'italic'] },
    { family: 'Open Sans', weights: [300, 400, 500, 600, 700, 800], styles: ['normal', 'italic'] },
    { family: 'Lato', weights: [100, 300, 400, 700, 900], styles: ['normal', 'italic'] },
    { family: 'Montserrat', weights: [400, 500, 600, 700, 800, 900], styles: ['normal', 'italic'] },
    { family: 'Poppins', weights: [400, 500, 600, 700, 800], styles: ['normal', 'italic'] },
    { family: 'Nunito', weights: [400, 600, 700, 800], styles: ['normal', 'italic'] },
    { family: 'Oswald', weights: [400, 500, 600, 700], styles: ['normal'] },
    { family: 'Raleway', weights: [400, 500, 600, 700, 800], styles: ['normal', 'italic'] },
    { family: 'Playfair Display', weights: [400, 500, 600, 700, 800, 900], styles: ['normal', 'italic'] },
    { family: 'Merriweather', weights: [300, 400, 700, 900], styles: ['normal', 'italic'] },
    { family: 'Source Sans 3', weights: [400, 500, 600, 700], styles: ['normal', 'italic'] },
    { family: 'Ubuntu', weights: [300, 400, 500, 700], styles: ['normal', 'italic'] },
    { family: 'Rubik', weights: [400, 500, 600, 700], styles: ['normal', 'italic'] },
    { family: 'Work Sans', weights: [400, 500, 600, 700], styles: ['normal', 'italic'] },
    { family: 'Noto Sans', weights: [400, 500, 600, 700], styles: ['normal', 'italic'] },
    { family: 'PT Sans', weights: [400, 700], styles: ['normal', 'italic'] },
    { family: 'Kanit', weights: [400, 500, 600, 700], styles: ['normal', 'italic'] },
    { family: 'Barlow', weights: [400, 500, 600, 700], styles: ['normal', 'italic'] },
    { family: 'Manrope', weights: [400, 500, 600, 700, 800], styles: ['normal'] },
    { family: 'Outfit', weights: [400, 500, 600, 700], styles: ['normal'] },
    { family: 'DM Sans', weights: [400, 500, 700], styles: ['normal', 'italic'] },
    { family: 'Space Grotesk', weights: [400, 500, 600, 700], styles: ['normal'] },
    { family: 'Josefin Sans', weights: [400, 500, 600, 700], styles: ['normal', 'italic'] },
    { family: 'Libre Baskerville', weights: [400, 700], styles: ['normal', 'italic'] },
    { family: 'Bebas Neue', weights: [400], styles: ['normal'] },
    { family: 'Pacifico', weights: [400], styles: ['normal'] },
    { family: 'Lobster', weights: [400], styles: ['normal'] },
    { family: 'Dancing Script', weights: [400, 500, 600, 700], styles: ['normal'] },
    { family: 'Inconsolata', weights: [400, 500, 600, 700], styles: ['normal'] },
    { family: 'Fira Code', weights: [400, 500, 600, 700], styles: ['normal'] },
    { family: 'Comfortaa', weights: [400, 500, 600, 700], styles: ['normal'] },
    { family: 'Quicksand', weights: [400, 500, 600, 700], styles: ['normal'] },
    { family: 'Archivo', weights: [400, 500, 600, 700], styles: ['normal', 'italic'] },
    { family: 'Karla', weights: [400, 500, 600, 700], styles: ['normal', 'italic'] },
    { family: 'IBM Plex Sans', weights: [400, 500, 600, 700], styles: ['normal', 'italic'] },
    { family: 'Figtree', weights: [400, 500, 600, 700], styles: ['normal'] },
    { family: 'Sora', weights: [400, 500, 600, 700], styles: ['normal'] },
    { family: 'Lexend', weights: [400, 500, 600, 700], styles: ['normal'] },
    { family: 'Plus Jakarta Sans', weights: [400, 500, 600, 700], styles: ['normal', 'italic'] }
];

const WEIGHT_LABELS = {
    100: 'Thin', 200: 'Extra Light', 300: 'Light', 400: 'Regular',
    500: 'Medium', 600: 'Semi Bold', 700: 'Bold', 800: 'Extra Bold', 900: 'Black'
};

const EFFECT_DEFAULTS = {
    dropShadow: { type: 'dropShadow', blur: 24, offsetX: 0, offsetY: 18, opacity: 0.45, color: '#000000' },
    castShadow: { type: 'castShadow', blur: 8, length: 110, angle: 45, opacity: 0.35, color: '#000000' },
    bevel: { type: 'bevel', angle: 135 }
};

const EFFECT_LABELS = {
    dropShadow: 'Drop Shadow',
    castShadow: 'Cast Shadow',
    bevel: 'Bevel',
    liquidGlass: 'Bevel'
};

const ANDROID_STOCK = [
    { name: 'Phone', color: '#22c55e', icon: 'phone' },
    { name: 'Messages', color: '#38bdf8', icon: 'message-circle' },
    { name: 'Camera', color: '#64748b', icon: 'camera' },
    { name: 'Photos', color: '#f59e0b', icon: 'image' },
    { name: 'Chrome', color: '#3b82f6', icon: 'globe' },
    { name: 'Maps', color: '#10b981', icon: 'map' },
    { name: 'YouTube', color: '#ef4444', icon: 'play' },
    { name: 'Gmail', color: '#f43f5e', icon: 'mail' },
    { name: 'Clock', color: '#6366f1', icon: 'clock' },
    { name: 'Files', color: '#eab308', icon: 'folder' },
    { name: 'Settings', color: '#94a3b8', icon: 'settings' },
    { name: 'Play', color: '#84cc16', icon: 'gamepad-2' },
    { name: 'Music', color: '#ec4899', icon: 'music' },
    { name: 'Weather', color: '#0ea5e9', icon: 'cloud-sun' },
    { name: 'Notes', color: '#f97316', icon: 'sticky-note' }
];

const IOS_STOCK = [
    { name: 'Calendar', color: '#ffffff', icon: 'calendar', fg: '#ef4444' },
    { name: 'Photos', color: '#f59e0b', icon: 'image' },
    { name: 'Camera', color: '#64748b', icon: 'camera' },
    { name: 'Mail', color: '#3b82f6', icon: 'mail' },
    { name: 'Maps', color: '#22c55e', icon: 'map' },
    { name: 'Clock', color: '#000000', icon: 'clock' },
    { name: 'Weather', color: '#38bdf8', icon: 'cloud-sun' },
    { name: 'Notes', color: '#eab308', icon: 'sticky-note' },
    { name: 'Reminders', color: '#ffffff', icon: 'list-checks', fg: '#2563eb' },
    { name: 'News', color: '#ef4444', icon: 'newspaper' },
    { name: 'TV', color: '#111827', icon: 'tv' },
    { name: 'Podcasts', color: '#9333ea', icon: 'podcast' },
    { name: 'App Store', color: '#3b82f6', icon: 'layout-grid' },
    { name: 'Settings', color: '#94a3b8', icon: 'settings' },
    { name: 'Health', color: '#ffffff', icon: 'heart', fg: '#f43f5e' }
];

const IOS_DOCK = [
    { name: 'Phone', color: '#22c55e', icon: 'phone' },
    { name: 'Safari', color: '#38bdf8', icon: 'compass' },
    { name: 'Messages', color: '#4ade80', icon: 'message-circle' },
    { name: 'Music', color: '#ec4899', icon: 'music' }
];

const ANDROID_DENSITIES = [
    { name: 'mdpi', scale: 1 },
    { name: 'hdpi', scale: 1.5 },
    { name: 'xhdpi', scale: 2 },
    { name: 'xxhdpi', scale: 3 },
    { name: 'xxxhdpi', scale: 4 }
];
const ANDROID_ADAPTIVE_DP = 108;
const ANDROID_SAFE_DP = 72;

const IOS_ICONS = [
    { filename: 'AppIcon@2x.png', size: 120 },
    { filename: 'AppIcon@3x.png', size: 180 },
    { filename: 'AppIcon~ipad.png', size: 76 },
    { filename: 'AppIcon@2x~ipad.png', size: 152 },
    { filename: 'AppIcon-83.5@2x~ipad.png', size: 167 },
    { filename: 'AppIcon-40@2x.png', size: 80 },
    { filename: 'AppIcon-40@3x.png', size: 120 },
    { filename: 'AppIcon-40~ipad.png', size: 40 },
    { filename: 'AppIcon-40@2x~ipad.png', size: 80 },
    { filename: 'AppIcon-20@2x.png', size: 40 },
    { filename: 'AppIcon-20@3x.png', size: 60 },
    { filename: 'AppIcon-20~ipad.png', size: 20 },
    { filename: 'AppIcon-20@2x~ipad.png', size: 40 },
    { filename: 'AppIcon-29.png', size: 29 },
    { filename: 'AppIcon-29@2x.png', size: 58 },
    { filename: 'AppIcon-29@3x.png', size: 87 },
    { filename: 'AppIcon-29~ipad.png', size: 29 },
    { filename: 'AppIcon-29@2x~ipad.png', size: 58 },
    { filename: 'AppIcon-60@2x~car.png', size: 120 },
    { filename: 'AppIcon-60@3x~car.png', size: 180 },
    { filename: 'AppIcon~ios-marketing.png', size: 1024 }
];

const IOS_CONTENTS = {
    images: [
        { filename: 'AppIcon@2x.png', idiom: 'iphone', scale: '2x', size: '60x60' },
        { filename: 'AppIcon@3x.png', idiom: 'iphone', scale: '3x', size: '60x60' },
        { filename: 'AppIcon~ipad.png', idiom: 'ipad', scale: '1x', size: '76x76' },
        { filename: 'AppIcon@2x~ipad.png', idiom: 'ipad', scale: '2x', size: '76x76' },
        { filename: 'AppIcon-83.5@2x~ipad.png', idiom: 'ipad', scale: '2x', size: '83.5x83.5' },
        { filename: 'AppIcon-40@2x.png', idiom: 'iphone', scale: '2x', size: '40x40' },
        { filename: 'AppIcon-40@3x.png', idiom: 'iphone', scale: '3x', size: '40x40' },
        { filename: 'AppIcon-40~ipad.png', idiom: 'ipad', scale: '1x', size: '40x40' },
        { filename: 'AppIcon-40@2x~ipad.png', idiom: 'ipad', scale: '2x', size: '40x40' },
        { filename: 'AppIcon-20@2x.png', idiom: 'iphone', scale: '2x', size: '20x20' },
        { filename: 'AppIcon-20@3x.png', idiom: 'iphone', scale: '3x', size: '20x20' },
        { filename: 'AppIcon-20~ipad.png', idiom: 'ipad', scale: '1x', size: '20x20' },
        { filename: 'AppIcon-20@2x~ipad.png', idiom: 'ipad', scale: '2x', size: '20x20' },
        { filename: 'AppIcon-29.png', idiom: 'iphone', scale: '1x', size: '29x29' },
        { filename: 'AppIcon-29@2x.png', idiom: 'iphone', scale: '2x', size: '29x29' },
        { filename: 'AppIcon-29@3x.png', idiom: 'iphone', scale: '3x', size: '29x29' },
        { filename: 'AppIcon-29~ipad.png', idiom: 'ipad', scale: '1x', size: '29x29' },
        { filename: 'AppIcon-29@2x~ipad.png', idiom: 'ipad', scale: '2x', size: '29x29' },
        { filename: 'AppIcon-60@2x~car.png', idiom: 'car', scale: '2x', size: '60x60' },
        { filename: 'AppIcon-60@3x~car.png', idiom: 'car', scale: '3x', size: '60x60' },
        { filename: 'AppIcon~ios-marketing.png', idiom: 'ios-marketing', scale: '1x', size: '1024x1024' }
    ],
    info: { author: 'iconkitchen', version: 1 }
};

const ADAPTIVE_XML = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
  <background android:drawable="@mipmap/ic_launcher_background"/>
  <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
  <monochrome android:drawable="@mipmap/ic_launcher_monochrome"/>
</adaptive-icon>
`;

function defaultState() {
    return {
        contentType: 'icon',
        iconPrefix: 'mdi',
        iconName: 'heart',
        iconSvg: DEFAULT_HEART_SVG,
        text: 'Aa',
        color: '#FFFFFF',
        contentScale: 56,
        contentX: 50,
        contentY: 50,
        tintIcon: true,
        tintImage: false,
        effects: [],
        bgType: 'color',
        bgColor: '#4F46E5',
        gradientKind: 'linear',
        gradientAngle: 135,
        gradientStops: [
            { color: '#4F46E5', pos: 0 },
            { color: '#EC4899', pos: 100 }
        ],
        meshStops: [
            { color: '#4F46E5', x: 0.22, y: 0.22, r: 0.7 },
            { color: '#EC4899', x: 0.78, y: 0.24, r: 0.7 },
            { color: '#22C55E', x: 0.24, y: 0.78, r: 0.7 },
            { color: '#F59E0B', x: 0.8, y: 0.76, r: 0.7 }
        ],
        badgeEnabled: false,
        badgeText: 'NEW',
        badgeTextColor: '#FFFFFF',
        badgeBgColor: '#EF4444',
        badgeX: 50,
        badgeY: 100,
        badgeWidth: 100,
        badgeHeight: 22,
        badgeRadius: 0,
        fonts: {
            content: { family: 'Inter', style: '700' },
            badge: { family: 'Inter', style: '700' }
        },
        fontTarget: 'content',
        exportAndroid: true,
        exportIos: true,
        previewShape: 'squircle',
        themed: false,
        contentImageName: '',
        contentImageData: '',
        bgImageName: '',
        bgImageData: ''
    };
}

let state = defaultState();
let googleFonts = FALLBACK_FONTS.slice();
let collections = [];
let packIcons = [];
let packQuery = '';
let packIconCache = new Map();
let allPacksMode = false;
let allPackCursor = 0;
let allPacksLoading = false;
let searchMode = false;
let searchIcons = [];
let iconOffset = 0;
let iconGridObserver = null;
let renderTimer = null;
let renderToken = 0;
let saveTimer = null;
let fontStyleSelect = null;
let fontTargetSelect = null;
let loadedFontHrefs = new Set();
let fontReady = new Set();
let fxId = 1;
let meshSelected = 0;
let meshDragIndex = -1;
let fxDragFrom = -1;
let fxDropAt = -1;

const iconPreview = document.getElementById('iconPreview');
const progress = document.getElementById('progress');
const progressLabel = document.getElementById('progressLabel');

const contentScaleSlider = initCustomSlider(document.getElementById('contentScaleSlider'), {
    min: 20, max: 100, value: 56, step: 1
});
const contentXSlider = initCustomSlider(document.getElementById('contentXSlider'), {
    min: 0, max: 100, value: 50, step: 1
});
const contentYSlider = initCustomSlider(document.getElementById('contentYSlider'), {
    min: 0, max: 100, value: 50, step: 1
});
const gradientAngleSlider = initCustomSlider(document.getElementById('gradientAngleSlider'), {
    min: 0, max: 360, value: 135, step: 1
});
const badgeWidthSlider = initCustomSlider(document.getElementById('badgeWidthSlider'), {
    min: 20, max: 100, value: 100, step: 1
});
const badgeHeightSlider = initCustomSlider(document.getElementById('badgeHeightSlider'), {
    min: 10, max: 50, value: 22, step: 1
});

const badgeRadiusSlider = initCustomSlider(document.getElementById('badgeRadiusSlider'), {
    min: 0, max: 50, value: 0, step: 1
});

const addEffectSelect = initCustomSelect(document.getElementById('addEffectSelect'), [
    { value: 'dropShadow', label: 'Drop Shadow' },
    { value: 'castShadow', label: 'Cast Shadow' },
    { value: 'bevel', label: 'Bevel' }
], 'dropShadow');

const gradientKindSelect = initCustomSelect(document.getElementById('gradientKind'), [
    { value: 'linear', label: 'Linear' },
    { value: 'radial', label: 'Radial' },
    { value: 'mesh', label: 'Mesh' }
], 'linear');

fontTargetSelect = initCustomSelect(document.getElementById('fontTarget'), [
    { value: 'content', label: 'Content text' },
    { value: 'badge', label: 'Badge text' }
], 'content');

function makeCanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
}

function normalizeHex(value) {
    let v = String(value || '').trim();
    if (!v.startsWith('#')) v = `#${v}`;
    if (/^#[0-9a-fA-F]{3}$/.test(v)) {
        v = `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}`;
    }
    if (!/^#[0-9a-fA-F]{6}$/.test(v)) return null;
    return v.toUpperCase();
}

function hexToRgba(hex, alpha) {
    const n = normalizeHex(hex) || '#000000';
    const r = parseInt(n.slice(1, 3), 16);
    const g = parseInt(n.slice(3, 5), 16);
    const b = parseInt(n.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function loadImageFromUrl(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Image load failed'));
        img.src = url;
    });
}

function normalizeSvg(svg) {
    let s = String(svg);
    if (!s.includes('xmlns')) {
        s = s.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    if (!/viewBox=/i.test(s)) {
        const w = s.match(/\swidth="([\d.]+)"/i);
        const h = s.match(/\sheight="([\d.]+)"/i);
        if (w && h) s = s.replace('<svg', `<svg viewBox="0 0 ${w[1]} ${h[1]}"`);
    }
    s = s.replace(/\s(width|height)="[^"]*"/gi, '');
    s = s.replace('<svg', '<svg width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;display:block"');
    return s;
}

function colorizeSvg(svg, color) {
    let s = normalizeSvg(svg);
    s = s.replace(/currentColor/g, color);
    s = s.replace(/fill="(?!none)[^"]*"/gi, `fill="${color}"`);
    s = s.replace(/stroke="(?!none)[^"]*"/gi, `stroke="${color}"`);
    s = s.replace(/fill='(?!none)[^']*'/gi, `fill='${color}'`);
    s = s.replace(/stroke='(?!none)[^']*'/gi, `stroke='${color}'`);
    if (!/\sfill=/.test(s) && !/<path[^>]*fill=/i.test(s)) {
        s = s.replace('<svg', `<svg fill="${color}"`);
    }
    return s;
}

function iconUsesTint(color) {
    if (color && color !== state.color) return true;
    return state.tintIcon !== false;
}

function iconSvgForColor(color) {
    if (!state.iconSvg) return '';
    const fill = color || state.color;
    return iconUsesTint(color) ? colorizeSvg(state.iconSvg, fill) : normalizeSvg(state.iconSvg);
}

function parseFontStyle(value) {
    const italic = String(value).endsWith('i');
    const weight = parseInt(String(value).replace('i', ''), 10) || 400;
    return { weight, italic };
}

function currentFont() {
    const target = state.fontTarget === 'badge' ? 'badge' : 'content';
    if (!state.fonts) {
        state.fonts = {
            content: { family: 'Inter', style: '700' },
            badge: { family: 'Inter', style: '700' }
        };
    }
    if (!state.fonts[target]) state.fonts[target] = { family: 'Inter', style: '700' };
    return state.fonts[target];
}

function currentFontMeta() {
    const family = currentFont().family;
    return googleFonts.find(f => f.family === family) || FALLBACK_FONTS[0];
}

function fontStyleOptions(meta) {
    const weights = (meta.weights || [400, 700]).slice().sort((a, b) => a - b);
    const styles = meta.styles || ['normal'];
    const options = [];
    weights.forEach(w => {
        options.push({ value: String(w), label: WEIGHT_LABELS[w] || String(w) });
        if (styles.includes('italic')) {
            options.push({ value: `${w}i`, label: `${WEIGHT_LABELS[w] || w} Italic` });
        }
    });
    return options.length ? options : [{ value: '400', label: 'Regular' }];
}

async function ensureFont(family, style) {
    const { weight, italic } = parseFontStyle(style);
    const key = `${family}|${weight}|${italic}`;
    if (fontReady.has(key) && document.fonts.check(`${italic ? 'italic ' : ''}${weight} 16px "${family}"`)) {
        return;
    }
    const axis = italic ? `ital,wght@0,${weight};1,${weight}` : `wght@${weight}`;
    const href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:${axis}&display=swap`;
    if (!loadedFontHrefs.has(href)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
        loadedFontHrefs.add(href);
    }
    const spec = `${italic ? 'italic ' : ''}${weight} 64px "${family}"`;
    try {
        await document.fonts.load(spec);
        fontReady.add(key);
    } catch (_) { /* canvas falls back */ }
}

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function measureTextPx(text, fontFamily, fontStyle, maxWidth, startPx) {
    const c = makeCanvas(1, 1);
    const ctx = c.getContext('2d');
    const { weight, italic } = parseFontStyle(fontStyle);
    let px = startPx;
    ctx.font = `${italic ? 'italic ' : ''}${weight} ${px}px "${fontFamily}", sans-serif`;
    const measured = ctx.measureText(text).width;
    if (measured > maxWidth) px *= maxWidth / measured;
    return px;
}

function doubleRaf() {
    return new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}

async function waitForStageImages(root) {
    const imgs = root.querySelectorAll('img');
    await Promise.all([...imgs].map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve;
        });
    }));
}

async function ensureFontsForStage() {
    if (state.contentType === 'text') {
        const font = state.fonts.content;
        await ensureFont(font.family, font.style);
    }
    if (state.badgeEnabled) {
        const font = state.fonts.badge;
        await ensureFont(font.family, font.style);
    }
}

function designLen(px, size) {
    if (!size) return `${(px / PREVIEW) * 100}cqw`;
    return `${px * (size / PREVIEW)}px`;
}

function buildBackgroundHtml() {
    if (state.bgType === 'image' && state.bgImageData) {
        return `<div class="im-bg" style="position:absolute;inset:0"><img src="${state.bgImageData}" alt="" crossorigin="anonymous" style="width:100%;height:100%;object-fit:cover;display:block"></div>`;
    }
    if (state.bgType === 'gradient') {
        if (state.gradientKind === 'mesh') {
            const stops = state.meshStops && state.meshStops.length ? state.meshStops : [
                { color: '#4F46E5', x: 0.22, y: 0.22, r: 0.7 }
            ];
            const layers = stops.map(stop => {
                const r = Math.round(Math.max(35, Math.min(90, (stop.r || 0.7) * 100)));
                const x = Math.round(stop.x * 1000) / 10;
                const y = Math.round(stop.y * 1000) / 10;
                const fade = hexToRgba(stop.color, 0);
                return `radial-gradient(circle at ${x}% ${y}%, ${stop.color} 0%, ${fade} ${r}%)`;
            }).join(', ');
            return `<div class="im-bg im-bg-mesh" style="position:absolute;inset:0;background:${layers}, ${stops[0].color}"></div>`;
        }
        const stopCss = state.gradientStops.map(s => `${s.color} ${s.pos}%`).join(', ');
        if (state.gradientKind === 'radial') {
            return `<div class="im-bg" style="position:absolute;inset:0;background:radial-gradient(circle at center, ${stopCss})"></div>`;
        }
        return `<div class="im-bg" style="position:absolute;inset:0;background:linear-gradient(${state.gradientAngle}deg, ${stopCss})"></div>`;
    }
    return `<div class="im-bg" style="position:absolute;inset:0;background:${state.bgColor}"></div>`;
}

function buildTextContentHtml(color, size) {
    const box = PREVIEW * (state.contentScale / 100);
    const font = state.fonts.content;
    const { weight, italic } = parseFontStyle(font.style);
    const raw = state.text || 'Aa';
    let px = box * 0.72;
    px = measureTextPx(raw, font.family, font.style, box * 0.95, px);
    return `<div class="im-c-text" style="display:flex;align-items:center;justify-content:center;color:${color};font-family:'${font.family}',sans-serif;font-weight:${weight};font-style:${italic ? 'italic' : 'normal'};font-size:${designLen(px, size)};line-height:1;text-align:center">${escapeHtml(raw)}</div>`;
}

function buildImageContentHtml(color, tinted) {
    if (!state.contentImageData) return '';
    if (tinted) {
        return `<div class="im-c-image im-c-tint" style="background:${color};-webkit-mask-image:url(${state.contentImageData});-webkit-mask-size:contain;-webkit-mask-repeat:no-repeat;-webkit-mask-position:center;mask-image:url(${state.contentImageData});mask-size:contain;mask-repeat:no-repeat;mask-position:center"></div>`;
    }
    return `<div class="im-c-image"><img src="${state.contentImageData}" alt="" crossorigin="anonymous"></div>`;
}

function buildIconContentHtml(color) {
    if (!state.iconSvg) return '';
    const fill = color || state.color;
    const svg = iconSvgForColor(color);
    const colorCss = iconUsesTint(color) ? `;color:${fill}` : '';
    return `<div class="im-c-icon" style="display:flex;align-items:center;justify-content:center${colorCss}">${svg}</div>`;
}

function buildContentInnerHtml(size, color) {
    const fill = color || state.color;
    if (state.contentType === 'icon') return buildIconContentHtml(fill);
    if (state.contentType === 'text') return buildTextContentHtml(fill, size);
    if (state.contentType === 'image') return buildImageContentHtml(fill, state.tintImage || (color && color !== state.color));
    return '';
}

function tintContentHtml(fillColor, size) {
    return buildContentLayerHtml(size, fillColor);
}

function contentLayout() {
    const box = Number(state.contentScale) || 56;
    const max = Math.max(0, 100 - box);
    const x = (Number(state.contentX ?? 50) / 100) * max;
    const y = (Number(state.contentY ?? 50) / 100) * max;
    return { x, y, box };
}

function buildContentLayerHtml(size, color) {
    const { x, y, box } = contentLayout();
    return `<div class="im-content-stack"><div class="im-content-box" style="position:absolute;left:${x}%;top:${y}%;width:${box}%">${buildContentInnerHtml(size, color)}</div></div>`;
}

function buildCastStamps(size, fx) {
    const rad = fx.angle * Math.PI / 180;
    const ux = Math.cos(rad);
    const uy = Math.sin(rad);
    const outScale = size ? size / PREVIEW : 1;
    const steps = fx.blur > 0
        ? Math.max(12, Math.round(fx.length))
        : Math.min(160, Math.max(1, Math.round(fx.length * outScale)));
    const silhouette = tintContentHtml(fx.color || '#000000', size);
    let stamps = '';
    for (let i = 1; i <= steps; i++) {
        const d = (i / steps) * fx.length;
        stamps += `<div class="im-fx-cast-stamp" style="transform:translate(${designLen(ux * d, size)},${designLen(uy * d, size)})">${silhouette}</div>`;
    }
    return stamps;
}

function wrapEffects(innerHtml, size) {
    let html = innerHtml;
    const n = (px) => designLen(px, size);
    state.effects.forEach(fx => {
        if (fx.type === 'dropShadow') {
            const col = hexToRgba(fx.color, fx.opacity);
            html = `<div class="im-fx-drop" style="filter:drop-shadow(${n(fx.offsetX)} ${n(fx.offsetY)} ${n(fx.blur)} ${col})">${html}</div>`;
        } else if (fx.type === 'castShadow') {
            const opacity = fx.opacity == null ? 0.35 : fx.opacity;
            const blurCss = fx.blur > 0 ? `filter:blur(${n(fx.blur)});` : '';
            html = `<div class="im-fx-cast"><div class="im-fx-cast-shadow" style="opacity:${opacity};${blurCss}">${buildCastStamps(size, fx)}</div><div class="im-fx-cast-front">${html}</div></div>`;
        } else if (fx.type === 'bevel' || fx.type === 'liquidGlass') {
            const rad = ((fx.angle != null ? fx.angle : 135) * Math.PI) / 180;
            const d = PREVIEW * 0.014;
            const ox = Math.cos(rad) * d;
            const oy = Math.sin(rad) * d;
            const hi = tintContentHtml('#ffffff', size);
            const sh = tintContentHtml('#000000', size);
            html = `<div class="im-fx-bevel">${html}<div class="im-fx-bevel-hi" style="transform:translate(${n(-ox)},${n(-oy)})">${hi}</div><div class="im-fx-bevel-sh" style="transform:translate(${n(ox)},${n(oy)})">${sh}</div></div>`;
        }
    });
    return html;
}

function badgeLayout() {
    const w = state.badgeWidth;
    const h = state.badgeHeight;
    const maxX = Math.max(0, 100 - w);
    const maxY = Math.max(0, 100 - h);
    const x = (state.badgeX / 100) * maxX;
    const y = (state.badgeY / 100) * maxY;
    return { x, y, w, h };
}

function buildBadgeHtml(size, opts = {}) {
    if (!state.badgeEnabled) return '';
    const { x, y, w, h } = badgeLayout();
    const minSide = Math.min(PREVIEW * (w / 100), PREVIEW * (h / 100));
    const radiusPx = (state.badgeRadius / 100) * minSide;
    const font = state.fonts.badge;
    const { weight, italic } = parseFontStyle(font.style);
    const label = state.badgeText || 'NEW';
    let px = PREVIEW * (h / 100) * 0.48;
    px = measureTextPx(label, font.family, font.style, PREVIEW * (w / 100) * 0.86, px);
    const fontCss = `font-family:'${font.family}',sans-serif;font-weight:${weight};font-style:${italic ? 'italic' : 'normal'};font-size:${designLen(px, size)};line-height:1`;
    const box = `position:absolute;left:${x}%;top:${y}%;width:${w}%;height:${h}%;border-radius:${designLen(radiusPx, size)};display:flex;align-items:center;justify-content:center;overflow:hidden`;
    if (opts.cutout) {
        const fill = opts.badgeColor || MONO_COLOR;
        return `<div class="im-badge im-badge-cutout" style="${box};z-index:3;background:${fill}"></div><div class="im-badge-punch" style="${box};z-index:4;mix-blend-mode:destination-out;color:#000;background:transparent;${fontCss}">${escapeHtml(label)}</div>`;
    }
    return `<div class="im-badge" style="${box};z-index:3;background:${state.badgeBgColor};color:${state.badgeTextColor};${fontCss}">${escapeHtml(label)}</div>`;
}

function buildStageHtml(size, opts = {}) {
    const { bg = true, content = true, badge = true, contentColor, badgeCutout, badgeColor } = opts;
    let inner = '';
    if (bg) inner += buildBackgroundHtml();
    if (content) {
        inner += `<div class="im-content-layer">${wrapEffects(buildContentLayerHtml(size, contentColor), size)}</div>`;
    }
    if (badge) inner += buildBadgeHtml(size, { cutout: badgeCutout, badgeColor });
    const sizeStyle = size ? `width:${size}px;height:${size}px;` : '';
    const bgStyle = bg ? '' : 'background:transparent;';
    const isolate = badgeCutout ? 'isolation:isolate;' : '';
    return `<div class="im-stage-root" style="${sizeStyle}${bgStyle}${isolate}">${inner}</div>`;
}

function roundRectPath(ctx, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    if (ctx.roundRect) {
        ctx.roundRect(x, y, w, h, radius);
        return;
    }
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
}

function drawMesh(ctx, size, stops) {
    const list = stops && stops.length ? stops : [
        { color: '#4F46E5', x: 0.22, y: 0.22, r: 0.55 }
    ];
    ctx.fillStyle = list[0].color;
    ctx.fillRect(0, 0, size, size);
    list.forEach(stop => {
        const radius = Math.max(size * 0.2, size * (stop.r || 0.55));
        const g = ctx.createRadialGradient(stop.x * size, stop.y * size, 0, stop.x * size, stop.y * size, radius);
        g.addColorStop(0, stop.color);
        g.addColorStop(1, hexToRgba(stop.color, 0));
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, size, size);
    });
}

function contentBoxRect(size) {
    const { x, y, box } = contentLayout();
    return { x: size * (x / 100), y: size * (y / 100), box: size * (box / 100) };
}

function drawCover(ctx, img, size) {
    const ir = img.width / Math.max(img.height, 1);
    let w;
    let h;
    if (ir > 1) {
        h = size;
        w = size * ir;
    } else {
        w = size;
        h = size / ir;
    }
    ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
}

function drawContain(ctx, img, x, y, box) {
    const ir = img.width / Math.max(img.height, 1);
    let w = box;
    let h = box;
    if (ir > 1) h = box / ir;
    else w = box * ir;
    ctx.drawImage(img, x + (box - w) / 2, y + (box - h) / 2, w, h);
}

async function svgToImage(svg, px) {
    let s = String(svg);
    s = s.replace(/\s(width|height)="[^"]*"/gi, '');
    s = s.replace(/\sstyle="[^"]*"/i, '');
    s = s.replace('<svg', `<svg width="${px}" height="${px}"`);
    const blob = new Blob([s], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    try {
        return await loadImageFromUrl(url);
    } finally {
        URL.revokeObjectURL(url);
    }
}

async function canvasDrawBackground(ctx, size) {
    if (state.bgType === 'image' && state.bgImageData) {
        const img = await loadImageFromUrl(state.bgImageData);
        drawCover(ctx, img, size);
        return;
    }
    if (state.bgType === 'gradient') {
        if (state.gradientKind === 'mesh') {
            drawMesh(ctx, size, state.meshStops);
            return;
        }
        const stops = state.gradientStops.slice().sort((a, b) => a.pos - b.pos);
        if (state.gradientKind === 'radial') {
            const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
            stops.forEach(stop => {
                try { g.addColorStop(Math.min(1, Math.max(0, stop.pos / 100)), stop.color); } catch (_) { /* invalid */ }
            });
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, size, size);
            return;
        }
        const rad = (state.gradientAngle - 90) * Math.PI / 180;
        const cx = size / 2;
        const cy = size / 2;
        const r = size * Math.SQRT2 / 2;
        const g = ctx.createLinearGradient(
            cx - Math.cos(rad) * r,
            cy - Math.sin(rad) * r,
            cx + Math.cos(rad) * r,
            cy + Math.sin(rad) * r
        );
        stops.forEach(stop => {
            try { g.addColorStop(Math.min(1, Math.max(0, stop.pos / 100)), stop.color); } catch (_) { /* invalid */ }
        });
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, size, size);
        return;
    }
    ctx.fillStyle = state.bgColor;
    ctx.fillRect(0, 0, size, size);
}

async function canvasDrawContent(ctx, size, color) {
    const { x, y, box } = contentBoxRect(size);
    const fill = color || state.color;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    if (state.contentType === 'icon' && state.iconSvg) {
        const img = await svgToImage(iconSvgForColor(color), Math.max(256, Math.round(box)));
        ctx.drawImage(img, x, y, box, box);
        return;
    }
    if (state.contentType === 'text') {
        const font = state.fonts.content;
        await ensureFont(font.family, font.style);
        const { weight, italic } = parseFontStyle(font.style);
        const text = state.text || 'Aa';
        let px = box * 0.72;
        px = measureTextPx(text, font.family, font.style, box * 0.95, px);
        ctx.fillStyle = fill;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `${italic ? 'italic ' : ''}${weight} ${px}px "${font.family}", sans-serif`;
        ctx.fillText(text, size / 2, size / 2);
        return;
    }
    if (state.contentType === 'image' && state.contentImageData) {
        const img = await loadImageFromUrl(state.contentImageData);
        drawContain(ctx, img, x, y, box);
        if (state.tintImage || (color && color !== state.color)) {
            ctx.save();
            ctx.globalCompositeOperation = 'source-atop';
            ctx.fillStyle = fill;
            ctx.fillRect(x, y, box, box);
            ctx.restore();
        }
    }
}

async function canvasContentLayer(size, color) {
    const c = makeCanvas(size, size);
    await canvasDrawContent(c.getContext('2d'), size, color);
    return c;
}

function canvasApplyEffect(src, fx, size) {
    const scale = size / PREVIEW;
    const out = makeCanvas(size, size);
    const ctx = out.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    if (fx.type === 'dropShadow') {
        ctx.shadowColor = hexToRgba(fx.color, fx.opacity);
        ctx.shadowBlur = fx.blur * scale;
        ctx.shadowOffsetX = fx.offsetX * scale;
        ctx.shadowOffsetY = fx.offsetY * scale;
        ctx.drawImage(src, 0, 0);
        return out;
    }

    if (fx.type === 'castShadow') {
        const rad = fx.angle * Math.PI / 180;
        const ux = Math.cos(rad);
        const uy = Math.sin(rad);
        const dist = fx.length * scale;
        const steps = fx.blur > 0
            ? Math.max(12, Math.round(fx.length))
            : Math.max(1, Math.round(dist));
        const sil = toMonochrome(src, fx.color || '#000000');
        const shadow = makeCanvas(size, size);
        const sctx = shadow.getContext('2d');
        for (let i = 1; i <= steps; i++) {
            const d = (i / steps) * dist;
            sctx.drawImage(sil, ux * d, uy * d);
        }
        let shadowLayer = shadow;
        if (fx.blur > 0) {
            const blurred = makeCanvas(size, size);
            const bctx = blurred.getContext('2d');
            bctx.filter = `blur(${fx.blur * scale}px)`;
            bctx.drawImage(shadow, 0, 0);
            shadowLayer = blurred;
        }
        ctx.globalAlpha = fx.opacity == null ? 0.35 : fx.opacity;
        ctx.drawImage(shadowLayer, 0, 0);
        ctx.globalAlpha = 1;
        ctx.drawImage(src, 0, 0);
        return out;
    }

    if (fx.type === 'bevel' || fx.type === 'liquidGlass') {
        const rad = ((fx.angle != null ? fx.angle : 135) * Math.PI) / 180;
        const d = Math.max(1.5, size * 0.014);
        const ox = Math.cos(rad) * d;
        const oy = Math.sin(rad) * d;
        ctx.drawImage(src, 0, 0);
        ctx.save();
        ctx.globalCompositeOperation = 'source-atop';
        ctx.globalAlpha = 0.55;
        ctx.drawImage(toMonochrome(src, '#ffffff'), -ox, -oy);
        ctx.globalAlpha = 0.45;
        ctx.drawImage(toMonochrome(src, '#000000'), ox, oy);
        ctx.restore();
        ctx.save();
        ctx.globalCompositeOperation = 'destination-in';
        ctx.drawImage(src, 0, 0);
        ctx.restore();
        return out;
    }

    ctx.drawImage(src, 0, 0);
    return out;
}

async function canvasDrawBadge(ctx, size) {
    if (!state.badgeEnabled) return;
    const font = state.fonts.badge;
    await ensureFont(font.family, font.style);
    const { x, y, w, h } = badgeLayout();
    const bx = size * x / 100;
    const by = size * y / 100;
    const bw = size * w / 100;
    const bh = size * h / 100;
    const radius = (state.badgeRadius / 100) * Math.min(bw, bh);
    const { weight, italic } = parseFontStyle(font.style);
    const label = state.badgeText || 'NEW';
    let px = bh * 0.48;
    px = measureTextPx(label, font.family, font.style, bw * 0.86, px);
    roundRectPath(ctx, bx, by, bw, bh, radius);
    ctx.fillStyle = state.badgeBgColor;
    ctx.fill();
    ctx.fillStyle = state.badgeTextColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${italic ? 'italic ' : ''}${weight} ${px}px "${font.family}", sans-serif`;
    ctx.fillText(label, bx + bw / 2, by + bh / 2 + px * 0.04);
}

async function canvasApplyEffects(src, size) {
    let layer = src;
    for (const fx of state.effects) {
        layer = canvasApplyEffect(layer, fx, size);
    }
    return layer;
}

async function renderLayers(size) {
    await ensureFontsForStage();
    const content = await canvasContentLayer(size, state.color);
    const fx = await canvasApplyEffects(content, size);

    const composed = makeCanvas(size, size);
    const cctx = composed.getContext('2d');
    await canvasDrawBackground(cctx, size);
    cctx.drawImage(fx, 0, 0);
    await canvasDrawBadge(cctx, size);

    const fg = makeCanvas(size, size);
    const fctx = fg.getContext('2d');
    fctx.drawImage(fx, 0, 0);
    await canvasDrawBadge(fctx, size);

    const bg = makeCanvas(size, size);
    await canvasDrawBackground(bg.getContext('2d'), size);

    const mono = applyMonoBadgeCutout(toMonochrome(fx, MONO_COLOR), size);
    return { composed, fg, bg, mono };
}

function toMonochrome(src, fill) {
    const c = makeCanvas(src.width, src.height);
    const ctx = c.getContext('2d');
    ctx.drawImage(src, 0, 0);
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = fill || MONO_COLOR;
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.globalCompositeOperation = 'source-over';
    return c;
}

function applyMonoBadgeCutout(canvas, size) {
    if (!state.badgeEnabled) return canvas;
    const { x, y, w, h } = badgeLayout();
    const scale = size / 100;
    const bx = x * scale;
    const by = y * scale;
    const bw = w * scale;
    const bh = h * scale;
    const radius = (state.badgeRadius / 100) * Math.min(bw, bh);
    const font = state.fonts.badge;
    const { weight, italic } = parseFontStyle(font.style);
    const label = state.badgeText || 'NEW';
    let fontPx = bh * 0.48;
    fontPx = measureTextPx(label, font.family, font.style, bw * 0.86, fontPx);
    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    roundRectPath(ctx, bx, by, bw, bh, radius);
    ctx.fillStyle = MONO_COLOR;
    ctx.fill();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${italic ? 'italic ' : ''}${weight} ${fontPx}px "${font.family}", sans-serif`;
    ctx.fillText(label, bx + bw / 2, by + bh / 2 + fontPx * 0.04);
    ctx.restore();
    return canvas;
}

function scheduleRender() {
    saveStateSoon();
    clearTimeout(renderTimer);
    renderTimer = setTimeout(() => renderAll(), 32);
}

async function renderAll() {
    const token = ++renderToken;
    try {
        await ensureFontsForStage();
        if (token !== renderToken) return;
        iconPreview.innerHTML = buildStageHtml(null, { bg: true, content: true, badge: true });
        await waitForStageImages(iconPreview);
        if (token !== renderToken) return;
        updateHomeIcons();
        if (state.contentType === 'icon') updateIconPickPreview();
    } catch (err) {
        console.error(err);
    }
}

function updateHomeIcons() {
    const html = iconPreview.innerHTML;
    const androidUser = document.getElementById('androidUserIcon');
    const iosUser = document.getElementById('iosUserIcon');
    if (iosUser) iosUser.innerHTML = html;
    if (!androidUser) return;
    if (state.themed) {
        androidUser.innerHTML = buildStageHtml(null, {
            bg: false,
            content: true,
            badge: true,
            contentColor: MONO_COLOR,
            badgeCutout: true,
            badgeColor: MONO_COLOR
        });
    } else {
        androidUser.innerHTML = html;
    }
}

function stockAppHtml(app, extraClass) {
    const fg = app.fg || '#ffffff';
    return `<div class="im-app ${extraClass || ''}">
        <div class="im-app-icon stock" style="background:${app.color};color:${fg}">
            <iconify-icon icon="lucide:${app.icon}" width="18" height="18"></iconify-icon>
        </div>
        <span class="im-app-label">${app.name}</span>
    </div>`;
}

function userAppHtml(id) {
    return `<div class="im-app">
        <div class="im-app-icon user" id="${id}"></div>
        <span class="im-app-label">App</span>
    </div>`;
}

function buildHomeScreens() {
    const androidGrid = document.getElementById('androidGrid');
    androidGrid.innerHTML = userAppHtml('androidUserIcon') + ANDROID_STOCK.map(a => stockAppHtml(a)).join('');
    const iosGrid = document.getElementById('iosGrid');
    iosGrid.innerHTML = userAppHtml('iosUserIcon') + IOS_STOCK.map(a => stockAppHtml(a)).join('');
    document.getElementById('iosDock').innerHTML = IOS_DOCK.map(a => stockAppHtml(a)).join('');
}

function setPreviewShape(shape) {
    state.previewShape = shape;
    const wrap = document.querySelector('.im-preview-wrap');
    wrap.classList.remove('shape-circle', 'shape-squircle', 'shape-rounded', 'shape-square');
    wrap.classList.add(`shape-${shape}`);
    document.querySelectorAll('.im-shape-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.shape === shape);
    });
    saveStateSoon();
}

function setContentType(type) {
    state.contentType = type;
    ['icon', 'text', 'image'].forEach(t => {
        const btn = document.getElementById(`content${t[0].toUpperCase()}${t.slice(1)}Btn`);
        btn.classList.toggle('active', t === type);
        btn.setAttribute('aria-pressed', t === type ? 'true' : 'false');
    });
    document.getElementById('iconContentSection').classList.toggle('hidden', type !== 'icon');
    document.getElementById('textContentSection').classList.toggle('hidden', type !== 'text');
    document.getElementById('imageContentSection').classList.toggle('hidden', type !== 'image');
    updateContextUi();
    scheduleRender();
}

function setBgType(type) {
    state.bgType = type;
    document.getElementById('bgTypeColorBtn').classList.toggle('active', type === 'color');
    document.getElementById('bgTypeGradientBtn').classList.toggle('active', type === 'gradient');
    document.getElementById('bgTypeImageBtn').classList.toggle('active', type === 'image');
    document.getElementById('bgTypeColorBtn').setAttribute('aria-pressed', type === 'color' ? 'true' : 'false');
    document.getElementById('bgTypeGradientBtn').setAttribute('aria-pressed', type === 'gradient' ? 'true' : 'false');
    document.getElementById('bgTypeImageBtn').setAttribute('aria-pressed', type === 'image' ? 'true' : 'false');
    document.getElementById('bgColorSection').classList.toggle('hidden', type !== 'color');
    document.getElementById('bgGradientSection').classList.toggle('hidden', type !== 'gradient');
    document.getElementById('bgImageSection').classList.toggle('hidden', type !== 'image');
    updateGradientKindUi();
    scheduleRender();
}

function updateGradientKindUi() {
    const kind = state.gradientKind;
    document.getElementById('gradientAngleGroup').classList.toggle('hidden', kind !== 'linear');
    document.getElementById('gradientStopsGroup').classList.toggle('hidden', kind === 'mesh');
    document.getElementById('meshColorsGroup').classList.toggle('hidden', kind !== 'mesh');
    if (kind === 'mesh') paintMeshEditor();
}

function updateContextUi() {
    const showColor = state.contentType === 'text'
        || (state.contentType === 'image' && state.tintImage)
        || (state.contentType === 'icon' && state.tintIcon);
    document.getElementById('contentColorSection').classList.toggle('hidden', !showColor);
    const fontCard = document.getElementById('accFont');
    const fontRelevant = state.contentType === 'text' || state.badgeEnabled;
    fontCard.classList.toggle('hidden', !fontRelevant);
    if (fontRelevant) fontCard.classList.add('open');
    document.getElementById('badgeFields').classList.toggle('hidden', !state.badgeEnabled);
    updateBadgePosUi();
}

function wireColor(picker, hexInput, swatchRoot, getter, setter) {
    const apply = (hex) => {
        const n = normalizeHex(hex);
        if (!n) return;
        picker.value = n.toLowerCase();
        hexInput.value = n;
        if (swatchRoot) {
            swatchRoot.querySelectorAll('.swatch-btn').forEach(btn => {
                btn.classList.toggle('active', (btn.dataset.color || '').toLowerCase() === n.toLowerCase());
            });
        }
        setter(n);
        scheduleRender();
    };
    picker.addEventListener('input', () => apply(picker.value));
    hexInput.addEventListener('change', () => apply(hexInput.value));
    hexInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') apply(hexInput.value);
    });
    if (swatchRoot) {
        swatchRoot.querySelectorAll('.swatch-btn').forEach(btn => {
            btn.addEventListener('click', () => apply(btn.dataset.color));
        });
    }
    apply(getter());
}

function wireSlider(slider, input, setter) {
    slider.root.addEventListener('input', () => {
        input.value = slider.value;
        setter(slider.value);
        scheduleRender();
    });
    input.addEventListener('input', () => {
        const n = parseInt(input.value, 10);
        if (Number.isNaN(n)) return;
        slider.setValue(n, false);
        setter(slider.value);
        scheduleRender();
    });
}

function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function hexLuminance(hex) {
    const n = normalizeHex(hex) || '#000000';
    const r = parseInt(n.slice(1, 3), 16) / 255;
    const g = parseInt(n.slice(3, 5), 16) / 255;
    const b = parseInt(n.slice(5, 7), 16) / 255;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function pickerPreviewColor() {
    const dark = document.documentElement.classList.contains('dark');
    const lum = hexLuminance(state.color);
    if (!dark && lum > 0.65) return '#111827';
    if (dark && lum < 0.22) return '#f8fafc';
    return state.color;
}

function updateIconPickPreview() {
    const nameEl = document.getElementById('iconPickName');
    const preview = document.getElementById('iconPickPreview');
    nameEl.textContent = `${state.iconPrefix}:${state.iconName}`;
    const fill = state.tintIcon !== false ? pickerPreviewColor() : null;
    if (state.iconSvg) {
        preview.innerHTML = fill ? colorizeSvg(state.iconSvg, fill) : normalizeSvg(state.iconSvg);
        const svg = preview.querySelector('svg');
        if (svg) {
            svg.removeAttribute('width');
            svg.removeAttribute('height');
        }
    } else {
        const colorCss = fill ? ` style="color:${fill}"` : '';
        preview.innerHTML = `<iconify-icon icon="${state.iconPrefix}:${state.iconName}" width="22" height="22"${colorCss}></iconify-icon>`;
    }
}

function renderGradientStops() {
    const root = document.getElementById('gradientStops');
    root.innerHTML = '';
    state.gradientStops.forEach((stop, index) => {
        const row = document.createElement('div');
        row.className = 'im-stop-row';
        row.innerHTML = `
            <div class="color-input-wrap">
                <input type="color" value="${stop.color.toLowerCase()}">
            </div>
            <input class="input" type="number" min="0" max="100" value="${stop.pos}">
            <button class="btn btn-ghost btn-sm" type="button" ${state.gradientStops.length <= 2 ? 'disabled' : ''}>${icon('x', 14)}</button>
        `;
        const colorInput = row.querySelector('input[type="color"]');
        const posInput = row.querySelector('input[type="number"]');
        const removeBtn = row.querySelector('button');
        colorInput.addEventListener('input', () => {
            state.gradientStops[index].color = normalizeHex(colorInput.value) || stop.color;
            scheduleRender();
        });
        posInput.addEventListener('input', () => {
            const n = parseInt(posInput.value, 10);
            if (Number.isNaN(n)) return;
            state.gradientStops[index].pos = Math.min(100, Math.max(0, n));
            scheduleRender();
        });
        removeBtn.addEventListener('click', () => {
            if (state.gradientStops.length <= 2) return;
            state.gradientStops.splice(index, 1);
            renderGradientStops();
            scheduleRender();
        });
        root.appendChild(row);
    });
}

function paintMeshEditor() {
    const canvas = document.getElementById('meshEditor');
    if (!canvas || !state.meshStops) return;
    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    ctx.clearRect(0, 0, size, size);
    drawMesh(ctx, size, state.meshStops);
    state.meshStops.forEach((stop, i) => {
        const x = stop.x * size;
        const y = stop.y * size;
        ctx.beginPath();
        ctx.arc(x, y, i === meshSelected ? 9 : 7, 0, Math.PI * 2);
        ctx.fillStyle = stop.color;
        ctx.fill();
        ctx.lineWidth = i === meshSelected ? 3 : 2;
        ctx.strokeStyle = i === meshSelected ? '#fff' : 'rgba(255,255,255,0.7)';
        ctx.stroke();
        if (i === meshSelected) {
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = '#111';
            ctx.stroke();
        }
    });
    const selected = state.meshStops[meshSelected] || state.meshStops[0];
    if (selected) {
        const picker = document.getElementById('meshStopColor');
        const hex = document.getElementById('meshStopHex');
        if (picker) picker.value = selected.color.toLowerCase();
        if (hex) hex.value = selected.color;
    }
}

function meshHit(clientX, clientY) {
    const canvas = document.getElementById('meshEditor');
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;
    let hit = -1;
    let best = 0.06;
    state.meshStops.forEach((stop, i) => {
        const d = Math.hypot(stop.x - x, stop.y - y);
        if (d < best) {
            best = d;
            hit = i;
        }
    });
    return { hit, x: Math.min(1, Math.max(0, x)), y: Math.min(1, Math.max(0, y)) };
}

function bindMeshEditor() {
    const canvas = document.getElementById('meshEditor');
    canvas.addEventListener('pointerdown', (e) => {
        canvas.setPointerCapture(e.pointerId);
        const { hit, x, y } = meshHit(e.clientX, e.clientY);
        if (hit >= 0) {
            meshSelected = hit;
            meshDragIndex = hit;
        } else {
            meshDragIndex = meshSelected;
            state.meshStops[meshSelected].x = x;
            state.meshStops[meshSelected].y = y;
        }
        paintMeshEditor();
        scheduleRender();
    });
    canvas.addEventListener('pointermove', (e) => {
        if (meshDragIndex < 0) return;
        const { x, y } = meshHit(e.clientX, e.clientY);
        state.meshStops[meshDragIndex].x = x;
        state.meshStops[meshDragIndex].y = y;
        paintMeshEditor();
        scheduleRender();
    });
    const endDrag = () => { meshDragIndex = -1; };
    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('pointercancel', endDrag);
    document.getElementById('meshStopColor').addEventListener('input', (e) => {
        const n = normalizeHex(e.target.value);
        if (!n || !state.meshStops[meshSelected]) return;
        state.meshStops[meshSelected].color = n;
        paintMeshEditor();
        scheduleRender();
    });
    document.getElementById('meshStopHex').addEventListener('change', (e) => {
        const n = normalizeHex(e.target.value);
        if (!n || !state.meshStops[meshSelected]) return;
        state.meshStops[meshSelected].color = n;
        paintMeshEditor();
        scheduleRender();
    });
    document.getElementById('meshAddStopBtn').addEventListener('click', () => {
        if (state.meshStops.length >= 8) return;
        state.meshStops.push({ color: '#FFFFFF', x: 0.5, y: 0.5, r: 0.5 });
        meshSelected = state.meshStops.length - 1;
        paintMeshEditor();
        scheduleRender();
    });
    document.getElementById('meshRemoveStopBtn').addEventListener('click', () => {
        if (state.meshStops.length <= 2) return;
        state.meshStops.splice(meshSelected, 1);
        meshSelected = Math.max(0, meshSelected - 1);
        paintMeshEditor();
        scheduleRender();
    });
}

function updatePosGridUi(gridId, x, y) {
    document.querySelectorAll(`#${gridId} .im-pos-btn`).forEach(btn => {
        const match = Number(btn.dataset.x) === Number(x) && Number(btn.dataset.y) === Number(y);
        btn.classList.toggle('active', match);
    });
}

function updateBadgePosUi() {
    updatePosGridUi('badgePosGrid', state.badgeX, state.badgeY);
}

function updateContentPosUi() {
    const x = Number(state.contentX ?? 50);
    const y = Number(state.contentY ?? 50);
    updatePosGridUi('contentPosGrid', x, y);
    contentXSlider.setValue(x, false);
    contentYSlider.setValue(y, false);
    document.getElementById('contentXInput').value = Math.round(x);
    document.getElementById('contentYInput').value = Math.round(y);
}

function bindPosGrid(gridId, xKey, yKey, onUpdate) {
    document.querySelectorAll(`#${gridId} .im-pos-btn`).forEach(btn => {
        btn.addEventListener('click', () => {
            state[xKey] = Number(btn.dataset.x);
            state[yKey] = Number(btn.dataset.y);
            onUpdate();
            scheduleRender();
        });
    });
}

function bindBadgePos() {
    bindPosGrid('badgePosGrid', 'badgeX', 'badgeY', updateBadgePosUi);
}

function bindContentPos() {
    bindPosGrid('contentPosGrid', 'contentX', 'contentY', updateContentPosUi);
    const toggle = document.getElementById('contentPosToggle');
    const fields = document.getElementById('contentPosFields');
    toggle.addEventListener('click', () => {
        const open = fields.classList.contains('hidden');
        fields.classList.toggle('hidden', !open);
        toggle.setAttribute('aria-expanded', String(open));
    });
}

function bindAccordions() {
    document.querySelectorAll('.im-acc-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const card = document.getElementById(btn.dataset.acc);
            if (card) card.classList.toggle('open');
        });
    });
}

function fxDropIndexFromY(clientY) {
    const root = document.getElementById('effectChain');
    const items = [...root.querySelectorAll('.im-effect-item')];
    for (let i = 0; i < items.length; i++) {
        const r = items[i].getBoundingClientRect();
        if (clientY < r.top + r.height / 2) return i;
    }
    return items.length;
}

function placeFxDropLine(toIndex) {
    const root = document.getElementById('effectChain');
    const line = document.getElementById('fxDropLine');
    const items = [...root.querySelectorAll('.im-effect-item')];
    if (!line || !items.length) return;
    const rootRect = root.getBoundingClientRect();
    let y;
    if (toIndex >= items.length) {
        const r = items[items.length - 1].getBoundingClientRect();
        y = r.bottom - rootRect.top + 4;
    } else {
        const r = items[toIndex].getBoundingClientRect();
        y = r.top - rootRect.top - 4;
    }
    line.style.top = `${y}px`;
    line.classList.add('visible');
}

function hideFxDropLine() {
    const line = document.getElementById('fxDropLine');
    if (line) line.classList.remove('visible');
}

function scrollFxChain(clientY) {
    const scroller = document.querySelector('.icon-maker-page .tool-sidebar-inner')
        || document.querySelector('.tool-sidebar-inner');
    if (!scroller) return;
    const r = scroller.getBoundingClientRect();
    if (clientY < r.top + 36) scroller.scrollTop -= 16;
    else if (clientY > r.bottom - 36) scroller.scrollTop += 16;
}

function commitFxReorder(from) {
    let to = fxDropAt;
    fxDragFrom = -1;
    fxDropAt = -1;
    if (from < 0 || to < 0) return;
    if (to > from) to -= 1;
    if (to === from) return;
    const [moved] = state.effects.splice(from, 1);
    state.effects.splice(to, 0, moved);
    renderEffectChain();
    scheduleRender();
}

function bindFxHandle(handle, item, index) {
    handle.addEventListener('pointerdown', (e) => {
        if (e.button !== 0) return;
        e.stopPropagation();
        const startY = e.clientY;
        let active = false;
        const onMove = (ev) => {
            if (!active) {
                if (Math.abs(ev.clientY - startY) < 5) return;
                active = true;
                fxDragFrom = index;
                item.classList.add('dragging');
                document.body.classList.add('im-fx-reordering');
                try { handle.setPointerCapture(ev.pointerId); } catch (_) { /* ignore */ }
            }
            ev.preventDefault();
            fxDropAt = fxDropIndexFromY(ev.clientY);
            placeFxDropLine(fxDropAt);
            scrollFxChain(ev.clientY);
        };
        const onUp = (ev) => {
            document.removeEventListener('pointermove', onMove);
            document.removeEventListener('pointerup', onUp);
            document.removeEventListener('pointercancel', onUp);
            try { handle.releasePointerCapture(ev.pointerId); } catch (_) { /* ignore */ }
            document.body.classList.remove('im-fx-reordering');
            item.classList.remove('dragging');
            hideFxDropLine();
            if (active) commitFxReorder(index);
        };
        document.addEventListener('pointermove', onMove, { passive: false });
        document.addEventListener('pointerup', onUp);
        document.addEventListener('pointercancel', onUp);
    });
}

function renderEffectChain() {
    const root = document.getElementById('effectChain');
    const tip = document.getElementById('effectEmptyTip');
    root.innerHTML = '';
    tip.classList.toggle('hidden', state.effects.length > 0);
    state.effects.forEach((fx, index) => {
        const item = document.createElement('div');
        item.className = 'im-effect-item';
        item.dataset.index = String(index);
        item.innerHTML = `
            <div class="im-effect-item-header">
                <span class="im-effect-drag" title="Drag to reorder">${icon('grip-vertical', 14)}</span>
                <span class="im-effect-title">${EFFECT_LABELS[fx.type] || fx.type}</span>
                <button class="btn btn-ghost btn-sm" type="button" data-remove>${icon('x', 14)}</button>
            </div>
            <div class="im-effect-body"></div>
        `;
        const body = item.querySelector('.im-effect-body');
        if (fx.type === 'dropShadow') {
            body.appendChild(fxSliderRow(fx, 'blur', 'Blur', 0, 80));
            body.appendChild(fxSliderRow(fx, 'offsetX', 'Offset X', -80, 80));
            body.appendChild(fxSliderRow(fx, 'offsetY', 'Offset Y', -80, 80));
            body.appendChild(fxSliderRow(fx, 'opacity', 'Opacity', 0, 1, 0.01));
            body.appendChild(fxColorRow(fx, 'color', 'Color'));
        } else if (fx.type === 'castShadow') {
            body.appendChild(fxSliderRow(fx, 'length', 'Length', 10, 160));
            body.appendChild(fxSliderRow(fx, 'angle', 'Angle', 0, 360));
            body.appendChild(fxSliderRow(fx, 'blur', 'Blur', 0, 60));
            body.appendChild(fxSliderRow(fx, 'opacity', 'Opacity', 0, 1, 0.01));
            body.appendChild(fxColorRow(fx, 'color', 'Color'));
        } else if (fx.type === 'bevel' || fx.type === 'liquidGlass') {
            if (fx.angle == null) fx.angle = 135;
            body.appendChild(fxSliderRow(fx, 'angle', 'Light direction', 0, 360));
        }
        item.querySelector('[data-remove]').addEventListener('click', () => {
            state.effects.splice(index, 1);
            renderEffectChain();
            scheduleRender();
        });
        bindFxHandle(item.querySelector('.im-effect-drag'), item, index);
        root.appendChild(item);
    });
    const line = document.createElement('div');
    line.id = 'fxDropLine';
    line.className = 'im-fx-drop-line';
    root.appendChild(line);
}

function fxSliderRow(fx, key, label, min, max, step) {
    const wrap = document.createElement('div');
    wrap.className = 'form-group';
    const sliderId = `fx-${fx.id}-${key}`;
    wrap.innerHTML = `
        <label class="label">${label}</label>
        <div class="range-wrap">
            <div class="custom-slider" id="${sliderId}" role="slider" tabindex="0"></div>
            <input class="input range-number-input" type="number" min="${min}" max="${max}" step="${step || 1}" value="${fx[key]}">
        </div>
    `;
    const sliderRoot = wrap.querySelector('.custom-slider');
    const input = wrap.querySelector('input');
    const slider = initCustomSlider(sliderRoot, {
        min, max, value: fx[key], step: step || 1
    });
    slider.root.addEventListener('input', () => {
        fx[key] = slider.value;
        input.value = slider.value;
        scheduleRender();
    });
    input.addEventListener('input', () => {
        const n = parseFloat(input.value);
        if (Number.isNaN(n)) return;
        slider.setValue(n, false);
        fx[key] = slider.value;
        scheduleRender();
    });
    return wrap;
}

function fxColorRow(fx, key, label) {
    const wrap = document.createElement('div');
    wrap.className = 'form-group';
    wrap.innerHTML = `
        <label class="label">${label}</label>
        <div class="color-picker-row">
            <div class="color-input-wrap">
                <input type="color" value="${String(fx[key]).toLowerCase()}">
            </div>
            <input class="input color-hex-input" type="text" value="${fx[key]}" maxlength="7">
        </div>
    `;
    const picker = wrap.querySelector('input[type="color"]');
    const hex = wrap.querySelector('input[type="text"]');
    const apply = (v) => {
        const n = normalizeHex(v);
        if (!n) return;
        fx[key] = n;
        picker.value = n.toLowerCase();
        hex.value = n;
        scheduleRender();
    };
    picker.addEventListener('input', () => apply(picker.value));
    hex.addEventListener('change', () => apply(hex.value));
    return wrap;
}

function rebuildFontStyleSelect() {
    const root = document.getElementById('fontStyle');
    const existing = customSelects.findIndex(s => s.root === root);
    if (existing >= 0) customSelects.splice(existing, 1);
    const font = currentFont();
    const options = fontStyleOptions(currentFontMeta());
    const preferred = options.some(o => o.value === font.style)
        ? font.style
        : (options.find(o => o.value === '700') || options[0]).value;
    font.style = preferred;
    root.innerHTML = '';
    fontStyleSelect = initCustomSelect(root, options, preferred);
    root.addEventListener('change', () => {
        currentFont().style = fontStyleSelect.value;
        scheduleRender();
    });
    updateFontFamilyLabel();
}

function updateFontFamilyLabel() {
    const font = currentFont();
    const label = document.getElementById('fontFamilyLabel');
    label.textContent = font.family;
    label.style.fontFamily = `"${font.family}", sans-serif`;
}

function openFontDropdown() {
    const dropdown = document.getElementById('fontDropdown');
    dropdown.classList.remove('hidden');
    document.getElementById('fontSearch').value = '';
    renderFontList('');
    document.getElementById('fontSearch').focus();
}

function closeFontDropdown() {
    document.getElementById('fontDropdown').classList.add('hidden');
}

function renderFontList(query) {
    const list = document.getElementById('fontList');
    const q = (query || '').trim().toLowerCase();
    const selected = currentFont().family;
    const matches = googleFonts
        .filter(f => !q || f.family.toLowerCase().includes(q))
        .slice(0, 80);
    if (!matches.length) {
        list.innerHTML = '<div class="im-empty">No fonts match</div>';
        return;
    }
    list.innerHTML = matches.map(f => (
        `<button type="button" class="im-font-option${f.family === selected ? ' selected' : ''}" data-family="${f.family}" style="font-family:'${f.family}',sans-serif">${f.family}</button>`
    )).join('');
    list.querySelectorAll('.im-font-option').forEach(btn => {
        btn.addEventListener('click', () => {
            currentFont().family = btn.dataset.family;
            rebuildFontStyleSelect();
            closeFontDropdown();
            scheduleRender();
        });
    });
}

async function loadGoogleFontsCatalog() {
    try {
        const res = await fetch('https://api.fontsource.org/v1/fonts');
        if (!res.ok) throw new Error('fonts');
        const data = await res.json();
        googleFonts = data
            .filter(f => f.family)
            .map(f => ({
                family: f.family,
                weights: f.weights && f.weights.length ? f.weights : [400, 700],
                styles: f.styles && f.styles.length ? f.styles : ['normal']
            }));
    } catch (_) {
        googleFonts = FALLBACK_FONTS.slice();
    }
    rebuildFontStyleSelect();
}

/* Iconify picker */
function openIconDialog() {
    document.getElementById('iconDialog').classList.remove('hidden');
    document.getElementById('iconSearchInput').focus();
    if (!collections.length) loadCollections();
    else requestAnimationFrame(fillIconGrid);
}

function closeIconDialog() {
    document.getElementById('iconDialog').classList.add('hidden');
}

async function loadCollections() {
    const list = document.getElementById('packList');
    list.innerHTML = '<div class="im-empty">Loading packs…</div>';
    try {
        const res = await fetch('https://api.iconify.design/collections');
        const data = await res.json();
        collections = Object.entries(data)
            .map(([prefix, info]) => ({
                prefix,
                name: info.name,
                total: info.total,
                samples: info.samples || []
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
        renderPackList();
        const last = localStorage.getItem(PACK_KEY) || state.iconPrefix || 'mdi';
        if (last === ALL_PACKS_KEY) {
            await selectAllPacks();
        } else {
            const pack = collections.find(c => c.prefix === last) || collections.find(c => c.prefix === 'mdi') || collections[0];
            if (pack) await selectPack(pack.prefix);
        }
    } catch (_) {
        list.innerHTML = '<div class="im-empty">Could not load Iconify packs. Check network.</div>';
    }
}

function renderPackList(filter) {
    const list = document.getElementById('packList');
    const q = (filter || '').trim().toLowerCase();
    const matches = collections.filter(c =>
        !q || c.prefix.includes(q) || c.name.toLowerCase().includes(q)
    );
    const last = localStorage.getItem(PACK_KEY);
    list.innerHTML = matches.slice(0, 400).map(c => `
        <button type="button" class="im-pack-btn${c.prefix === last ? ' active' : ''}" data-prefix="${c.prefix}">
            <span class="im-pack-samples">
                ${(c.samples || []).slice(0, 2).map(s => `<iconify-icon icon="${c.prefix}:${s}" width="14" height="14"></iconify-icon>`).join('')}
            </span>
            <span class="im-pack-name">${c.name}</span>
        </button>
    `).join('') || '<div class="im-empty">No packs match</div>';
    list.querySelectorAll('.im-pack-btn').forEach(btn => {
        btn.addEventListener('click', () => selectPack(btn.dataset.prefix));
    });
}

function parseCollectionIcons(prefix, data) {
    const names = [];
    if (Array.isArray(data.uncategorized)) names.push(...data.uncategorized);
    if (data.categories) {
        Object.values(data.categories).forEach(arr => {
            if (Array.isArray(arr)) names.push(...arr);
        });
    }
    return [...new Set(names)].map(name => `${prefix}:${name}`);
}

async function fetchPackIcons(prefix) {
    if (packIconCache.has(prefix)) return packIconCache.get(prefix);
    const res = await fetch(`https://api.iconify.design/collection?prefix=${encodeURIComponent(prefix)}`);
    const data = await res.json();
    const ids = parseCollectionIcons(prefix, data);
    packIconCache.set(prefix, ids);
    return ids;
}

function setPackSearchPlaceholder() {
    const input = document.getElementById('packIconSearchInput');
    if (!input) return;
    input.placeholder = allPacksMode ? 'Search all icons…' : 'Search this pack…';
}

function allPacksTotal() {
    return collections.reduce((sum, c) => sum + (c.total || 0), 0);
}

async function selectAllPacks() {
    allPacksMode = true;
    searchMode = false;
    packQuery = '';
    allPackCursor = 0;
    packIcons = [];
    localStorage.setItem(PACK_KEY, ALL_PACKS_KEY);
    document.getElementById('iconSearchInput').value = '';
    const packSearch = document.getElementById('packIconSearchInput');
    if (packSearch) packSearch.value = '';
    setPackSearchVisible(true);
    setPackSearchPlaceholder();
    document.getElementById('allPacksBtn').classList.add('active');
    document.querySelectorAll('#packList .im-pack-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('packTitle').textContent = 'All packs';
    showIconGridMessage('Loading icons…');
    await ensureAllPackIcons(216);
    resetAndFillIconGrid();
}

async function ensureAllPackIcons(needed) {
    if (!allPacksMode || allPacksLoading) return;
    allPacksLoading = true;
    let added = 0;
    try {
        while (packIcons.length < needed && allPackCursor < collections.length) {
            const pack = collections[allPackCursor];
            allPackCursor += 1;
            try {
                const ids = await fetchPackIcons(pack.prefix);
                packIcons.push(...ids);
                added += ids.length;
                updateIconCount();
            } catch (_) { /* skip pack */ }
        }
    } finally {
        allPacksLoading = false;
    }
    if (added) requestAnimationFrame(() => fillIconGrid());
}

async function selectPack(prefix) {
    allPacksMode = false;
    localStorage.setItem(PACK_KEY, prefix);
    searchMode = false;
    packQuery = '';
    document.getElementById('iconSearchInput').value = '';
    const packSearch = document.getElementById('packIconSearchInput');
    if (packSearch) packSearch.value = '';
    setPackSearchVisible(true);
    setPackSearchPlaceholder();
    document.getElementById('allPacksBtn').classList.remove('active');
    document.querySelectorAll('#packList .im-pack-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.prefix === prefix);
    });
    const pack = collections.find(c => c.prefix === prefix);
    document.getElementById('packTitle').textContent = pack ? pack.name : prefix;
    showIconGridMessage('Loading icons…');
    try {
        packIcons = await fetchPackIcons(prefix);
        resetAndFillIconGrid();
    } catch (_) {
        showIconGridMessage('Could not load this pack.');
    }
}

function setPackSearchVisible(show) {
    const wrap = document.getElementById('packIconSearchWrap');
    if (wrap) wrap.classList.toggle('hidden', !show);
}

function getIconSource() {
    if (searchMode) return searchIcons;
    if (allPacksMode && packQuery.trim()) return searchIcons;
    const q = packQuery.trim().toLowerCase();
    if (!q) return packIcons;
    return packIcons.filter(id => {
        const name = id.slice(id.indexOf(':') + 1);
        return name.toLowerCase().includes(q);
    });
}

function updateIconCount() {
    const el = document.getElementById('iconCount');
    if (!el) return;
    const source = getIconSource();
    if (searchMode) {
        el.textContent = `${source.length} results`;
        return;
    }
    if (allPacksMode && packQuery.trim()) {
        el.textContent = `${source.length} results`;
        return;
    }
    if (allPacksMode) {
        el.textContent = `${packIcons.length.toLocaleString()} / ${allPacksTotal().toLocaleString()}`;
        return;
    }
    if (packQuery.trim()) {
        el.textContent = `${source.length} / ${packIcons.length}`;
        return;
    }
    el.textContent = `${packIcons.length} icons`;
}

function ensureIconSentinel() {
    const grid = document.getElementById('iconGrid');
    let el = document.getElementById('iconGridSentinel');
    if (!el) {
        el = document.createElement('div');
        el.id = 'iconGridSentinel';
        el.className = 'im-icon-grid-sentinel';
        el.setAttribute('aria-hidden', 'true');
    }
    if (el.parentNode !== grid) grid.appendChild(el);
    return el;
}

function clearIconGridCells() {
    const grid = document.getElementById('iconGrid');
    grid.querySelectorAll('.im-icon-cell, .im-empty').forEach(n => n.remove());
}

function showIconGridMessage(text) {
    const grid = document.getElementById('iconGrid');
    clearIconGridCells();
    const empty = document.createElement('div');
    empty.className = 'im-empty';
    empty.textContent = text;
    const sentinel = ensureIconSentinel();
    grid.insertBefore(empty, sentinel);
}

function makeIconCell(id) {
    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = 'im-icon-cell';
    if (id === `${state.iconPrefix}:${state.iconName}`) cell.classList.add('selected');
    cell.title = id;
    cell.innerHTML = `<iconify-icon icon="${id}" width="22" height="22"></iconify-icon>`;
    cell.addEventListener('click', () => pickIcon(id));
    return cell;
}

function appendIconPage() {
    const source = getIconSource();
    if (iconOffset >= source.length) return 0;
    const grid = document.getElementById('iconGrid');
    const slice = source.slice(iconOffset, iconOffset + 72);
    const frag = document.createDocumentFragment();
    slice.forEach(id => frag.appendChild(makeIconCell(id)));
    const sentinel = ensureIconSentinel();
    grid.insertBefore(frag, sentinel);
    iconOffset += slice.length;
    return slice.length;
}

async function fillIconGrid() {
    const dialog = document.getElementById('iconDialog');
    const grid = document.getElementById('iconGrid');
    if (!dialog || dialog.classList.contains('hidden') || !grid) return;
    if (allPacksMode && !searchMode && !packQuery.trim() && iconOffset >= packIcons.length - 24) {
        await ensureAllPackIcons(packIcons.length + 288);
    }
    if (iconOffset >= getIconSource().length) return;
    let guard = 0;
    while (iconOffset < getIconSource().length && guard < 16) {
        if (grid.clientHeight >= 48 && grid.scrollHeight > grid.clientHeight + 64) break;
        if (!appendIconPage()) break;
        guard++;
    }
    if (iconOffset < getIconSource().length && (grid.clientHeight < 48 || grid.scrollHeight <= grid.clientHeight + 64)) {
        requestAnimationFrame(() => fillIconGrid());
    }
}

function resetAndFillIconGrid() {
    clearIconGridCells();
    iconOffset = 0;
    updateIconCount();
    ensureIconSentinel();
    if (!getIconSource().length) {
        showIconGridMessage('No icons found.');
        return;
    }
    fillIconGrid();
}

function bindIconGridScroll() {
    const grid = document.getElementById('iconGrid');
    if (!grid) return;
    ensureIconSentinel();
    if (iconGridObserver) iconGridObserver.disconnect();
    iconGridObserver = new IntersectionObserver((entries) => {
        if (!entries.some(e => e.isIntersecting)) return;
        fillIconGrid();
    }, { root: grid, rootMargin: '280px 0px', threshold: 0 });
    iconGridObserver.observe(document.getElementById('iconGridSentinel'));
    if (!grid.dataset.roBound) {
        grid.dataset.roBound = '1';
        new ResizeObserver(() => fillIconGrid()).observe(grid);
    }
}

async function searchIconsQuery(query) {
    const q = query.trim();
    if (!q) {
        searchMode = false;
        setPackSearchVisible(true);
        const last = localStorage.getItem(PACK_KEY);
        if (last === ALL_PACKS_KEY) await selectAllPacks();
        else if (last) await selectPack(last);
        return;
    }
    searchMode = true;
    setPackSearchVisible(false);
    document.getElementById('packTitle').textContent = `Search: ${q}`;
    showIconGridMessage('Searching…');
    try {
        const res = await fetch(`https://api.iconify.design/search?query=${encodeURIComponent(q)}&limit=999`);
        const data = await res.json();
        searchIcons = data.icons || [];
        document.getElementById('iconCount').textContent = `${data.total || searchIcons.length} results`;
        resetAndFillIconGrid();
    } catch (_) {
        showIconGridMessage('Search failed.');
    }
}

async function searchAllPacksQuery(query) {
    const q = query.trim();
    if (!q) {
        searchIcons = [];
        resetAndFillIconGrid();
        return;
    }
    showIconGridMessage('Searching…');
    try {
        const res = await fetch(`https://api.iconify.design/search?query=${encodeURIComponent(q)}&limit=999`);
        const data = await res.json();
        searchIcons = data.icons || [];
        resetAndFillIconGrid();
    } catch (_) {
        showIconGridMessage('Search failed.');
    }
}

async function pickIcon(id) {
    const [prefix, ...rest] = id.split(':');
    const name = rest.join(':');
    try {
        const svg = await fetch(`https://api.iconify.design/${prefix}/${name}.svg`).then(r => r.text());
        state.iconPrefix = prefix;
        state.iconName = name;
        state.iconSvg = svg;
        state.contentType = 'icon';
        setContentType('icon');
        if (!allPacksMode) localStorage.setItem(PACK_KEY, prefix);
        updateIconPickPreview();
        closeIconDialog();
        scheduleRender();
    } catch (_) {
        console.error('Failed to fetch icon SVG');
    }
}

function scaleCanvas(src, size, opaque) {
    const c = makeCanvas(size, size);
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    if (opaque) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);
    }
    ctx.drawImage(src, 0, 0, size, size);
    return c;
}

function scaleAndroidAdaptive(src) {
    const size = src.width;
    const out = makeCanvas(size, size);
    const ctx = out.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    const draw = size * (ANDROID_SAFE_DP / ANDROID_ADAPTIVE_DP);
    const off = (size - draw) / 2;
    ctx.drawImage(src, off, off, draw, draw);
    return out;
}

function canvasPng(canvas) {
    return new Promise((resolve) => canvas.toBlob(blob => resolve(blob), 'image/png'));
}

function canvasWebp(canvas) {
    return new Promise((resolve) => {
        canvas.toBlob(blob => {
            if (blob) {
                resolve(blob);
                return;
            }
            canvas.toBlob(fallback => resolve(fallback), 'image/png');
        }, 'image/webp', 1);
    });
}

async function exportZip() {
    if (!state.exportAndroid && !state.exportIos) return;
    progressLabel.textContent = 'Exporting icons…';
    progress.classList.add('active');
    try {
        const layers = await renderLayers(MASTER);
        const zip = new JSZip();
        if (state.exportAndroid) {
            zip.file('android/res/mipmap-anydpi-v26/ic_launcher.xml', ADAPTIVE_XML);
            zip.file('android/play_store_512.webp', await canvasWebp(scaleCanvas(layers.composed, 512)));
            for (const dens of ANDROID_DENSITIES) {
                const folder = zip.folder(`android/res/mipmap-${dens.name}`);
                const adaptive = Math.round(108 * dens.scale);
                folder.file('ic_launcher_background.webp', await canvasWebp(scaleCanvas(layers.bg, adaptive)));
                folder.file('ic_launcher_foreground.webp', await canvasWebp(scaleCanvas(scaleAndroidAdaptive(layers.fg), adaptive)));
                folder.file('ic_launcher_monochrome.webp', await canvasWebp(scaleCanvas(scaleAndroidAdaptive(layers.mono), adaptive)));
            }
        }
        if (state.exportIos) {
            const ios = zip.folder('ios');
            ios.file('Contents.json', JSON.stringify(IOS_CONTENTS, null, 2));
            for (const item of IOS_ICONS) {
                ios.file(item.filename, await canvasPng(scaleCanvas(layers.composed, item.size, true)));
            }
        }
        const blob = await zip.generateAsync({ type: 'blob' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'AppIcon.zip';
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1500);
    } catch (err) {
        console.error(err);
        progressLabel.textContent = 'Export failed.';
        setTimeout(() => progress.classList.remove('active'), 1800);
        return;
    }
    progress.classList.remove('active');
}

function saveStateSoon() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveState, 250);
}

function saveState() {
    try {
        const payload = { ...state };
        if ((payload.contentImageData || '').length > 400000) payload.contentImageData = '';
        if ((payload.bgImageData || '').length > 400000) payload.bgImageData = '';
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (_) { /* quota */ }
}

function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const saved = JSON.parse(raw);
        state = { ...defaultState(), ...saved };
        if (!Array.isArray(state.effects)) state.effects = [];
        if (!Array.isArray(state.gradientStops) || state.gradientStops.length < 2) {
            state.gradientStops = defaultState().gradientStops;
        }
        if (!Array.isArray(state.meshStops) || state.meshStops.length < 2) {
            if (Array.isArray(saved.meshColors) && saved.meshColors.length) {
                const pos = [[0.22, 0.22], [0.78, 0.24], [0.24, 0.78], [0.8, 0.76]];
                state.meshStops = saved.meshColors.map((color, i) => ({
                    color, x: pos[i] ? pos[i][0] : 0.5, y: pos[i] ? pos[i][1] : 0.5, r: 0.55
                }));
            } else {
                state.meshStops = defaultState().meshStops;
            }
        }
        if (!state.fonts) {
            state.fonts = {
                content: { family: saved.fontFamily || 'Inter', style: saved.fontStyle || '700' },
                badge: { family: saved.fontFamily || 'Inter', style: saved.fontStyle || '700' }
            };
        }
        if (state.badgeX == null) state.badgeX = 50;
        if (state.badgeY == null) state.badgeY = 100;
        if (state.contentX == null) state.contentX = 50;
        if (state.contentY == null) state.contentY = 50;
        if (state.badgeRadius == null) state.badgeRadius = 0;
        if (state.tintImage == null) state.tintImage = false;
        if (state.tintIcon == null) state.tintIcon = true;
        state.effects.forEach(fx => {
            if (!fx.id) fx.id = fxId++;
            if (fx.type === 'liquidGlass') {
                fx.type = 'bevel';
                if (fx.angle == null) fx.angle = 135;
            }
        });
    } catch (_) {
        state = defaultState();
    }
}

function applyStateToUi() {
    document.getElementById('contentText').value = state.text;
    document.getElementById('contentScaleInput').value = state.contentScale;
    contentScaleSlider.setValue(state.contentScale, false);
    document.getElementById('contentXInput').value = state.contentX ?? 50;
    contentXSlider.setValue(state.contentX ?? 50, false);
    document.getElementById('contentYInput').value = state.contentY ?? 50;
    contentYSlider.setValue(state.contentY ?? 50, false);
    document.getElementById('gradientAngleInput').value = state.gradientAngle;
    gradientAngleSlider.setValue(state.gradientAngle, false);
    document.getElementById('badgeEnabled').checked = state.badgeEnabled;
    document.getElementById('badgeText').value = state.badgeText;
    document.getElementById('badgeWidthInput').value = state.badgeWidth;
    badgeWidthSlider.setValue(state.badgeWidth, false);
    document.getElementById('badgeHeightInput').value = state.badgeHeight;
    badgeHeightSlider.setValue(state.badgeHeight, false);
    document.getElementById('badgeRadiusInput').value = state.badgeRadius;
    badgeRadiusSlider.setValue(state.badgeRadius, false);
    document.getElementById('tintImage').checked = state.tintImage;
    document.getElementById('tintIcon').checked = state.tintIcon !== false;
    document.getElementById('exportAndroid').checked = state.exportAndroid;
    document.getElementById('exportIos').checked = state.exportIos;
    document.getElementById('exportBtn').disabled = !state.exportAndroid && !state.exportIos;
    document.getElementById('themedToggle').checked = state.themed;
    document.getElementById('androidPhone').classList.toggle('themed', state.themed);
    document.getElementById('contentImageName').textContent = state.contentImageName || 'No file';
    document.getElementById('bgImageName').textContent = state.bgImageName || 'No file';
    gradientKindSelect.setValue(state.gradientKind, false);
    fontTargetSelect.setValue(state.fontTarget || 'content', false);
    setContentType(state.contentType);
    setBgType(state.bgType);
    setPreviewShape(state.previewShape);
    renderGradientStops();
    paintMeshEditor();
    renderEffectChain();
    updateIconPickPreview();
    updateContextUi();
    updateBadgePosUi();
    updateContentPosUi();
}

function bindUi() {
    bindAccordions();
    bindMeshEditor();
    bindBadgePos();
    bindContentPos();

    document.getElementById('contentIconBtn').addEventListener('click', () => setContentType('icon'));
    document.getElementById('contentTextBtn').addEventListener('click', () => setContentType('text'));
    document.getElementById('contentImageBtn').addEventListener('click', () => setContentType('image'));
    document.getElementById('contentText').addEventListener('input', (e) => {
        state.text = e.target.value;
        scheduleRender();
    });
    document.getElementById('tintImage').addEventListener('change', (e) => {
        state.tintImage = e.target.checked;
        updateContextUi();
        scheduleRender();
    });
    document.getElementById('tintIcon').addEventListener('change', (e) => {
        state.tintIcon = e.target.checked;
        updateContextUi();
        updateIconPickPreview();
        scheduleRender();
    });

    document.getElementById('openIconPickerBtn').addEventListener('click', openIconDialog);
    document.getElementById('iconDialogCloseBtn').addEventListener('click', closeIconDialog);
    document.getElementById('iconDialogBackdrop').addEventListener('click', closeIconDialog);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeIconDialog();
            closeFontDropdown();
        }
    });

    let searchTimer = null;
    document.getElementById('iconSearchInput').addEventListener('input', (e) => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => searchIconsQuery(e.target.value), 280);
    });
    document.getElementById('packSearchInput').addEventListener('input', (e) => renderPackList(e.target.value));
    document.getElementById('allPacksBtn').addEventListener('click', () => selectAllPacks());
    let packIconTimer = null;
    document.getElementById('packIconSearchInput').addEventListener('input', (e) => {
        packQuery = e.target.value;
        clearTimeout(packIconTimer);
        packIconTimer = setTimeout(() => {
            if (allPacksMode) searchAllPacksQuery(packQuery);
            else resetAndFillIconGrid();
        }, 160);
    });
    bindIconGridScroll();

    async function loadContentImageFile(file) {
        if (!file || !file.type.startsWith('image/')) return;
        state.contentImageName = file.name;
        document.getElementById('contentImageName').textContent = file.name;
        state.contentImageData = await fileToDataUrl(file);
        state.tintImage = false;
        document.getElementById('tintImage').checked = false;
        setContentType('image');
    }

    const contentImageDrop = document.getElementById('contentImageDrop');
    contentImageDrop.addEventListener('click', (e) => {
        if (!e.target.closest('#contentImageBtnPick')) {
            document.getElementById('contentImageInput').click();
        }
    });
    contentImageDrop.addEventListener('dragover', (e) => {
        e.preventDefault();
        contentImageDrop.classList.add('dragover');
    });
    contentImageDrop.addEventListener('dragleave', () => contentImageDrop.classList.remove('dragover'));
    contentImageDrop.addEventListener('drop', async (e) => {
        e.preventDefault();
        contentImageDrop.classList.remove('dragover');
        const file = e.dataTransfer.files && e.dataTransfer.files[0];
        if (file) await loadContentImageFile(file);
    });

    document.getElementById('contentImageBtnPick').addEventListener('click', (e) => {
        e.stopPropagation();
        document.getElementById('contentImageInput').click();
    });
    document.getElementById('contentImageInput').addEventListener('change', async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        await loadContentImageFile(file);
    });

    document.getElementById('bgImageBtnPick').addEventListener('click', () => {
        document.getElementById('bgImageInput').click();
    });
    document.getElementById('bgImageInput').addEventListener('change', async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        state.bgImageName = file.name;
        document.getElementById('bgImageName').textContent = file.name;
        state.bgImageData = await fileToDataUrl(file);
        setBgType('image');
    });

    wireColor(
        document.getElementById('contentColorPicker'),
        document.getElementById('contentColorHex'),
        document.getElementById('contentColorSwatches'),
        () => state.color,
        (v) => {
            state.color = v;
            if (state.contentType === 'icon') updateIconPickPreview();
        }
    );
    wireColor(
        document.getElementById('bgColorPicker'),
        document.getElementById('bgColorHex'),
        document.getElementById('bgColorSwatches'),
        () => state.bgColor,
        (v) => { state.bgColor = v; }
    );
    wireColor(
        document.getElementById('badgeTextColorPicker'),
        document.getElementById('badgeTextColorHex'),
        null,
        () => state.badgeTextColor,
        (v) => { state.badgeTextColor = v; }
    );
    wireColor(
        document.getElementById('badgeBgColorPicker'),
        document.getElementById('badgeBgColorHex'),
        null,
        () => state.badgeBgColor,
        (v) => { state.badgeBgColor = v; }
    );

    wireSlider(contentScaleSlider, document.getElementById('contentScaleInput'), (v) => { state.contentScale = v; });
    wireSlider(contentXSlider, document.getElementById('contentXInput'), (v) => {
        state.contentX = v;
        updatePosGridUi('contentPosGrid', state.contentX, state.contentY);
    });
    wireSlider(contentYSlider, document.getElementById('contentYInput'), (v) => {
        state.contentY = v;
        updatePosGridUi('contentPosGrid', state.contentX, state.contentY);
    });
    wireSlider(gradientAngleSlider, document.getElementById('gradientAngleInput'), (v) => { state.gradientAngle = v; });
    wireSlider(badgeWidthSlider, document.getElementById('badgeWidthInput'), (v) => { state.badgeWidth = v; });
    wireSlider(badgeHeightSlider, document.getElementById('badgeHeightInput'), (v) => { state.badgeHeight = v; });
    wireSlider(badgeRadiusSlider, document.getElementById('badgeRadiusInput'), (v) => { state.badgeRadius = v; });

    document.getElementById('addEffectBtn').addEventListener('click', () => {
        const type = addEffectSelect.value;
        const fx = { ...EFFECT_DEFAULTS[type], id: fxId++ };
        state.effects.push(fx);
        document.getElementById('accEffects').classList.add('open');
        renderEffectChain();
        scheduleRender();
    });

    document.getElementById('bgTypeColorBtn').addEventListener('click', () => setBgType('color'));
    document.getElementById('bgTypeGradientBtn').addEventListener('click', () => setBgType('gradient'));
    document.getElementById('bgTypeImageBtn').addEventListener('click', () => setBgType('image'));

    document.getElementById('gradientKind').addEventListener('change', () => {
        state.gradientKind = gradientKindSelect.value;
        updateGradientKindUi();
        scheduleRender();
    });
    document.getElementById('addGradientStopBtn').addEventListener('click', () => {
        if (state.gradientStops.length >= 4) return;
        state.gradientStops.push({ color: '#FFFFFF', pos: 50 });
        renderGradientStops();
        scheduleRender();
    });

    document.getElementById('badgeEnabled').addEventListener('change', (e) => {
        state.badgeEnabled = e.target.checked;
        if (state.badgeEnabled) document.getElementById('accBadge').classList.add('open');
        updateContextUi();
        scheduleRender();
    });
    document.getElementById('badgeText').addEventListener('input', (e) => {
        state.badgeText = e.target.value;
        scheduleRender();
    });

    document.getElementById('fontTarget').addEventListener('change', () => {
        state.fontTarget = fontTargetSelect.value;
        rebuildFontStyleSelect();
    });
    document.getElementById('fontFamilyBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        const dropdown = document.getElementById('fontDropdown');
        if (dropdown.classList.contains('hidden')) openFontDropdown();
        else closeFontDropdown();
    });
    document.getElementById('fontSearch').addEventListener('input', (e) => renderFontList(e.target.value));
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#fontPicker')) closeFontDropdown();
    });

    document.getElementById('exportAndroid').addEventListener('change', (e) => {
        state.exportAndroid = e.target.checked;
        document.getElementById('exportBtn').disabled = !state.exportAndroid && !state.exportIos;
        saveStateSoon();
    });
    document.getElementById('exportIos').addEventListener('change', (e) => {
        state.exportIos = e.target.checked;
        document.getElementById('exportBtn').disabled = !state.exportAndroid && !state.exportIos;
        saveStateSoon();
    });
    document.getElementById('exportBtn').addEventListener('click', exportZip);
    document.getElementById('clearIconCacheBtn').addEventListener('click', () => {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(PACK_KEY);
        location.reload();
    });

    document.getElementById('themedToggle').addEventListener('change', (e) => {
        state.themed = e.target.checked;
        document.getElementById('androidPhone').classList.toggle('themed', state.themed);
        updateHomeIcons();
        saveStateSoon();
    });

    document.querySelectorAll('.im-shape-btn').forEach(btn => {
        btn.addEventListener('click', () => setPreviewShape(btn.dataset.shape));
    });
}

async function init() {
    loadState();
    buildHomeScreens();
    bindUi();
    applyStateToUi();
    rebuildFontStyleSelect();
    await renderAll();
    loadGoogleFontsCatalog();
}

init();
