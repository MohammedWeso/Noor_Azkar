import { pad2 } from './utils';

export interface PrayerMeta {
  key: string;
  ar: string;
}

export const PRAYER_ORDER: PrayerMeta[] = [
  { key: 'Fajr', ar: 'الفجر' },
  { key: 'Sunrise', ar: 'الشروق' },
  { key: 'Dhuhr', ar: 'الظهر' },
  { key: 'Asr', ar: 'العصر' },
  { key: 'Maghrib', ar: 'المغرب' },
  { key: 'Isha', ar: 'العشاء' },
];

export const MAIN_PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export const MAKKAH = { lat: 21.422487, lng: 39.826206 };

export function cleanTime(t: string): string {
  return t ? t.slice(0, 5) : '';
}

export async function fetchPrayerTimes(
  lat: number,
  lng: number
): Promise<Record<string, string>> {
  const d = new Date();
  const dateStr = `${pad2(d.getDate())}-${pad2(d.getMonth() + 1)}-${d.getFullYear()}`;
  const url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lng}&method=4`;
  const res = await fetch(url);
  const j = await res.json();
  if (!j || j.code !== 200 || !j.data || !j.data.timings) {
    throw new Error('failed');
  }
  return j.data.timings;
}

export interface NextPrayer {
  key: string;
  ar: string;
  time: string;
  secondsLeft: number;
  isTomorrow: boolean;
}

export function getNextPrayer(
  timings: Record<string, string>,
  now: Date = new Date()
): NextPrayer | null {
  if (!timings) return null;
  const candidates: { key: string; ar: string; time: string; date: Date }[] = [];
  for (const dayOffset of [0, 1]) {
    for (const p of PRAYER_ORDER) {
      if (!MAIN_PRAYERS.includes(p.key)) continue;
      const t = cleanTime(timings[p.key] || '');
      if (!/^\d{2}:\d{2}$/.test(t)) continue;
      const [hh, mm] = t.split(':').map(Number);
      const date = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + dayOffset,
        hh,
        mm,
        0
      );
      if (date.getTime() > now.getTime()) {
        candidates.push({ key: p.key, ar: p.ar, time: t, date });
      }
    }
    if (candidates.length > 0) break;
  }
  if (candidates.length === 0) return null;
  const next = candidates[0];
  return {
    key: next.key,
    ar: next.ar,
    time: next.time,
    secondsLeft: Math.floor((next.date.getTime() - now.getTime()) / 1000),
    isTomorrow: next.date.getDate() !== now.getDate(),
  };
}

export function getCurrentPosition(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    try {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        reject(new Error('no-geo'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => reject(err),
        { timeout: 9000, maximumAge: 600000 }
      );
    } catch (e) {
      reject(e);
    }
  });
}
