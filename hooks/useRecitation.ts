import { useCallback, useEffect, useRef, useState } from 'react';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

export function useRecitation(onEnded: () => void) {
  const player = useAudioPlayer(null, { updateInterval: 250 });
  const status = useAudioPlayerStatus(player);
  const callback = useRef(onEnded); callback.current = onEnded;
  const [loading, setLoading] = useState(false), [error, setError] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clear = useCallback(() => { if (timer.current) clearTimeout(timer.current); }, []);
  useEffect(() => { if (status.isLoaded) { clear(); setLoading(false); } }, [status.isLoaded, clear]);
  useEffect(() => { if (status.didJustFinish) callback.current(); }, [status.didJustFinish]);
  useEffect(() => () => { clear(); }, [clear]);
  const play = async (uri?: string) => {
    setError('');
    try {
      await setAudioModeAsync({ playsInSilentMode: true });
      if (uri) { player.pause(); player.replace({ uri }); setLoading(true); clear(); timer.current = setTimeout(() => { if (!player.isLoaded) { player.pause(); setLoading(false); setError('Audio could not be loaded. Check your connection and try again.'); } }, 20000); }
      if (!uri && player.duration > 0 && player.currentTime >= player.duration) await player.seekTo(0);
      player.play();
    } catch { setLoading(false); setError('Recitation could not be played. Try again.'); }
  };
  return {
    playing: status.playing, loading, error, position: status.currentTime || 0, duration: status.duration || 0,
    play, pause: () => player.pause(), seek: (seconds: number) => { void player.seekTo(seconds).catch(() => setError('Could not seek this recitation.')); },
    stop: () => { clear(); player.pause(); player.replace(null); setLoading(false); setError(''); },
  };
}
