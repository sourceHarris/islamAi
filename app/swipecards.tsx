import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { X, RefreshCw, Sparkles, Heart, Share2, BookOpen, Zap } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useTheme } from '../contexts/ThemeContext';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width - 40;
const CARD_HEIGHT = height * 0.65;

interface Card {
  id: number;
  topic: string;
  arabicVerse: string;
  translation: string;
  reference: string;
  color1: string;
  color2: string;
  emoji: string;
}

const CARDS_DATA: Card[] = [
  {
    id: 1,
    topic: 'Peace',
    arabicVerse: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    translation: 'Verily, in the remembrance of Allah do hearts find rest.',
    reference: 'Surah Ar-Ra\'d (13:28)',
    color1: '#10b981',
    color2: '#059669',
    emoji: '🌟',
  },
  {
    id: 2,
    topic: 'Gratitude',
    arabicVerse: 'لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ',
    translation: 'If you are grateful, I will surely increase you in favor.',
    reference: 'Surah Ibrahim (14:7)',
    color1: '#f59e0b',
    color2: '#d97706',
    emoji: '🙏',
  },
  {
    id: 3,
    topic: 'Trust in Allah',
    arabicVerse: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ',
    translation: 'And whoever relies upon Allah - then He is sufficient for him.',
    reference: 'Surah At-Talaq (65:3)',
    color1: '#3b82f6',
    color2: '#2563eb',
    emoji: '💙',
  },
  {
    id: 4,
    topic: 'Hope',
    arabicVerse: 'لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ',
    translation: 'Do not despair of the mercy of Allah.',
    reference: 'Surah Az-Zumar (39:53)',
    color1: '#8b5cf6',
    color2: '#7c3aed',
    emoji: '🌈',
  },
  {
    id: 5,
    topic: 'Forgiveness',
    arabicVerse: 'إِنَّ اللَّهَ غَفُورٌ رَّحِيمٌ',
    translation: 'Indeed, Allah is Forgiving and Merciful.',
    reference: 'Surah Al-Baqarah (2:173)',
    color1: '#ec4899',
    color2: '#db2777',
    emoji: '💖',
  },
  {
    id: 6,
    topic: 'Guidance',
    arabicVerse: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
    translation: 'Guide us to the straight path.',
    reference: 'Surah Al-Fatihah (1:6)',
    color1: '#14b8a6',
    color2: '#0d9488',
    emoji: '🧭',
  },
  {
    id: 7,
    topic: 'Patience',
    arabicVerse: 'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ',
    translation: 'Indeed, Allah is with the patient.',
    reference: 'Surah Al-Baqarah (2:153)',
    color1: '#06b6d4',
    color2: '#0891b2',
    emoji: '☮️',
  },
  {
    id: 8,
    topic: 'Strength',
    arabicVerse: 'وَلَا تَهِنُوا وَلَا تَحْزَنُوا',
    translation: 'Do not lose hope, nor be sad. You will surely be victorious.',
    reference: 'Surah Ali Imran (3:139)',
    color1: '#ef4444',
    color2: '#dc2626',
    emoji: '💪',
  },
];

// Floating Particle Component
const FloatingParticle = ({ delay = 0, x = 0, cardColor = '#10b981' }) => {
  const translateY = useSharedValue(CARD_HEIGHT);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withTiming(-50, {
        duration: 6000 + Math.random() * 3000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
    opacity.value = withRepeat(
      withTiming(0.5, { duration: 1500 }),
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
        { left: x, backgroundColor: cardColor },
        particleStyle,
      ]}
    />
  );
};

export default function SwipeCardsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cards] = useState(CARDS_DATA);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const holoAnim = useSharedValue(0);

  useEffect(() => {
    holoAnim.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const handleSwipe = () => {
    setCurrentIndex((prev) => {
      if (prev === cards.length - 1) {
        return 0;
      }
      return prev + 1;
    });
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      rotate.value = event.translationX / 10;
    })
    .onEnd((event) => {
      if (Math.abs(event.translationX) > 100) {
        translateX.value = withSpring(event.translationX > 0 ? 500 : -500, {
          damping: 20,
          stiffness: 90,
        });
        translateY.value = withSpring(event.translationY);
        
        setTimeout(() => {
          runOnJS(handleSwipe)();
          translateX.value = 0;
          translateY.value = 0;
          rotate.value = 0;
        }, 200);
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        rotate.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate.value}deg` },
      ],
    };
  });

  const holoStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      holoAnim.value,
      [0, 1],
      [-CARD_WIDTH, CARD_WIDTH],
      Extrapolate.CLAMP
    );
    return {
      transform: [{ translateX }, { rotate: '45deg' }],
    };
  });

  const handleRefresh = () => {
    setCurrentIndex(0);
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    rotate.value = withSpring(0);
  };

  const currentCard = cards[currentIndex];
  const nextCard = cards[(currentIndex + 1) % cards.length];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Futuristic Header with Blur */}
      <BlurView intensity={80} tint="dark" style={styles.headerBlur}>
        <View style={[styles.header, { backgroundColor: 'transparent' }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <View style={styles.buttonGlow} />
            <X size={28} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <View style={styles.titleContainer}>
              <Sparkles size={20} color={colors.primary} />
              <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Gift Ayah</Text>
            </View>
            <View style={styles.counterBadge}>
              <Text style={[styles.headerSubtitle, { color: colors.textPrimary }]}>
                {currentIndex + 1} / {cards.length}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
            <View style={styles.buttonGlow} />
            <RefreshCw size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </BlurView>

      {/* Cards Stack */}
      <View style={styles.cardsContainer}>
        {/* Next Card (Behind) with Glow */}
        <View style={[styles.cardWrapper, styles.nextCardWrapper]}>
          <View style={[styles.cardGlowOuter, { shadowColor: nextCard.color1 }]} />
          <LinearGradient
            colors={[nextCard.color1, nextCard.color2]}
            style={styles.card}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.cardContent}>
              <Text style={styles.cardEmoji}>{nextCard.emoji}</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Current Card (Top) - Futuristic */}
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.cardWrapper, animatedStyle]}>
            <View style={[styles.cardGlowOuter, { shadowColor: currentCard.color1 }]} />
            <LinearGradient
              colors={[currentCard.color1, currentCard.color2, currentCard.color2]}
              style={styles.card}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {/* Holographic Shimmer */}
              <Animated.View style={[styles.holoShimmer, holoStyle]}>
                <LinearGradient
                  colors={['transparent', 'rgba(255,255,255,0.4)', 'transparent']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.shimmerGradient}
                />
              </Animated.View>

              {/* Neon Border */}
              <View style={[styles.neonBorder, { borderColor: currentCard.color1 }]} />

              {/* Floating Particles */}
              <View style={styles.particlesContainer}>
                <FloatingParticle x={50} delay={0} cardColor={currentCard.color1} />
                <FloatingParticle x={CARD_WIDTH * 0.3} delay={500} cardColor={currentCard.color1} />
                <FloatingParticle x={CARD_WIDTH * 0.7} delay={1000} cardColor={currentCard.color1} />
                <FloatingParticle x={CARD_WIDTH * 0.5} delay={1500} cardColor={currentCard.color1} />
              </View>

              {/* Sparkle Background */}
              <View style={styles.sparklesBackground}>
                <Sparkles size={20} color="#ffffff" opacity={0.3} style={styles.sparkle1} />
                <Sparkles size={16} color="#ffffff" opacity={0.25} style={styles.sparkle2} />
                <Sparkles size={18} color="#ffffff" opacity={0.28} style={styles.sparkle3} />
                <Sparkles size={14} color="#ffffff" opacity={0.2} style={styles.sparkle4} />
              </View>

              <ScrollView 
                style={styles.cardScrollView}
                contentContainerStyle={styles.cardContentScroll}
                showsVerticalScrollIndicator={false}
              >
                {/* Topic Badge - Enhanced */}
                <View style={styles.topicBadge}>
                  <View style={styles.topicGlow} />
                  <Text style={styles.topicEmoji}>{currentCard.emoji}</Text>
                  <Text style={styles.topicText}>{currentCard.topic}</Text>
                </View>

                {/* Arabic Verse with Glow */}
                <View style={styles.verseContainer}>
                  <View style={styles.iconContainer}>
                    <View style={styles.iconGlow} />
                    <BookOpen size={32} color="#ffffff" style={styles.bookIcon} />
                  </View>
                  <Text style={styles.arabicVerse}>{currentCard.arabicVerse}</Text>
                </View>

                {/* Translation */}
                <View style={styles.translationContainer}>
                  <View style={styles.quoteGlow} />
                  <Text style={styles.translationText}>"{currentCard.translation}"</Text>
                </View>

                {/* Reference with Divider */}
                <View style={styles.referenceContainer}>
                  <LinearGradient
                    colors={['transparent', 'rgba(255,255,255,0.5)', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.referenceDivider}
                  />
                  <Text style={styles.referenceText}>{currentCard.reference}</Text>
                </View>

                {/* Action Buttons - Futuristic */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                    <View style={styles.actionButtonGlow} />
                    <Heart size={24} color="#ffffff" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                    <View style={styles.actionButtonGlow} />
                    <Share2 size={24} color="#ffffff" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                    <View style={styles.actionButtonGlow} />
                    <Zap size={24} color="#ffffff" fill="#ffffff" />
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </LinearGradient>
          </Animated.View>
        </GestureDetector>
      </View>

      {/* Swipe Instructions - Futuristic */}
      <View style={styles.instructionsContainer}>
        <BlurView intensity={60} tint="dark" style={styles.instructionsBlur}>
          <View style={styles.instructionItem}>
            <View style={styles.arrowContainer}>
              <Text style={[styles.instructionArrow, { color: colors.primary }]}>←</Text>
            </View>
            <Text style={[styles.instructionText, { color: colors.textPrimary }]}>Swipe</Text>
            <View style={styles.arrowContainer}>
              <Text style={[styles.instructionArrow, { color: colors.primary }]}>→</Text>
            </View>
          </View>
          <Text style={[styles.instructionSubtext, { color: colors.textSecondary }]}>
            Swipe left or right for next ayah
          </Text>
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  refreshButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  buttonGlow: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  counterBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  cardsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardWrapper: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  nextCardWrapper: {
    transform: [{ scale: 0.95 }],
    opacity: 0.6,
  },
  cardGlowOuter: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 42,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 15,
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 15,
  },
  holoShimmer: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: CARD_WIDTH + 200,
    height: CARD_HEIGHT + 200,
    zIndex: 1,
  },
  shimmerGradient: {
    flex: 1,
  },
  neonBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 32,
    borderWidth: 2,
    opacity: 0.5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    zIndex: 2,
  },
  particlesContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  sparklesBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 2,
  },
  sparkle1: {
    position: 'absolute',
    top: 40,
    right: 30,
  },
  sparkle2: {
    position: 'absolute',
    bottom: 100,
    left: 40,
  },
  sparkle3: {
    position: 'absolute',
    top: 150,
    left: 50,
  },
  sparkle4: {
    position: 'absolute',
    bottom: 200,
    right: 60,
  },
  cardScrollView: {
    flex: 1,
    zIndex: 3,
  },
  cardContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContentScroll: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: CARD_HEIGHT,
  },
  topicBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 32,
    gap: 8,
    position: 'relative',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  topicGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  topicEmoji: {
    fontSize: 24,
    zIndex: 1,
  },
  topicText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    zIndex: 1,
  },
  verseContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  iconGlow: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    top: -8,
    left: -8,
  },
  bookIcon: {
    opacity: 0.9,
    zIndex: 1,
  },
  arabicVerse: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 50,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  translationContainer: {
    marginBottom: 32,
    position: 'relative',
  },
  quoteGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
  },
  translationText: {
    fontSize: 20,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 32,
    fontWeight: '500',
    zIndex: 1,
  },
  referenceContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  referenceDivider: {
    width: 80,
    height: 3,
    marginBottom: 16,
    borderRadius: 1.5,
  },
  referenceText: {
    fontSize: 15,
    color: '#ffffff',
    opacity: 0.95,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  actionButtonGlow: {
    position: 'absolute',
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  cardEmoji: {
    fontSize: 80,
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  instructionsBlur: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  arrowContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionArrow: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  instructionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  instructionSubtext: {
    fontSize: 13,
  },
});