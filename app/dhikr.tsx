import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { RotateCcw, Award, Target } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

interface Milestone {
  count: number;
  label: string;
  achieved: boolean;
}

export default function DhikrScreen() {
  const { colors } = useTheme();
  const [count, setCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [target, setTarget] = useState(100);

  const milestones: Milestone[] = [
    { count: 33, label: 'Subhan Allah (33x)', achieved: count >= 33 },
    { count: 100, label: 'First Century', achieved: count >= 100 },
    { count: 500, label: 'Dedicated Soul', achieved: totalCount >= 500 },
    { count: 1000, label: 'Spiritual Warrior', achieved: totalCount >= 1000 },
    { count: 5000, label: 'Master of Remembrance', achieved: totalCount >= 5000 },
  ];

  const handleCount = () => {
    setCount(count + 1);
    setTotalCount(totalCount + 1);
  };

  const handleReset = () => {
    setCount(0);
  };

  const progress = Math.min((count / target) * 100, 100);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Dhikr Counter</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Remember Allah</Text>
      </View>

      {/* Main Counter */}
      <View style={[styles.counterCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <Text style={[styles.counterLabel, { color: colors.textSecondary }]}>Current Count</Text>
        <TouchableOpacity 
          style={[styles.counterCircle, { backgroundColor: colors.primary + '20', borderColor: colors.primary }]}
          onPress={handleCount}
          activeOpacity={0.7}>
          <Text style={[styles.counterNumber, { color: colors.primary }]}>{count}</Text>
          <Text style={[styles.counterHint, { color: colors.textSecondary }]}>Tap to count</Text>
        </TouchableOpacity>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>Target: {target}</Text>
            <Text style={[styles.progressPercentage, { color: colors.primary }]}>{Math.round(progress)}%</Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: colors.primary }]} />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.resetButton, { backgroundColor: colors.background, borderColor: colors.border }]}
            onPress={handleReset}>
            <RotateCcw size={20} color={colors.textSecondary} />
            <Text style={[styles.resetButtonText, { color: colors.textSecondary }]}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Total Count Card */}
      <View style={[styles.statsCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <Target size={24} color={colors.primary} />
        <View style={styles.statsInfo}>
          <Text style={[styles.statsLabel, { color: colors.textSecondary }]}>Total Lifetime</Text>
          <Text style={[styles.statsValue, { color: colors.textPrimary }]}>{totalCount.toLocaleString()}</Text>
        </View>
      </View>

      {/* Milestones */}
      <View style={styles.milestonesSection}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Milestones</Text>
        {milestones.map((milestone, index) => (
          <View 
            key={index}
            style={[
              styles.milestoneCard,
              { 
                backgroundColor: milestone.achieved ? colors.primary + '10' : colors.cardBackground,
                borderColor: milestone.achieved ? colors.primary : colors.border 
              }
            ]}>
            <Award 
              size={24} 
              color={milestone.achieved ? colors.primary : colors.textSecondary}
              fill={milestone.achieved ? colors.primary : 'none'}
            />
            <View style={styles.milestoneInfo}>
              <Text style={[styles.milestoneLabel, { color: colors.textPrimary }]}>{milestone.label}</Text>
              <Text style={[styles.milestoneCount, { color: colors.textSecondary }]}>
                {milestone.count.toLocaleString()} count{milestone.count > 1 ? 's' : ''}
              </Text>
            </View>
            {milestone.achieved && (
              <View style={[styles.achievedBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.achievedText}>✓</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Dhikr Suggestions */}
      <View style={styles.suggestionsSection}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Common Dhikr</Text>
        {[
          { arabic: 'سُبْحَانَ اللهِ', transliteration: 'Subhan Allah', count: 33 },
          { arabic: 'الْحَمْدُ لِلَّهِ', transliteration: 'Alhamdulillah', count: 33 },
          { arabic: 'اللهُ أَكْبَرُ', transliteration: 'Allahu Akbar', count: 34 },
          { arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ', transliteration: 'La ilaha illallah', count: 100 },
          { arabic: 'أَسْتَغْفِرُ اللهَ', transliteration: 'Astaghfirullah', count: 100 },
        ].map((dhikr, index) => (
          <TouchableOpacity 
            key={index}
            style={[styles.dhikrCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
            onPress={() => setTarget(dhikr.count)}>
            <View style={styles.dhikrContent}>
              <Text style={[styles.dhikrArabic, { color: colors.primary }]}>{dhikr.arabic}</Text>
              <Text style={[styles.dhikrTransliteration, { color: colors.textPrimary }]}>{dhikr.transliteration}</Text>
            </View>
            <View style={[styles.dhikrBadge, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.dhikrBadgeText, { color: colors.primary }]}>{dhikr.count}x</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  counterCard: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  counterLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 20,
  },
  counterCircle: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  counterNumber: {
    fontSize: 72,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  counterHint: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressSection: {
    width: '100%',
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  statsCard: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statsInfo: {
    flex: 1,
  },
  statsLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  statsValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  milestonesSection: {
    marginTop: 20,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  milestoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    gap: 12,
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  milestoneCount: {
    fontSize: 13,
  },
  achievedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievedText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  suggestionsSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  dhikrCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  dhikrContent: {
    flex: 1,
  },
  dhikrArabic: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dhikrTransliteration: {
    fontSize: 14,
    fontWeight: '500',
  },
  dhikrBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  dhikrBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});