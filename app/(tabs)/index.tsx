import React, { useEffect } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { BookOpen, Compass, Clock, BookHeart, Flame, CircleDot, Moon, Sparkles, Gift, Zap } from 'lucide-react-native';
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
  withRepeat,
  withTiming,
  withSpring,
  Easing,
  useAnimatedProps,
  withSequence,
} from 'react-native-reanimated';
import Svg, { Circle, Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

const { width, height } = Dimensions.get('window');
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Floating Particle Component
const FloatingParticle = ({ delay = 0, x = 0 }) => {
  const translateY = useSharedValue(height);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withTiming(-100, {
        duration: 8000 + Math.random() * 4000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 2000 }),
        withTiming(0, { duration: 2000 })
      ),
      -1,
      false
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

// Islamic Pattern Background - Enhanced & More Visible
const IslamicPattern = () => (
  <Svg width={width} height={340} style={styles.patternSvg}>
    <Defs>
      <SvgLinearGradient id="patternGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
        <Stop offset="100%" stopColor="#ffffff" stopOpacity="0.18" />
      </SvgLinearGradient>
    </Defs>
    
    {/* Left Mosque Silhouette - More Detailed */}
    <Path
      d={`M ${width * 0.12} 300 L ${width * 0.12} 260 L ${width * 0.15} 250 L ${width * 0.18} 260 L ${width * 0.18} 300`}
      stroke="url(#patternGrad)"
      strokeWidth="2.5"
      fill="rgba(255,255,255,0.05)"
    />
    <Path
      d={`M ${width * 0.15} 250 L ${width * 0.15} 200`}
      stroke="url(#patternGrad)"
      strokeWidth="3"
    />
    <Circle cx={width * 0.15} cy={195} r="8" fill="url(#patternGrad)" />
    <Path
      d={`M ${width * 0.08} 280 L ${width * 0.22} 280 L ${width * 0.22} 300 L ${width * 0.08} 300 Z`}
      stroke="url(#patternGrad)"
      strokeWidth="2"
      fill="rgba(255,255,255,0.04)"
    />
    {/* Minarets */}
    <Path
      d={`M ${width * 0.1} 280 L ${width * 0.1} 220`}
      stroke="url(#patternGrad)"
      strokeWidth="2"
    />
    <Circle cx={width * 0.1} cy={215} r="5" fill="url(#patternGrad)" />
    <Path
      d={`M ${width * 0.2} 280 L ${width * 0.2} 220`}
      stroke="url(#patternGrad)"
      strokeWidth="2"
    />
    <Circle cx={width * 0.2} cy={215} r="5" fill="url(#patternGrad)" />

    {/* Right Mosque Silhouette - More Detailed */}
    <Path
      d={`M ${width * 0.82} 300 L ${width * 0.82} 260 L ${width * 0.85} 250 L ${width * 0.88} 260 L ${width * 0.88} 300`}
      stroke="url(#patternGrad)"
      strokeWidth="2.5"
      fill="rgba(255,255,255,0.05)"
    />
    <Path
      d={`M ${width * 0.85} 250 L ${width * 0.85} 200`}
      stroke="url(#patternGrad)"
      strokeWidth="3"
    />
    <Circle cx={width * 0.85} cy={195} r="8" fill="url(#patternGrad)" />
    <Path
      d={`M ${width * 0.78} 280 L ${width * 0.92} 280 L ${width * 0.92} 300 L ${width * 0.78} 300 Z`}
      stroke="url(#patternGrad)"
      strokeWidth="2"
      fill="rgba(255,255,255,0.04)"
    />
    {/* Minarets */}
    <Path
      d={`M ${width * 0.8} 280 L ${width * 0.8} 220`}
      stroke="url(#patternGrad)"
      strokeWidth="2"
    />
    <Circle cx={width * 0.8} cy={215} r="5" fill="url(#patternGrad)" />
    <Path
      d={`M ${width * 0.9} 280 L ${width * 0.9} 220`}
      stroke="url(#patternGrad)"
      strokeWidth="2"
    />
    <Circle cx={width * 0.9} cy={215} r="5" fill="url(#patternGrad)" />

    {/* Crescent Moons - Top Corners */}
    <Path
      d={`M ${width * 0.08} 80 Q ${width * 0.06} 90 ${width * 0.08} 100 Q ${width * 0.11} 90 ${width * 0.08} 80`}
      stroke="url(#patternGrad)"
      strokeWidth="2.5"
      fill="none"
    />
    <Circle cx={width * 0.095} cy={85} r="3" fill="url(#patternGrad)" />
    
    <Path
      d={`M ${width * 0.92} 80 Q ${width * 0.94} 90 ${width * 0.92} 100 Q ${width * 0.89} 90 ${width * 0.92} 80`}
      stroke="url(#patternGrad)"
      strokeWidth="2.5"
      fill="none"
    />
    <Circle cx={width * 0.905} cy={85} r="3" fill="url(#patternGrad)" />

    {/* Islamic Stars - 8 Pointed */}
    <Path
      d={`M ${width * 0.15} 120 L ${width * 0.155} 110 L ${width * 0.16} 120 L ${width * 0.17} 115 L ${width * 0.17} 125 L ${width * 0.16} 120 L ${width * 0.155} 130 L ${width * 0.15} 120 L ${width * 0.14} 125 L ${width * 0.14} 115 Z`}
      fill="url(#patternGrad)"
      opacity="0.7"
    />
    <Path
      d={`M ${width * 0.85} 120 L ${width * 0.855} 110 L ${width * 0.86} 120 L ${width * 0.87} 115 L ${width * 0.87} 125 L ${width * 0.86} 120 L ${width * 0.855} 130 L ${width * 0.85} 120 L ${width * 0.84} 125 L ${width * 0.84} 115 Z`}
      fill="url(#patternGrad)"
      opacity="0.7"
    />

    {/* Geometric Islamic Patterns - Center */}
    <Circle cx={width * 0.5} cy={160} r="30" stroke="url(#patternGrad)" strokeWidth="2" fill="none" opacity="0.6" />
    <Circle cx={width * 0.5} cy={160} r="20" stroke="url(#patternGrad)" strokeWidth="1.5" fill="none" opacity="0.6" />
    <Path
      d={`M ${width * 0.5 - 25} 160 L ${width * 0.5 + 25} 160 M ${width * 0.5} ${160 - 25} L ${width * 0.5} ${160 + 25}`}
      stroke="url(#patternGrad)"
      strokeWidth="2"
      opacity="0.6"
    />
    <Path
      d={`M ${width * 0.5 - 18} ${160 - 18} L ${width * 0.5 + 18} ${160 + 18} M ${width * 0.5 - 18} ${160 + 18} L ${width * 0.5 + 18} ${160 - 18}`}
      stroke="url(#patternGrad)"
      strokeWidth="2"
      opacity="0.6"
    />

    {/* More Stars Scattered */}
    <Circle cx={width * 0.25} cy={100} r="3" fill="url(#patternGrad)" opacity="0.8" />
    <Circle cx={width * 0.3} cy={140} r="2.5" fill="url(#patternGrad)" opacity="0.7" />
    <Circle cx={width * 0.75} cy={100} r="3" fill="url(#patternGrad)" opacity="0.8" />
    <Circle cx={width * 0.7} cy={140} r="2.5" fill="url(#patternGrad)" opacity="0.7" />
    <Circle cx={width * 0.4} cy={180} r="2" fill="url(#patternGrad)" opacity="0.6" />
    <Circle cx={width * 0.6} cy={180} r="2" fill="url(#patternGrad)" opacity="0.6" />

    {/* Arabesque Corner Decorations */}
    <Path
      d={`M ${width * 0.05} 260 Q ${width * 0.03} 250 ${width * 0.05} 240 Q ${width * 0.07} 250 ${width * 0.05} 260`}
      stroke="url(#patternGrad)"
      strokeWidth="2"
      fill="rgba(255,255,255,0.03)"
    />
    <Path
      d={`M ${width * 0.95} 260 Q ${width * 0.97} 250 ${width * 0.95} 240 Q ${width * 0.93} 250 ${width * 0.95} 260`}
      stroke="url(#patternGrad)"
      strokeWidth="2"
      fill="rgba(255,255,255,0.03)"
    />
  </Svg>
);

// Circular Progress Component
type CircularProgressProps = {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
};

const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 60,
  strokeWidth = 4,
  color = '#10b981',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withSpring(progress, {
      damping: 15,
      stiffness: 100,
    });
  }, [progress]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset =
      circumference - animatedProgress.value * circumference;
    return { strokeDashoffset };
  });

  return (
    <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="rgba(255, 255, 255, 0.1)"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <AnimatedCircle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        animatedProps={animatedProps}
        strokeLinecap="round"
      />
    </Svg>
  );
};

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const userName = "Huzaifa Haris";
  
  const tabBarHeight = useBottomTabBarHeight();
  
  const scrollY = useSharedValue(0);
  const holoAnim = useSharedValue(0);

  useEffect(() => {
    holoAnim.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const greetingStyle = useAnimatedStyle(() => {
    'worklet';
    const translateY = interpolate(scrollY.value, [0, 60], [0, -30], Extrapolate.CLAMP);
    const opacity = interpolate(scrollY.value, [0, 60], [1, 0], Extrapolate.CLAMP);
    return { transform: [{ translateY }], opacity };
  });

  const verseStyle = useAnimatedStyle(() => {
    'worklet';
    const translateY = interpolate(scrollY.value, [0, 80], [0, -40], Extrapolate.CLAMP);
    const opacity = interpolate(scrollY.value, [0, 80], [1, 0], Extrapolate.CLAMP);
    return { transform: [{ translateY }], opacity };
  });

  const statsStyle = useAnimatedStyle(() => {
    'worklet';
    const translateY = interpolate(scrollY.value, [0, 100], [0, -50], Extrapolate.CLAMP);
    const opacity = interpolate(scrollY.value, [0, 100], [1, 0], Extrapolate.CLAMP);
    return { transform: [{ translateY }], opacity };
  });

  const nameStyle = useAnimatedStyle(() => {
    'worklet';
    const translateY = interpolate(scrollY.value, [0, 150], [0, -25], Extrapolate.CLAMP);
    const scale = interpolate(scrollY.value, [0, 150], [1, 0.7], Extrapolate.CLAMP);
    const opacity = interpolate(scrollY.value, [0, 150], [1, 0.85], Extrapolate.CLAMP);
    return { transform: [{ translateY }, { scale }], opacity };
  });

  const headerStyle = useAnimatedStyle(() => {
    'worklet';
    const height = interpolate(scrollY.value, [0, 150], [380, 140], Extrapolate.CLAMP);
    return { height };
  });

  const gradientOpacity = useAnimatedStyle(() => {
    'worklet';
    const opacity = interpolate(scrollY.value, [0, 80], [1, 0], Extrapolate.CLAMP);
    return { opacity };
  });

  const blurOpacity = useAnimatedStyle(() => {
    'worklet';
    const opacity = interpolate(scrollY.value, [0, 80], [0, 1], Extrapolate.CLAMP);
    return { opacity };
  });

  const holoStyle = useAnimatedStyle(() => {
    'worklet';
    const translateX = interpolate(holoAnim.value, [0, 1], [-200, 200], Extrapolate.CLAMP);
    return { transform: [{ translateX }, { rotate: '45deg' }] };
  });

  const prayerProgress = 2 / 5;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>

      <StatusBar barStyle="light-content" />
      
      {/* FUTURISTIC HEADER WITH PATTERNS */}
      <Animated.View style={[styles.headerContainer, headerStyle]}>
        {/* Gradient Background */}
        <Animated.View style={[styles.gradientContainer, gradientOpacity]}>
          <LinearGradient
            colors={[colors.primary, `${colors.primary}CC`, `${colors.primary}88`]}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          {/* Islamic Pattern Overlay */}
          <View style={styles.patternOverlay}>
            <IslamicPattern />
          </View>
        </Animated.View>

        {/* Floating Particles */}
        <View style={styles.particlesContainer}>
          <FloatingParticle x={30} delay={0} />
          <FloatingParticle x={width * 0.3} delay={1000} />
          <FloatingParticle x={width * 0.6} delay={2000} />
          <FloatingParticle x={width * 0.8} delay={1500} />
          <FloatingParticle x={width * 0.5} delay={3000} />
        </View>

        {/* Glassmorphic Blur */}
        <Animated.View style={[styles.blurContainer, blurOpacity]}>
          <BlurView intensity={80} tint="dark" style={styles.blurView}>
            <View style={[styles.glassOverlay, { backgroundColor: `${colors.primary}20` }]} />
          </BlurView>
        </Animated.View>

        {/* Content Layer */}
        <View style={styles.headerContent}>
          <Animated.View style={[styles.greetingContainer, greetingStyle]}>
            <Text style={styles.greeting}>السلام عليكم</Text>
          </Animated.View>

          <Animated.View style={[styles.nameContainer, nameStyle]}>
            <Text style={styles.heroTitle}>{userName}</Text>
          </Animated.View>
          
          <Animated.View style={[styles.verseContainer, verseStyle]}>
            <Text style={styles.arabicVerse}>إِنَّ مَعَ الْعُسْرِ يُسْرًا</Text>
            <Text style={styles.urduTranslation}>بیشک تنگی کے ساتھ آسانی ہے</Text>
          </Animated.View>

          {/* Neon Stats */}
          <Animated.View style={[styles.floatingStats, statsStyle]}>
            <View style={styles.neonStatContainer}>
              <LinearGradient
                colors={['#f59e0b', '#ea580c']}
                style={styles.statBubbleGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}>
                <View style={[styles.statGlow, { backgroundColor: '#f59e0b' }]} />
                <Flame size={22} color="#ffffff" fill="#ffffff" />
                <Text style={styles.statBubbleNumber}>7</Text>
                <Text style={styles.statBubbleLabel}>Days</Text>
              </LinearGradient>
            </View>

            <View style={styles.neonStatContainer}>
              <LinearGradient
                colors={['#10b981', '#059669']}
                style={styles.statBubbleGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}>
                <View style={[styles.statGlow, { backgroundColor: '#10b981' }]} />
                <BookOpen size={22} color="#ffffff" fill="#ffffff" />
                <Text style={styles.statBubbleNumber}>12</Text>
                <Text style={styles.statBubbleLabel}>Juz</Text>
              </LinearGradient>
            </View>
          </Animated.View>
        </View>
      </Animated.View>

      {/* SCROLLABLE CONTENT */}
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: tabBarHeight + 20 }
        ]}>
        
        <View style={styles.contentSection}>
          {/* HOLOGRAPHIC GIFT AYAH */}
          <TouchableOpacity
            style={styles.giftAyahButton}
            onPress={() => router.push('/swipecards')}
            activeOpacity={0.9}>
            <LinearGradient
              colors={['#10b981', '#059669', '#047857']}
              style={styles.giftAyahGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}>
              
              {/* Holographic Shimmer */}
              <Animated.View style={[styles.holoShimmer, holoStyle]}>
                <LinearGradient
                  colors={['transparent', 'rgba(255,255,255,0.3)', 'transparent']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.shimmerGradient}
                />
              </Animated.View>

              {/* Neon Border */}
              <View style={styles.neonBorder} />

              <View style={styles.sparklesContainer}>
                <View style={styles.sparkle1}>
                  <Sparkles size={16} color="#ffffff" opacity={0.4} />
                </View>
                <View style={styles.sparkle2}>
                  <Sparkles size={12} color="#ffffff" opacity={0.3} />
                </View>
                <View style={styles.sparkle3}>
                  <Sparkles size={14} color="#ffffff" opacity={0.35} />
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
                  <Zap size={22} color="#ffffff" fill="#ffffff" />
                </View>
              </View>

              <View style={styles.premiumBadge}>
                <Sparkles size={10} color="#fbbf24" fill="#fbbf24" />
                <Text style={styles.premiumBadgeText}>NEW</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Next Prayer Card - Enhanced */}
          <View style={[styles.nextPrayerCard, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.cardGlow} />
            <View style={styles.nextPrayerHeader}>
              <View style={[styles.iconCircle, { backgroundColor: `${colors.primary}20` }]}>
                <View style={[styles.iconGlowSmall, { backgroundColor: colors.primary }]} />
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

          {/* Quick Access - Futuristic */}
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Quick Access</Text>
          <View style={styles.quickGrid}>
            <TouchableOpacity 
              style={[styles.quickCard, { backgroundColor: colors.cardBackground }]}
              onPress={() => router.push('/qibla')}
              activeOpacity={0.7}>
              <View style={styles.quickCardGlow} />
              <View style={[styles.quickIconContainer, { backgroundColor: `${colors.primary}15` }]}>
                <View style={[styles.iconGlowLarge, { backgroundColor: colors.primary }]} />
                <Compass size={32} color={colors.primary} />
              </View>
              <Text style={[styles.quickLabel, { color: colors.textPrimary }]}>Qibla</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.quickCard, { backgroundColor: colors.cardBackground }]}
              onPress={() => router.push('/dhikr')}
              activeOpacity={0.7}>
              <View style={styles.quickCardGlow} />
              <View style={[styles.quickIconContainer, { backgroundColor: `${colors.primary}15` }]}>
                <View style={[styles.iconGlowLarge, { backgroundColor: colors.primary }]} />
                <CircleDot size={32} color={colors.primary} />
              </View>
              <Text style={[styles.quickLabel, { color: colors.textPrimary }]}>Dhikr</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.quickCard, { backgroundColor: colors.cardBackground }]}
              onPress={() => router.push('/dua')}
              activeOpacity={0.7}>
              <View style={styles.quickCardGlow} />
              <View style={[styles.quickIconContainer, { backgroundColor: `${colors.primary}15` }]}>
                <View style={[styles.iconGlowLarge, { backgroundColor: colors.primary }]} />
                <BookHeart size={32} color={colors.primary} />
              </View>
              <Text style={[styles.quickLabel, { color: colors.textPrimary }]}>Du'a</Text>
            </TouchableOpacity>
          </View>

          {/* Today's Prayers with Progress */}
          <View style={styles.prayerHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginBottom: 0 }]}>Today's Prayers</Text>
            <View style={styles.progressCircleContainer}>
              <CircularProgress progress={prayerProgress} size={50} color={colors.primary} />
              <View style={styles.progressTextContainer}>
                <Text style={[styles.progressText, { color: colors.textPrimary }]}>2/5</Text>
              </View>
            </View>
          </View>

          <View style={[styles.prayersList, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.prayersGlow} />
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
                      <View style={[styles.checkGlow, { backgroundColor: colors.primary }]} />
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

          {/* Islamic Date - Enhanced */}
          <View style={[styles.dateCard, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.dateCardGlow} />
            <View style={styles.moonContainer}>
              <View style={[styles.moonGlow, { backgroundColor: colors.primary }]} />
              <Moon size={28} color={colors.primary} />
            </View>
            <View style={styles.dateInfo}>
              <Text style={[styles.islamicDate, { color: colors.primary }]}>15 Ramadan 1446</Text>
              <Text style={[styles.gregorianDate, { color: colors.textSecondary }]}>October 8, 2025</Text>
            </View>
          </View>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
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
  patternOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  patternSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ffffff',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  blurContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
  },
  blurView: {
    flex: 1,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  glassOverlay: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.18)',
  },
  headerContent: {
    paddingTop: Platform.OS === 'android' ? 40 : 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
    flex: 1,
    zIndex: 3,
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
  neonStatContainer: { position: 'relative' },
  statBubbleGradient: { 
    paddingHorizontal: 24, 
    paddingVertical: 14, 
    borderRadius: 24, 
    alignItems: 'center', 
    flexDirection: 'row', 
    gap: 10, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 6 }, 
    shadowOpacity: 0.35, 
    shadowRadius: 10, 
    elevation: 8,
    position: 'relative',
  },
  statGlow: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: 27,
    opacity: 0.3,
  },
  statBubbleNumber: { fontSize: 22, fontWeight: 'bold', color: '#ffffff', zIndex: 1 },
  statBubbleLabel: { fontSize: 13, color: '#ffffff', fontWeight: '600', zIndex: 1 },
  scrollContent: { paddingTop: 380 },
  contentSection: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  
  // HOLOGRAPHIC GIFT AYAH
  giftAyahButton: { 
    marginBottom: 24, 
    borderRadius: 28, 
    overflow: 'hidden', 
    shadowColor: '#10b981', 
    shadowOffset: { width: 0, height: 12 }, 
    shadowOpacity: 0.5, 
    shadowRadius: 20, 
    elevation: 12,
  },
  giftAyahGradient: { padding: 24, position: 'relative', overflow: 'hidden' },
  holoShimmer: {
    position: 'absolute',
    top: -50,
    left: -100,
    width: 200,
    height: 300,
    zIndex: 1,
  },
  shimmerGradient: { flex: 1 },
  neonBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
  sparklesContainer: { position: 'absolute', width: '100%', height: '100%', zIndex: 2 },
  sparkle1: { position: 'absolute', top: 15, right: 40 },
  sparkle2: { position: 'absolute', bottom: 20, left: 30 },
  sparkle3: { position: 'absolute', top: 40, left: 60 },
  giftAyahContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: 3 },
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
  giftAyahArrow: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: 'rgba(255, 255, 255, 0.25)', 
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  premiumBadge: { position: 'absolute', top: 12, right: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(251, 191, 36, 0.3)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 4, zIndex: 4 },
  premiumBadgeText: { fontSize: 11, fontWeight: 'bold', color: '#fbbf24', letterSpacing: 0.5 },

  // ENHANCED CARDS
  nextPrayerCard: { 
    padding: 24, 
    borderRadius: 24, 
    marginBottom: 24, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 6 }, 
    shadowOpacity: 0.12, 
    shadowRadius: 14, 
    elevation: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  cardGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderRadius: 26,
  },
  nextPrayerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, zIndex: 1 },
  iconCircle: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginRight: 14, position: 'relative' },
  iconGlowSmall: {
    position: 'absolute',
    width: 58,
    height: 58,
    borderRadius: 29,
    opacity: 0.15,
  },
  nextPrayerInfo: { flex: 1 },
  nextPrayerLabel: { fontSize: 14, fontWeight: '500', marginBottom: 4 },
  nextPrayerName: { fontSize: 22, fontWeight: 'bold' },
  nextPrayerTime: { fontSize: 42, fontWeight: 'bold', marginBottom: 6, zIndex: 1 },
  nextPrayerCountdown: { fontSize: 16, zIndex: 1 },
  
  sectionTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  
  // FUTURISTIC QUICK ACCESS
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 32 },
  quickCard: { 
    flex: 1, 
    aspectRatio: 1, 
    borderRadius: 20, 
    alignItems: 'center', 
    justifyContent: 'center', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 10, 
    elevation: 5,
    position: 'relative',
    overflow: 'hidden',
  },
  quickCardGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderRadius: 22,
  },
  quickIconContainer: { 
    width: 64, 
    height: 64, 
    borderRadius: 32, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 8,
    position: 'relative',
    zIndex: 1,
  },
  iconGlowLarge: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    opacity: 0.2,
  },
  quickLabel: { fontSize: 13, fontWeight: '600', zIndex: 1 },
  
  // PRAYERS WITH PROGRESS
  prayerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressCircleContainer: {
    position: 'relative',
    width: 50,
    height: 50,
  },
  progressTextContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  prayersList: { 
    borderRadius: 20, 
    padding: 4, 
    marginBottom: 24, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 10, 
    elevation: 5,
    position: 'relative',
    overflow: 'hidden',
  },
  prayersGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    backgroundColor: 'rgba(16, 185, 129, 0.03)',
    borderRadius: 22,
  },
  prayerItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16, borderBottomWidth: 1, zIndex: 1 },
  prayerLeft: { flexDirection: 'row', alignItems: 'center' },
  checkCircle: { 
    width: 26, 
    height: 26, 
    borderRadius: 13, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 12,
    position: 'relative',
  },
  checkGlow: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    opacity: 0.25,
  },
  checkMark: { color: '#ffffff', fontSize: 14, fontWeight: 'bold', zIndex: 1 },
  emptyCircle: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, marginRight: 12 },
  prayerName: { fontSize: 16, fontWeight: '600' },
  prayerTime: { fontSize: 15, fontWeight: '500' },
  
  // ENHANCED DATE CARD
  dateCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 20, 
    borderRadius: 20, 
    gap: 16, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 10, 
    elevation: 5,
    position: 'relative',
    overflow: 'hidden',
  },
  dateCardGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderRadius: 22,
  },
  moonContainer: {
    position: 'relative',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  moonGlow: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    opacity: 0.15,
  },
  dateInfo: { flex: 1, zIndex: 1 },
  islamicDate: { fontSize: 18, fontWeight: 'bold', marginBottom: 2 },
  gregorianDate: { fontSize: 14 },
});
