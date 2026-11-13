import { AppText as Text } from '../components/Typography';
import { AppBackdrop } from '../components/Glass';
import { useReducedMotion } from 'react-native-reanimated';
import ScreenHeader from '../components/ScreenHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import { CheckCircle, Circle, Plus, X } from 'lucide-react-native';
import { useTheme, fonts } from '../contexts/ThemeContext';
import { useRouter, useLocalSearchParams } from 'expo-router';

import {
  loadChecklistForDate,
  getTodayDateString,
  saveTodayChecklist,
  ChecklistItem,
} from '../services/trackingService';

export default function ChecklistScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string }>();
  const requestedDate = typeof params.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(params.date) && params.date <= getTodayDateString() ? params.date : getTodayDateString();
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [reflection, setReflection] = useState('');

  const [checklistDate, setChecklistDate] = useState<string>('');
  const [prayers, setPrayers] = useState<ChecklistItem[]>([]);
  const [quranTracking, setQuranTracking] = useState({
    read: false,
    listened: false,
    minutes: 0,
  });
  const [dhikr, setDhikr] = useState<ChecklistItem[]>([]);
  const [customPractices, setCustomPractices] = useState<ChecklistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = React.useCallback(() => {
    setIsLoading(true); setError('');
    loadChecklistForDate(requestedDate).then((data) => {
      setChecklistDate(data.date);
      setPrayers(data.prayers);
      setQuranTracking(data.quranTracking);
      setDhikr(data.dhikr);
      setCustomPractices(data.customPractices);
      setReflection(data.reflection || '');
    }).catch(() => setError('Your practice could not be loaded. Existing records have been kept.')).finally(() => setIsLoading(false));
  }, [requestedDate]);
  React.useEffect(load, [load]);

  const togglePrayer = (id: string) => {
    setPrayers(
      prayers.map((p) => (p.id === id ? { ...p, completed: !p.completed } : p)),
    );
  };

  const toggleDhikr = (id: string) => {
    setDhikr(
      dhikr.map((d) => (d.id === id ? { ...d, completed: !d.completed } : d)),
    );
  };

  const toggleCustom = (id: string) => {
    setCustomPractices(
      customPractices.map((c) =>
        c.id === id ? { ...c, completed: !c.completed } : c,
      ),
    );
  };

  const addCustomPractice = () => {
    if (customTitle.trim()) {
      const newPractice: ChecklistItem = {
        id: Date.now().toString(),
        title: customTitle,
        completed: false,
        isCustom: true,
      };
      setCustomPractices([...customPractices, newPractice]);
      setCustomTitle('');
      setModalVisible(false);
    }
  };

  const removeCustomPractice = (id: string) => {
    setCustomPractices(customPractices.filter((c) => c.id !== id));
  };

  const handleSubmit = async () => {
    setIsLoading(true); setError('');
    try { await saveTodayChecklist({
      date: checklistDate,
      prayers,
      quranTracking,
      dhikr,
      customPractices,
      reflection,
    });
    router.back();
    } catch { setError('Your practice could not be saved. Please try again.'); }
    finally { setIsLoading(false); }
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            justifyContent: 'center',
            alignItems: 'center',
          },
        ]}
      >
        <Text style={{ color: colors.textPrimary }}>Loading Checklist...</Text>
      </View>
    );
  }

  const completedPrayers = prayers.filter(
    (p) => !p.isCustom && p.completed,
  ).length;
  const totalProgress = (completedPrayers / 5) * 100;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingBottom: insets.bottom },
      ]}
    >
      <AppBackdrop />
      {/* Header */}
      <ScreenHeader
        title="Daily checklist"
        subtitle={new Date(requestedDate + 'T12:00:00').toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        })}
      />

      {!!error && <View style={{ padding: 16 }}><Text accessibilityRole="alert" style={{ color: colors.danger }}>{error}</Text>{!checklistDate && <TouchableOpacity accessibilityRole="button" onPress={load} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={{ color: colors.primary }}>Retry loading practice</Text></TouchableOpacity>}</View>}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Progress Overview */}
        <View
          style={[
            styles.progressCard,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.progressTitle, { color: colors.textPrimary }]}>
            Today&apos;s Progress
          </Text>
          <View style={styles.progressInfo}>
            <Text style={[styles.progressText, { color: colors.primary }]}>
              {completedPrayers}/5 Prayers
            </Text>
            <Text
              style={[
                styles.progressPercentage,
                { color: colors.textSecondary },
              ]}
            >
              {Math.round(totalProgress)}%
            </Text>
          </View>
          <View
            style={[styles.progressBar, { backgroundColor: colors.border }]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.round(totalProgress)}%` as any,
                  backgroundColor: colors.primary,
                },
              ]}
            />
          </View>
        </View>

        {/* Prayers Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Prayers (Salah)
          </Text>
          {prayers.map((prayer) => (
            <TouchableOpacity
              key={prayer.id}
              style={[
                styles.checklistItem,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.border,
                },
              ]}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: prayer.completed }}
              aria-checked={prayer.completed}
              onPress={() => togglePrayer(prayer.id)}
            >
              {prayer.completed ? (
                <CheckCircle size={24} color={colors.primary} fill="none" />
              ) : (
                <Circle size={24} color={colors.textSecondary} />
              )}
              <Text style={[styles.itemText, { color: colors.textPrimary }]}>
                {prayer.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quran Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Quran Interaction
          </Text>
          <TouchableOpacity
            style={[
              styles.checklistItem,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
              },
            ]}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: quranTracking.read }}
            aria-checked={quranTracking.read}
            onPress={() =>
              setQuranTracking({ ...quranTracking, read: !quranTracking.read })
            }
          >
            {quranTracking.read ? (
              <CheckCircle size={24} color={colors.primary} fill="none" />
            ) : (
              <Circle size={24} color={colors.textSecondary} />
            )}
            <Text style={[styles.itemText, { color: colors.textPrimary }]}>
              Read Quran
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.checklistItem,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
              },
            ]}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: quranTracking.listened }}
            aria-checked={quranTracking.listened}
            onPress={() =>
              setQuranTracking({
                ...quranTracking,
                listened: !quranTracking.listened,
              })
            }
          >
            {quranTracking.listened ? (
              <CheckCircle size={24} color={colors.primary} fill="none" />
            ) : (
              <Circle size={24} color={colors.textSecondary} />
            )}
            <Text style={[styles.itemText, { color: colors.textPrimary }]}>
              Listened to Quran
            </Text>
          </TouchableOpacity>
        </View>

        {/* Dhikr Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Dhikr & Du&apos;a
          </Text>
          {dhikr.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.checklistItem,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.border,
                },
              ]}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: item.completed }}
              aria-checked={item.completed}
              onPress={() => toggleDhikr(item.id)}
            >
              {item.completed ? (
                <CheckCircle size={24} color={colors.primary} fill="none" />
              ) : (
                <Circle size={24} color={colors.textSecondary} />
              )}
              <Text style={[styles.itemText, { color: colors.textPrimary }]}>
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Custom Practices */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Custom Practices
            </Text>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              accessibilityRole="button"
              accessibilityLabel="Add custom practice"
              onPress={() => setModalVisible(true)}
            >
              <Plus size={20} color={colors.onPrimary} />
            </TouchableOpacity>
          </View>
          {customPractices.map((item) => (
            <View key={item.id} style={styles.customItemContainer}>
              <TouchableOpacity
                style={[
                  styles.checklistItem,
                  {
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.border,
                    flex: 1,
                  },
                ]}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: item.completed }}
                aria-checked={item.completed}
                onPress={() => toggleCustom(item.id)}
              >
                {item.completed ? (
                  <CheckCircle size={24} color={colors.primary} fill="none" />
                ) : (
                  <Circle size={24} color={colors.textSecondary} />
                )}
                <Text style={[styles.itemText, { color: colors.textPrimary }]}>
                  {item.title}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${item.title}`}
                onPress={() => removeCustomPractice(item.id)}
              >
                <X size={20} color={colors.danger} />
              </TouchableOpacity>
            </View>
          ))}
          {customPractices.length === 0 && (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Add your personal spiritual goals
            </Text>
          )}
        </View>

        {/* Reflection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Evening Reflection (Optional)
          </Text>
          <TextInput
            style={[
              styles.reflectionInput,
              {
                backgroundColor: colors.cardBackground,
                color: colors.textPrimary,
                borderColor: colors.border,
              },
            ]}
            placeholder="How was your spiritual day? Any challenges?"
            placeholderTextColor={colors.textSecondary}
            value={reflection}
            onChangeText={setReflection}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          accessibilityRole="button"
          style={[styles.submitButton, { backgroundColor: colors.primary }]}
          onPress={handleSubmit}
          disabled={!checklistDate}
        >
          <Text style={[styles.submitButtonText, { color: colors.onPrimary }]}>
            {requestedDate === getTodayDateString() ? "Save today's practice" : 'Save practice for ' + requestedDate}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add Custom Practice Modal */}
      <Modal
        visible={modalVisible}
        animationType={reduceMotion ? 'none' : 'fade'}
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.cardBackground },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Add Custom Practice
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: colors.background,
                  color: colors.textPrimary,
                  borderColor: colors.border,
                },
              ]}
              placeholder="e.g., Tahajjud, Ishraq, Extra Dhikr..."
              placeholderTextColor={colors.textSecondary}
              value={customTitle}
              onChangeText={setCustomTitle}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                accessibilityRole="button"
                style={[
                  styles.modalButton,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setModalVisible(false)}
              >
                <Text
                  style={[
                    styles.modalButtonText,
                    { color: colors.textSecondary },
                  ]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                style={[
                  styles.modalButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={addCustomPractice}
              >
                <Text
                  style={[styles.modalButtonText, { color: colors.onPrimary }]}
                >
                  Add
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    borderBottomWidth: 1,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    width: '100%',
    maxWidth: 820,
    alignSelf: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  progressCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  progressTitle: {
    fontFamily: fonts.display,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressPercentage: {
    fontSize: 18,
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
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customItemContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  deleteButton: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  reflectionInput: {
    fontFamily: fonts.body,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 17,
    minHeight: 100,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 26,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    maxWidth: 600,
    width: '100%',
    padding: 24,
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalInput: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
