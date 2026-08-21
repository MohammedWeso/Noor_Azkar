import { Platform } from 'react-native';

export type AudioEventName = 'time' | 'loaded' | 'ended' | 'error' | 'state';

type Listener = (payload?: any) => void;

const SILENT_WAV =
  'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';

/**
 * HTML5-Audio based engine (web export).
 * Each engine owns a single <audio> element that is reused across sources,
 * so a user-gesture "unlock" persists for later programmatic playback (alarms).
 */
export class AudioEngine {
  private el: any = null;
  private listeners: Record<string, Listener[]> = {};
  private _duration = 0;
  private _position = 0;
  private _playing = false;
  private _src: string | null = null;
  private _unlocked = false;

  private ensureEl(): any {
    if (this.el) return this.el;
    if (Platform.OS !== 'web' || typeof document === 'undefined') return null;
    const A: any = (globalThis as any).Audio;
    if (!A) return null;
    const el = new A();
    el.preload = 'auto';
    el.addEventListener('timeupdate', () => {
      this._position = el.currentTime || 0;
      this.emit('time', this._position);
    });
    const durCb = () => {
      const d = el.duration;
      if (d && isFinite(d)) {
        this._duration = d;
        this.emit('loaded', d);
      }
    };
    el.addEventListener('durationchange', durCb);
    el.addEventListener('loadedmetadata', durCb);
    el.addEventListener('ended', () => {
      if (!el.loop) {
        this._playing = false;
        this.emit('ended');
        this.emit('state', false);
      }
    });
    el.addEventListener('error', () => this.emit('error'));
    el.addEventListener('play', () => {
      this._playing = true;
      this.emit('state', true);
    });
    el.addEventListener('pause', () => {
      this._playing = false;
      this.emit('state', false);
    });
    this.el = el;
    return el;
  }

  on(name: AudioEventName, cb: Listener): () => void {
    if (!this.listeners[name]) this.listeners[name] = [];
    this.listeners[name].push(cb);
    return () => {
      this.listeners[name] = (this.listeners[name] || []).filter((x) => x !== cb);
    };
  }

  private emit(name: string, payload?: any) {
    (this.listeners[name] || []).forEach((cb) => {
      try {
        cb(payload);
      } catch {}
    });
  }

  setSource(src: string, loop = false) {
    const el = this.ensureEl();
    if (!el) return;
    if (this._src !== src) {
      el.src = src;
      this._src = src;
      this._position = 0;
      this._duration = 0;
      try {
        el.load();
      } catch {}
    }
    el.loop = loop;
  }

  async play() {
    const el = this.ensureEl();
    if (!el || !el.src) return;
    try {
      await el.play();
    } catch {}
  }

  pause() {
    if (this.el) {
      try {
        this.el.pause();
      } catch {}
    }
  }

  stop() {
    if (!this.el) return;
    try {
      this.el.pause();
      this.el.currentTime = 0;
    } catch {}
    this._position = 0;
  }

  seek(sec: number) {
    if (!this.el) return;
    try {
      this.el.currentTime = sec;
      this._position = sec;
      this.emit('time', sec);
    } catch {}
  }

  setLoop(loop: boolean) {
    if (this.el) this.el.loop = loop;
  }

  /** Unlock playback for future non-gesture calls (must run inside a user gesture). */
  unlock() {
    const el = this.ensureEl();
    if (!el || this._unlocked) return;
    this._unlocked = true;
    try {
      if (!el.src) el.src = SILENT_WAV;
      el.muted = true;
      const p = el.play();
      const done = () => {
        try {
          el.pause();
        } catch {}
        el.muted = false;
      };
      if (p && p.then) {
        p.then(done).catch(() => {
          el.muted = false;
        });
      } else {
        done();
      }
    } catch {}
  }

  get position() {
    return this._position;
  }
  get duration() {
    return this._duration;
  }
  get playing() {
    return this._playing;
  }
  get source() {
    return this._src;
  }
}

/** Recitation player */
export const playerAudio = new AudioEngine();
/** Ringing alarm (loops until dismissed) */
export const alarmAudio = new AudioEngine();
/** Short previews inside forms */
export const previewAudio = new AudioEngine();

export function unlockAllAudio() {
  playerAudio.unlock();
  alarmAudio.unlock();
  previewAudio.unlock();
}
