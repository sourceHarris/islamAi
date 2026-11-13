import { AppText as Text } from '../components/Typography';
import { AppBackdrop } from '../components/Glass';
import { useReducedMotion } from 'react-native-reanimated';
import ScreenHeader from '../components/ScreenHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { personalStorageKey, savePersonalData } from '../services/personalStorage';
import { getTodayDateString } from '../services/trackingService';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { BookHeart, Plus, Edit2, Trash2, X } from 'lucide-react-native';
import { useTheme, fonts } from '../contexts/ThemeContext';

interface Dua {
  id: string;
  title: string;
  text: string;
  category: string;
  date: string;
}

export default function DuaScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const [duas, setDuas] = useState<Dua[]>([]);
  const [storageKey, setStorageKey] = useState('');
  const [ready, setReady] = useState(false), [saving, setSaving] = useState(false);
  const [storageError, setStorageError] = useState('');
  const load = async () => {
    setStorageError(''); setReady(false);
    try {
      const key = await personalStorageKey('duas'), value = await AsyncStorage.getItem(key);
      const data = value ? JSON.parse(value) : [];
      if (!Array.isArray(data) || data.some(d => !d || typeof d.id !== 'string' || typeof d.title !== 'string' || typeof d.text !== 'string' || typeof d.category !== 'string' || typeof d.date !== 'string')) throw new Error('Invalid saved prayers');
      setDuas(data); setStorageKey(key); setReady(true);
    } catch { setStorageError('Your saved prayers could not be loaded. Retry before editing; existing data has been kept.'); }
  };
  useEffect(() => { void load(); }, []);
  const persist = async (next: Dua[]) => {
    if (!ready || saving) return false;
    setSaving(true); setStorageError('');
    try { await savePersonalData(storageKey, next); setDuas(next); return true; }
    catch { setStorageError('Your changes could not be saved. Keep this screen open and try again.'); return false; }
    finally { setSaving(false); }
  };
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDua, setEditingDua] = useState<Dua | null>(null);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [category, setCategory] = useState('Personal');

  const categories = [
    'Personal',
    'Family',
    'Health',
    'Success',
    'Forgiveness',
    'Guidance',
    'Other',
  ];

  const handleSaveDua = async () => {
    if (!title.trim() || !text.trim()) { setStorageError('Enter a title and prayer before saving.'); return; }
    const next = editingDua ? duas.map(d => d.id === editingDua.id ? { ...d, title: title.trim(), text: text.trim(), category } : d)
      : [{ id: Date.now().toString(), title: title.trim(), text: text.trim(), category, date: getTodayDateString() }, ...duas];
    if (await persist(next)) handleCloseModal();
  };
  const handleDeleteDua = (id: string) => {
    const remove = () => { void persist(duas.filter(d => d.id !== id)); };
    if (Platform.OS === 'web') { if (window.confirm('Delete this personal prayer?')) remove(); }
    else Alert.alert('Delete this prayer?', 'This removes it from this device.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: remove }]);
  };

  const handleEditDua = (dua: Dua) => {
    setEditingDua(dua);
    setTitle(dua.title);
    setText(dua.text);
    setCategory(dua.category);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingDua(null);
    setTitle('');
    setText('');
    setCategory('Personal');
  };

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
        title="Du'a book"
        subtitle="Write and revisit your personal prayers."
      />

      {!!storageError && <View style={{ padding: 16 }}><Text accessibilityRole="alert" style={{ color: colors.danger }}>{storageError}</Text>{!ready && <TouchableOpacity accessibilityRole="button" onPress={load} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={{ color: colors.primary }}>Retry loading prayers</Text></TouchableOpacity>}</View>}
      {/* Add Button */}
      <View style={styles.addButtonContainer}>
        <TouchableOpacity
          accessibilityRole="button"
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          disabled={!ready || saving}
          onPress={() => setModalVisible(true)}
        >
          <Plus size={24} color={colors.onPrimary} />
          <Text style={[styles.addButtonText, { color: colors.onPrimary }]}>
            {ready ? "Add New Du'a" : 'Loading saved prayers…'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={{ color: colors.textSecondary, paddingHorizontal: 20, paddingBottom: 12 }}>Saved on this device for your account. These prayers are not synced to the server.</Text>
      {/* Du'a List */}
      <ScrollView
        style={styles.duaList}
        contentContainerStyle={styles.duaListContent}
      >
        {duas.length === 0 ? (
          <View style={styles.emptyState}>
            <BookHeart size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No du&apos;as yet. Start adding your personal prayers.
            </Text>
          </View>
        ) : (
          duas.map((dua) => (
            <View
              key={dua.id}
              style={[
                styles.duaCard,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.duaHeader}>
                <View style={styles.duaTitleSection}>
                  <Text
                    style={[styles.duaTitle, { color: colors.textPrimary }]}
                  >
                    {dua.title}
                  </Text>
                  <View
                    style={[
                      styles.categoryBadge,
                      { backgroundColor: colors.primary + '20' },
                    ]}
                  >
                    <Text
                      style={[styles.categoryText, { color: colors.primary }]}
                    >
                      {dua.category}
                    </Text>
                  </View>
                </View>
                <View style={styles.duaActions}>
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={`Edit ${dua.title}`}
                    onPress={() => handleEditDua(dua)}
                    style={styles.actionButton}
                  >
                    <Edit2 size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={`Delete ${dua.title}`}
                    onPress={() => handleDeleteDua(dua.id)}
                    style={styles.actionButton}
                  >
                    <Trash2 size={18} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={[styles.duaText, { color: colors.textSecondary }]}>
                {dua.text}
              </Text>
              <Text style={[styles.duaDate, { color: colors.textSecondary }]}>
                {dua.date}
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType={reduceMotion ? 'none' : 'slide'}
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.cardBackground,
                paddingBottom: Math.max(insets.bottom, 24),
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                {editingDua ? "Edit Du'a" : "Add New Du'a"}
              </Text>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Close editor"
                style={{
                  minWidth: 48,
                  minHeight: 48,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={handleCloseModal}
              >
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              {!!storageError && <Text accessibilityRole="alert" style={{ color: colors.danger }}>{storageError}</Text>}
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Title
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    color: colors.textPrimary,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="e.g., For My Health"
                placeholderTextColor={colors.textSecondary}
                value={title}
                onChangeText={setTitle}
              />

              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Category
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryList}
              >
                {categories.map((cat) => (
                  <TouchableOpacity
                    accessibilityRole="button"
                    key={cat}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor:
                          category === cat ? colors.primary : colors.background,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        {
                          color:
                            category === cat
                              ? colors.onPrimary
                              : colors.textPrimary,
                        },
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Du&apos;a Text
              </Text>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    backgroundColor: colors.background,
                    color: colors.textPrimary,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="Write your du'a here..."
                placeholderTextColor={colors.textSecondary}
                value={text}
                onChangeText={setText}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                accessibilityRole="button"
                style={[
                  styles.cancelButton,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
                onPress={handleCloseModal}
              >
                <Text
                  style={[
                    styles.cancelButtonText,
                    { color: colors.textSecondary },
                  ]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                style={[styles.saveButton, { backgroundColor: colors.primary }]}
                disabled={!ready || saving}
                onPress={handleSaveDua}
              >
                <Text
                  style={[styles.saveButtonText, { color: colors.onPrimary }]}
                >
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
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
    marginTop: 12,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  addButtonContainer: {
    width: '100%',
    maxWidth: 820,
    alignSelf: 'center',
    padding: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 22,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  duaList: {
    flex: 1,
  },
  duaListContent: {
    width: '100%',
    maxWidth: 820,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  duaCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  duaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  duaTitleSection: {
    flex: 1,
    gap: 8,
  },
  duaTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    fontWeight: 'bold',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  duaActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  duaText: {
    fontSize: 17,
    lineHeight: 27,
    marginBottom: 12,
  },
  duaDate: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    width: '100%',
    maxWidth: 820,
    alignSelf: 'center',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalForm: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    fontFamily: fonts.body,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  categoryList: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  categoryChip: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  textArea: {
    fontFamily: fonts.body,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    minHeight: 120,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
