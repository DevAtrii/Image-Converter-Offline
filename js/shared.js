function icon(name, size = 16) {
    return `<iconify-icon icon="lucide:${name}" width="${size}" height="${size}"></iconify-icon>`;
}

const FORMAT_OPTIONS = [
    { value: 'image/png', label: 'PNG' },
    { value: 'image/jpeg', label: 'JPEG' },
    { value: 'image/webp', label: 'WebP' },
    { value: 'image/gif', label: 'GIF' }
];

const customSelects = [];

class CustomSelect {
    constructor(root, options, defaultValue) {
        this.root = root;
        this.options = options;
        this._value = defaultValue || options[0].value;
        this.open = false;
        this.focusIndex = -1;
        this.render();
        this.bind();
        this.updateUI(false);
    }

    get value() {
        return this._value;
    }

    set value(nextValue) {
        this.setValue(nextValue, false);
    }

    hasOption(value) {
        return this.options.some(option => option.value === value);
    }

    render() {
        this.root.innerHTML = `
            <button type="button" class="custom-select-trigger" aria-expanded="false" aria-haspopup="listbox">
                <span class="custom-select-value"></span>
                <span class="custom-select-chevron">${icon('chevron-down', 16)}</span>
            </button>
            <div class="custom-select-menu hidden" role="listbox">
                ${this.options.map(option => `
                    <button type="button" class="custom-select-option" role="option" data-value="${option.value}" aria-selected="false">
                        <span>${option.label}</span>
                        <span class="custom-select-option-check">${icon('check', 16)}</span>
                    </button>
                `).join('')}
            </div>
        `;

        this.trigger = this.root.querySelector('.custom-select-trigger');
        this.valueEl = this.root.querySelector('.custom-select-value');
        this.menu = this.root.querySelector('.custom-select-menu');
        this.optionEls = Array.from(this.root.querySelectorAll('.custom-select-option'));
    }

    bind() {
        this.trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });

        this.optionEls.forEach((optionEl, index) => {
            optionEl.addEventListener('click', (e) => {
                e.stopPropagation();
                this.setValue(optionEl.dataset.value);
                this.close();
            });

            optionEl.addEventListener('mousemove', () => {
                this.setFocusedIndex(index);
            });
        });

        this.root.addEventListener('keydown', (e) => this.onKeyDown(e));
    }

    getLabel(value = this._value) {
        return this.options.find(option => option.value === value)?.label || '';
    }

    setValue(nextValue, triggerChange = true) {
        if (!this.hasOption(nextValue)) return;
        this._value = nextValue;
        this.updateUI(triggerChange);
    }

    updateUI(triggerChange = true) {
        this.valueEl.textContent = this.getLabel();
        this.optionEls.forEach(optionEl => {
            const selected = optionEl.dataset.value === this._value;
            optionEl.classList.toggle('selected', selected);
            optionEl.setAttribute('aria-selected', selected ? 'true' : 'false');
        });
        if (triggerChange) {
            this.root.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }

    setFocusedIndex(index) {
        this.focusIndex = index;
        this.optionEls.forEach((optionEl, i) => {
            optionEl.classList.toggle('focused', i === index);
        });
    }

    openMenu() {
        customSelects.forEach(select => {
            if (select !== this) select.close();
        });
        this.open = true;
        this.root.classList.add('open');
        this.menu.classList.remove('hidden');
        this.trigger.setAttribute('aria-expanded', 'true');
        const selectedIndex = this.optionEls.findIndex(optionEl => optionEl.dataset.value === this._value);
        this.setFocusedIndex(selectedIndex >= 0 ? selectedIndex : 0);
    }

    close() {
        this.open = false;
        this.root.classList.remove('open');
        this.menu.classList.add('hidden');
        this.trigger.setAttribute('aria-expanded', 'false');
        this.setFocusedIndex(-1);
    }

    toggle() {
        if (this.open) {
            this.close();
        } else {
            this.openMenu();
        }
    }

    onKeyDown(e) {
        if (!this.open && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            this.openMenu();
            return;
        }

        if (!this.open) return;

        if (e.key === 'Escape') {
            e.preventDefault();
            this.close();
            this.trigger.focus();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.setFocusedIndex(Math.min(this.focusIndex + 1, this.optionEls.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.setFocusedIndex(Math.max(this.focusIndex - 1, 0));
        } else if (e.key === 'Home') {
            e.preventDefault();
            this.setFocusedIndex(0);
        } else if (e.key === 'End') {
            e.preventDefault();
            this.setFocusedIndex(this.optionEls.length - 1);
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (this.focusIndex >= 0) {
                this.setValue(this.optionEls[this.focusIndex].dataset.value);
                this.close();
                this.trigger.focus();
            }
        }
    }
}

function initCustomSelect(root, options, defaultValue) {
    const select = new CustomSelect(root, options, defaultValue);
    customSelects.push(select);
    return select;
}

class CustomSlider {
    constructor(root, { min = 1, max = 100, value = 90, step = 1 } = {}) {
        this.root = root;
        this.min = min;
        this.max = max;
        this.step = step;
        this._value = value;
        this.dragging = false;
        this.render();
        this.bind();
        this.updateUI(false);
    }

    get value() {
        return this._value;
    }

    set value(nextValue) {
        this.setValue(nextValue, false);
    }

    clamp(value) {
        return Math.min(this.max, Math.max(this.min, value));
    }

    snap(value) {
        const stepped = Math.round((this.clamp(value) - this.min) / this.step) * this.step + this.min;
        return this.clamp(stepped);
    }

    setValue(nextValue, triggerInput = true) {
        this._value = this.snap(nextValue);
        this.updateUI(triggerInput);
    }

    getPercent() {
        return ((this._value - this.min) / (this.max - this.min)) * 100;
    }

    render() {
        this.root.innerHTML = `
            <div class="custom-slider-track">
                <div class="custom-slider-range"></div>
                <div class="custom-slider-thumb" tabindex="-1" aria-hidden="true"></div>
            </div>
        `;
        this.track = this.root.querySelector('.custom-slider-track');
        this.range = this.root.querySelector('.custom-slider-range');
        this.thumb = this.root.querySelector('.custom-slider-thumb');
    }

    bind() {
        this.track.addEventListener('pointerdown', (e) => this.onPointerDown(e));
        this.root.addEventListener('keydown', (e) => this.onKeyDown(e));
    }

    updateUI(triggerInput = true) {
        const percent = this.getPercent();
        this.range.style.width = `${percent}%`;
        this.thumb.style.left = `${percent}%`;
        this.root.setAttribute('aria-valuenow', String(this._value));

        if (triggerInput) {
            this.root.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    valueFromClientX(clientX) {
        const rect = this.track.getBoundingClientRect();
        if (rect.width <= 0) return this._value;
        const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
        return this.min + ratio * (this.max - this.min);
    }

    onPointerDown(e) {
        if (e.button !== 0) return;
        e.preventDefault();
        this.dragging = true;
        this.root.classList.add('dragging');
        this.setValue(this.valueFromClientX(e.clientX));

        const onMove = (moveEvent) => {
            this.setValue(this.valueFromClientX(moveEvent.clientX));
        };

        const onUp = () => {
            this.dragging = false;
            this.root.classList.remove('dragging');
            this.root.dispatchEvent(new Event('change', { bubbles: true }));
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
        };

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
    }

    onKeyDown(e) {
        let nextValue = this._value;

        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
            e.preventDefault();
            nextValue = this._value + this.step;
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
            e.preventDefault();
            nextValue = this._value - this.step;
        } else if (e.key === 'Home') {
            e.preventDefault();
            nextValue = this.min;
        } else if (e.key === 'End') {
            e.preventDefault();
            nextValue = this.max;
        } else {
            return;
        }

        this.setValue(nextValue);
        this.root.dispatchEvent(new Event('change', { bubbles: true }));
    }
}

function initCustomSlider(root, options) {
    return new CustomSlider(root, options);
}

document.addEventListener('click', () => {
    customSelects.forEach(select => select.close());
});

const THEME_STORAGE_KEY = 'imageConverterTheme';
const themeLightBtn = document.getElementById('themeLightBtn');
const themeDarkBtn = document.getElementById('themeDarkBtn');
function formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatLabel(mime) {
    return mime.split('/')[1].toUpperCase();
}

function getThemeColor(theme) {
    return theme === 'dark' ? '#0a1510' : '#15803d';
}

function applyTheme(theme) {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(THEME_STORAGE_KEY, theme);

    themeLightBtn.classList.toggle('active', theme === 'light');
    themeDarkBtn.classList.toggle('active', theme === 'dark');
    themeLightBtn.setAttribute('aria-pressed', theme === 'light');
    themeDarkBtn.setAttribute('aria-pressed', theme === 'dark');

    const themeColor = getThemeColor(theme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColor);
    document.querySelector('meta[name="msapplication-TileColor"]')?.setAttribute('content', themeColor);
}

function initTheme() {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved === 'dark' || saved === 'light' ? saved : (prefersDark ? 'dark' : 'light');
    applyTheme(theme);
}

themeLightBtn.addEventListener('click', () => applyTheme('light'));
themeDarkBtn.addEventListener('click', () => applyTheme('dark'));
initTheme();

const clearCacheBtn = document.getElementById('clearCacheBtn');

async function clearServiceWorkerCache() {
    clearCacheBtn.disabled = true;

    try {
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(name => caches.delete(name)));
        }

        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            await Promise.all(registrations.map(registration => registration.unregister()));
        }

        alert('Cache cleared. The page will reload with fresh content.');
        window.location.reload();
    } catch (error) {
        console.error('Failed to clear cache:', error);
        alert('Failed to clear cache. Please try again.');
        clearCacheBtn.disabled = false;
    }
}

clearCacheBtn.addEventListener('click', clearServiceWorkerCache);
document.getElementById('footerYear').textContent = new Date().getFullYear();

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(() => console.log('ServiceWorker registered'))
            .catch(error => console.log('ServiceWorker registration failed:', error));
    });
}
