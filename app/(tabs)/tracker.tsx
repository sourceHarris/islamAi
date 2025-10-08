import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Platform,
} from 'react-native';
import { Flame, TrendingUp, Calendar, CheckSquare, BarChart3, BookOpen, Plus, Sparkles, Zap, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../contexts/ThemeContext';
import { useRouter } from 'expo-router';
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
const CARD_WIDTH = width - 48;

// Floating Particle - iOS Style
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

export default function TrackerScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [activeStreakIndex, setActiveStreakIndex] = useState(0);
  
  const pulseAnim = useSharedValue(0);
  const shimmerAnim = useSharedValue(0);

  useEffect(() => {
    pulseAnim.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    shimmerAnim.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
      -1,
      true
    );
  }, []);

  const streakData = [
    {
      id: 'prayer',
      type: 'streak',
      title: 'Prayer Streak',
      icon: Flame,
      iconColor: '#f59e0b',
      current: 7,
      goal: 30,
      percentage: 23,
      subtitle: 'Keep going! 23 more days to reach 30',
    },
    {
      id: 'quran',
      type: 'streak',
      title: 'Quran Streak',
      icon: BookOpen,
      iconColor: colors.primary,
      current: 12,
      goal: 40,
      percentage: 30,
      subtitle: 'Amazing progress! 28 more days to reach 40',
    },
    {
      id: 'report',
      type: 'report',
      title: 'Weekly Insights',
      icon: Sparkles,
      iconColor: '#8b5cf6',
      date: 'Oct 1 - Oct 7, 2025',
      insights: [
        { emoji: '🌟', text: 'Fajr consistency up 15%' },
        { emoji: '📖', text: '12-day Quran streak' },
        { emoji: '🎯', text: "70% to your 30-day goal" },
      ],
    },
  ];

  const onStreakScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / (CARD_WIDTH + 20));
    setActiveStreakIndex(slideIndex);
  };

  const generateHeatmapData = () => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const intensity = Math.floor(Math.random() * 5);
      days.push({ day: i, intensity });
    }
    return days;
  };

  const heatmapData = generateHeatmapData();

  const getHeatmapColor = (intensity: number) => {
    const baseColor = colors.primary || '#34d399';
    const colorMap = [
      colors.border,
      baseColor + '40',
      baseColor + '60',
      baseColor + '80',
      baseColor,
    ];
    return colorMap[intensity];
  };

  const shimmerStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerAnim.value,
      [0, 1],
      [-CARD_WIDTH * 1.5, CARD_WIDTH * 1.5],
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

  const renderStreakCard = ({ item }: any) => {
    if (item.type === 'report') {
      return (
        <View style={[styles.streakCard, { width: CARD_WIDTH }]}>
          <BlurView intensity={80} tint="dark" style={styles.cardBlur}>
            {/* iOS-style gradient overlay */}
            <LinearGradient
              colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
              style={styles.iosGlassOverlay}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            />

            {/* Shimmer effect */}
            <Animated.View style={[styles.shimmerEffect, shimmerStyle]}>
              <LinearGradient
                colors={['transparent', 'rgba(255,255,255,0.1)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.shimmerGradient}
              />
            </Animated.View>

            {/* Content */}
            <View style={styles.cardContent}>
              <View style={styles.reportHeader}>
                {/* iOS-style icon container */}
                <View style={styles.iosIconContainer}>
                  <LinearGradient 
                    colors={[item.iconColor + '40', item.iconColor + '20']} 
                    style={styles.iconGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}>
                    <item.icon size={26} color={item.iconColor} strokeWidth={2.5} />
                  </LinearGradient>
                </View>
                
                <View style={styles.reportTitleContainer}>
                  <Text style={[styles.reportTitle, { color: colors.textPrimary }]}>{item.title}</Text>
                  <Text style={[styles.reportDate, { color: colors.textSecondary }]}>{item.date}</Text>
                </View>
              </View>

              {/* Insights with iOS cards */}
              <View style={styles.insightsList}>
                {item.insights.map((insight: any, index: number) => (
                  <BlurView key={index} intensity={60} tint="dark" style={styles.insightCard}>
                    <View style={styles.insightContent}>
                      <View style={styles.insightEmojiContainer}>
                        <Text style={styles.insightEmoji}>{insight.emoji}</Text>
                      </View>
                      <Text style={[styles.insightText, { color: colors.textSecondary }]}>
                        {insight.text}
                      </Text>
                    </View>
                  </BlurView>
                ))}
              </View>

              {/* iOS-style button */}
              <TouchableOpacity
                style={styles.iosButton}
                activeOpacity={0.7}>
                <BlurView intensity={60} tint="dark" style={styles.iosButtonBlur}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                    style={styles.iosButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}>
                    <Text style={[styles.iosButtonText, { color: item.iconColor }]}>View Full Report</Text>
                    <ChevronRight size={18} color={item.iconColor} strokeWidth={2.5} />
                  </LinearGradient>
                </BlurView>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      );
    }

    return (
      <View style={[styles.streakCard, { width: CARD_WIDTH }]}>
        <BlurView intensity={80} tint="dark" style={styles.cardBlur}>
          {/* iOS-style gradient overlay */}
          <LinearGradient
            colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
            style={styles.iosGlassOverlay}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />

          {/* Shimmer effect */}
          <Animated.View style={[styles.shimmerEffect, shimmerStyle]}>
            <LinearGradient
              colors={['transparent', 'rgba(255,255,255,0.1)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.shimmerGradient}
            />
          </Animated.View>

          {/* Content */}
          <View style={styles.cardContent}>
            <View style={styles.streakHeader}>
              {/* iOS-style pulsing icon */}
              <Animated.View style={pulseStyle}>
                <View style={styles.iosIconContainer}>
                  <LinearGradient 
                    colors={[item.iconColor + '40', item.iconColor + '20']} 
                    style={styles.iconGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}>
                    <item.icon size={26} color={item.iconColor} strokeWidth={2.5} />
                  </LinearGradient>
                </View>
              </Animated.View>

              <BlurView intensity={60} tint="dark" style={styles.trendingBadge}>
                <TrendingUp size={16} color="#10B981" strokeWidth={2.5} />
              </BlurView>
            </View>

            <Text style={[styles.streakTitle, { color: colors.textPrimary }]}>{item.title}</Text>

            <View style={styles.streakStats}>
              <View style={styles.numberContainer}>
                <Text style={[styles.currentNumber, { 
                  color: item.iconColor,
                  textShadowColor: item.iconColor + '40',
                  textShadowOffset: { width: 0, height: 4 },
                  textShadowRadius: 20,
                }]}>
                  {item.current}
                </Text>
                <Text style={[styles.goalText, { color: colors.textSecondary }]}>/ {item.goal} days</Text>
              </View>
              
              <BlurView intensity={60} tint="dark" style={styles.percentageContainer}>
                <Text style={[styles.percentageText, { color: item.iconColor }]}>{item.percentage}%</Text>
              </BlurView>
            </View>

            {/* iOS-style progress bar */}
            <View style={styles.progressContainer}>
              <View style={[styles.progressTrack, { backgroundColor: colors.border + '40' }]}>
                <LinearGradient
                  colors={[item.iconColor, item.iconColor + 'CC']}
                  style={[styles.progressFill, { width: `${item.percentage}%` }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}>
                  {/* Glow effect */}
                  <View style={[styles.progressGlow, { backgroundColor: item.iconColor }]} />
                </LinearGradient>
              </View>
            </View>

            <Text style={[styles.streakSubtitle, { color: colors.textSecondary }]}>{item.subtitle}</Text>
          </View>
        </BlurView>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* iOS 16+ Dynamic Island Style Header */}
      <View style={styles.headerContainer}>
        <BlurView intensity={100} tint="dark" style={styles.headerBlur}>
          <LinearGradient
            colors={[colors.primary + 'DD', colors.primary + '99']}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}>
            
            {/* Floating particles */}
            <View style={styles.headerParticles}>
              <FloatingParticle x={40} />
              <FloatingParticle x={width * 0.4} delay={500} />
              <FloatingParticle x={width * 0.7} delay={1000} />
            </View>

            <View style={styles.headerContent}>
              <View style={styles.headerText}>
                <View style={styles.headerTitleRow}>
                  <Sparkles size={24} color="#ffffff" fill="#ffffff" opacity={0.9} />
                  <Text style={styles.headerTitle}>Spiritual Tracker</Text>
                </View>
                <Text style={styles.headerSubtitle}>Your Journey to Excellence</Text>
              </View>

              {/* iOS-style add button */}
              <TouchableOpacity
                onPress={() => router.push('/checklist')}
                activeOpacity={0.7}>
                <BlurView intensity={80} tint="light" style={styles.addButton}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                    style={styles.addButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}>
                    <Plus size={24} color="#FFFFFF" strokeWidth={3} />
                  </LinearGradient>
                </BlurView>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </BlurView>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        {/* Streak Cards */}
        <View style={styles.streakSection}>
          <Text style={[styles.sectionTitle, { paddingHorizontal: 24, color: colors.textPrimary }]}>Overview</Text>

          <FlatList
            data={streakData}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onStreakScroll}
            scrollEventThrottle={16}
            snapToInterval={CARD_WIDTH + 20}
            decelerationRate="fast"
            contentContainerStyle={styles.streakList}
            renderItem={renderStreakCard}
            keyExtractor={(item) => item.id}
          />

          {/* iOS-style pagination */}
          <View style={styles.pagination}>
            {streakData.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === activeStreakIndex && styles.paginationDotActive,
                  { backgroundColor: index === activeStreakIndex ? colors.primary : 'rgba(255,255,255,0.3)' }
                ]}
              />
            ))}
          </View>
        </View>

        {/* Stats Grid - iOS Cards */}
        <View style={styles.statsSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>This Week</Text>
          
          <View style={styles.statsGrid}>
            {[
              { icon: CheckSquare, value: '34/35', label: 'Prayers', color: colors.primary },
              { icon: TrendingUp, value: '85%', label: 'Consistency', color: '#10b981' },
              { icon: Calendar, value: '6/7', label: 'Days Active', color: '#f59e0b' },
            ].map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <BlurView intensity={80} tint="dark" style={styles.statBlur}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
                    style={styles.statGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}>
                    <View style={styles.statContent}>
                      <LinearGradient 
                        colors={[stat.color + '40', stat.color + '20']} 
                        style={styles.statIconBg}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}>
                        <stat.icon size={20} color={stat.color} strokeWidth={2.5} />
                      </LinearGradient>
                      <Text style={[styles.statValue, { color: colors.textPrimary }]}>{stat.value}</Text>
                      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
                    </View>
                  </LinearGradient>
                </BlurView>
              </View>
            ))}
          </View>
        </View>

        {/* Prayer Analytics - iOS Style */}
        <View style={styles.analyticsSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Prayer Consistency</Text>
          
          <BlurView intensity={80} tint="dark" style={styles.analyticsCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
              style={styles.analyticsGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}>
              <View style={styles.analyticsContent}>
                {[
                  { name: 'Fajr', completion: 85, color: '#8b5cf6' },
                  { name: 'Dhuhr', completion: 100, color: '#10b981' },
                  { name: 'Asr', completion: 92, color: '#3b82f6' },
                  { name: 'Maghrib', completion: 100, color: '#f59e0b' },
                  { name: 'Isha', completion: 88, color: '#ef4444' },
                ].map((prayer, index) => (
                  <View key={index} style={styles.prayerRow}>
                    <View style={styles.prayerLeft}>
                      <LinearGradient 
                        colors={[prayer.color, prayer.color + 'CC']} 
                        style={styles.prayerDot}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}>
                        <View style={[styles.prayerDotGlow, { backgroundColor: prayer.color }]} />
                      </LinearGradient>
                      <Text style={[styles.prayerName, { color: colors.textPrimary }]}>{prayer.name}</Text>
                    </View>
                    <View style={styles.prayerRight}>
                      <View style={[styles.prayerBarTrack, { backgroundColor: colors.border + '40' }]}>
                        <LinearGradient
                          colors={[prayer.color, prayer.color + 'CC']}
                          style={[styles.prayerBarFill, { width: `${prayer.completion}%` }]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}>
                          <View style={[styles.barGlow, { backgroundColor: prayer.color }]} />
                        </LinearGradient>
                      </View>
                      <Text style={[styles.prayerPercent, { color: colors.textSecondary }]}>{prayer.completion}%</Text>
                    </View>
                  </View>
                ))}
              </View>
            </LinearGradient>
          </BlurView>
        </View>

        {/* Heatmap - iOS Style */}
        <View style={[styles.heatmapSection, { marginBottom: 40 }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>30-Day Activity</Text>
          
          <BlurView intensity={80} tint="dark" style={styles.heatmapCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
              style={styles.heatmapGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}>
              <View style={styles.heatmapContent}>
                <View style={styles.heatmapHeader}>
                  <View style={styles.heatmapTitleRow}>
                    <Zap size={20} color={colors.primary} fill={colors.primary} />
                    <Text style={[styles.heatmapTitle, { color: colors.textPrimary }]}>Your Spiritual Journey</Text>
                  </View>
                  <Text style={[styles.heatmapSubtitle, { color: colors.textSecondary }]}>Last 30 days</Text>
                </View>

                <View style={styles.heatmapGrid}>
                  {heatmapData.map((item, index) => (
                    <View
                      key={index}
                      style={[styles.heatmapCell, { 
                        backgroundColor: getHeatmapColor(item.intensity),
                        shadowColor: item.intensity > 2 ? colors.primary : 'transparent',
                        shadowOpacity: item.intensity > 2 ? 0.6 : 0,
                        shadowRadius: 8,
                      }]}
                    />
                  ))}
                </View>

                <View style={styles.heatmapLegend}>
                  <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>Less</Text>
                  <View style={styles.legendDots}>
                    {[0, 1, 2, 3, 4].map((level) => (
                      <View
                        key={level}
                        style={[styles.legendDot, { 
                          backgroundColor: getHeatmapColor(level),
                          shadowColor: level > 2 ? colors.primary : 'transparent',
                          shadowOpacity: level > 2 ? 0.5 : 0,
                          shadowRadius: 6,
                        }]}
                      />
                    ))}
                  </View>
                  <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>More</Text>
                </View>
              </View>
            </LinearGradient>
          </BlurView>
        </View>
      </ScrollView>
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
    paddingBottom: 20,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  headerText: {
    flex: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  addButton: {
    borderRadius: 26,
    overflow: 'hidden',
  },
  addButtonGradient: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 24,
  },
  streakSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  streakList: {
    paddingHorizontal: 24,
  },
  streakCard: {
    marginRight: 20,
    height: 340,
  },
  cardBlur: {
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  iosGlassOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  shimmerEffect: {
    position: 'absolute',
    top: -100,
    left: -CARD_WIDTH,
    width: CARD_WIDTH * 3,
    height: 500,
  },
  shimmerGradient: {
    flex: 1,
  },
  cardContent: {
    flex: 1,
    padding: 24,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  iosIconContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  iconGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendingBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  streakTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  streakStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  numberContainer: {
    flex: 1,
  },
  currentNumber: {
    fontSize: 56,
    fontWeight: '800',
    letterSpacing: -2,
  },
  goalText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  percentageContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  percentageText: {
    fontSize: 18,
    fontWeight: '700',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressTrack: {
    height: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 10,
    position: 'relative',
  },
  progressGlow: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: 13,
    opacity: 0.3,
  },
  streakSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  reportTitleContainer: {
    flex: 1,
    marginLeft: 16,
  },
  reportTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  reportDate: {
    fontSize: 13,
    fontWeight: '500',
  },
  insightsList: {
    marginBottom: 20,
    gap: 12,
  },
  insightCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  insightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  insightEmojiContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  insightEmoji: {
    fontSize: 18,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  iosButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  iosButtonBlur: {
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  iosButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  iosButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  paginationDot: {
    height: 6,
    width: 6,
    borderRadius: 3,
  },
  paginationDotActive: {
    width: 24,
  },
  statsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
  },
  statBlur: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statGradient: {
    borderRadius: 20,
  },
  statContent: {
    padding: 16,
    alignItems: 'center',
  },
  statIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  analyticsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  analyticsCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginTop: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  analyticsGradient: {
    borderRadius: 24,
  },
  analyticsContent: {
    padding: 20,
  },
  prayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  prayerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 85,
  },
  prayerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
    position: 'relative',
  },
  prayerDotGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 9,
    opacity: 0.3,
  },
  prayerName: {
    fontSize: 15,
    fontWeight: '600',
  },
  prayerRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  prayerBarTrack: {
    flex: 1,
    height: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  prayerBarFill: {
    height: '100%',
    borderRadius: 8,
    position: 'relative',
  },
  barGlow: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: 11,
    opacity: 0.3,
  },
  prayerPercent: {
    fontSize: 13,
    fontWeight: '700',
    width: 38,
    textAlign: 'right',
  },
  heatmapSection: {
    paddingHorizontal: 24,
  },
  heatmapCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginTop: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  heatmapGradient: {
    borderRadius: 24,
  },
  heatmapContent: {
    padding: 20,
  },
  heatmapHeader: {
    marginBottom: 20,
  },
  heatmapTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  heatmapTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  heatmapSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  heatmapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginBottom: 20,
  },
  heatmapCell: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  heatmapLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  legendLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  legendDots: {
    flexDirection: 'row',
    gap: 5,
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 3,
  },
});