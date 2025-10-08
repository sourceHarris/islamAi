import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from 'react-native';
import { Flame, TrendingUp, Calendar, CheckSquare, BarChart3, BookOpen, Plus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 60;

export default function TrackerScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [activeStreakIndex, setActiveStreakIndex] = useState(0);

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
      title: 'Weekly Report',
      icon: BarChart3,
      iconColor: '#8b5cf6',
      date: 'Oct 1 - Oct 7, 2025',
      insights: [
        { emoji: '🌟', text: 'Your Fajr consistency improved by 15%' },
        { emoji: '📖', text: 'Maintained 12-day Quran streak' },
        { emoji: '🎯', text: "You're 70% to your 30-day goal" },
      ],
    },
  ];

  const onStreakScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / (CARD_WIDTH + 16));
    setActiveStreakIndex(slideIndex);
  };

  // Generate calendar heatmap data (30 days)
  const generateHeatmapData = () => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const intensity = Math.floor(Math.random() * 5); // 0-4 intensity levels
      days.push({ day: i, intensity });
    }
    return days;
  };

  const heatmapData = generateHeatmapData();

  const getHeatmapColor = (intensity: number) => {
    const colorMap = ['#1e293b', '#10b981', '#059669', '#047857', '#065f46'];
    return colorMap[intensity];
  };

  const renderStreakCard = ({ item }: any) => {
    if (item.type === 'report') {
      return (
        <View style={[styles.streakCard, { backgroundColor: colors.cardBackground, width: CARD_WIDTH }]}>
          <View style={styles.streakHeader}>
            <View style={[styles.streakIconContainer, { backgroundColor: item.iconColor + '20' }]}>
              <item.icon size={32} color={item.iconColor} />
            </View>
          </View>
          
          <Text style={[styles.streakTitle, { color: colors.textPrimary }]}>{item.title}</Text>
          <Text style={[styles.reportDate, { color: colors.textSecondary }]}>{item.date}</Text>
          
          <View style={styles.reportInsightsList}>
            {item.insights.map((insight: any, index: number) => (
              <View key={index} style={styles.reportInsightItem}>
                <Text style={styles.reportInsightEmoji}>{insight.emoji}</Text>
                <Text style={[styles.reportInsightText, { color: colors.textSecondary }]}>
                  {insight.text}
                </Text>
              </View>
            ))}
          </View>

          <TouchableOpacity 
            style={[styles.viewDetailButton, { backgroundColor: item.iconColor + '20' }]}
            onPress={() => {/* Navigate to detailed report */}}>
            <Text style={[styles.viewDetailText, { color: item.iconColor }]}>
              View Full Report
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={[styles.streakCard, { backgroundColor: colors.cardBackground, width: CARD_WIDTH }]}>
        <View style={styles.streakHeader}>
          <View style={[styles.streakIconContainer, { backgroundColor: item.iconColor + '20' }]}>
            <item.icon size={32} color={item.iconColor} />
          </View>
          <TrendingUp size={20} color={colors.textSecondary} />
        </View>
        
        <Text style={[styles.streakTitle, { color: colors.textPrimary }]}>{item.title}</Text>
        
        <View style={styles.streakNumbers}>
          <Text style={[styles.currentNumber, { color: item.iconColor }]}>{item.current}</Text>
          <Text style={[styles.numberSeparator, { color: colors.textSecondary }]}>/</Text>
          <Text style={[styles.goalNumber, { color: colors.textSecondary }]}>{item.goal}</Text>
          <Text style={[styles.daysLabel, { color: colors.textSecondary }]}>days</Text>
        </View>

        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <LinearGradient
            colors={[item.iconColor, item.iconColor + 'AA']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${item.percentage}%` }]}
          />
        </View>

        <Text style={[styles.streakSubtitle, { color: colors.textSecondary }]}>
          {item.subtitle}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Fixed Header with Vibrant Plus Button */}
      <LinearGradient
        colors={[colors.primary, colors.primary + 'DD']}
        style={styles.fixedHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}>
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Spiritual Tracker</Text>
            <Text style={styles.headerSubtitle}>Track Your Journey to Allah</Text>
          </View>
          
          {/* Vibrant Plus Button */}
          <TouchableOpacity 
            style={styles.plusButtonContainer}
            onPress={() => router.push('/checklist')}
            activeOpacity={0.8}>
            <LinearGradient
              colors={['#f97316', '#ea580c']}
              style={styles.plusButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}>
              <Plus size={28} color="#ffffff" strokeWidth={3} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Swipeable Cards - Streaks + Weekly Report */}
        <View style={styles.streaksSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Overview</Text>
          
          <FlatList
            data={streakData}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onStreakScroll}
            scrollEventThrottle={16}
            snapToInterval={CARD_WIDTH + 16}
            decelerationRate="fast"
            contentContainerStyle={styles.streakCardsList}
            renderItem={renderStreakCard}
            keyExtractor={(item) => item.id}
          />

          {/* Pagination Dots */}
          <View style={styles.pagination}>
            {streakData.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  {
                    backgroundColor: index === activeStreakIndex ? colors.primary : colors.border,
                    width: index === activeStreakIndex ? 24 : 8,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* This Week Stats */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>This Week's Overview</Text>
          
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
              <View style={[styles.statIconBg, { backgroundColor: colors.primary + '20' }]}>
                <CheckSquare size={24} color={colors.primary} />
              </View>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>34/35</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Prayers</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
              <View style={[styles.statIconBg, { backgroundColor: '#10b981' + '20' }]}>
                <TrendingUp size={24} color="#10b981" />
              </View>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>85%</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Consistency</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
              <View style={[styles.statIconBg, { backgroundColor: '#f59e0b' + '20' }]}>
                <Calendar size={24} color="#f59e0b" />
              </View>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>6/7</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Days Active</Text>
            </View>
          </View>
        </View>

        {/* Prayer Times Analytics */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Prayer Consistency</Text>
          
          <View style={[styles.prayerAnalyticsCard, { backgroundColor: colors.cardBackground }]}>
            {[
              { name: 'Fajr', completion: 85, color: '#8b5cf6' },
              { name: 'Dhuhr', completion: 100, color: '#10b981' },
              { name: 'Asr', completion: 92, color: '#3b82f6' },
              { name: 'Maghrib', completion: 100, color: '#f59e0b' },
              { name: 'Isha', completion: 88, color: '#ef4444' },
            ].map((prayer, index) => (
              <View key={index} style={styles.prayerAnalyticsRow}>
                <View style={styles.prayerAnalyticsLeft}>
                  <View style={[styles.prayerDot, { backgroundColor: prayer.color }]} />
                  <Text style={[styles.prayerAnalyticsName, { color: colors.textPrimary }]}>
                    {prayer.name}
                  </Text>
                </View>
                <View style={styles.prayerAnalyticsRight}>
                  <View style={[styles.prayerAnalyticsBar, { backgroundColor: colors.border }]}>
                    <View 
                      style={[
                        styles.prayerAnalyticsFill, 
                        { width: `${prayer.completion}%`, backgroundColor: prayer.color }
                      ]} 
                    />
                  </View>
                  <Text style={[styles.prayerAnalyticsPercent, { color: colors.textSecondary }]}>
                    {prayer.completion}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Activity Heatmap Calendar */}
        <View style={[styles.section, { marginBottom: 40 }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>30-Day Activity</Text>
          
          <View style={[styles.heatmapCard, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.heatmapHeader}>
              <Text style={[styles.heatmapTitle, { color: colors.textPrimary }]}>
                Your Spiritual Journey
              </Text>
              <Text style={[styles.heatmapSubtitle, { color: colors.textSecondary }]}>
                Last 30 days activity heatmap
              </Text>
            </View>

            <View style={styles.heatmapGrid}>
              {heatmapData.map((item, index) => (
                <View
                  key={index}
                  style={[
                    styles.heatmapCell,
                    { backgroundColor: getHeatmapColor(item.intensity) }
                  ]}
                />
              ))}
            </View>

            <View style={styles.heatmapLegend}>
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>Less</Text>
              <View style={styles.legendDots}>
                {[0, 1, 2, 3, 4].map((level) => (
                  <View
                    key={level}
                    style={[styles.legendDot, { backgroundColor: getHeatmapColor(level) }]}
                  />
                ))}
              </View>
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>More</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fixedHeader: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
  },
  plusButtonContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  plusButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flex: 1,
  },
  streaksSection: {
    paddingTop: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  streakCardsList: {
    paddingHorizontal: 20,
  },
  streakCard: {
    padding: 24,
    borderRadius: 24,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  streakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  streakIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  streakNumbers: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  currentNumber: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  numberSeparator: {
    fontSize: 32,
    fontWeight: 'bold',
    marginHorizontal: 4,
  },
  goalNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    marginRight: 8,
  },
  daysLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  progressBar: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  streakSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  reportDate: {
    fontSize: 14,
    marginBottom: 20,
  },
  reportInsightsList: {
    gap: 16,
    marginBottom: 20,
  },
  reportInsightItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportInsightEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  reportInsightText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  viewDetailButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  viewDetailText: {
    fontSize: 15,
    fontWeight: '600',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  prayerAnalyticsCard: {
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  prayerAnalyticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  prayerAnalyticsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
  },
  prayerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  prayerAnalyticsName: {
    fontSize: 15,
    fontWeight: '600',
  },
  prayerAnalyticsRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  prayerAnalyticsBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  prayerAnalyticsFill: {
    height: '100%',
    borderRadius: 4,
  },
  prayerAnalyticsPercent: {
    fontSize: 14,
    fontWeight: '600',
    width: 40,
    textAlign: 'right',
  },
  heatmapCard: {
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  heatmapHeader: {
    marginBottom: 20,
  },
  heatmapTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  heatmapSubtitle: {
    fontSize: 14,
  },
  heatmapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 16,
  },
  heatmapCell: {
    width: 18,
    height: 18,
    borderRadius: 4,
  },
  heatmapLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  legendText: {
    fontSize: 12,
  },
  legendDots: {
    flexDirection: 'row',
    gap: 4,
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 3,
  },
});