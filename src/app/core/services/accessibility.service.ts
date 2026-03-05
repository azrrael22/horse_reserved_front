import { Injectable, signal } from '@angular/core';

export type Contrast = 'normal' | 'high';
export type FontSize = 'normal' | 'large' | 'xlarge';
export type Saturation = 'normal' | 'low' | 'none';

interface A11yPrefs {
  contrast: Contrast;
  fontSize: FontSize;
  saturation: Saturation;
}

const STORAGE_KEY = 'hr_a11y';
const DEFAULTS: A11yPrefs = { contrast: 'normal', fontSize: 'normal', saturation: 'normal' };

@Injectable({ providedIn: 'root' })
export class AccessibilityService {
  readonly contrast   = signal<Contrast>(DEFAULTS.contrast);
  readonly fontSize   = signal<FontSize>(DEFAULTS.fontSize);
  readonly saturation = signal<Saturation>(DEFAULTS.saturation);

  constructor() {
    const saved = this.load();
    this.contrast.set(saved.contrast);
    this.fontSize.set(saved.fontSize);
    this.saturation.set(saved.saturation);
    this.applyClasses(saved);
  }

  setContrast(v: Contrast): void {
    this.contrast.set(v);
    this.applyAndSave();
  }

  setFontSize(v: FontSize): void {
    this.fontSize.set(v);
    this.applyAndSave();
  }

  setSaturation(v: Saturation): void {
    this.saturation.set(v);
    this.applyAndSave();
  }

  private applyAndSave(): void {
    const prefs: A11yPrefs = {
      contrast:   this.contrast(),
      fontSize:   this.fontSize(),
      saturation: this.saturation(),
    };
    this.applyClasses(prefs);
    this.save(prefs);
  }

  private applyClasses(prefs: A11yPrefs): void {
    const root = document.documentElement;

    // Clase hc en <html> — usada para re-invertir imágenes en CSS
    root.classList.toggle('hc', prefs.contrast === 'high');

    // Tamaño de fuente
    root.classList.remove('fs-large', 'fs-xlarge');
    if (prefs.fontSize !== 'normal') root.classList.add(`fs-${prefs.fontSize}`);

    // Filtro combinado (contraste + saturación) aplicado vía CSS custom property
    const filters: string[] = [];
    if (prefs.contrast === 'high') filters.push('invert(1)');
    if (prefs.saturation === 'low')  filters.push('saturate(0.4)');
    else if (prefs.saturation === 'none') filters.push('grayscale(1)');

    root.style.setProperty('--a11y-split-filter', filters.length ? filters.join(' ') : 'none');
  }

  private load(): A11yPrefs {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
    } catch {
      return { ...DEFAULTS };
    }
  }

  private save(prefs: A11yPrefs): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  }
}
