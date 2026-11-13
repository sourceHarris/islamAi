import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet, ScrollView, Share, Alert, I18nManager, BackHandler, Linking } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Bookmark, Search, Share2, Volume2, BookOpen, X } from 'lucide-react-native';
import { useTheme, fonts } from '../../contexts/ThemeContext';
import { BrandHeader, Card, Unavailable, ui } from '../../components/DesignSystem';
import { fetchAllSurahs, fetchSurahVerses, Surah, Ayah } from '../../services/quranApi';
import { fetchHadithBooks, HadithBook } from '../../services/hadithApi';
import { fetchEnglishSurah, EnglishSurah } from '../../services/quranTranslations';
import HadithDetailView from '../../components/HadithDetailView';
import { QuranAudio, reciters } from '../../components/QuranAudio';

function Reader({ surah, close, saved, toggleSave }: { surah: Surah; close: () => void; saved: boolean; toggleSave: () => void }) {
  const { colors, theme } = useTheme(); const insets = useSafeAreaInsets();
  const [ayahs, setAyahs] = useState<Ayah[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(false); const [size, setSize] = useState(28);
  const [translation, setTranslation] = useState(true);
  const [reciterIndex, setReciterIndex] = useState(0);
  const [english, setEnglish] = useState<EnglishSurah | null>(null);
  const [englishError, setEnglishError] = useState(false);
  const [englishAttempt, retryEnglish] = useState(0);
  useEffect(() => { const controller = new AbortController(); let active = true; setEnglishError(false); fetchEnglishSurah(surah.number, controller.signal).then(data => { if (active) setEnglish(data); }).catch(() => { if (active) setEnglishError(true); }); return () => { active = false; controller.abort(); }; }, [surah.number, englishAttempt]);
  const mounted = useRef(true);
  const load = useCallback(async () => { setLoading(true); setError(false); try { const data = await fetchSurahVerses(surah.number); if (mounted.current) setAyahs(data); } catch { if (mounted.current) setError(true); } finally { if (mounted.current) setLoading(false); } }, [surah.number]);
  useEffect(() => { mounted.current = true; void load(); return () => { mounted.current = false; }; }, [load]);
  useEffect(() => { const back = BackHandler.addEventListener('hardwareBackPress', () => { close(); return true; }); return () => back.remove(); }, [close]);
  const unavailable = (label: string) => Alert.alert(label, 'This feature is shown in the design but is not available in the current app.');
  // Some editions include the basmala before Ayah 1. Display that exact prefix once,
  // in its own card, while keeping the original API text for sharing.
  const firstWords = ayahs[0]?.text.match(/^\s*(\S+\s+\S+\s+\S+\s+\S+)\s+/)?.[0] || '';
  const normalizedPrefix = firstWords.normalize('NFD').replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '').replace(/\u0671/g, 'ا').replace(/\u0640/g, '').replace(/\u06CC/g, 'ي').trim();
  const basmalaPrefix = surah.number !== 1 && surah.number !== 9 && normalizedPrefix === 'بسم الله الرحمن الرحيم' ? firstWords : '';
  const toolbar = <View style={s.readerTools}>
    <TouchableOpacity accessibilityRole="button" accessibilityLabel="Change reciter" onPress={() => setReciterIndex(i => (i + 1) % reciters.length)} style={[s.toolPill, { backgroundColor: colors.surface }]}><Volume2 size={16} color={colors.textSecondary} /><Text style={[ui.small, { color: colors.textSecondary }]}>{reciters[reciterIndex].name}</Text></TouchableOpacity>
    <TouchableOpacity accessibilityRole="button" accessibilityLabel="Toggle Urdu translation" accessibilityState={{ selected: translation }} onPress={() => setTranslation(v => !v)} style={[s.toolPill, { backgroundColor: colors.surfaceMuted }]}><Text style={[ui.small, { color: colors.textPrimary }]}>{translation ? 'EN + UR' : 'English'}</Text></TouchableOpacity>
    <View style={[s.fontControls, { backgroundColor: colors.surface }]}>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Decrease Arabic text size" disabled={size <= 24} accessibilityState={{ disabled: size <= 24 }} onPress={() => setSize(v => Math.max(24, v - 2))} style={[s.control, { opacity: size <= 24 ? .4 : 1 }]}><Text style={[ui.caption, { color: colors.textPrimary }]}>A−</Text></TouchableOpacity>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Increase Arabic text size" disabled={size >= 40} accessibilityState={{ disabled: size >= 40 }} onPress={() => setSize(v => Math.min(40, v + 2))} style={[s.control, { opacity: size >= 40 ? .4 : 1 }]}><Text style={[ui.caption, { color: colors.textPrimary }]}>A+</Text></TouchableOpacity>
    </View>
  </View>;
  return <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: colors.readerBackground }}>
    <BrandHeader section="Quran" reader action={<TouchableOpacity accessibilityRole="button" accessibilityLabel="Search Surahs" onPress={close} style={ui.back}><Search size={19} color={colors.textPrimary} /></TouchableOpacity>} />
    <FlatList data={ayahs} keyExtractor={item => String(item.number)} contentContainerStyle={[ui.page, { maxWidth: 620, paddingHorizontal: 16, paddingTop: 8, gap: 14, paddingBottom: 164 + insets.bottom }]}
      ListHeaderComponent={<View style={{ gap: 14 }}>
        {theme === 'dark' && <TouchableOpacity accessibilityRole="button" accessibilityLabel="Back to library" onPress={close} style={{ flexDirection: 'row', alignItems: 'center', gap: 7, minHeight: 44 }}><ArrowLeft size={18} color={colors.textPrimary} style={{ transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }] }} /><Text style={[ui.caption, { color: colors.textPrimary }]}>Surah Index</Text></TouchableOpacity>}
        <Card style={{ borderColor: colors.readerBorder, padding: 14, gap: 10 }}>
          <View style={ui.row}><TouchableOpacity accessibilityRole="button" accessibilityLabel="Choose a Surah" onPress={close} style={{ flex: 1, gap: 4 }}><Text accessibilityRole="header" style={[s.surahTitle, { color: colors.textPrimary }]}>Surah {surah.englishName} ⌄</Text><Text style={[ui.small, { color: colors.textSecondary }]}>{surah.englishNameTranslation} · <Text style={{ fontFamily: fonts.arabic, fontSize: 15 }}>{surah.name.replace(/^سُورَةُ\s*/, '')}</Text></Text></TouchableOpacity><View style={{ alignItems: 'flex-end', gap: 5 }}><Text accessibilityLabel="Surah starting page" style={[ui.small, { color: colors.primary, backgroundColor: colors.surfaceMuted, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 }]}>{english?.firstJuz && english.firstPage ? 'Juz ' + english.firstJuz + ' · Page ' + english.firstPage : 'Surah ' + surah.number}</Text><Text style={[ui.small, { color: colors.textSecondary }]}>{surah.revelationType === 'Meccan' ? 'Makki' : 'Madani'} · {surah.numberOfAyahs} verses</Text></View></View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, borderTopWidth: StyleSheet.hairlineWidth, borderColor: colors.readerBorder, paddingTop: 8 }}><View style={{ flex: 1 }}>{toolbar}</View><TouchableOpacity accessibilityRole="button" accessibilityLabel={saved ? 'Unsave Surah' : 'Save Surah'} accessibilityState={{ selected: saved }} onPress={toggleSave} style={s.control}><Bookmark size={17} color={colors.gold} fill={saved ? colors.gold : 'none'} /></TouchableOpacity></View>

        </Card>
        {surah.number !== 1 && surah.number !== 9 && <Card style={{ alignItems: 'center', paddingVertical: 23, borderColor: colors.readerBorder }}>
          <Text style={{ color: colors.gold, fontSize: 17 }}>—  ✦  —</Text><Text lang="ar" style={[ui.arabic, { color: colors.textPrimary, textAlign: 'center', fontSize: size, lineHeight: size * 1.9 }]}>{basmalaPrefix.trim() || 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ'}</Text><Text style={{ fontFamily: fonts.editorialItalic, fontSize: 14, lineHeight: 20, color: colors.textSecondary, textAlign: 'center' }}>In the name of Allah, the Entirely Merciful, the Especially Merciful.</Text>
        </Card>}
        {loading && <ActivityIndicator accessibilityLabel="Loading verses" color={colors.primary} style={{ margin: 28 }} />}
        {error && <Card><Text style={[ui.body, { color: colors.textSecondary }]}>Verses could not be loaded. Check your connection and try again.</Text><TouchableOpacity accessibilityRole="button" onPress={load} style={s.control}><Text style={[ui.rowTitle, { color: colors.primary }]}>Try again</Text></TouchableOpacity></Card>}
      </View>}
      renderItem={({ item }) => <Card style={{ padding: 16, gap: 16, borderColor: colors.readerBorder }}>
        <View style={[ui.row, { borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.readerBorder, paddingBottom: 6 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><View style={[s.ayahNumber, { backgroundColor: colors.surfaceMuted }]}><Text style={[ui.small, { color: colors.primary }]}>{item.numberInSurah.toLocaleString('ar')}</Text></View><Text style={[ui.small, { color: colors.textPrimary }]}>AYAH {surah.number}:{item.numberInSurah}</Text></View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={'Share Ayah ' + item.numberInSurah} onPress={() => void Share.share({ message: item.text + '\n' + item.translation + '\nQuran ' + surah.number + ':' + item.numberInSurah }).catch(() => unavailable('Sharing'))} style={s.control}><Share2 size={17} color={colors.textSecondary} /></TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={'Read Tafsir for Ayah ' + item.numberInSurah + ' on Quran.com'} onPress={() => void Linking.openURL('https://quran.com/' + surah.number + '/' + item.numberInSurah + '/tafsirs/en-tafisr-ibn-kathir').catch(() => unavailable('Opening Tafsir'))} style={[s.toolPill, { backgroundColor: colors.goldSurface }]}><Text style={[ui.small, { color: colors.gold }]}>Tafsir ↗</Text></TouchableOpacity>
          </View>
        </View>
        <Text selectable lang="ar" style={[ui.arabic, { fontSize: size, lineHeight: size * 1.95, color: colors.textPrimary, paddingVertical: 5 }]}>{item.numberInSurah === 1 && basmalaPrefix ? item.text.slice(basmalaPrefix.length) : item.text}</Text>
        <View style={[s.translation, { backgroundColor: theme === 'dark' ? colors.surface : '#FAF8F3', borderColor: colors.readerBorder }]}><View style={ui.row}><Text style={[ui.small, { color: colors.textSecondary, letterSpacing: .4 }]}>SAHIH INTERNATIONAL</Text><Text style={[ui.small, { color: colors.textSecondary }]}>ENGLISH</Text></View><Text selectable style={{ fontFamily: fonts.body, fontSize: 14, lineHeight: 22, color: colors.textPrimary }}>{english?.verses[item.numberInSurah] || (englishError ? 'English translation could not be loaded.' : 'Loading English translation…')}</Text>{englishError && <TouchableOpacity accessibilityRole="button" onPress={() => retryEnglish(n => n + 1)} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={[ui.small, { color: colors.primary }]}>Try English translation again</Text></TouchableOpacity>}</View>
        {translation && <View style={[s.translation, { backgroundColor: theme === 'dark' ? colors.surface : '#FAF8F3', borderColor: colors.readerBorder }]}><View style={ui.row}><Text style={[ui.small, { color: colors.textSecondary }]}>FATEH MUHAMMAD JALANDHRY</Text><Text lang="ur" style={[ui.small, { fontFamily: fonts.arabic, fontSize: 15, color: colors.textSecondary }]}>اردو</Text></View><Text selectable lang="ur" style={[ui.urdu, { color: colors.textPrimary, fontSize: 18, lineHeight: 35 }]}>{item.translation}</Text></View>}
      </Card>}
      ListFooterComponent={!loading && !error ? <View style={{ gap: 14 }}><Text style={[ui.caption, { color: colors.textSecondary, textAlign: 'center' }]}>End of {surah.englishName} · {ayahs.length} verses</Text><Text style={[ui.small, { color: colors.textSecondary }]}>Uthmani Arabic · Sahih International English · Jalandhry Urdu. Quran text is included for offline reading. Audio streams online; Tafsir opens Quran.com.</Text></View> : null} />
    {!!ayahs.length && <QuranAudio firstAyah={ayahs[0].number} count={ayahs.length} name={surah.englishName} reciter={reciters[reciterIndex].id} bottom={88 + insets.bottom} />}
  </SafeAreaView>;
}
export default function QuranScreen() {
  const { colors } = useTheme(); const insets = useSafeAreaInsets(); const router = useRouter(); const params = useLocalSearchParams<{ surah?: string; tab?: string }>();
  const [tab, setTab] = useState<'surahs' | 'hadith' | 'saved' | 'recent'>('surahs'); const [search, setSearch] = useState('');
  const [origin, setOrigin] = useState<'all' | 'Meccan' | 'Medinan'>('all');
  const [surahs, setSurahs] = useState<Surah[]>([]); const [books, setBooks] = useState<HadithBook[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null); const [selectedBook, setSelectedBook] = useState<HadithBook | null>(null);
  const [loading, setLoading] = useState(true); const [error, setError] = useState(false); const [storageError, setStorageError] = useState(false);
  const [saved, setSaved] = useState<number[]>([]); const [recent, setRecent] = useState<number[]>([]); const request = useRef(0); const consumed = useRef('');
  const load = useCallback(async () => { const current = ++request.current; setLoading(true); setError(false); try {
    if (tab === 'hadith') { const data = books.length ? books : await fetchHadithBooks(); if (current === request.current) setBooks(data); }
    else { const data = surahs.length ? surahs : await fetchAllSurahs(); if (current === request.current) setSurahs(data); }
  } catch { if (current === request.current) setError(true); } finally { if (current === request.current) setLoading(false); } }, [tab, books, surahs]);
  const cancelRequests = useCallback(() => { request.current++; }, []);
  useEffect(() => { void load(); return cancelRequests; }, [load, cancelRequests]);
  useEffect(() => { AsyncStorage.multiGet(['hidayah_saved_surahs', 'hidayah_recent_surahs']).then(values => {
    try { const a = JSON.parse(values[0][1] || '[]'), b = JSON.parse(values[1][1] || '[]'); if (!Array.isArray(a) || !Array.isArray(b)) throw new Error('Invalid history'); setSaved(a.filter(Number.isInteger)); setRecent(b.filter(Number.isInteger)); } catch { setStorageError(true); }
  }).catch(() => setStorageError(true)); }, []);
  useEffect(() => { if (params.tab === 'hadith') { setSelectedSurah(null); setSelectedBook(null); setTab('hadith'); setSearch(''); router.setParams({ tab: undefined }); } }, [params.tab, router]);
  useEffect(() => { if (!params.surah) { consumed.current = ''; return; } if (params.surah !== consumed.current && surahs.length) { const item = surahs.find(s => s.number === Number(params.surah)); if (item) { consumed.current = params.surah; setSelectedSurah(item); const next = [item.number, ...recent.filter(n => n !== item.number)].slice(0, 15); setRecent(next); AsyncStorage.setItem('hidayah_recent_surahs', JSON.stringify(next)).catch(() => setStorageError(true)); router.setParams({ surah: undefined }); } } }, [params.surah, surahs, recent, router]);
  const open = (surah: Surah) => { setSelectedSurah(surah); const next = [surah.number, ...recent.filter(n => n !== surah.number)].slice(0, 15); setRecent(next); AsyncStorage.setItem('hidayah_recent_surahs', JSON.stringify(next)).catch(() => setStorageError(true)); };
  const toggleSave = (number: number) => { const next = saved.includes(number) ? saved.filter(n => n !== number) : [...saved, number]; setSaved(next); AsyncStorage.setItem('hidayah_saved_surahs', JSON.stringify(next)).catch(() => setStorageError(true)); };
  useEffect(() => {
    if (!selectedBook) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => { setSelectedBook(null); return true; });
    return () => subscription.remove();
  }, [selectedBook]);
  if (selectedBook) return <HadithDetailView book={selectedBook} onClose={() => setSelectedBook(null)} colors={colors} />;
  if (selectedSurah) return <Reader key={selectedSurah.number} surah={selectedSurah} close={() => setSelectedSurah(null)} saved={saved.includes(selectedSurah.number)} toggleSave={() => toggleSave(selectedSurah.number)} />;
  const lastRead = surahs.find(s => s.number === recent[0]);
  const filtered = (tab === 'recent' ? recent.map(n => surahs.find(s => s.number === n)).filter((s): s is Surah => !!s) : surahs).filter(s => (tab !== 'saved' || saved.includes(s.number)) && (origin === 'all' || s.revelationType === origin) && (s.name + ' ' + s.englishName + ' ' + s.englishNameTranslation + ' ' + s.number).toLowerCase().includes(search.toLowerCase()));
  const filteredBooks = books.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));
  const header = <View style={{ gap: 14, paddingBottom: 4 }}>
    {lastRead && <Card style={{ backgroundColor: colors.surface, padding: 18 }}>
      <View style={ui.row}><View style={{ flex: 1, gap: 3 }}><Text style={[ui.eyebrow, { color: colors.gold }]}>LAST OPENED</Text><Text style={[s.surahTitle, { color: colors.textPrimary }]}>{lastRead.englishName}</Text><Text style={[ui.small, { color: colors.textSecondary }]}>Reopen this Surah</Text></View><TouchableOpacity accessibilityRole="button" onPress={() => open(lastRead)} style={[ui.primaryButton, { backgroundColor: colors.primary }]}><Text style={[ui.rowTitle, { color: colors.onPrimary }]}>Continue →</Text></TouchableOpacity></View>
    </Card>}
    <View style={[s.search, { backgroundColor: colors.surface, borderColor: colors.border }]}><Search size={20} color={colors.textSecondary} /><TextInput accessibilityLabel="Search the library" placeholder={tab === 'hadith' ? 'Search Hadith collections' : 'Search Surah by name, number, or meaning'} placeholderTextColor={colors.textSecondary} value={search} onChangeText={setSearch} style={[s.searchInput, { color: colors.textPrimary }]} />{!!search && <TouchableOpacity accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => setSearch('')} style={s.control}><X size={18} color={colors.textSecondary} /></TouchableOpacity>}</View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}><View accessibilityRole="tablist" style={s.tabs}>{(['surahs', 'hadith', 'saved', 'recent'] as const).map((t, i) => <TouchableOpacity key={t} accessibilityRole="tab" accessibilityState={{ selected: tab === t }} aria-selected={tab === t} onPress={() => { setTab(t); setSearch(''); }} style={[s.tab, { backgroundColor: tab === t ? colors.surfaceMuted : colors.surface, borderColor: tab === t ? colors.border : 'transparent' }]}><Text style={[ui.caption, { color: tab === t ? colors.textPrimary : colors.textSecondary, fontWeight: tab === t ? '600' : '400' }]}>{['Surah (' + surahs.length + ')', 'Hadith', 'Saved (' + saved.length + ')', 'Recent'][i]}</Text></TouchableOpacity>)}</View></ScrollView>
    {tab !== 'hadith' && <View style={ui.row}><Text style={[ui.small, { color: colors.textSecondary }]}>Showing {filtered.length} Surahs</Text><View style={{ flexDirection: 'row', gap: 4 }}>{(['all', 'Meccan', 'Medinan'] as const).map((value, i) => <TouchableOpacity key={value} accessibilityRole="button" accessibilityState={{ selected: origin === value }} onPress={() => setOrigin(value)} style={[s.origin, { backgroundColor: origin === value ? colors.surfaceMuted : colors.surface }]}><Text style={[ui.small, { color: colors.textPrimary }]}>{['All', 'Makki', 'Madani'][i]}</Text></TouchableOpacity>)}</View></View>}
    {storageError && <Text accessibilityLiveRegion="polite" style={[ui.caption, { color: colors.danger }]}>Reading is available, but saved items could not be synced on this device.</Text>}
    {loading && <ActivityIndicator accessibilityLabel="Loading library" color={colors.primary} style={{ margin: 32 }} />}
    {error && <Card><Text style={[ui.body, { color: colors.textSecondary }]}>The library could not be loaded. Check your connection and try again.</Text><TouchableOpacity accessibilityRole="button" onPress={load} style={s.control}><Text style={[ui.rowTitle, { color: colors.primary }]}>Try again</Text></TouchableOpacity></Card>}
  </View>;
  return <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: colors.background }}>
    <BrandHeader section={tab === 'hadith' ? 'Hadith Library' : 'Quran'} />
    {tab === 'hadith' ? <FlatList key="books" data={loading || error ? [] : filteredBooks} keyExtractor={b => b.id} contentContainerStyle={[ui.page, { paddingBottom: 112 + insets.bottom, gap: 10 }]} ListHeaderComponent={header} ListEmptyComponent={!loading && !error ? <Text style={[ui.body, { color: colors.textSecondary }]}>No collections match your search.</Text> : null} renderItem={({ item }) => <TouchableOpacity accessibilityRole="button" onPress={() => setSelectedBook(item)} style={[s.item, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}><BookOpen size={25} color={colors.gold} /><View style={{ flex: 1 }}><Text style={[s.surahTitle, { color: colors.textPrimary }]}>{item.name.replace(/^سُورَةُ\s*/, '')}</Text><Text style={[ui.caption, { color: colors.textSecondary }]}>{item.available.toLocaleString()} available narrations · Arabic / English / Urdu</Text></View></TouchableOpacity>} />
    : <FlatList key="surahs" data={loading || error ? [] : filtered} keyExtractor={s => String(s.number)} contentContainerStyle={[ui.page, { paddingBottom: 112 + insets.bottom, gap: 10 }]} ListHeaderComponent={header}
      ListEmptyComponent={!loading && !error ? <Card><Text style={[ui.rowTitle, { color: colors.textPrimary }]}>{tab === 'saved' ? 'Keep a Surah close' : tab === 'recent' ? 'Your reading starts here' : 'No Surahs found'}</Text><Text style={[ui.body, { color: colors.textSecondary }]}>{tab === 'saved' ? 'Use the bookmark beside a Surah to save it here.' : tab === 'recent' ? 'Open a Surah and it will appear here for your next visit.' : 'Try a different name, number, or filter.'}</Text></Card> : null}
      renderItem={({ item }) => <View style={[s.item, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={'Read ' + item.englishName} onPress={() => open(item)} style={s.surah}>
          <Text style={[s.number, { color: colors.gold, backgroundColor: colors.surfaceMuted }]}>{item.number}</Text>
          <View style={{ flex: 1, gap: 3 }}><View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}><Text style={[s.surahTitle, { color: colors.textPrimary }]}>{item.englishName}</Text><Text style={[s.originLabel, { color: colors.textSecondary, backgroundColor: colors.surfaceMuted }]}>{item.revelationType === 'Meccan' ? 'Makki' : 'Madani'}</Text></View><Text style={[ui.small, { color: colors.textSecondary }]}>{item.englishNameTranslation} · {item.numberOfAyahs} verses</Text></View>
          <Text lang="ar" style={[ui.arabic, { color: colors.textPrimary, fontSize: 19, lineHeight: 32, maxWidth: '30%' }]}>{item.name.replace(/^سُورَةُ\s*/, '')}</Text>
        </TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={(saved.includes(item.number) ? 'Unsave ' : 'Save ') + item.englishName} accessibilityState={{ selected: saved.includes(item.number) }} aria-selected={saved.includes(item.number)} onPress={() => toggleSave(item.number)} style={s.control}><Bookmark size={18} color={colors.gold} fill={saved.includes(item.number) ? colors.gold : 'none'} /></TouchableOpacity>
      </View>} ListFooterComponent={<Unavailable label="Juz browsing, page progress and reading plans" />} />}
  </SafeAreaView>;
}
const s = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 14, borderWidth: 1, gap: 2 },
  surah: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 13, minHeight: 64 },
  surahTitle: { fontFamily: fonts.display, fontSize: 23, fontWeight: '600', lineHeight: 29, flexShrink: 1 },
  number: { fontFamily: fonts.display, fontSize: 25, minWidth: 39, padding: 4, textAlign: 'center', borderRadius: 8 },
  originLabel: { fontFamily: fonts.body, fontSize: 10, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1 },
  searchInput: { flex: 1, minWidth: 0, minHeight: 48, fontFamily: fonts.body, fontSize: 14 },
  tabs: { flexDirection: 'row', gap: 8 }, tab: { minHeight: 44, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 9, borderWidth: 1 },
  origin: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 7 },
  control: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  readerTools: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  toolPill: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6, minHeight: 34 },
  fontControls: { flexDirection: 'row', borderRadius: 10 }, ayahNumber: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  translation: { borderWidth: 1, borderRadius: 12, padding: 12, gap: 8 },
  audioDock: { position: 'absolute', width: '92%', maxWidth: 588, alignSelf: 'center', padding: 10, borderRadius: 14, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
});
