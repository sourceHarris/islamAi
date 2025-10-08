import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { BookOpen, Compass, Clock, BookHeart, Flame, CircleDot, Moon, Sparkles, Gift } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../contexts/ThemeContext';
import { useRouter } from 'expo-router';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const userName = "Huzaifa Haris";
  
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Hide greeting by moving it up
  const greetingStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, 60],
      [0, -30],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      scrollY.value,
      [0, 60],
      [1, 0],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  // Hide verse by moving it up
  const verseStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, 80],
      [0, -40],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      scrollY.value,
      [0, 80],
      [1, 0],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  // Hide stats by moving them up
  const statsStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, 100],
      [0, -50],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      scrollY.value,
      [0, 100],
      [1, 0],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  // Name scales down and moves up to compact position
  const nameStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, 100],
      [0, -70],
      Extrapolate.CLAMP
    );

    const scale = interpolate(
      scrollY.value,
      [0, 100],
      [1, 0.7],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateY }, { scale }],
    };
  });

  // Header shrinks when scrolling
  const headerStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, 100],
      [340, 100],
      Extrapolate.CLAMP
    );

    return {
      height,
    };
  });

  // Gradient opacity fades out, blur fades in
  const gradientOpacity = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 80],
      [1, 0],
      Extrapolate.CLAMP
    );

    return {
      opacity,
    };
  });

  // Blur view opacity (only shows when scrolled)
  const blurOpacity = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 80],
      [0, 1],
      Extrapolate.CLAMP
    );

    return {
      opacity,
    };
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* COLLAPSING HEADER */}
      <Animated.View style={[styles.headerContainer, headerStyle]}>
        {/* Gradient Background - Fades out */}
        <Animated.View style={[styles.gradientContainer, gradientOpacity]}>
          <LinearGradient
            colors={[colors.primary, `${colors.primary}CC`, `${colors.primary}88`]}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>

        {/* Glassmorphic Blur - Fades in */}
        <Animated.View style={[styles.blurContainer, blurOpacity]}>
          <BlurView intensity={80} tint="dark" style={styles.blurView}>
            <View style={styles.glassOverlay} />
          </BlurView>
        </Animated.View>

        {/* Content Layer */}
        <View style={styles.headerContent}>
          {/* Greeting - Fades out */}
          <Animated.View style={[styles.greetingContainer, greetingStyle]}>
            <Text style={styles.greeting}>السلام عليكم</Text>
          </Animated.View>

          {/* Name - Stays visible, scales down */}
          <Animated.View style={[styles.nameContainer, nameStyle]}>
            <Text style={styles.heroTitle}>{userName}</Text>
          </Animated.View>
          
          {/* Verse - Fades out */}
          <Animated.View style={[styles.verseContainer, verseStyle]}>
            <Text style={styles.arabicVerse}>إِنَّ مَعَ الْعُسْرِ يُسْرًا</Text>
            <Text style={styles.urduTranslation}>بیشک تنگی کے ساتھ آسانی ہے</Text>
          </Animated.View>

          {/* Stats - Fade out */}
          <Animated.View style={[styles.floatingStats, statsStyle]}>
            <LinearGradient
              colors={['#f59e0b', '#ea580c']}
              style={styles.statBubbleGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}>
              <Flame size={22} color="#ffffff" fill="#ffffff" />
              <Text style={styles.statBubbleNumber}>7</Text>
              <Text style={styles.statBubbleLabel}>Days</Text>
            </LinearGradient>

            <LinearGradient
              colors={['#10b981', '#059669']}
              style={styles.statBubbleGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}>
              <BookOpen size={22} color="#ffffff" fill="#ffffff" />
              <Text style={styles.statBubbleNumber}>12</Text>
              <Text style={styles.statBubbleLabel}>Juz</Text>
            </LinearGradient>
          </Animated.View>
        </View>
      </Animated.View>

      {/* SCROLLABLE CONTENT */}
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.contentSection}>
          {/* 🎁 GIFT AYAH FEATURE */}
          <TouchableOpacity
            style={styles.giftAyahButton}
            onPress={() => router.push('/swipecards')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#10b981', '#059669', '#047857']}
              style={styles.giftAyahGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.sparklesContainer}>
                <View style={styles.sparkle1}>
                  <Sparkles size={16} color="#ffffff" opacity={0.3} />
                </View>
                <View style={styles.sparkle2}>
                  <Sparkles size={12} color="#ffffff" opacity={0.2} />
                </View>
                <View style={styles.sparkle3}>
                  <Sparkles size={14} color="#ffffff" opacity={0.25} />
                </View>
              </View>

              <View style={styles.giftAyahContent}>
                <View style={styles.giftAyahLeft}>
                  <View style={styles.stackedCardsContainer}>
                    <View style={[styles.stackedCard, styles.cardBack2, { backgroundColor: 'rgba(255,255,255,0.15)' }]} />
                    <View style={[styles.stackedCard, styles.cardBack1, { backgroundColor: 'rgba(255,255,255,0.25)' }]} />
                    <View style={[styles.stackedCard, styles.cardFront, { backgroundColor: 'rgba(255,255,255,0.95)' }]}>
                      <Gift size={28} color="#10b981" strokeWidth={2.5} />
                    </View>
                    <View style={styles.giftBadge}>
                      <Sparkles size={14} color="#fbbf24" fill="#fbbf24" />
                    </View>
                  </View>

                  <View style={styles.giftAyahText}>
                    <Text style={styles.giftAyahTitle}>Gift Ayah</Text>
                    <Text style={styles.giftAyahSubtitle}>Open your daily gift ayah ✨</Text>
                  </View>
                </View>

                <View style={styles.giftAyahArrow}>
                  <Text style={styles.arrowText}>→</Text>
                </View>
              </View>

              <View style={styles.premiumBadge}>
                <Sparkles size={10} color="#fbbf24" fill="#fbbf24" />
                <Text style={styles.premiumBadgeText}>NEW</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Next Prayer Card */}
          <View style={[styles.nextPrayerCard, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.nextPrayerHeader}>
              <View style={[styles.iconCircle, { backgroundColor: `${colors.primary}20` }]}>
                <Clock size={28} color={colors.primary} />
              </View>
              <View style={styles.nextPrayerInfo}>
                <Text style={[styles.nextPrayerLabel, { color: colors.textSecondary }]}>Next Prayer</Text>
                <Text style={[styles.nextPrayerName, { color: colors.primary }]}>Asr</Text>
              </View>
            </View>
            <Text style={[styles.nextPrayerTime, { color: colors.textPrimary }]}>3:45 PM</Text>
            <Text style={[styles.nextPrayerCountdown, { color: colors.textSecondary }]}>in 2 hours 15 minutes</Text>
          </View>

          {/* Quick Access */}
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Quick Access</Text>
          <View style={styles.quickGrid}>
            <TouchableOpacity 
              style={[styles.quickCard, { backgroundColor: colors.cardBackground }]}
              onPress={() => router.push('/qibla')}
              activeOpacity={0.7}>
              <View style={[styles.quickIconContainer, { backgroundColor: `${colors.primary}15` }]}>
                <Compass size={32} color={colors.primary} />
              </View>
              <Text style={[styles.quickLabel, { color: colors.textPrimary }]}>Qibla</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.quickCard, { backgroundColor: colors.cardBackground }]}
              onPress={() => router.push('/dhikr')}
              activeOpacity={0.7}>
              <View style={[styles.quickIconContainer, { backgroundColor: `${colors.primary}15` }]}>
                <CircleDot size={32} color={colors.primary} />
              </View>
              <Text style={[styles.quickLabel, { color: colors.textPrimary }]}>Dhikr</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.quickCard, { backgroundColor: colors.cardBackground }]}
              onPress={() => router.push('/dua')}
              activeOpacity={0.7}>
              <View style={[styles.quickIconContainer, { backgroundColor: `${colors.primary}15` }]}>
                <BookHeart size={32} color={colors.primary} />
              </View>
              <Text style={[styles.quickLabel, { color: colors.textPrimary }]}>Du'a</Text>
            </TouchableOpacity>
          </View>

          {/* Today's Prayers */}
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Today's Prayers</Text>
          <View style={[styles.prayersList, { backgroundColor: colors.cardBackground }]}>
            {[
              { name: 'Fajr', time: '5:30 AM', completed: true },
              { name: 'Dhuhr', time: '12:45 PM', completed: true },
              { name: 'Asr', time: '3:45 PM', completed: false },
              { name: 'Maghrib', time: '6:20 PM', completed: false },
              { name: 'Isha', time: '7:50 PM', completed: false },
            ].map((prayer, index) => (
              <View key={index} style={[styles.prayerItem, { borderBottomColor: colors.border }]}>
                <View style={styles.prayerLeft}>
                  {prayer.completed ? (
                    <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
                      <Text style={styles.checkMark}>✓</Text>
                    </View>
                  ) : (
                    <View style={[styles.emptyCircle, { borderColor: colors.border }]} />
                  )}
                  <Text style={[styles.prayerName, { color: colors.textPrimary }]}>{prayer.name}</Text>
                </View>
                <Text style={[styles.prayerTime, { color: colors.textSecondary }]}>{prayer.time}</Text>
              </View>
            ))}
          </View>

          {/* Islamic Date */}
          <View style={[styles.dateCard, { backgroundColor: colors.cardBackground }]}>
            <Moon size={28} color={colors.primary} />
            <View style={styles.dateInfo}>
              <Text style={[styles.islamicDate, { color: colors.primary }]}>15 Ramadan 1446</Text>
              <Text style={[styles.gregorianDate, { color: colors.textSecondary }]}>October 8, 2025</Text>
            </View>
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: 'hidden',
  },
  gradientContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerGradient: {
    flex: 1,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  blurContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  blurView: {
    flex: 1,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  glassOverlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.18)',
  },
  headerContent: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
    flex: 1,
  },
  greetingContainer: { alignItems: 'center', marginBottom: 8 },
  greeting: { fontSize: 28, color: '#ffffff', fontWeight: '600' },
  nameContainer: { alignItems: 'center', marginBottom: 16 },
  heroTitle: { 
    fontSize: 34, 
    fontWeight: '700', 
    color: '#ffffff', 
    letterSpacing: 1.2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  verseContainer: { alignItems: 'center', paddingHorizontal: 20, marginBottom: 24 },
  arabicVerse: { fontSize: 20, color: '#ffffff', fontWeight: '600', marginBottom: 6, textAlign: 'center' },
  urduTranslation: { fontSize: 14, color: '#ffffff', opacity: 0.9, textAlign: 'center' },
  floatingStats: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
  statBubbleGradient: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: 24, alignItems: 'center', flexDirection: 'row', gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  statBubbleNumber: { fontSize: 22, fontWeight: 'bold', color: '#ffffff' },
  statBubbleLabel: { fontSize: 13, color: '#ffffff', fontWeight: '600' },
  scrollContent: { paddingTop: 340 },
  contentSection: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  
  giftAyahButton: { marginBottom: 24, borderRadius: 28, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 12 },
  giftAyahGradient: { padding: 24, position: 'relative', overflow: 'hidden' },
  sparklesContainer: { position: 'absolute', width: '100%', height: '100%' },
  sparkle1: { position: 'absolute', top: 15, right: 40 },
  sparkle2: { position: 'absolute', bottom: 20, left: 30 },
  sparkle3: { position: 'absolute', top: 40, left: 60 },
  giftAyahContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: 1 },
  giftAyahLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  stackedCardsContainer: { position: 'relative', width: 70, height: 70, marginRight: 16 },
  stackedCard: { position: 'absolute', width: 50, height: 60, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  cardBack2: { top: 0, left: 0, transform: [{ rotate: '-8deg' }] },
  cardBack1: { top: 4, left: 8, transform: [{ rotate: '-4deg' }] },
  cardFront: { top: 8, left: 16, alignItems: 'center', justifyContent: 'center' },
  giftBadge: { position: 'absolute', top: -4, right: 0, zIndex: 10 },
  giftAyahText: { flex: 1 },
  giftAyahTitle: { fontSize: 22, fontWeight: 'bold', color: '#ffffff', marginBottom: 4 },
  giftAyahSubtitle: { fontSize: 14, color: '#ffffff', opacity: 0.95, fontWeight: '500' },
  giftAyahArrow: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255, 255, 255, 0.25)', alignItems: 'center', justifyContent: 'center' },
  arrowText: { fontSize: 22, color: '#ffffff', fontWeight: 'bold' },
  premiumBadge: { position: 'absolute', top: 12, right: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(251, 191, 36, 0.3)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 4 },
  premiumBadgeText: { fontSize: 11, fontWeight: 'bold', color: '#fbbf24', letterSpacing: 0.5 },

  nextPrayerCard: { padding: 24, borderRadius: 24, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 },
  nextPrayerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  iconCircle: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  nextPrayerInfo: { flex: 1 },
  nextPrayerLabel: { fontSize: 14, fontWeight: '500', marginBottom: 4 },
  nextPrayerName: { fontSize: 22, fontWeight: 'bold' },
  nextPrayerTime: { fontSize: 42, fontWeight: 'bold', marginBottom: 6 },
  nextPrayerCountdown: { fontSize: 16 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 32 },
  quickCard: { flex: 1, aspectRatio: 1, borderRadius: 20, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  quickIconContainer: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  quickLabel: { fontSize: 13, fontWeight: '600' },
  prayersList: { borderRadius: 20, padding: 4, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  prayerItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16, borderBottomWidth: 1 },
  prayerLeft: { flexDirection: 'row', alignItems: 'center' },
  checkCircle: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  checkMark: { color: '#ffffff', fontSize: 14, fontWeight: 'bold' },
  emptyCircle: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, marginRight: 12 },
  prayerName: { fontSize: 16, fontWeight: '600' },
  prayerTime: { fontSize: 15, fontWeight: '500' },
  dateCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 20, gap: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  dateInfo: { flex: 1 },
  islamicDate: { fontSize: 18, fontWeight: 'bold', marginBottom: 2 },
  gregorianDate: { fontSize: 14 },
});