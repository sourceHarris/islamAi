import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { X, RefreshCw, Sparkles, Heart, Share2, BookOpen } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useTheme } from '../contexts/ThemeContext';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width - 48;
const CARD_HEIGHT = height * 0.68;
const SWIPE_THRESHOLD = 120;

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

export default function SwipeCardsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cards] = useState(CARDS_DATA);

  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);
  const cardOpacity = useSharedValue(1);

  const handleSwipeNext = () => {
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handleSwipePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      const dragProgress = Math.abs(event.translationX) / CARD_WIDTH;
      scale.value = 1 - dragProgress * 0.08;
      cardOpacity.value = 1 - dragProgress * 0.4;
    })
    .onEnd((event) => {
      const shouldSwipe = Math.abs(event.translationX) > SWIPE_THRESHOLD;
      
      if (shouldSwipe) {
        const direction = event.translationX > 0 ? 1 : -1;
        
        translateX.value = withTiming(
          direction * CARD_WIDTH * 1.5,
          { duration: 250 },
          () => {
            translateX.value = 0;
            scale.value = 1;
            cardOpacity.value = 1;
            
            if (direction > 0) {
              runOnJS(handleSwipePrev)();
            } else {
              runOnJS(handleSwipeNext)();
            }
          }
        );
        
        scale.value = withTiming(0.85, { duration: 250 });
        cardOpacity.value = withTiming(0, { duration: 250 });
      } else {
        translateX.value = withSpring(0, { damping: 25, stiffness: 250 });
        scale.value = withSpring(1);
        cardOpacity.value = withSpring(1);
      }
    });

  const cardAnimatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-CARD_WIDTH, 0, CARD_WIDTH],
      [-12, 0, 12],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { rotate: `${rotate}deg` },
        { scale: scale.value },
      ],
      opacity: cardOpacity.value,
    };
  });

  const handleRefresh = () => {
    setCurrentIndex(0);
    translateX.value = withSpring(0);
    scale.value = withSpring(1);
    cardOpacity.value = withSpring(1);
  };

  const currentCard = cards[currentIndex];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Modern iOS-style Header */}
      <BlurView intensity={95} tint="dark" style={styles.headerBlur}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <View style={styles.headerButtonInner}>
              <X size={22} color={colors.textPrimary} strokeWidth={2.5} />
            </View>
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <View style={styles.titleRow}>
              <Sparkles size={18} color={colors.primary} strokeWidth={2} />
              <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Gift Ayah</Text>
            </View>
            <View style={styles.counterPill}>
              <Text style={[styles.counterText, { color: colors.primary }]}>
                {currentIndex + 1} of {cards.length}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity onPress={handleRefresh} style={styles.headerButton}>
            <View style={styles.headerButtonInner}>
              <RefreshCw size={20} color={colors.textPrimary} strokeWidth={2.5} />
            </View>
          </TouchableOpacity>
        </View>
      </BlurView>

      {/* Card Area */}
      <View style={styles.cardArea}>
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.cardContainer, cardAnimatedStyle]}>
            {/* iOS-style Card with Gradient */}
            <LinearGradient
              colors={[currentCard.color1, currentCard.color2]}
              style={styles.card}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {/* Subtle mesh gradient overlay */}
              <View style={styles.meshOverlay} />
              
              <View style={styles.cardInner}>
                {/* Top Section - Topic */}
                <View style={styles.topSection}>
                  <BlurView intensity={30} tint="light" style={styles.topicPill}>
                    <Text style={styles.emojiLarge}>{currentCard.emoji}</Text>
                    <View style={styles.topicDivider} />
                    <Text style={styles.topicLabel}>{currentCard.topic}</Text>
                  </BlurView>
                </View>

                {/* Middle Section - Content */}
                <View style={styles.contentSection}>
                  <View style={styles.iconCircle}>
                    <BookOpen size={24} color="#ffffff" strokeWidth={2} />
                  </View>
                  
                  <Text style={styles.arabicText}>{currentCard.arabicVerse}</Text>
                  
                  <View style={styles.dividerLine} />
                  
                  <Text style={styles.translationText}>
                    {currentCard.translation}
                  </Text>
                  
                  <Text style={styles.referenceText}>{currentCard.reference}</Text>
                </View>

                {/* Bottom Section - Actions */}
                <View style={styles.bottomSection}>
                  <TouchableOpacity style={styles.actionButtonModern} activeOpacity={0.6}>
                    <BlurView intensity={20} tint="light" style={styles.actionBlur}>
                      <Heart size={20} color="#ffffff" strokeWidth={2} />
                    </BlurView>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.actionButtonModern} activeOpacity={0.6}>
                    <BlurView intensity={20} tint="light" style={styles.actionBlur}>
                      <Share2 size={20} color="#ffffff" strokeWidth={2} />
                    </BlurView>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.actionButtonModern} activeOpacity={0.6}>
                    <BlurView intensity={20} tint="light" style={styles.actionBlur}>
                      <BookOpen size={20} color="#ffffff" strokeWidth={2} />
                    </BlurView>
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
        </GestureDetector>
      </View>

      {/* Bottom Instructions - iOS style */}
      <View style={styles.bottomInstructions}>
        <BlurView intensity={90} tint="dark" style={styles.instructionBlur}>
          <View style={styles.swipeIndicators}>
            <View style={[styles.swipeArrow, styles.swipeLeft]}>
              <Text style={[styles.arrowText, { color: colors.primary }]}>←</Text>
            </View>
            <View style={styles.swipeTextContainer}>
              <Text style={[styles.swipeMainText, { color: colors.textPrimary }]}>
                Swipe to explore
              </Text>
              <Text style={[styles.swipeSubText, { color: colors.textSecondary }]}>
                {cards.length - currentIndex - 1} more verses
              </Text>
            </View>
            <View style={[styles.swipeArrow, styles.swipeRight]}>
              <Text style={[styles.arrowText, { color: colors.primary }]}>→</Text>
            </View>
          </View>
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
    zIndex: 100,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.12)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerButton: {
    width: 40,
    height: 40,
  },
  headerButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  counterPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  counterText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  cardArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  card: {
    flex: 1,
    borderRadius: 40,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 20,
  },
  meshOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  cardInner: {
    flex: 1,
    padding: 28,
    justifyContent: 'space-between',
  },
  topSection: {
    alignItems: 'center',
  },
  topicPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  emojiLarge: {
    fontSize: 28,
  },
  topicDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 12,
  },
  topicLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  contentSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  arabicText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 50,
    letterSpacing: 0.5,
  },
  dividerLine: {
    width: 60,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 2,
  },
  translationText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 28,
    opacity: 0.95,
    paddingHorizontal: 8,
  },
  referenceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    opacity: 0.8,
    marginTop: 8,
    letterSpacing: 0.3,
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  actionButtonModern: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  actionBlur: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomInstructions: {
    position: 'absolute',
    bottom: 32,
    left: 24,
    right: 24,
    borderRadius: 24,
    overflow: 'hidden',
    zIndex: 50,
  },
  instructionBlur: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  swipeIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  swipeArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  swipeLeft: {},
  swipeRight: {},
  arrowText: {
    fontSize: 18,
    fontWeight: '700',
  },
  swipeTextContainer: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  swipeMainText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  swipeSubText: {
    fontSize: 12,
    fontWeight: '500',
  },
});