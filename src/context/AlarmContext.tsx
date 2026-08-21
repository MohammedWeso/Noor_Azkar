import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AlarmSound, DEFAULT_SOUND_ID, getSound } from '../data/alarmSounds';
import { alarmAudio, playerAudio, previewAudio } from '../lib/audio';
import { pad2, uid, vibrate } from '../lib/utils';

export interface Alarm {
  id: string;
  label: string;
  hour24: number;
  minute: number;
  days: number[]; // 0 = Sunday ... 6 = Saturday
  soundId: string;
  enabled: boolean;
}

export interface RingingState {
  alarm: Alarm;
  sound: AlarmSound;
}

interface AlarmContextValue {
  alarms: Alarm[];
  addAlarm: (a: Omit<Alarm, 'id'>) => void;
  updateAlarm: (a: Alarm) => void;
  deleteAlarm: (id: string) => void;
  toggleAlarm: (id: string) => void;
  ringing: RingingState | null;
  dismissRinging: () => void;
  snoozeRinging: () => void;
  nextAlarm: Alarm | null;
}

const AlarmContext = createContext<AlarmContextValue | null>(null);

const ALARMS_KEY = '@noor/alarms';
const FIRED_KEY = '@noor/fired';
export const SNOOZE_MINUTES = 5;

function tryNotify(title: string, body: string) {
  try {
    const N: any = (globalThis as any).Notification;
    if (N && N.permission === 'granted') {
      new N(title, { body });
    }
  } catch {}
}

export function requestNotifyPermission() {
  try {
    const N: any = (globalThis as any).Notification;
    if (N && N.permission === 'default') N.requestPermission();
  } catch {}
}

export function AlarmProvider({ children }: { children: React.ReactNode }) {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [ringing, setRinging] = useState<RingingState | null>(null);
  const [snoozes, setSnoozes] = useState<Record<string, number>>({});
  const firedRef = useRef<Record<string, string>>({});
  const ringingRef = useRef<RingingState | null>(null);
  const loadedRef = useRef(false);

  ringingRef.current = ringing;

  /* load persisted alarms + fired map */
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(ALARMS_KEY);
        if (raw) setAlarms(JSON.parse(raw));
        const f = await AsyncStorage.getItem(FIRED_KEY);
        if (f) firedRef.current = JSON.parse(f);
      } catch {}
      loadedRef.current = true;
    })();
  }, []);

  /* persist */
  useEffect(() => {
    if (!loadedRef.current) return;
    AsyncStorage.setItem(ALARMS_KEY, JSON.stringify(alarms)).catch(() => {});
  }, [alarms]);

  const fire = useCallback((alarm: Alarm) => {
    const sound = getSound(alarm.soundId);
    const now = new Date();
    const firedKey = `${now.toDateString()}-${pad2(alarm.hour24)}:${pad2(alarm.minute)}`;
    firedRef.current[alarm.id] = firedKey;
    AsyncStorage.setItem(FIRED_KEY, JSON.stringify(firedRef.current)).catch(() => {});

    // pause other audio
    playerAudio.pause();
    previewAudio.stop();

    alarmAudio.setSource(sound.url, true);
    alarmAudio.play();
    vibrate([350, 150, 350, 150, 700]);
    setRinging({ alarm, sound });
    tryNotify('تنبيه: ' + (alarm.label || 'المنبه'), sound.name);
  }, []);

  /* the engine — ticks every second */
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const hm = `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
      const day = now.getDay();

      // snoozed alarms
      setSnoozes((prev) => {
        const entries = Object.entries(prev);
        if (entries.length === 0) return prev;
        const next = { ...prev };
        let changed = false;
        for (const [id, ts] of entries) {
          if (ts <= now.getTime()) {
            delete next[id];
            changed = true;
            const alarm = alarms.find((a) => a.id === id);
            if (alarm && !ringingRef.current) fire(alarm);
          }
        }
        return changed ? next : prev;
      });

      if (ringingRef.current) return;

      for (const alarm of alarms) {
        if (!alarm.enabled) continue;
        if (alarm.days.length > 0 && !alarm.days.includes(day)) continue;
        if (`${pad2(alarm.hour24)}:${pad2(alarm.minute)}` !== hm) continue;
        const firedKey = `${now.toDateString()}-${hm}`;
        if (firedRef.current[alarm.id] === firedKey) continue;
        fire(alarm);
        break;
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [alarms, fire]);

  const addAlarm = useCallback((a: Omit<Alarm, 'id'>) => {
    const alarm: Alarm = { ...a, id: uid() };
    setAlarms((prev) =>
      [...prev, alarm].sort((x, y) => x.hour24 * 60 + x.minute - (y.hour24 * 60 + y.minute))
    );
    requestNotifyPermission();
  }, []);

  const updateAlarm = useCallback((a: Alarm) => {
    setAlarms((prev) =>
      prev
        .map((x) => (x.id === a.id ? a : x))
        .sort((x, y) => x.hour24 * 60 + x.minute - (y.hour24 * 60 + y.minute))
    );
  }, []);

  const deleteAlarm = useCallback((id: string) => {
    setAlarms((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const toggleAlarm = useCallback((id: string) => {
    setAlarms((prev) => prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)));
  }, []);

  const dismissRinging = useCallback(() => {
    alarmAudio.stop();
    setRinging(null);
  }, []);

  const snoozeRinging = useCallback(() => {
    const current = ringingRef.current;
    alarmAudio.stop();
    if (current) {
      setSnoozes((prev) => ({
        ...prev,
        [current.alarm.id]: Date.now() + SNOOZE_MINUTES * 60 * 1000,
      }));
    }
    setRinging(null);
  }, []);

  /* next scheduled alarm (for home card) */
  const nextAlarm = useMemo<Alarm | null>(() => {
    const now = new Date();
    let best: Alarm | null = null;
    let bestDelta = Infinity;
    for (const alarm of alarms) {
      if (!alarm.enabled) continue;
      for (let offset = 0; offset < 8; offset++) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
        const day = d.getDay();
        if (alarm.days.length > 0 && !alarm.days.includes(day)) continue;
        const t = new Date(d.getFullYear(), d.getMonth(), d.getDate(), alarm.hour24, alarm.minute, 0);
        const delta = t.getTime() - now.getTime();
        if (delta > 0 && delta < bestDelta) {
          bestDelta = delta;
          best = alarm;
        }
        break; // only first matching day per alarm matters
      }
    }
    return best;
  }, [alarms]);

  const value = useMemo<AlarmContextValue>(
    () => ({
      alarms,
      addAlarm,
      updateAlarm,
      deleteAlarm,
      toggleAlarm,
      ringing,
      dismissRinging,
      snoozeRinging,
      nextAlarm,
    }),
    [alarms, addAlarm, updateAlarm, deleteAlarm, toggleAlarm, ringing, dismissRinging, snoozeRinging, nextAlarm]
  );

  return <AlarmContext.Provider value={value}>{children}</AlarmContext.Provider>;
}

export function useAlarms(): AlarmContextValue {
  const ctx = useContext(AlarmContext);
  if (!ctx) throw new Error('useAlarms must be used within AlarmProvider');
  return ctx;
}
