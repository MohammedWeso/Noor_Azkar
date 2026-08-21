import { Platform } from 'react-native';

export const pad2 = (n: number) => String(n).padStart(2, '0');

export const WEEKDAYS_AR = [
  'الأحد',
  'الاثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت',
];

export const WEEKDAYS_SHORT = [
  'أحد',
  'اثنين',
  'ثلاثاء',
  'أربعاء',
  'خميس',
  'جمعة',
  'سبت',
];

export function hijriToday(): string {
  try {
    return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());
  } catch {
    return '';
  }
}

export function gregorianToday(): string {
  try {
    return new Intl.DateTimeFormat('ar', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());
  } catch {
    return '';
  }
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return 'ليلة مباركة';
  if (h < 12) return 'صباح النور';
  if (h < 17) return 'طاب يومك';
  return 'مساء النور';
}

export function dayOfYear(d: Date = new Date()): number {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / 86400000);
}

export function format12(hour24: number, minute: number): string {
  const period = hour24 >= 12 ? 'م' : 'ص';
  let h = hour24 % 12;
  if (h === 0) h = 12;
  return `${h}:${pad2(minute)} ${period}`;
}

export function formatSeconds(total: number): string {
  const s = Math.max(0, Math.floor(total));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  if (h > 0) return `${h}:${pad2(m)}:${pad2(ss)}`;
  return `${m}:${pad2(ss)}`;
}

export function vibrate(pattern: number | number[] = 15) {
  try {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
      const nav: any = navigator;
      if (nav.vibrate) nav.vibrate(pattern);
    }
  } catch {}
}

export async function copyText(t: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined') {
      const nav: any = navigator;
      if (nav.clipboard && nav.clipboard.writeText) {
        await nav.clipboard.writeText(t);
        return true;
      }
    }
  } catch {}
  return false;
}

export async function shareText(t: string): Promise<void> {
  try {
    if (typeof navigator !== 'undefined') {
      const nav: any = navigator;
      if (nav.share) {
        await nav.share({ text: t });
        return;
      }
    }
  } catch {}
  await copyText(t);
}

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
