import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  FlatList, Dimensions, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import {
  Search, BookOpen, Heart, Bookmark, Volume2, Star,
  ChevronRight, Book, X, ChevronLeft, AlertCircle, Moon,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../contexts/ThemeContext';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming,
  Easing, interpolate, Extrapolate,
} from 'react-native-reanimated';
import { fetchAllSurahs, fetchSurahVerses, Surah, Ayah } from '../../services/quranApi';
import { fetchHadithBooks, HadithBook } from '../../services/hadithApi';
import HadithDetailView from '../../components/HadithDetailView';

const { width } = Dimensions.get('window');

const BOOK_COLORS: Record<string, string> = {
  'bukhari': '#10b981', 'muslim': '#3b82f6', 'tirmidzi': '#8b5cf6',
  'abu-daud': '#f59e0b', 'nasai': '#ec4899', 'ibnu-majah': '#06b6d4',
  'ahmad': '#f97316', 'malik': '#84cc16', 'darimi': '#a78bfa',
};

// ─── Floating Particle ─────────────────────────────────────────────────────
const FloatingParticle = ({ x = 0 }) => {
  const translateY = useSharedValue(300);
  const opacity = useSharedValue(0);
  useEffect(() => {
    translateY.value = withRepeat(withTiming(-50, { duration: 7000, easing: Easing.linear }), -1, false);
    opacity.value = withRepeat(withTiming(0.5, { duration: 2000, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, []);
  const s = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }], opacity: opacity.value }));
  return <Animated.View style={[{ position: 'absolute', width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#fff', left: x }, s]} />;
};

// ─── Surah Reading View ────────────────────────────────────────────────────
function SurahReadingView({ surah, onBack, onExit, colors }: { surah: Surah; onBack: () => void; onExit: () => void; colors: any }) {
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setAyahs(await fetchSurahVerses(surah.number)); }
    catch { setError('آیات لوڈ نہیں ہو سکیں۔'); }
    finally { setLoading(false); }
  }, [surah.number]);

  useEffect(() => { load(); }, []);

  return (
    <View style={[styles.readingContainer, { backgroundColor: colors.background }]}>
      {/* Header — matches app header style */}
      <LinearGradient
        colors={[colors.primary + 'DD', colors.primary + '99']}
        style={styles.readingHeader}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <TouchableOpacity onPress={onBack} style={styles.readingNavBtn}>
          <ChevronLeft size={26} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Text style={styles.readingTitle}>{surah.name}</Text>
          <Text style={styles.readingSubtitle}>{surah.englishName} • {surah.numberOfAyahs} آیات</Text>
        </View>
        <TouchableOpacity onPress={onExit} style={styles.readingNavBtn}>
          <X size={24} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>
      </LinearGradient>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.centerTxt, { color: colors.textSecondary }]}>آیات لوڈ ہو رہی ہیں...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <AlertCircle size={40} color={colors.textSecondary} />
          <Text style={[styles.centerTxt, { color: colors.textSecondary, textAlign: 'center' }]}>{error}</Text>
          <TouchableOpacity style={[styles.retryBtn, { borderColor: colors.primary }]} onPress={load}>
            <Text style={[styles.retryTxt, { color: colors.primary }]}>دوبارہ کوشش کریں</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.readingContent} showsVerticalScrollIndicator={false}>
          {/* Bismillah card */}
          {surah.number !== 9 && (
            <View style={styles.surahCard}>
              <BlurView intensity={80} tint="dark" style={{ borderRadius: 20, overflow: 'hidden' }}>
                <LinearGradient
                  colors={[colors.primary + '30', colors.primary + '10']}
                  style={{ padding: 20, alignItems: 'center' }}
                  start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}>
                  <Text style={[styles.bismillahArabic, { color: colors.textPrimary }]}>
                    بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                  </Text>
                  <Text style={[styles.bismillahUrdu, { color: colors.primary }]}>
                    اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے
                  </Text>
                </LinearGradient>
              </BlurView>
            </View>
          )}

          {/* Ayahs */}
          {ayahs.map((ayah) => (
            <View key={ayah.numberInSurah} style={styles.surahCard}>
              <BlurView intensity={80} tint="dark" style={{ borderRadius: 20, overflow: 'hidden' }}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
                  style={{ padding: 16 }}
                  start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}>
                  {/* Verse number badge */}
                  <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 14 }}>
                    <LinearGradient
                      colors={[colors.primary, colors.primary + 'CC']}
                      style={styles.ayahNumBadge}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                      <Text style={styles.ayahNum}>{ayah.numberInSurah}</Text>
                    </LinearGradient>
                  </View>
                  {/* Arabic */}
                  <Text style={[styles.ayahArabic, { color: colors.textPrimary }]}>
                    {ayah.text}
                  </Text>
                  {/* Urdu translation */}
                  <View style={[styles.ayahDivider, { backgroundColor: colors.border }]} />
                  <Text style={[styles.ayahUrdu, { color: colors.textSecondary }]}>
                    {ayah.translation}
                  </Text>
                </LinearGradient>
              </BlurView>
            </View>
          ))}

          <Text style={[styles.sourceNote, { color: colors.textSecondary }]}>
            عربی متن: مصحف المدینہ • ترجمہ: فتح محمد جالندھری
          </Text>
        </ScrollView>
      )}
    </View>
  );
}


// ─── Main Screen ───────────────────────────────────────────────────────────
export default function QuranScreen() {
  const { colors } = useTheme();
  const [tab, setTab] = useState<'surahs' | 'hadith' | 'bookmarks' | 'recent'>('surahs');
  const [search, setSearch] = useState('');
  const [quranMode, setQuranMode] = useState(false);
  const [quranView, setQuranView] = useState<'list' | 'reading'>('list');
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [selectedBook, setSelectedBook] = useState<HadithBook | null>(null);
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [surahLoading, setSurahLoading] = useState(true);
  const [surahError, setSurahError] = useState<string | null>(null);
  const [hadithBooks, setHadithBooks] = useState<HadithBook[]>([]);
  const [hadithLoading, setHadithLoading] = useState(false);
  const [hadithError, setHadithError] = useState<string | null>(null);

  const bookmarks = [
    { surah: 'البقرة', verse: 255, text: 'آیة الکرسی' },
    { surah: 'الإخلاص', verse: 1, text: 'قُلْ هُوَ اللَّهُ أَحَدٌ' },
    { surah: 'الفاتحة', verse: 6, text: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ' },
  ];
  const recent = [
    { surah: 'البقرة', verse: 255, time: '۲ گھنٹے پہلے' },
    { surah: 'الفاتحة', verse: 7, time: 'کل' },
    { surah: 'الملک', verse: 15, time: '۲ دن پہلے' },
  ];

  const shimmerAnim = useSharedValue(0);
  const pulseAnim = useSharedValue(0);

  useEffect(() => {
    shimmerAnim.value = withRepeat(withTiming(1, { duration: 3000, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }), -1, true);
    pulseAnim.value = withRepeat(withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }), -1, true);
    loadSurahs();
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(shimmerAnim.value, [0, 1], [-width * 1.5, width * 1.5], Extrapolate.CLAMP) }, { rotate: '25deg' }],
  }));
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulseAnim.value, [0, 0.5, 1], [1, 1.05, 1], Extrapolate.CLAMP) }],
  }));

  const loadSurahs = async () => {
    setSurahLoading(true); setSurahError(null);
    try { setSurahs(await fetchAllSurahs()); }
    catch (e: any) { setSurahError(`سورتیں لوڈ نہیں ہو سکیں۔\n(${e?.message ?? 'Network Error'})`); }
    finally { setSurahLoading(false); }
  };

  const loadHadithBooks = async () => {
    if (hadithBooks.length > 0) return;
    setHadithLoading(true); setHadithError(null);
    try { setHadithBooks(await fetchHadithBooks()); }
    catch { setHadithError('کتابیں لوڈ نہیں ہو سکیں۔'); }
    finally { setHadithLoading(false); }
  };

  const filtered = surahs.filter(s =>
    s.englishName.toLowerCase().includes(search.toLowerCase()) ||
    s.name.includes(search) ||
    s.number.toString().includes(search)
  );

  const openSurah = (item: Surah) => { setSelectedSurah(item); };

  if (selectedBook) return <HadithDetailView book={selectedBook} onClose={() => setSelectedBook(null)} colors={colors} />;

  if (selectedSurah) {
    return (
      <SurahReadingView
        surah={selectedSurah}
        onBack={() => {
          setSelectedSurah(null);
          if (quranMode) setQuranView('list');
        }}
        onExit={() => {
          setQuranMode(false);
          setSelectedSurah(null);
        }}
        colors={colors}
      />
    );
  }

  // Quran Mode surah list (paper style)
  if (quranMode) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F5EDD6' }}>
        <View style={[styles.quranModeHeader, { borderBottomColor: '#D4C4A8' }]}>
          <Text style={styles.quranModeTitle}>سورة منتخب کریں</Text>
          <TouchableOpacity onPress={() => { setQuranMode(false); setSelectedSurah(null); }}><X size={28} color="#5C4A3A" /></TouchableOpacity>
        </View>
        {surahLoading ? (
          <View style={styles.center}><ActivityIndicator size="large" color="#8B7355" /></View>
        ) : (
          <FlatList
            data={surahs}
            keyExtractor={s => s.number.toString()}
            contentContainerStyle={{ padding: 12, gap: 4 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.quranModeCard} activeOpacity={0.7} onPress={() => { setSelectedSurah(item); setQuranView('reading'); }}>
                <View style={styles.quranModeNum}><Text style={styles.quranModeNumTxt}>{item.number}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.quranModeNameEn}>{item.englishName}</Text>
                  <Text style={styles.quranModeNameAr}>{item.name}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.quranModeVerse}>{item.numberOfAyahs} آیات</Text>
                  <ChevronRight size={18} color="#8B7355" />
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    );
  }

  // ── Main Screen ──
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {/* Header — matches app design */}
      <View style={styles.headerContainer}>
        <BlurView intensity={100} tint="dark" style={{ overflow: 'hidden' }}>
          <LinearGradient
            colors={[colors.primary + 'DD', colors.primary + '99']}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            {/* Particles */}
            <View style={StyleSheet.absoluteFillObject}>
              <FloatingParticle x={40} />
              <FloatingParticle x={width * 0.4} />
              <FloatingParticle x={width * 0.7} />
            </View>
            {/* Glow */}
            <View style={[styles.headerGlow, { backgroundColor: colors.primary }]} />
            <View style={styles.headerContent}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
                <BookOpen size={28} color="#ffffff" strokeWidth={2.5} />
                <Text style={styles.headerTitle}>القرآن الکریم</Text>
              </View>
              <Text style={styles.headerSub}>
                {surahs.length > 0 ? `${surahs.length} سورتیں • پڑھیں اور غور کریں` : 'قرآن و احادیث'}
              </Text>
            </View>
          </LinearGradient>
        </BlurView>
      </View>

      {/* Search — matches the glassmorphism search bar in original */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
        <BlurView intensity={80} tint="dark" style={{ borderRadius: 16, overflow: 'hidden' }}>
          <LinearGradient
            colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
            style={styles.searchGradient}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Search size={18} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder={tab === 'hadith' ? 'کتاب تلاش کریں...' : 'سورة تلاش کریں...'}
              placeholderTextColor={colors.textSecondary}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && <TouchableOpacity onPress={() => setSearch('')}><X size={16} color={colors.textSecondary} /></TouchableOpacity>}
          </LinearGradient>
        </BlurView>
      </View>

      {/* Tabs — same glassmorphism style as original */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 10 }}>
        <BlurView intensity={80} tint="dark" style={{ borderRadius: 16, overflow: 'hidden' }}>
          <LinearGradient
            colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
            style={styles.tabGradient}
            start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 8, gap: 4 }}>
                {(['surahs', 'hadith', 'recent', 'bookmarks'] as const).map(t => {
                  const ICONS: any = { surahs: BookOpen, hadith: Book, recent: Volume2, bookmarks: Bookmark };
                  const LABELS: any = { surahs: 'سورتیں', hadith: 'احادیث', recent: 'حالیہ', bookmarks: 'بُک مارک' };
                  const Icon = ICONS[t];
                  const isActive = tab === t;
                  return (
                    <TouchableOpacity
                      key={t}
                      style={[styles.tab, isActive && styles.activeTab]}
                      activeOpacity={0.7}
                      onPress={() => { setTab(t); if (t === 'hadith') loadHadithBooks(); }}>
                      {isActive && (
                        <LinearGradient
                          colors={[colors.primary + '40', colors.primary + '20']}
                          style={StyleSheet.absoluteFillObject}
                          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        />
                      )}
                      <Icon size={15} color={isActive ? colors.primary : colors.textSecondary} strokeWidth={2.5} />
                      <Text style={[styles.tabTxt, { color: isActive ? colors.primary : colors.textSecondary }]}>{LABELS[t]}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              {/* Quran Mode Button */}
              <TouchableOpacity style={styles.quranModeBtn} activeOpacity={0.7} onPress={() => { setQuranMode(true); setQuranView('list'); }}>
                <Moon size={18} color={colors.primary} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </BlurView>
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>

        {/* ── Surahs ── */}
        {tab === 'surahs' && (
          surahLoading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.centerTxt, { color: colors.textSecondary }]}>تمام ۱۱۴ سورتیں لوڈ ہو رہی ہیں...</Text>
            </View>
          ) : surahError ? (
            <View style={styles.center}>
              <AlertCircle size={48} color={colors.textSecondary} />
              <Text style={[styles.centerTxt, { color: colors.textSecondary, textAlign: 'center' }]}>{surahError}</Text>
              <TouchableOpacity style={[styles.retryBtn, { borderColor: colors.primary }]} onPress={loadSurahs}>
                <Text style={[styles.retryTxt, { color: colors.primary }]}>دوبارہ کوشش کریں</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={s => s.number.toString()}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={<View style={styles.center}><Text style={[styles.centerTxt, { color: colors.textSecondary }]}>کوئی نتیجہ نہیں ملا</Text></View>}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.surahCard} activeOpacity={0.7} onPress={() => openSurah(item)}>
                  <BlurView intensity={80} tint="dark" style={{ borderRadius: 20, overflow: 'hidden' }}>
                    <LinearGradient
                      colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
                      style={styles.surahGradient}
                      start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}>
                      {/* shimmer */}
                      <Animated.View style={[styles.shimmerEffect, shimmerStyle]}>
                        <LinearGradient colors={['transparent', 'rgba(255,255,255,0.1)', 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} />
                      </Animated.View>
                      <View style={styles.surahContent}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                          <Animated.View style={pulseStyle}>
                            <LinearGradient colors={[colors.primary, colors.primary + 'DD']} style={styles.surahNum} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                              <View style={[styles.numGlow, { backgroundColor: colors.primary }]} />
                              <Text style={styles.surahNumTxt}>{item.number}</Text>
                            </LinearGradient>
                          </Animated.View>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.surahName, { color: colors.textPrimary }]}>{item.name}</Text>
                            <Text style={[styles.surahEn, { color: colors.primary }]}>{item.englishName}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                              <Text style={[styles.surahMeta, { color: colors.textSecondary }]}>{item.englishNameTranslation}</Text>
                              <View style={styles.metaDot} />
                              <Text style={[styles.surahMeta, { color: colors.textSecondary }]}>{item.numberOfAyahs} آیات</Text>
                              <View style={styles.metaDot} />
                              <BlurView intensity={60} tint="dark" style={{ borderRadius: 8, overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 2 }}>
                                <Text style={[{ fontSize: 11, fontWeight: '600' }, { color: colors.primary }]}>
                                  {item.revelationType === 'Meccan' ? 'مکی' : 'مدنی'}
                                </Text>
                              </BlurView>
                            </View>
                          </View>
                          <View style={{ gap: 8 }}>
                            <TouchableOpacity style={styles.iconBtn}>
                              <BlurView intensity={60} tint="dark" style={styles.iconBlur}><Heart size={14} color={colors.primary} /></BlurView>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconBtn}>
                              <BlurView intensity={60} tint="dark" style={styles.iconBlur}><Bookmark size={14} color={colors.textSecondary} /></BlurView>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    </LinearGradient>
                  </BlurView>
                </TouchableOpacity>
              )}
            />
          )
        )}

        {/* ── Hadith ── */}
        {tab === 'hadith' && (
          hadithLoading ? (
            <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /><Text style={[styles.centerTxt, { color: colors.textSecondary }]}>احادیث کی کتابیں لوڈ ہو رہی ہیں...</Text></View>
          ) : hadithError ? (
            <View style={styles.center}>
              <AlertCircle size={48} color={colors.textSecondary} />
              <Text style={[styles.centerTxt, { color: colors.textSecondary }]}>{hadithError}</Text>
              <TouchableOpacity style={[styles.retryBtn, { borderColor: colors.primary }]} onPress={loadHadithBooks}>
                <Text style={[styles.retryTxt, { color: colors.primary }]}>دوبارہ کوشش کریں</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={hadithBooks}
              keyExtractor={b => b.id}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const bc = BOOK_COLORS[item.id] ?? colors.primary;
                return (
                  <TouchableOpacity style={styles.surahCard} activeOpacity={0.7} onPress={() => setSelectedBook(item)}>
                    <BlurView intensity={80} tint="dark" style={{ borderRadius: 20, overflow: 'hidden' }}>
                      <LinearGradient
                        colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
                        style={styles.surahGradient}
                        start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}>
                        <View style={styles.surahContent}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                            <LinearGradient colors={[bc + 'DD', bc + '99']} style={styles.hadithIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                              <Book size={24} color="#fff" strokeWidth={2.5} />
                            </LinearGradient>
                            <View style={{ flex: 1 }}>
                              <Text style={[styles.surahName, { color: colors.textPrimary }]}>{item.name}</Text>
                              <BlurView intensity={60} tint="dark" style={{ borderRadius: 8, overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginTop: 6 }}>
                                <Text style={[{ fontSize: 12, fontWeight: '600' }, { color: bc }]}>{item.available.toLocaleString()} احادیث</Text>
                              </BlurView>
                            </View>
                            <BlurView intensity={60} tint="dark" style={{ borderRadius: 10, overflow: 'hidden', width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}>
                              <ChevronRight size={20} color={bc} strokeWidth={2.5} />
                            </BlurView>
                          </View>
                        </View>
                      </LinearGradient>
                    </BlurView>
                  </TouchableOpacity>
                );
              }}
            />
          )
        )}

        {/* ── Recent ── */}
        {tab === 'recent' && (
          <FlatList
            data={recent}
            keyExtractor={(_, i) => i.toString()}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.surahCard} activeOpacity={0.7}>
                <BlurView intensity={80} tint="dark" style={{ borderRadius: 20, overflow: 'hidden' }}>
                  <LinearGradient colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']} style={styles.surahGradient} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}>
                    <View style={styles.surahContent}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View>
                          <Text style={[styles.surahName, { color: colors.textPrimary }]}>{item.surah}</Text>
                          <Text style={[styles.surahMeta, { color: colors.textSecondary }]}>آیت {item.verse}</Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
                            <View style={[styles.metaDot, { backgroundColor: colors.primary }]} />
                            <Text style={[styles.surahMeta, { color: colors.textSecondary }]}>{item.time}</Text>
                          </View>
                        </View>
                        <BlurView intensity={60} tint="dark" style={{ borderRadius: 14, overflow: 'hidden' }}>
                          <LinearGradient colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 10 }} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                            <Text style={[{ fontSize: 13, fontWeight: '600' }, { color: colors.primary }]}>جاری رکھیں</Text>
                            <ChevronRight size={14} color={colors.primary} strokeWidth={2.5} />
                          </LinearGradient>
                        </BlurView>
                      </View>
                    </View>
                  </LinearGradient>
                </BlurView>
              </TouchableOpacity>
            )}
          />
        )}

        {/* ── Bookmarks ── */}
        {tab === 'bookmarks' && (
          <FlatList
            data={bookmarks}
            keyExtractor={(_, i) => i.toString()}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.surahCard} activeOpacity={0.7}>
                <BlurView intensity={80} tint="dark" style={{ borderRadius: 20, overflow: 'hidden' }}>
                  <LinearGradient colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']} style={styles.surahGradient} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}>
                    <View style={styles.surahContent}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.surahName, { color: colors.textPrimary }]}>{item.surah}</Text>
                          <Text style={[styles.surahMeta, { color: colors.textSecondary }]}>آیت {item.verse}</Text>
                          <Text style={[styles.surahMeta, { color: colors.textSecondary, fontStyle: 'italic', marginTop: 4 }]}>"{item.text}"</Text>
                        </View>
                        <BlurView intensity={60} tint="dark" style={{ borderRadius: 10, overflow: 'hidden', width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}>
                          <Star size={18} color="#f59e0b" fill="#f59e0b" />
                        </BlurView>
                      </View>
                    </View>
                  </LinearGradient>
                </BlurView>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  headerContainer: { borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.1)' },
  headerGradient: { paddingTop: Platform.OS === 'ios' ? 60 : 50, paddingBottom: 24, paddingHorizontal: 24, position: 'relative' },
  headerGlow: { position: 'absolute', top: -60, left: '50%', width: 120, height: 120, borderRadius: 60, opacity: 0.15 },
  headerContent: { alignItems: 'center' },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 6 },

  searchGradient: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  searchInput: { flex: 1, fontSize: 15 },

  tabGradient: { paddingVertical: 4 },
  tab: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, gap: 6, position: 'relative', overflow: 'hidden' },
  activeTab: {},
  tabTxt: { fontSize: 12, fontWeight: '600' },
  quranModeBtn: { paddingHorizontal: 14, paddingVertical: 10 },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 32 },
  centerTxt: { fontSize: 14, marginTop: 4 },
  retryBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, marginTop: 4 },
  retryTxt: { fontSize: 14, fontWeight: '600' },

  list: { padding: 16, gap: 12 },

  // Surah / Hadith cards
  surahCard: { borderRadius: 20, overflow: 'hidden' },
  surahGradient: { borderRadius: 20, position: 'relative', overflow: 'hidden' },
  shimmerEffect: { position: 'absolute', top: -50, left: -100, right: -100, bottom: -50, zIndex: 0 },
  surahContent: { padding: 16, zIndex: 1 },
  surahNum: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' },
  numGlow: { position: 'absolute', width: 70, height: 70, borderRadius: 35, opacity: 0.3, top: -10, left: -10 },
  surahNumTxt: { fontSize: 16, fontWeight: '800', color: '#fff', zIndex: 1 },
  surahName: { fontSize: 20, fontWeight: '700' },
  surahEn: { fontSize: 14, fontWeight: '600', marginTop: 2 },
  surahMeta: { fontSize: 12 },
  metaDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: 'rgba(255,255,255,0.2)' },
  iconBtn: { borderRadius: 10, overflow: 'hidden' },
  iconBlur: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },

  hadithIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },

  readingContainer: { flex: 1 },
  readingHeader: { flexDirection: 'row', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 60 : 50, paddingBottom: 20, paddingHorizontal: 16, gap: 8 },
  readingNavBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  readingTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  readingSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 3 },
  readingRetryBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)', marginTop: 12 },
  readingContent: { padding: 16, paddingBottom: 40, gap: 12 },
  bismillahArabic: { fontSize: 24, textAlign: 'center', lineHeight: 42, fontWeight: '600' },
  bismillahUrdu: { fontSize: 13, textAlign: 'center', marginTop: 8, fontWeight: '500' },
  ayahNumBadge: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  ayahNum: { color: '#fff', fontSize: 13, fontWeight: '700' },
  ayahArabic: { fontSize: 22, lineHeight: 44, textAlign: 'right', writingDirection: 'rtl', fontWeight: '500' },
  ayahDivider: { height: 1, marginVertical: 12 },
  ayahUrdu: { fontSize: 15, lineHeight: 28, textAlign: 'right' },
  sourceNote: { fontSize: 11, textAlign: 'center', marginTop: 8 },
  quranModeHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: Platform.OS === 'ios' ? 60 : 50, paddingBottom: 16, paddingHorizontal: 20, borderBottomWidth: 1 },
  quranModeTitle: { fontSize: 24, fontWeight: '700', color: '#3D2C1E' },
  quranModeCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.7)', padding: 14, borderRadius: 12, borderWidth: 0.5, borderColor: '#D4C4A8' },
  quranModeNum: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#8B7355', alignItems: 'center', justifyContent: 'center' },
  quranModeNumTxt: { color: '#fff', fontSize: 14, fontWeight: '700' },
  quranModeNameEn: { color: '#3D2C1E', fontSize: 15, fontWeight: '600' },
  quranModeNameAr: { color: '#8B7355', fontSize: 16, marginTop: 2 },
  quranModeVerse: { color: '#8B7355', fontSize: 12 },
});