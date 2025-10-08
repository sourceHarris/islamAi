import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Dimensions,
  Platform,
  ScrollView,
} from 'react-native';
import { Search, BookOpen, Play, Bookmark, Volume2, Star, Sparkles, Zap, ChevronRight, Book, X, Minimize2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../contexts/ThemeContext';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  Easing,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface Surah {
  number: number;
  name: string;
  arabicName: string;
  englishName: string;
  verses: number;
  revelation: 'Meccan' | 'Medinan';
  progress?: number;
}

interface RecentReading {
  surah: string;
  verse: number;
  timestamp: string;
}

interface HadithBook {
  id: string;
  name: string;
  arabicName: string;
  author: string;
  hadiths: number;
  description: string;
  color: string;
}

// Floating Particle
const FloatingParticle = ({ delay = 0, x = 0 }) => {
  const translateY = useSharedValue(300);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withTiming(-50, {
        duration: 6000 + Math.random() * 3000,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
      -1,
      false
    );
    opacity.value = withRepeat(
      withTiming(0.4, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const particleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        { left: x },
        particleStyle,
      ]}
    />
  );
};

export default function QuranScreen() {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'surahs' | 'hadith' | 'bookmarks' | 'recent'>('surahs');
  const [quranMode, setQuranMode] = useState(false);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);

  const shimmerAnim = useSharedValue(0);
  const pulseAnim = useSharedValue(0);
  const quranModeAnim = useSharedValue(0);

  useEffect(() => {
    shimmerAnim.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
      -1,
      true
    );
    pulseAnim.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  useEffect(() => {
    quranModeAnim.value = withSpring(quranMode ? 1 : 0, {
      damping: 20,
      stiffness: 90,
    });
  }, [quranMode]);

  const [surahs] = useState<Surah[]>([
    { number: 1, name: 'Al-Fatihah', arabicName: 'الفاتحة', englishName: 'The Opening', verses: 7, revelation: 'Meccan', progress: 100 },
    { number: 2, name: 'Al-Baqarah', arabicName: 'البقرة', englishName: 'The Cow', verses: 286, revelation: 'Medinan', progress: 45 },
    { number: 3, name: 'Al-Imran', arabicName: 'آل عمران', englishName: 'Family of Imran', verses: 200, revelation: 'Medinan', progress: 0 },
    { number: 4, name: 'An-Nisa', arabicName: 'النساء', englishName: 'The Women', verses: 176, revelation: 'Medinan', progress: 0 },
    { number: 5, name: 'Al-Ma\'idah', arabicName: 'المائدة', englishName: 'The Table Spread', verses: 120, revelation: 'Medinan', progress: 0 },
    { number: 6, name: 'Al-An\'am', arabicName: 'الأنعام', englishName: 'The Cattle', verses: 165, revelation: 'Meccan', progress: 0 },
  ]);

  const [hadithBooks] = useState<HadithBook[]>([
    {
      id: 'bukhari',
      name: 'Sahih al-Bukhari',
      arabicName: 'صحيح البخاري',
      author: 'Imam Muhammad al-Bukhari',
      hadiths: 7563,
      description: 'The most authentic hadith collection',
      color: '#10b981',
    },
    {
      id: 'muslim',
      name: 'Sahih Muslim',
      arabicName: 'صحيح مسلم',
      author: 'Imam Muslim ibn al-Hajjaj',
      hadiths: 7190,
      description: 'Second most authentic collection',
      color: '#3b82f6',
    },
    {
      id: 'tirmidhi',
      name: 'Jami\' at-Tirmidhi',
      arabicName: 'جامع الترمذي',
      author: 'Imam at-Tirmidhi',
      hadiths: 3956,
      description: 'Comprehensive hadith compilation',
      color: '#8b5cf6',
    },
    {
      id: 'abudawud',
      name: 'Sunan Abu Dawud',
      arabicName: 'سنن أبي داود',
      author: 'Imam Abu Dawud',
      hadiths: 5274,
      description: 'Focus on legal rulings',
      color: '#f59e0b',
    },
    {
      id: 'nasai',
      name: 'Sunan an-Nasa\'i',
      arabicName: 'سنن النسائي',
      author: 'Imam an-Nasa\'i',
      hadiths: 5758,
      description: 'Rigorous authentication standards',
      color: '#ec4899',
    },
    {
      id: 'ibnmajah',
      name: 'Sunan Ibn Majah',
      arabicName: 'سنن ابن ماجه',
      author: 'Imam Ibn Majah',
      hadiths: 4341,
      description: 'Final of the six authentic books',
      color: '#06b6d4',
    },
  ]);

  const [recentReadings] = useState<RecentReading[]>([
    { surah: 'Al-Baqarah', verse: 255, timestamp: '2 hours ago' },
    { surah: 'Al-Fatihah', verse: 7, timestamp: 'Yesterday' },
    { surah: 'Al-Mulk', verse: 15, timestamp: '2 days ago' },
  ]);

  const [bookmarkedVerses] = useState([
    { surah: 'Al-Baqarah', verse: 255, text: 'Ayat al-Kursi' },
    { surah: 'Al-Ikhlas', verse: 1, text: 'Say: He is Allah, the One!' },
    { surah: 'Al-Fatiha', verse: 6, text: 'Guide us to the straight path' },
  ]);

  const filteredSurahs = surahs.filter(surah =>
    surah.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    surah.englishName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const shimmerStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerAnim.value,
      [0, 1],
      [-width * 1.5, width * 1.5],
      Extrapolate.CLAMP
    );
    return {
      transform: [{ translateX }, { rotate: '25deg' }],
    };
  });

  const pulseStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      pulseAnim.value,
      [0, 0.5, 1],
      [1, 1.05, 1],
      Extrapolate.CLAMP
    );
    return {
      transform: [{ scale }],
    };
  });

  const quranModeStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      quranModeAnim.value,
      [0, 1],
      [0, 1],
      Extrapolate.CLAMP
    );
    return {
      opacity,
      transform: [{ scale: quranModeAnim.value }],
    };
  });

  const enterQuranMode = (surah: Surah) => {
    setSelectedSurah(surah);
    setQuranMode(true);
  };

  const exitQuranMode = () => {
    setQuranMode(false);
    setTimeout(() => setSelectedSurah(null), 300);
  };

  const renderSurahItem = ({ item }: { item: Surah }) => (
    <TouchableOpacity 
      style={styles.surahCard} 
      activeOpacity={0.7}
      onPress={() => enterQuranMode(item)}
    >
      <BlurView intensity={80} tint="dark" style={styles.surahBlur}>
        <LinearGradient
          colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
          style={styles.surahGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}>
          
          <Animated.View style={[styles.shimmerEffect, shimmerStyle]}>
            <LinearGradient
              colors={['transparent', 'rgba(255,255,255,0.1)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.shimmerGradient}
            />
          </Animated.View>

          <View style={styles.surahContent}>
            <View style={styles.surahHeader}>
              <Animated.View style={pulseStyle}>
                <LinearGradient
                  colors={[colors.primary, colors.primary + 'DD']}
                  style={styles.surahNumber}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}>
                  <View style={[styles.numberGlow, { backgroundColor: colors.primary }]} />
                  <Text style={styles.surahNumberText}>{item.number}</Text>
                </LinearGradient>
              </Animated.View>

              <View style={styles.surahInfo}>
                <Text style={[styles.surahName, { color: colors.textPrimary }]}>{item.name}</Text>
                <Text style={[styles.surahArabic, { color: colors.primary }]}>{item.arabicName}</Text>
                <View style={styles.surahMeta}>
                  <Text style={[styles.surahDetails, { color: colors.textSecondary }]}>
                    {item.englishName}
                  </Text>
                  <View style={styles.metaDivider} />
                  <Text style={[styles.surahDetails, { color: colors.textSecondary }]}>
                    {item.verses} verses
                  </Text>
                  <View style={styles.metaDivider} />
                  <BlurView intensity={60} tint="dark" style={styles.revelationBadge}>
                    <Text style={[styles.revelationText, { color: colors.primary }]}>
                      {item.revelation}
                    </Text>
                  </BlurView>
                </View>
              </View>

              <View style={styles.surahActions}>
                <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                  <BlurView intensity={60} tint="dark" style={styles.actionBlur}>
                    <Play size={16} color={colors.primary} fill={colors.primary} />
                  </BlurView>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                  <BlurView intensity={60} tint="dark" style={styles.actionBlur}>
                    <Bookmark size={16} color={colors.textSecondary} />
                  </BlurView>
                </TouchableOpacity>
              </View>
            </View>
            
            {item.progress !== undefined && item.progress > 0 && (
              <View style={styles.progressContainer}>
                <View style={styles.progressInfo}>
                  <View style={styles.progressLabelRow}>
                    <Zap size={12} color={colors.primary} fill={colors.primary} />
                    <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
                      Progress
                    </Text>
                  </View>
                  <Text style={[styles.progressPercent, { color: colors.primary }]}>
                    {item.progress}%
                  </Text>
                </View>
                <View style={[styles.progressTrack, { backgroundColor: colors.border + '40' }]}>
                  <LinearGradient
                    colors={[colors.primary, colors.primary + 'DD']}
                    style={[styles.progressFill, { width: `${item.progress}%` }]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}>
                    <View style={[styles.progressGlow, { backgroundColor: colors.primary }]} />
                  </LinearGradient>
                </View>
              </View>
            )}
          </View>
        </LinearGradient>
      </BlurView>
    </TouchableOpacity>
  );

  const renderHadithBook = ({ item }: { item: HadithBook }) => (
    <TouchableOpacity style={styles.hadithCard} activeOpacity={0.7}>
      <BlurView intensity={80} tint="dark" style={styles.hadithBlur}>
        <LinearGradient
          colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
          style={styles.hadithGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}>
          
          <View style={styles.hadithContent}>
            <View style={styles.hadithIconContainer}>
              <LinearGradient
                colors={[item.color + 'DD', item.color + '99']}
                style={styles.hadithIcon}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}>
                <Book size={24} color="#ffffff" strokeWidth={2.5} />
              </LinearGradient>
            </View>

            <View style={styles.hadithInfo}>
              <Text style={[styles.hadithName, { color: colors.textPrimary }]}>{item.name}</Text>
              <Text style={[styles.hadithArabic, { color: item.color }]}>{item.arabicName}</Text>
              <Text style={[styles.hadithAuthor, { color: colors.textSecondary }]}>{item.author}</Text>
              <View style={styles.hadithMeta}>
                <BlurView intensity={60} tint="dark" style={styles.hadithBadge}>
                  <Text style={[styles.hadithCount, { color: item.color }]}>
                    {item.hadiths.toLocaleString()} Hadiths
                  </Text>
                </BlurView>
              </View>
            </View>

            <TouchableOpacity style={styles.hadithAction} activeOpacity={0.7}>
              <BlurView intensity={60} tint="dark" style={styles.hadithActionBlur}>
                <ChevronRight size={20} color={item.color} strokeWidth={2.5} />
              </BlurView>
            </TouchableOpacity>
          </View>

          <View style={styles.hadithDescription}>
            <Text style={[styles.hadithDescText, { color: colors.textSecondary }]}>
              {item.description}
            </Text>
          </View>
        </LinearGradient>
      </BlurView>
    </TouchableOpacity>
  );

  const renderRecentItem = ({ item }: { item: RecentReading }) => (
    <TouchableOpacity style={styles.recentCard} activeOpacity={0.7}>
      <BlurView intensity={80} tint="dark" style={styles.recentBlur}>
        <LinearGradient
          colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
          style={styles.recentGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}>
          <View style={styles.recentContent}>
            <View style={styles.recentInfo}>
              <Text style={[styles.recentSurah, { color: colors.textPrimary }]}>{item.surah}</Text>
              <Text style={[styles.recentVerse, { color: colors.textSecondary }]}>Verse {item.verse}</Text>
              <View style={styles.recentTimeRow}>
                <View style={[styles.timeDot, { backgroundColor: colors.primary }]} />
                <Text style={[styles.recentTime, { color: colors.textSecondary }]}>{item.timestamp}</Text>
              </View>
            </View>
            
            <BlurView intensity={60} tint="dark" style={styles.continueButton}>
              <LinearGradient
                colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                style={styles.continueGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}>
                <Text style={[styles.continueText, { color: colors.primary }]}>Continue</Text>
                <ChevronRight size={16} color={colors.primary} strokeWidth={2.5} />
              </LinearGradient>
            </BlurView>
          </View>
        </LinearGradient>
      </BlurView>
    </TouchableOpacity>
  );

  const renderBookmarkItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.bookmarkCard} activeOpacity={0.7}>
      <BlurView intensity={80} tint="dark" style={styles.bookmarkBlur}>
        <LinearGradient
          colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
          style={styles.bookmarkGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}>
          <View style={styles.bookmarkContent}>
            <View style={styles.bookmarkInfo}>
              <Text style={[styles.bookmarkSurah, { color: colors.textPrimary }]}>{item.surah}</Text>
              <Text style={[styles.bookmarkVerse, { color: colors.textSecondary }]}>Verse {item.verse}</Text>
              <View style={styles.bookmarkTextContainer}>
                <Text style={[styles.bookmarkText, { color: colors.textSecondary }]}>"{item.text}"</Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.bookmarkAction} activeOpacity={0.7}>
              <BlurView intensity={60} tint="dark" style={styles.starBlur}>
                <Star size={18} color="#f59e0b" fill="#f59e0b" />
              </BlurView>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </BlurView>
    </TouchableOpacity>
  );

  // Quran Mode View
  if (quranMode && selectedSurah) {
    return (
      <Animated.View style={[styles.quranModeContainer, { backgroundColor: colors.background }, quranModeStyle]}>
        <LinearGradient
          colors={[colors.primary + '20', colors.background, colors.background]}
          style={styles.quranModeGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}>
          
          {/* Minimal Header */}
          <View style={styles.quranModeHeader}>
            <BlurView intensity={80} tint="dark" style={styles.quranModeHeaderBlur}>
              <View style={styles.quranModeHeaderContent}>
                <View style={styles.quranModeTitleSection}>
                  <Text style={[styles.quranModeSurahName, { color: colors.textPrimary }]}>
                    {selectedSurah.name}
                  </Text>
                  <Text style={[styles.quranModeArabicName, { color: colors.primary }]}>
                    {selectedSurah.arabicName}
                  </Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.quranModeExit}
                  onPress={exitQuranMode}
                  activeOpacity={0.7}>
                  <BlurView intensity={60} tint="dark" style={styles.exitBlur}>
                    <Minimize2 size={20} color={colors.textPrimary} strokeWidth={2.5} />
                  </BlurView>
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>

          {/* Quran Reading Area */}
          <ScrollView 
            style={styles.quranModeScroll}
            contentContainerStyle={styles.quranModeContent}
            showsVerticalScrollIndicator={false}>
            
            <View style={styles.bismillahContainer}>
              <Text style={[styles.bismillah, { color: colors.primary }]}>
                بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
              </Text>
            </View>

            {/* Sample Verses - Replace with actual verse data */}
            {[1, 2, 3, 4, 5, 6, 7].map((verseNum) => (
              <View key={verseNum} style={styles.verseContainer}>
                <BlurView intensity={40} tint="dark" style={styles.verseBlur}>
                  <View style={styles.verseContent}>
                    <View style={styles.verseNumberBadge}>
                      <LinearGradient
                        colors={[colors.primary + '40', colors.primary + '20']}
                        style={styles.verseNumberGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}>
                        <Text style={[styles.verseNumber, { color: colors.primary }]}>
                          {verseNum}
                        </Text>
                      </LinearGradient>
                    </View>
                    
                    <Text style={[styles.verseArabic, { color: colors.textPrimary }]}>
                      وَٱلْعَصْرِ ﴿١﴾ إِنَّ ٱلْإِنسَٰنَ لَفِى خُسْرٍ ﴿٢﴾
                    </Text>
                    
                    <Text style={[styles.verseTranslation, { color: colors.textSecondary }]}>
                      By time, Indeed, mankind is in loss, Except for those who have believed and done righteous deeds and advised each other to truth and advised each other to patience.
                    </Text>
                  </View>
                </BlurView>
              </View>
            ))}
          </ScrollView>

          {/* Minimal Controls */}
          <View style={styles.quranModeControls}>
            <BlurView intensity={80} tint="dark" style={styles.controlsBlur}>
              <View style={styles.controlsRow}>
                <TouchableOpacity style={styles.controlButton} activeOpacity={0.7}>
                  <Volume2 size={20} color={colors.primary} strokeWidth={2.5} />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.controlButton} activeOpacity={0.7}>
                  <Bookmark size={20} color={colors.primary} strokeWidth={2.5} />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.controlButton} activeOpacity={0.7}>
                  <Sparkles size={20} color={colors.primary} strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* iOS 16+ Header */}
      <View style={styles.headerContainer}>
        <BlurView intensity={100} tint="dark" style={styles.headerBlur}>
          <LinearGradient
            colors={[colors.primary + 'DD', colors.primary + '99']}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}>
            
            <View style={styles.headerParticles}>
              <FloatingParticle x={40} />
              <FloatingParticle x={width * 0.4} delay={500} />
              <FloatingParticle x={width * 0.7} delay={1000} />
            </View>

            <View style={styles.headerContent}>
              <View style={styles.headerTitleRow}>
                <BookOpen size={28} color="#ffffff" strokeWidth={2.5} />
                <Text style={styles.headerTitle}>Holy Quran</Text>
              </View>
              <Text style={styles.headerSubtitle}>Read, Listen & Reflect</Text>
            </View>
          </LinearGradient>
        </BlurView>
      </View>

      {/* iOS-style Search Bar */}
      <View style={styles.searchContainer}>
        <BlurView intensity={80} tint="dark" style={styles.searchBlur}>
          <LinearGradient
            colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
            style={styles.searchGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}>
            <Search size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder={selectedTab === 'hadith' ? 'Search hadith books...' : 'Search surahs...'}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={colors.textSecondary}
            />
          </LinearGradient>
        </BlurView>
      </View>

      {/* iOS-style Tabs */}
      <View style={styles.tabContainer}>
        <BlurView intensity={80} tint="dark" style={styles.tabBlur}>
          <LinearGradient
            colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
            style={styles.tabGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabsRow}>
              <TouchableOpacity
                style={[styles.tab, selectedTab === 'surahs' && styles.activeTab]}
                onPress={() => setSelectedTab('surahs')}
                activeOpacity={0.7}>
                {selectedTab === 'surahs' && (
                  <LinearGradient
                    colors={[colors.primary + '40', colors.primary + '20']}
                    style={styles.tabActiveGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                )}
                <BookOpen size={16} color={selectedTab === 'surahs' ? colors.primary : colors.textSecondary} strokeWidth={2.5} />
                <Text style={[styles.tabText, { color: selectedTab === 'surahs' ? colors.primary : colors.textSecondary }]}>
                  Surahs
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.tab, selectedTab === 'hadith' && styles.activeTab]}
                onPress={() => setSelectedTab('hadith')}
                activeOpacity={0.7}>
                {selectedTab === 'hadith' && (
                  <LinearGradient
                    colors={[colors.primary + '40', colors.primary + '20']}
                    style={styles.tabActiveGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                )}
                <Book size={16} color={selectedTab === 'hadith' ? colors.primary : colors.textSecondary} strokeWidth={2.5} />
                <Text style={[styles.tabText, { color: selectedTab === 'hadith' ? colors.primary : colors.textSecondary }]}>
                  Hadith
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.tab, selectedTab === 'recent' && styles.activeTab]}
                onPress={() => setSelectedTab('recent')}
                activeOpacity={0.7}>
                {selectedTab === 'recent' && (
                  <LinearGradient
                    colors={[colors.primary + '40', colors.primary + '20']}
                    style={styles.tabActiveGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                )}
                <Volume2 size={16} color={selectedTab === 'recent' ? colors.primary : colors.textSecondary} strokeWidth={2.5} />
                <Text style={[styles.tabText, { color: selectedTab === 'recent' ? colors.primary : colors.textSecondary }]}>
                  Recent
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.tab, selectedTab === 'bookmarks' && styles.activeTab]}
                onPress={() => setSelectedTab('bookmarks')}
                activeOpacity={0.7}>
                {selectedTab === 'bookmarks' && (
                  <LinearGradient
                    colors={[colors.primary + '40', colors.primary + '20']}
                    style={styles.tabActiveGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                )}
                <Bookmark size={16} color={selectedTab === 'bookmarks' ? colors.primary : colors.textSecondary} strokeWidth={2.5} />
                <Text style={[styles.tabText, { color: selectedTab === 'bookmarks' ? colors.primary : colors.textSecondary }]}>
                  Bookmarks
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </LinearGradient>
        </BlurView>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {selectedTab === 'surahs' && (
          <FlatList
            data={filteredSurahs}
            renderItem={renderSurahItem}
            keyExtractor={(item) => item.number.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        )}
        
        {selectedTab === 'hadith' && (
          <FlatList
            data={hadithBooks}
            renderItem={renderHadithBook}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        )}
        
        {selectedTab === 'recent' && (
          <FlatList
            data={recentReadings}
            renderItem={renderRecentItem}
            keyExtractor={(item, index) => index.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        )}
        
        {selectedTab === 'bookmarks' && (
          <FlatList
            data={bookmarkedVerses}
            renderItem={renderBookmarkItem}
            keyExtractor={(item, index) => index.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerBlur: {
    overflow: 'hidden',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 24,
    paddingHorizontal: 24,
    position: 'relative',
  },
  headerParticles: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  particle: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#ffffff',
  },
  headerContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginTop: 20,
    marginBottom: 20,
  },
  searchBlur: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  tabContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  tabBlur: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  tabGradient: {
    padding: 4,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 4,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    position: 'relative',
    marginRight: 8,
  },
  activeTab: {
    overflow: 'hidden',
  },
  tabActiveGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
    zIndex: 1,
  },
  content: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  surahCard: {
    marginBottom: 16,
    height: 140,
  },
  surahBlur: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  surahGradient: {
    flex: 1,
    position: 'relative',
  },
  shimmerEffect: {
    position: 'absolute',
    top: -100,
    left: -width,
    width: width * 3,
    height: 300,
  },
  shimmerGradient: {
    flex: 1,
  },
  surahContent: {
    flex: 1,
    padding: 16,
  },
  surahHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  surahNumber: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  numberGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 26,
    opacity: 0.3,
  },
  surahNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    zIndex: 1,
  },
  surahInfo: {
    flex: 1,
  },
  surahName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  surahArabic: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  surahMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  surahDetails: {
    fontSize: 12,
    fontWeight: '500',
  },
  metaDivider: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 6,
  },
  revelationBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  revelationText: {
    fontSize: 11,
    fontWeight: '600',
  },
  surahActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
  },
  actionBlur: {
    flex: 1,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  progressContainer: {
    marginTop: 'auto',
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressTrack: {
    height: 6,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
    position: 'relative',
  },
  progressGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 8,
    opacity: 0.3,
  },
  // Hadith Styles
  hadithCard: {
    marginBottom: 16,
    height: 160,
  },
  hadithBlur: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  hadithGradient: {
    flex: 1,
    padding: 16,
  },
  hadithContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  hadithIconContainer: {
    marginRight: 14,
  },
  hadithIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  hadithInfo: {
    flex: 1,
  },
  hadithName: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  hadithArabic: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  hadithAuthor: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  hadithMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hadithBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  hadithCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  hadithAction: {
    width: 40,
    height: 40,
  },
  hadithActionBlur: {
    flex: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  hadithDescription: {
    marginTop: 'auto',
  },
  hadithDescText: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  recentCard: {
    marginBottom: 16,
    height: 100,
  },
  recentBlur: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  recentGradient: {
    flex: 1,
  },
  recentContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  recentInfo: {
    flex: 1,
  },
  recentSurah: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  recentVerse: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  recentTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  recentTime: {
    fontSize: 12,
    fontWeight: '500',
  },
  continueButton: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  continueGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  continueText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bookmarkCard: {
    marginBottom: 16,
    height: 120,
  },
  bookmarkBlur: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  bookmarkGradient: {
    flex: 1,
  },
  bookmarkContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  bookmarkInfo: {
    flex: 1,
    marginRight: 12,
  },
  bookmarkSurah: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  bookmarkVerse: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  bookmarkTextContainer: {
    marginTop: 4,
  },
  bookmarkText: {
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  bookmarkAction: {
    width: 40,
    height: 40,
  },
  starBlur: {
    flex: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  // Quran Mode Styles
  quranModeContainer: {
    flex: 1,
  },
  quranModeGradient: {
    flex: 1,
  },
  quranModeHeader: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  quranModeHeaderBlur: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  quranModeHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  quranModeTitleSection: {
    flex: 1,
  },
  quranModeSurahName: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.4,
  },
  quranModeArabicName: {
    fontSize: 18,
    fontWeight: '600',
  },
  quranModeExit: {
    width: 44,
    height: 44,
  },
  exitBlur: {
    flex: 1,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  quranModeScroll: {
    flex: 1,
  },
  quranModeContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  bismillahContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  bismillah: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  verseContainer: {
    marginBottom: 20,
  },
  verseBlur: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  verseContent: {
    padding: 20,
  },
  verseNumberBadge: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  verseNumberGradient: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  verseNumber: {
    fontSize: 14,
    fontWeight: '700',
  },
  verseArabic: {
    fontSize: 22,
    lineHeight: 40,
    textAlign: 'right',
    marginBottom: 16,
    fontWeight: '500',
  },
  verseTranslation: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '400',
  },
  quranModeControls: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
  },
  controlsBlur: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
  controlButton: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
  },
});