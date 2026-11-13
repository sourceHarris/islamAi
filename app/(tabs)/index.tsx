import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Share, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter, Href } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArrowRight, ArrowUp, BookOpen, BookHeart, Check, CircleDot, Clock3, Compass, MessageCircle, Share2, Sparkles, Search, Moon } from 'lucide-react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Svg, { Path } from 'react-native-svg';
import { displayName } from '../../utils/displayName';
import { BrandHeader, Card, Chip, ui, hijriDate } from '../../components/DesignSystem';
import { useTheme, fonts } from '../../contexts/ThemeContext';
import { DailyChecklist, loadTodayChecklist } from '../../services/trackingService';
import { fetchAllSurahs } from '../../services/quranApi';
import { PrayerSettings } from '../../components/PrayerSettings';
import { fetchPrayerTimes, PrayerSettings as PrayerPreferences, PrayerSchedule } from '../../services/prayerTimes';

const AYAH = 'إِنَّ مَعَ الْعُسْرِ يُسْرًا';
const prompts = ['Patience during hardship', 'Dua before sleeping', 'Focus in prayer'];
export default function HomeScreen() {
  const { colors, theme } = useTheme(); const router = useRouter(); const insets = useSafeAreaInsets(); const { width, fontScale } = useWindowDimensions();
  const [name, setName] = useState(''); const [today, setToday] = useState<DailyChecklist | null>(null);
  const [lastRead, setLastRead] = useState<{ number: number; name: string } | null>(null); const [error, setError] = useState('');
  const [prayerSettings, setPrayerSettings] = useState<PrayerPreferences | null>(null);
  const [schedule, setSchedule] = useState<PrayerSchedule | null>(null), [prayerModal, setPrayerModal] = useState(false);
  const [prayerError, setPrayerError] = useState('');
  useFocusEffect(useCallback(() => {
    let active = true;
    AsyncStorage.getItem('hidayah_prayer_preferences').then(async value => {
      if (!value) return;
      const preferences = JSON.parse(value) as PrayerPreferences;
      if (active) setPrayerSettings(preferences);
      const result = await fetchPrayerTimes(preferences);
      if (active) { setSchedule(result); setPrayerError(''); }
    }).catch(() => { if (active) { setSchedule(null); setPrayerError('Prayer times could not be refreshed. Open prayer settings to retry.'); } });
    return () => { active = false; };
  }, []));
  useFocusEffect(useCallback(() => {
    let active = true;
    Promise.all([AsyncStorage.getItem('hidayah_user'), loadTodayChecklist(), AsyncStorage.getItem('hidayah_recent_surahs')]).then(async ([user, checklist, recent]) => {
      if (!active) return;
      try { setName(user ? displayName(JSON.parse(user).name).split(' ')[0] || '' : ''); } catch { setName(''); }
      setToday(checklist); setError('');
      try {
        const ids = JSON.parse(recent || '[]'); const number = Array.isArray(ids) ? ids.find(Number.isInteger) : undefined;
        if (number) {
          setLastRead({ number, name: 'Surah ' + number });
          try { const surahs = await fetchAllSurahs(); if (active) setLastRead({ number, name: surahs.find(s => s.number === number)?.englishName || 'Surah ' + number }); } catch { /* Surah number is enough to reopen real reading history. */ }
        } else setLastRead(null);
      } catch { setLastRead(null); }
    }).catch(() => { if (active) setError('Your practice summary could not be loaded.'); });
    return () => { active = false; };
  }, []));
  const completed = today?.prayers.filter(prayer => !prayer.isCustom && prayer.completed).length ?? 0;
  const ask = (prompt: string) => router.push({ pathname: '/(tabs)/chatbot', params: { prompt } });
  const tile = (title: string, detail: string, route: Href, _Icon: typeof Compass) => {
    const icons = { 'Digital Tasbih': 'fingerprint', 'Qibla Compass': 'explore', 'Dua Book': 'favorite-border', 'Hadith Library': 'history-edu' } as const;
    const labels = { 'Digital Tasbih': 'Saved', 'Qibla Compass': 'Compass', 'Dua Book': 'Personal', 'Hadith Library': 'Collections' };
    return <TouchableOpacity key={title} accessibilityRole="button" onPress={() => router.push(route)} style={[s.tile, { backgroundColor: colors.cardBackground, borderColor: theme === 'dark' ? colors.border : 'transparent' }, fontScale > 1.4 && { width: '100%' }]}>
      <View style={ui.row}><View style={[ui.icon, { width: 40, height: 40, borderRadius: 8, backgroundColor: colors.surfaceMuted }]}><MaterialIcons name={icons[title as keyof typeof icons]} size={24} color={colors.primary} /></View><Chip gold={title === 'Qibla Compass'}>{labels[title as keyof typeof labels]}</Chip></View>
      <View style={{ gap: 2 }}><Text style={[ui.rowTitle, { color: colors.textPrimary }]}>{title}</Text><Text style={[ui.caption, { color: colors.textSecondary }]}>{detail}</Text></View>
    </TouchableOpacity>;
  };
  return <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: colors.background }}>
    {prayerModal && <PrayerSettings visible close={() => setPrayerModal(false)} initial={prayerSettings} save={async (preferences, times) => { await AsyncStorage.setItem('hidayah_prayer_preferences', JSON.stringify(preferences)); setPrayerSettings(preferences); setSchedule(times); setPrayerError(''); }} />}
    <BrandHeader section="Home" />
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[ui.page, { maxWidth: 620, paddingTop: 10, paddingBottom: 110 + insets.bottom }]}>
      <View style={{ gap: 12 }}>
        {!!prayerError && <Text accessibilityRole="alert" style={[ui.caption, { color: colors.danger }]}>{prayerError}</Text>}
        <View style={ui.row}><Chip gold>{hijriDate()}</Chip><TouchableOpacity accessibilityRole="button" accessibilityLabel="Configure prayer times" onPress={() => setPrayerModal(true)}><Chip>{schedule ? schedule.city + ' · Times' : 'Set prayer times'}</Chip></TouchableOpacity></View>
        <View style={{ gap: 2 }}><Text accessibilityRole="header" style={[s.greeting, { color: colors.textPrimary }]}>Assalamu Alaikum{name ? ', ' + name : ''}</Text><Text style={[ui.body, { color: colors.textSecondary, fontSize: 14, lineHeight: 22 }]}>May this sacred day bring serenity and light to your heart.</Text></View>
      </View>
      <View style={[s.topCards, width >= 760 && { flexDirection: 'row', alignItems: 'flex-start' }]}>
        <Card style={[s.ayahCard, width >= 760 && { flex: 1.2 }]}>{theme === 'light' && <Svg accessible={false} pointerEvents="none" width={120} height={120} viewBox="0 0 100 100" style={{ position: 'absolute', right: 16, bottom: 12, opacity: .045 }}><Path d="M50 0L61.8 38.2L100 50L61.8 61.8L50 100L38.2 61.8L0 50L38.2 38.2Z" fill={colors.primary} /></Svg>}
          <View style={ui.row}><View style={s.inline}><Sparkles size={17} color={colors.gold} /><Text style={[ui.small, { color: colors.textSecondary }]}>AYAH OF THE DAY</Text></View><Chip gold>Surah Ash-Sharh · 94:6</Chip></View>
          <View style={{ alignItems: 'center', paddingVertical: 12, gap: 10 }}>
            <Text selectable lang="ar" style={[ui.arabic, { color: colors.textPrimary, textAlign: 'center', fontSize: 32 }]}>{AYAH}</Text>
            <View style={{ height: 2, width: 40, backgroundColor: colors.gold, opacity: .55 }} />
            <Text style={[s.translation, { color: colors.textPrimary }]}>“Indeed, with hardship comes ease.”</Text>
          </View>
          <Text style={[ui.caption, { color: colors.textSecondary, textAlign: 'center', fontSize: 14, lineHeight: 22 }]}>A gentle reminder that peace is woven directly into every trial you face today. Ease is not a distant reward, but an intimate companion.</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 8 }}>
            <TouchableOpacity accessibilityRole="button" onPress={() => ask('Help me reflect on Quran 94:6: Indeed, with hardship comes ease.')} style={[ui.primaryButton, s.inline, { flex: 1, backgroundColor: theme === 'dark' ? '#10B981' : colors.primary }]}><MessageCircle size={18} color={colors.onPrimary} /><Text style={[ui.rowTitle, { color: colors.onPrimary, textAlign: 'center', fontSize: 14, fontWeight: '600' }]}>Reflect with Hidayah</Text></TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Share Ayah" onPress={() => void Share.share({ message: AYAH + '\n“Indeed, with hardship comes ease.” — Quran 94:6' }).catch(() => setError('Sharing is unavailable on this device.'))} style={[ui.back, { backgroundColor: colors.surfaceMuted }]}><Share2 size={20} color={colors.textSecondary} /></TouchableOpacity>
          </View>
        </Card>
        <Card style={width >= 760 ? { flex: 1 } : undefined}>
          <View style={ui.row}><View style={s.inline}><Clock3 size={18} color={colors.primary} /><Text style={[ui.rowTitle, { color: colors.textPrimary }]}>Daily Prayers</Text></View><Text accessibilityLiveRegion="polite" style={[ui.small, { color: colors.primary }]}>{today ? completed + ' of 5 completed' : 'Loading…'}</Text></View>
          <View style={[s.prayerRow, fontScale > 1.4 && { flexWrap: 'wrap' }]}>{(today?.prayers.filter(p => !p.isCustom) || []).map(prayer => <TouchableOpacity accessibilityRole="button" accessibilityLabel={prayer.title + ': ' + (prayer.completed ? 'completed' : 'not recorded') + '. Open checklist'} key={prayer.id} onPress={() => router.push('/checklist')} style={[s.prayer, { backgroundColor: prayer.completed ? colors.messageSurface : colors.surface, borderColor: colors.border }, fontScale > 1.4 && { flexBasis: '28%', flexGrow: 1 }]}>
            <Text style={[ui.small, { color: colors.textPrimary, textAlign: 'center' }]}>{prayer.title}</Text>
            <View style={[s.prayerMark, { backgroundColor: prayer.completed ? colors.primary : colors.surfaceMuted }]}>{prayer.completed ? <Check size={17} color={colors.onPrimary} /> : <View style={{ width: 14, height: 14, borderRadius: 7, borderWidth: 1, borderColor: colors.textSecondary }} />}</View>
            <Text style={{ fontFamily: fonts.body, fontSize: 10, color: colors.textSecondary }}>{schedule?.timings[prayer.title] || (prayer.completed ? 'Done' : '--:--')}</Text>
          </TouchableOpacity>)}</View>
          {schedule && <Text style={[ui.small, { color: colors.textSecondary }]}>{schedule.city} · {schedule.timezone} · {schedule.date} · {schedule.method}. Calculated times; check your local mosque.</Text>}
        </Card>
      </View>
      {!!error && <Text accessibilityRole="alert" style={[ui.caption, { color: colors.danger }]}>{error}</Text>}
      <Card style={{ backgroundColor: colors.hero, borderColor: theme === 'dark' ? colors.border : colors.hero, padding: 24 }}>{theme === 'light' && <LinearGradient pointerEvents="none" colors={[colors.hero, colors.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />}
        <View style={ui.row}><View style={{ flex: 1, gap: 8 }}><Text style={[ui.eyebrow, { color: theme === 'dark' ? colors.gold : '#FFDEA5' }]}>SPIRITUAL COMPANION</Text><Text style={[s.companionTitle, { color: colors.onHero }]}>What is on your heart today?</Text></View><Sparkles color={theme === 'dark' ? colors.gold : '#FFDEA5'} size={26} /></View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{prompts.map(prompt => <TouchableOpacity accessibilityRole="button" key={prompt} onPress={() => ask(prompt)} style={[s.prompt, { backgroundColor: theme === 'dark' ? colors.surfaceMuted : '#FFFFFF18' }]}><Text style={[ui.small, { color: colors.onHero }]}>✦  {prompt}</Text></TouchableOpacity>)}</View>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Ask Hidayah a question" onPress={() => router.push('/(tabs)/chatbot')} style={[s.askField, { backgroundColor: theme === 'dark' ? colors.surfaceMuted : '#FFFFFF' }]}><Search size={18} color={theme === 'dark' ? colors.textSecondary : '#404944'} /><Text style={[ui.caption, { flex: 1, color: theme === 'dark' ? colors.textSecondary : '#404944' }]}>Ask about Quran & Sunnah…</Text><View style={[ui.icon, { width: 34, height: 34, borderRadius: 17, backgroundColor: theme === 'dark' ? '#10B981' : colors.primary }]}><ArrowUp size={20} color={colors.onPrimary} /></View></TouchableOpacity>
      </Card>
      <View style={{ gap: 10 }}>
        <View style={ui.row}><Text accessibilityRole="header" style={[ui.sectionTitle, { color: colors.textPrimary }]}>Daily Practice</Text><Text style={[ui.small, { color: colors.textSecondary }]}>Quick Access</Text></View>
        <TouchableOpacity accessibilityRole="button" onPress={() => router.push(lastRead ? { pathname: '/(tabs)/quran', params: { surah: String(lastRead.number) } } : '/(tabs)/quran')} style={[s.reading, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <View style={[ui.icon, { backgroundColor: colors.surfaceMuted }]}><BookOpen size={25} color={colors.primary} /></View>
          <View style={{ flex: 1, gap: 3 }}><Text style={[ui.small, { color: colors.gold }]}>{lastRead ? lastRead.name.toUpperCase() : 'QURAN & HADITH'}</Text><Text style={[ui.rowTitle, { color: colors.textPrimary }]}>{lastRead ? 'Continue Reading' : 'Begin Reading'}</Text><Text style={[ui.small, { color: colors.textSecondary }]}>{lastRead ? 'Reopen your last Surah' : 'Your library of guidance'}</Text></View><ArrowRight size={20} color={colors.primary} />
        </TouchableOpacity>
        <View style={s.grid}>
          {tile('Digital Tasbih', 'A moment of remembrance', '/dhikr', CircleDot)}
          {tile('Qibla Compass', 'Direction to the Kaaba', '/qibla', Compass)}
          {tile('Dua Book', 'Your personal supplications', '/dua', BookHeart)}
          {tile('Hadith Library', 'Explore the collections', { pathname: '/(tabs)/quran', params: { tab: 'hadith' } }, BookOpen)}
        </View>
      </View>
      <View style={[s.reading, { backgroundColor: colors.surface, borderColor: colors.border }]}><Moon size={23} color={colors.primary} /><View style={{ flex: 1, gap: 3 }}><Text style={[ui.rowTitle, { color: colors.textPrimary }]}>A moment of stillness</Text><Text style={[ui.caption, { color: colors.textSecondary }]}>Prepare your intentions and supplications.</Text></View></View>
    </ScrollView>
  </SafeAreaView>;
}
const s = StyleSheet.create({
  greeting: { fontFamily: fonts.display, fontSize: 28, lineHeight: 36, fontWeight: '500', letterSpacing: -.5 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 7 }, topCards: { gap: 24 }, ayahCard: { padding: 24, gap: 16 },
  translation: { fontFamily: fonts.body, fontSize: 18, lineHeight: 27, fontStyle: 'italic', textAlign: 'center' },
  prayerRow: { flexDirection: 'row', gap: 5 }, prayer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 2, borderWidth: 0 },
  prayerMark: { width: 27, height: 27, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  companionTitle: { fontFamily: fonts.display, fontSize: 22, lineHeight: 28, fontWeight: '500' },
  prompt: { borderRadius: 24, paddingHorizontal: 11, paddingVertical: 6, minHeight: 30, justifyContent: 'center' },
  askField: { borderRadius: 30, padding: 10, paddingStart: 16, flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 56 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, tile: { width: '48%', flexGrow: 1, borderWidth: 1, borderRadius: 12, padding: 16, gap: 16, minHeight: 148 },
  reading: { flexDirection: 'row', alignItems: 'center', gap: 16, borderRadius: 12, borderWidth: 1, padding: 16 },
});
