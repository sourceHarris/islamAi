import { useEffect, useRef, useState } from 'react';

// Use browser media events directly: SDK 54's web player does not expose load errors.
export function useRecitation(onEnded: () => void) {
  const audio = useRef<HTMLAudioElement | null>(null), callback = useRef(onEnded);
  callback.current = onEnded;
  const [playing, setPlaying] = useState(false), [loading, setLoading] = useState(false);
  const [error, setError] = useState(''), [position, setPosition] = useState(0), [duration, setDuration] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clear = () => { if (timer.current) clearTimeout(timer.current); };
  const element = () => {
    if (!audio.current) {
      const media = new Audio(); media.preload = 'none';
      media.onplay = () => setPlaying(true); media.onpause = () => setPlaying(false);
      media.ontimeupdate = () => setPosition(media.currentTime);
      media.onloadedmetadata = () => { clear(); setLoading(false); setDuration(Number.isFinite(media.duration) ? media.duration : 0); };
      media.onwaiting = () => setLoading(true); media.oncanplay = () => setLoading(false);
      media.onerror = () => { clear(); setLoading(false); setPlaying(false); setError('Audio could not be loaded. Check your connection and try again.'); };
      media.onended = () => { setPlaying(false); callback.current(); };
      audio.current = media;
    }
    return audio.current;
  };
  useEffect(() => () => { clear(); const media = audio.current; if (media) { media.onplay = media.onpause = media.ontimeupdate = media.onloadedmetadata = media.onwaiting = media.oncanplay = media.onerror = media.onended = null; media.pause(); media.removeAttribute('src'); media.load(); } }, []);
  const play = async (uri?: string) => {
    const media = element(); setError('');
    if (uri) { media.pause(); media.src = uri; setPosition(0); setDuration(0); setLoading(true); clear(); timer.current = setTimeout(() => { if (media.readyState < 2) { media.pause(); setLoading(false); setError('Audio is taking too long to load. Try again.'); } }, 20000); }
    try { await media.play(); } catch { clear(); setLoading(false); setPlaying(false); setError('Playback was blocked or interrupted. Tap play to try again.'); }
  };
  return { playing, loading, error, position, duration, play,
    pause: () => audio.current?.pause(),
    seek: (seconds: number) => { if (audio.current && Number.isFinite(audio.current.duration)) audio.current.currentTime = Math.max(0, Math.min(seconds, audio.current.duration)); },
    stop: () => { clear(); if (audio.current) { audio.current.pause(); audio.current.removeAttribute('src'); audio.current.load(); } setPosition(0); setDuration(0); setLoading(false); setError(''); },
  };
}
