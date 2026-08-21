import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { playerAudio } from '../lib/audio';

export interface Track {
  sheikhId: string;
  sheikhName: string;
  surahNo: number;
  surahName: string;
  url: string;
}

interface PlayerContextValue {
  track: Track | null;
  playing: boolean;
  loading: boolean;
  position: number;
  duration: number;
  playTrack: (t: Track) => void;
  toggle: () => void;
  seek: (sec: number) => void;
  skip: (delta: number) => void;
  stop: () => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [track, setTrack] = useState<Track | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const trackRef = useRef<Track | null>(null);

  useEffect(() => {
    const offs = [
      playerAudio.on('state', (p: boolean) => {
        setPlaying(p);
        if (p) setLoading(false);
      }),
      playerAudio.on('time', (p: number) => setPosition(p)),
      playerAudio.on('loaded', (d: number) => {
        setDuration(d);
        setLoading(false);
      }),
      playerAudio.on('ended', () => {
        setPlaying(false);
        setPosition(0);
      }),
      playerAudio.on('error', () => {
        setLoading(false);
        setPlaying(false);
      }),
    ];
    return () => offs.forEach((off) => off());
  }, []);

  const playTrack = useCallback((t: Track) => {
    const current = trackRef.current;
    if (current && current.url === t.url) {
      if (playerAudio.playing) playerAudio.pause();
      else playerAudio.play();
      return;
    }
    trackRef.current = t;
    setTrack(t);
    setPosition(0);
    setDuration(0);
    setLoading(true);
    playerAudio.setSource(t.url, false);
    playerAudio.play();
  }, []);

  const toggle = useCallback(() => {
    if (!trackRef.current) return;
    if (playerAudio.playing) playerAudio.pause();
    else playerAudio.play();
  }, []);

  const seek = useCallback((sec: number) => {
    playerAudio.seek(sec);
  }, []);

  const skip = useCallback((delta: number) => {
    const next = Math.max(0, Math.min(playerAudio.position + delta, playerAudio.duration || 0));
    playerAudio.seek(next);
  }, []);

  const stop = useCallback(() => {
    playerAudio.stop();
    trackRef.current = null;
    setTrack(null);
    setPlaying(false);
    setPosition(0);
    setDuration(0);
  }, []);

  const value = useMemo<PlayerContextValue>(
    () => ({ track, playing, loading, position, duration, playTrack, toggle, seek, skip, stop }),
    [track, playing, loading, position, duration, playTrack, toggle, seek, skip, stop]
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
