import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { X, RefreshCw, Sparkles, Heart, Share2, BookOpen } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
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

export default function SwipeCardsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cards] = useState(CARDS_DATA);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);

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
        translateX.value = withSpring(event.translationX > 0 ? 500 : -500);
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
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <X size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Gift Ayah</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {currentIndex + 1} of {cards.length}
          </Text>
        </View>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <RefreshCw size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Cards Stack */}
      <View style={styles.cardsContainer}>
        {/* Next Card (Behind) */}
        <View style={[styles.cardWrapper, styles.nextCardWrapper]}>
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

        {/* Current Card (Top) */}
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.cardWrapper, animatedStyle]}>
            <LinearGradient
              colors={[currentCard.color1, currentCard.color2]}
              style={styles.card}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {/* Sparkle Background */}
              <View style={styles.sparklesBackground}>
                <Sparkles size={20} color="#ffffff" opacity={0.2} style={styles.sparkle1} />
                <Sparkles size={16} color="#ffffff" opacity={0.15} style={styles.sparkle2} />
                <Sparkles size={18} color="#ffffff" opacity={0.18} style={styles.sparkle3} />
              </View>

              <ScrollView 
                style={styles.cardScrollView}
                contentContainerStyle={styles.cardContentScroll}
                showsVerticalScrollIndicator={false}
              >
                {/* Topic Badge */}
                <View style={styles.topicBadge}>
                  <Text style={styles.topicEmoji}>{currentCard.emoji}</Text>
                  <Text style={styles.topicText}>{currentCard.topic}</Text>
                </View>

                {/* Arabic Verse */}
                <View style={styles.verseContainer}>
                  <BookOpen size={32} color="#ffffff" style={styles.bookIcon} />
                  <Text style={styles.arabicVerse}>{currentCard.arabicVerse}</Text>
                </View>

                {/* Translation */}
                <View style={styles.translationContainer}>
                  <Text style={styles.translationText}>"{currentCard.translation}"</Text>
                </View>

                {/* Reference */}
                <View style={styles.referenceContainer}>
                  <View style={styles.referenceDivider} />
                  <Text style={styles.referenceText}>{currentCard.reference}</Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Heart size={24} color="#ffffff" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Share2 size={24} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </LinearGradient>
          </Animated.View>
        </GestureDetector>
      </View>

      {/* Swipe Instructions */}
      <View style={styles.instructionsContainer}>
        <View style={styles.instructionItem}>
          <Text style={[styles.instructionArrow, { color: colors.textSecondary }]}>←</Text>
          <Text style={[styles.instructionText, { color: colors.textSecondary }]}>Swipe</Text>
          <Text style={[styles.instructionArrow, { color: colors.textSecondary }]}>→</Text>
        </View>
        <Text style={[styles.instructionSubtext, { color: colors.textSecondary }]}>
          Swipe left or right for next ayah
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  refreshButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
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
    opacity: 0.5,
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  sparklesBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
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
  cardScrollView: {
    flex: 1,
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
  },
  topicEmoji: {
    fontSize: 24,
  },
  topicText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  verseContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  bookIcon: {
    marginBottom: 16,
    opacity: 0.9,
  },
  arabicVerse: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 50,
  },
  translationContainer: {
    marginBottom: 32,
  },
  translationText: {
    fontSize: 20,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 32,
    fontWeight: '500',
  },
  referenceContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  referenceDivider: {
    width: 60,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 16,
    borderRadius: 1,
  },
  referenceText: {
    fontSize: 15,
    color: '#ffffff',
    opacity: 0.9,
    fontWeight: '600',
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
  },
  cardEmoji: {
    fontSize: 80,
  },
  instructionsContainer: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  instructionArrow: {
    fontSize: 24,
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