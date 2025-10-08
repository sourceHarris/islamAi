import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import { BookHeart, Plus, Edit2, Trash2, X } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';

interface Dua {
  id: string;
  title: string;
  text: string;
  category: string;
  date: string;
}

export default function DuaScreen() {
  const { colors } = useTheme();
  const [duas, setDuas] = useState<Dua[]>([
    {
      id: '1',
      title: 'For Success in Studies',
      text: 'O Allah, grant me knowledge and understanding. Make learning easy for me and bless my efforts.',
      category: 'Personal',
      date: '2025-10-05',
    },
    {
      id: '2',
      title: 'For My Parents',
      text: 'My Lord, have mercy upon them as they brought me up when I was small.',
      category: 'Family',
      date: '2025-10-04',
    },
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDua, setEditingDua] = useState<Dua | null>(null);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [category, setCategory] = useState('Personal');

  const categories = ['Personal', 'Family', 'Health', 'Success', 'Forgiveness', 'Guidance', 'Other'];

  const handleSaveDua = () => {
    if (title.trim() && text.trim()) {
      if (editingDua) {
        setDuas(duas.map(d => d.id === editingDua.id ? {
          ...d,
          title,
          text,
          category,
        } : d));
      } else {
        const newDua: Dua = {
          id: Date.now().toString(),
          title,
          text,
          category,
          date: new Date().toISOString().split('T')[0],
        };
        setDuas([newDua, ...duas]);
      }
      handleCloseModal();
    }
  };

  const handleDeleteDua = (id: string) => {
    setDuas(duas.filter(d => d.id !== id));
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
        <BookHeart size={32} color={colors.primary} />
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Du'a Book</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Your Private Prayers</Text>
      </View>

      {/* Add Button */}
      <View style={styles.addButtonContainer}>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => setModalVisible(true)}>
          <Plus size={24} color="#ffffff" />
          <Text style={styles.addButtonText}>Add New Du'a</Text>
        </TouchableOpacity>
      </View>

      {/* Du'a List */}
      <ScrollView style={styles.duaList} contentContainerStyle={styles.duaListContent}>
        {duas.length === 0 ? (
          <View style={styles.emptyState}>
            <BookHeart size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No du'as yet. Start adding your personal prayers.
            </Text>
          </View>
        ) : (
          duas.map((dua) => (
            <View key={dua.id} style={[styles.duaCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <View style={styles.duaHeader}>
                <View style={styles.duaTitleSection}>
                  <Text style={[styles.duaTitle, { color: colors.textPrimary }]}>{dua.title}</Text>
                  <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={[styles.categoryText, { color: colors.primary }]}>{dua.category}</Text>
                  </View>
                </View>
                <View style={styles.duaActions}>
                  <TouchableOpacity onPress={() => handleEditDua(dua)} style={styles.actionButton}>
                    <Edit2 size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteDua(dua.id)} style={styles.actionButton}>
                    <Trash2 size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={[styles.duaText, { color: colors.textSecondary }]}>{dua.text}</Text>
              <Text style={[styles.duaDate, { color: colors.textSecondary }]}>{dua.date}</Text>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                {editingDua ? 'Edit Du\'a' : 'Add New Du\'a'}
              </Text>
              <TouchableOpacity onPress={handleCloseModal}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Title</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
                placeholder="e.g., For My Health"
                placeholderTextColor={colors.textSecondary}
                value={title}
                onChangeText={setTitle}
              />

              <Text style={[styles.label, { color: colors.textSecondary }]}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryList}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      { 
                        backgroundColor: category === cat ? colors.primary : colors.background,
                        borderColor: colors.border 
                      }
                    ]}
                    onPress={() => setCategory(cat)}>
                    <Text style={[
                      styles.categoryChipText,
                      { color: category === cat ? '#ffffff' : colors.textPrimary }
                    ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={[styles.label, { color: colors.textSecondary }]}>Du'a Text</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
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
                style={[styles.cancelButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                onPress={handleCloseModal}>
                <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={handleSaveDua}>
                <Text style={styles.saveButtonText}>Save</Text>
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
    padding: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
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
    padding: 8,
  },
  duaText: {
    fontSize: 15,
    lineHeight: 22,
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
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