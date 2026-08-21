import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface BuiltinFont {
  family: string;
  label: string;
  weights: string;
}

export const BUILTIN_FONTS: BuiltinFont[] = [
  { family: 'Cairo', label: 'القاهرة', weights: '400;600;700;800' },
  { family: 'Tajawal', label: 'تجوال', weights: '400;500;700;800' },
  { family: 'Almarai', label: 'المراعي', weights: '400;700;800' },
  { family: 'Amiri', label: 'أميري', weights: '400;700' },
  { family: 'Noto Naskh Arabic', label: 'نسخ عربي', weights: '400;700' },
  { family: 'Aref Ruqaa', label: 'رقعة', weights: '400;700' },
  { family: 'Reem Kufi', label: 'ريم كوفي', weights: '400;700' },
  { family: 'El Messiri', label: 'المسيري', weights: '400;600;700' },
  { family: 'Scheherazade New', label: 'شهرزاد', weights: '400;700' },
  { family: 'IBM Plex Sans Arabic', label: 'بلكس عربي', weights: '400;700' },
  { family: 'Lateef', label: 'لطيف', weights: '400;700' },
];

export const ACCENT_PRESETS = [
  '#0FA06F',
  '#0E9AA7',
  '#2E86DE',
  '#5B5BD6',
  '#8E44AD',
  '#D64570',
  '#C0392B',
  '#E67E22',
  '#D4A017',
  '#7A8B2F',
  '#546E7A',
  '#14532D',
];

/* ---------------- color utils ---------------- */

export function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  if (isNaN(n)) return [16, 160, 111];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex(r: number, g: number, b: number): string {
  const c = (v: number) =>
    Math.max(0, Math.min(255, Math.round(v)))
      .toString(16)
      .padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`.toUpperCase();
}

export function withAlpha(hex: string, a: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

/** amt: -1 (black) .. 1 (white) */
export function shade(hex: string, amt: number): string {
  const [r, g, b] = hexToRgb(hex);
  const t = amt < 0 ? 0 : 255;
  const p = Math.abs(amt);
  return rgbToHex(r + (t - r) * p, g + (t - g) * p, b + (t - b) * p);
}

export function hexToHsl(hex: string): [number, number, number] {
  const [r0, g0, b0] = hexToRgb(hex).map((v) => v / 255);
  const max = Math.max(r0, g0, b0);
  const min = Math.min(r0, g0, b0);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r0) h = ((g0 - b0) / d + (g0 < b0 ? 6 : 0)) / 6;
    else if (max === g0) h = ((b0 - r0) / d + 2) / 6;
    else h = ((r0 - g0) / d + 4) / 6;
  }
  return [h * 360, s, l];
}

export function hslToHex(h: number, s: number, l: number): string {
  const hue = ((h % 360) + 360) % 360 / 360;
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const f = (t0: number) => {
    let t = t0;
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return rgbToHex(f(hue + 1 / 3) * 255, f(hue) * 255, f(hue - 1 / 3) * 255);
}

export function isValidHex(v: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v);
}

/* ---------------- theme types ---------------- */

export interface ThemeColors {
  bg: string;
  card: string;
  cardAlt: string;
  text: string;
  sub: string;
  faint: string;
  border: string;
  accent: string;
  accentSoft: string;
  gold: string;
  danger: string;
  success: string;
  tabBar: string;
  input: string;
  overlay: string;
}

interface CustomFontMeta {
  family: string;
  name: string;
  b64?: string;
}

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  isDark: boolean;
  accent: string;
  setAccent: (hex: string) => void;
  fontFamily: string;
  fontLabel: string;
  setBuiltinFont: (f: BuiltinFont) => void;
  customFontName: string | null;
  uploadCustomFont: () => Promise<{ ok: boolean; message: string }>;
  removeCustomFont: () => void;
  fontScale: number;
  setFontScale: (n: number) => void;
  fs: (n: number) => number;
  colors: ThemeColors;
  accentGradient: [string, string];
  resetAllData: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const PREFS_KEY = '@noor/prefs';
const CUSTOM_FONT_KEY = '@noor/customfont';

function arrayBufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk) as any);
  }
  return (globalThis as any).btoa(bin);
}

function base64ToArrayBuffer(b64: string): ArrayBuffer {
  const bin = (globalThis as any).atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

function registerFontFace(family: string, data: ArrayBuffer): boolean {
  try {
    const doc: any = typeof document !== 'undefined' ? document : null;
    const FF: any = (globalThis as any).FontFace;
    if (!doc || !FF) return false;
    const face = new FF(family, data);
    face.load();
    doc.fonts.add(face);
    return true;
  } catch {
    return false;
  }
}

export function injectGoogleFonts() {
  try {
    if (typeof document === 'undefined') return;
    if ((globalThis as any).__noorGF) return;
    (globalThis as any).__noorGF = true;
    const pre = document.createElement('link');
    pre.rel = 'preconnect';
    pre.href = 'https://fonts.gstatic.com';
    (pre as any).crossOrigin = 'anonymous';
    document.head.appendChild(pre);
    const fams = BUILTIN_FONTS.map(
      (f) => `family=${f.family.replace(/ /g, '+')}:wght@${f.weights}`
    ).join('&');
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?${fams}&display=swap`;
    document.head.appendChild(link);
  } catch {}
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [accent, setAccentState] = useState('#0FA06F');
  const [fontFamily, setFontFamily] = useState('Cairo');
  const [fontLabel, setFontLabel] = useState('القاهرة');
  const [fontScale, setFontScaleState] = useState(1);
  const [customFont, setCustomFont] = useState<CustomFontMeta | null>(null);
  const [loaded, setLoaded] = useState(false);

  /* load prefs + custom font */
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(PREFS_KEY);
        if (raw) {
          const p = JSON.parse(raw);
          if (p.mode) setModeState(p.mode);
          if (p.accent && isValidHex(p.accent)) setAccentState(p.accent);
          if (typeof p.fontScale === 'number') setFontScaleState(p.fontScale);
          if (p.fontFamily) {
            setFontFamily(p.fontFamily);
            setFontLabel(p.fontLabel || p.fontFamily);
          }
        }
        const fraw = await AsyncStorage.getItem(CUSTOM_FONT_KEY);
        if (fraw) {
          const meta: CustomFontMeta = JSON.parse(fraw);
          if (meta.b64) {
            const ok = registerFontFace(meta.family, base64ToArrayBuffer(meta.b64));
            if (ok) setCustomFont(meta);
          }
        }
      } catch {}
      setLoaded(true);
    })();
  }, []);

  /* fallback if saved font was a removed custom font */
  useEffect(() => {
    if (!loaded) return;
    if (fontFamily.startsWith('CustomFont') && !customFont) {
      setFontFamily('Cairo');
      setFontLabel('القاهرة');
    }
  }, [loaded, fontFamily, customFont]);

  /* persist prefs */
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(
      PREFS_KEY,
      JSON.stringify({ mode, accent, fontFamily, fontLabel, fontScale })
    ).catch(() => {});
  }, [loaded, mode, accent, fontFamily, fontLabel, fontScale]);

  const isDark = mode === 'dark' || (mode === 'system' && systemScheme === 'dark');

  const setMode = useCallback((m: ThemeMode) => setModeState(m), []);
  const setAccent = useCallback((hex: string) => {
    if (isValidHex(hex)) setAccentState(hex.toUpperCase());
  }, []);

  const setBuiltinFont = useCallback((f: BuiltinFont) => {
    setFontFamily(f.family);
    setFontLabel(f.label);
  }, []);

  const setFontScale = useCallback((n: number) => {
    setFontScaleState(Math.max(0.85, Math.min(1.35, n)));
  }, []);

  const uploadCustomFont = useCallback(async (): Promise<{ ok: boolean; message: string }> => {
    try {
      const doc: any = typeof document !== 'undefined' ? document : null;
      if (!doc) return { ok: false, message: 'رفع الخطوط متاح في نسخة الويب' };
      return await new Promise((resolve) => {
        const input = doc.createElement('input');
        input.type = 'file';
        input.accept = '.ttf,.otf,.woff,.woff2';
        input.style.display = 'none';
        input.onchange = async () => {
          try {
            const file = input.files && input.files[0];
            if (!file) {
              resolve({ ok: false, message: 'لم يتم اختيار ملف' });
              return;
            }
            if (file.size > 4_500_000) {
              resolve({ ok: false, message: 'حجم الخط كبير جدًا (الحد ٤٫٥ م.ب)' });
              return;
            }
            const buf = await file.arrayBuffer();
            const family = 'CustomFont' + Date.now();
            const ok = registerFontFace(family, buf);
            if (!ok) {
              resolve({ ok: false, message: 'تعذّر تحميل هذا الملف كخط' });
              return;
            }
            const meta: CustomFontMeta = {
              family,
              name: file.name,
              b64: arrayBufferToBase64(buf),
            };
            setCustomFont(meta);
            setFontFamily(family);
            setFontLabel(file.name.replace(/\.(ttf|otf|woff2?|TTF|OTF|WOFF2?)$/, ''));
            AsyncStorage.setItem(CUSTOM_FONT_KEY, JSON.stringify(meta)).catch(() => {});
            resolve({ ok: true, message: 'تم تحميل الخط بنجاح ✨' });
          } catch {
            resolve({ ok: false, message: 'حدث خطأ أثناء رفع الخط' });
          }
        };
        doc.body.appendChild(input);
        input.click();
        doc.body.removeChild(input);
      });
    } catch {
      return { ok: false, message: 'حدث خطأ أثناء رفع الخط' };
    }
  }, []);

  const removeCustomFont = useCallback(() => {
    setCustomFont(null);
    AsyncStorage.removeItem(CUSTOM_FONT_KEY).catch(() => {});
    if (fontFamily.startsWith('CustomFont')) {
      setFontFamily('Cairo');
      setFontLabel('القاهرة');
    }
  }, [fontFamily]);

  const resetAllData = useCallback(async () => {
    try {
      await AsyncStorage.clear();
      if (typeof window !== 'undefined' && (window as any).location) {
        (window as any).location.reload();
      }
    } catch {}
  }, []);

  const colors: ThemeColors = useMemo(() => {
    if (isDark) {
      return {
        bg: '#0B100E',
        card: '#141B18',
        cardAlt: '#1A231F',
        text: '#EFF2EC',
        sub: '#93A09A',
        faint: '#5C6B64',
        border: 'rgba(255,255,255,0.09)',
        accent,
        accentSoft: withAlpha(accent, 0.16),
        gold: '#D4AF37',
        danger: '#E5484D',
        success: '#30A46C',
        tabBar: '#101613',
        input: '#1C2621',
        overlay: 'rgba(4,8,6,0.72)',
      };
    }
    return {
      bg: '#F6F3EC',
      card: '#FFFFFF',
      cardAlt: '#FBFAF6',
      text: '#21252B',
      sub: '#6E7681',
      faint: '#9AA1AA',
      border: 'rgba(30,35,40,0.09)',
      accent,
      accentSoft: withAlpha(accent, 0.12),
      gold: '#C9A227',
      danger: '#D64550',
      success: '#1F9D61',
      tabBar: '#FDFCF9',
      input: '#F1EEE6',
      overlay: 'rgba(20,22,20,0.5)',
    };
  }, [isDark, accent]);

  const accentGradient = useMemo<[string, string]>(
    () => [shade(accent, 0.18), shade(accent, -0.22)],
    [accent]
  );

  const fs = useCallback((n: number) => n * fontScale, [fontScale]);

  const value: ThemeContextValue = {
    mode,
    setMode,
    isDark,
    accent,
    setAccent,
    fontFamily,
    fontLabel,
    setBuiltinFont,
    customFontName: customFont ? customFont.name : null,
    uploadCustomFont,
    removeCustomFont,
    fontScale,
    setFontScale,
    fs,
    colors,
    accentGradient,
    resetAllData,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
