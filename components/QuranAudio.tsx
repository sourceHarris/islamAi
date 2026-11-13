import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { Pause, Play, SkipBack, SkipForward } from 'lucide-react-native';
import { useRecitation } from '../hooks/useRecitation';
import { useTheme } from '../contexts/ThemeContext';
import { ui } from './DesignSystem';

export const reciters = [{ id: 'ar.alafasy', name: 'Mishary Alafasy' }, { id: 'ar.abdulbasitmurattal', name: 'Abdul Basit' }];
const clock = (n: number) => Math.floor(n / 60) + ':' + String(Math.floor(n % 60)).padStart(2, '0');
export function QuranAudio({ firstAyah, count, name, reciter, bottom }: { firstAyah: number; count: number; name: string; reciter: string; bottom: number }) {
  const { colors } = useTheme();
  const [index, setIndex] = useState(0), [started, setStarted] = useState(false);
  const loaded = useRef(''); const focused = useIsFocused();
  const source = (i: number) => 'https://cdn.islamic.network/quran/audio/128/' + reciter + '/' + (firstAyah + i) + '.mp3';
  const audio = useRecitation(() => { if (focused && index < count - 1) change(index + 1); });
  const pause = useRef(audio.pause); pause.current = audio.pause;
  const stop = useRef(audio.stop); stop.current = audio.stop;
  useFocusEffect(useCallback(() => () => { pause.current(); }, []));
  useEffect(() => { stop.current(); loaded.current = ''; setStarted(false); }, [reciter]);
  function change(next: number) { setIndex(next); const uri = source(next); loaded.current = uri; setStarted(true); void audio.play(uri); }
  const toggle = () => {
    if (audio.playing) { audio.pause(); return; }
    const uri = source(index);
    if (loaded.current !== uri || audio.error) { loaded.current = uri; setStarted(true); void audio.play(uri); }
    else void audio.play();
  };
  return <View style={{ position: 'absolute', bottom, width: '94%', maxWidth: 596, alignSelf: 'center', backgroundColor: colors.cardBackground, borderColor: colors.readerBorder, borderWidth: 1, borderRadius: 14, padding: 10, gap: 5 }}>
    <View style={ui.row}><View style={{ flex: 1, gap: 3 }}><Text style={[ui.caption, { color: colors.textPrimary }]}>{name} · Ayah {index + 1}/{count}</Text><Text style={[ui.small, { color: colors.textSecondary }]}>{reciters.find(r => r.id === reciter)?.name} · {started ? clock(audio.position) + ' / ' + clock(audio.duration) : 'Stream recitation'}</Text></View>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Previous recitation verse" disabled={index === 0} onPress={() => change(index - 1)} style={[ui.back, { opacity: index === 0 ? .3 : 1 }]}><SkipBack size={19} color={colors.primary} /></TouchableOpacity>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel={audio.playing ? 'Pause recitation' : 'Play recitation'} onPress={toggle} style={[ui.back, { borderRadius: 24, backgroundColor: colors.surfaceMuted }]}>{audio.loading ? <ActivityIndicator color={colors.primary} /> : audio.playing ? <Pause size={21} color={colors.primary} /> : <Play size={21} color={colors.primary} />}</TouchableOpacity>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Next recitation verse" disabled={index === count - 1} onPress={() => change(index + 1)} style={[ui.back, { opacity: index === count - 1 ? .3 : 1 }]}><SkipForward size={19} color={colors.primary} /></TouchableOpacity>
    </View>
    {!!audio.error && <Text accessibilityRole="alert" style={[ui.small, { color: colors.danger }]}>{audio.error}</Text>}
  </View>;
}
