import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  ActivityIndicator, TextInput, Platform,
} from 'react-native';
import { ChevronLeft, ChevronRight, Search, X, Book, AlertCircle } from 'lucide-react-native';
import { fetchHadiths, HadithBook, HadithItem } from '../services/hadithApi';

interface Props {
  book: HadithBook;
  onClose: () => void;
  colors: any;
}

const BOOK_COLORS: Record<string, string> = {
  'bukhari': '#10b981', 'muslim': '#3b82f6', 'tirmidzi': '#8b5cf6',
  'abu-daud': '#f59e0b', 'nasai': '#ec4899', 'ibnu-majah': '#06b6d4',
  'ahmad': '#f97316', 'malik': '#84cc16', 'darimi': '#a78bfa',
};

const PAGE_SIZE = 20;

export default function HadithDetailView({ book, onClose, colors }: Props) {
  const bookColor = BOOK_COLORS[book.id] ?? colors.primary;

  const [allHadiths, setAllHadiths] = useState<HadithItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<HadithItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const loadPage = useCallback(async (pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const start = (pageNum - 1) * PAGE_SIZE + 1;
      const end = Math.min(start + PAGE_SIZE - 1, book.available);
      const data = await fetchHadiths(book.id, start, end);
      setAllHadiths(data.hadiths);
      setTotalPages(Math.ceil(book.available / PAGE_SIZE));
    } catch {
      setError('اتصال میں خرابی۔ دوبارہ کوشش کریں۔');
    } finally {
      setLoading(false);
    }
  }, [book]);

  useEffect(() => { loadPage(1); }, []);

  // Smart search: number → fetch that range; text → filter current hadiths
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) { setIsSearching(false); setSearchResults([]); return; }

    setIsSearching(true);
    const trimmed = query.trim();
    const isNumber = /^\d+$/.test(trimmed);

    if (isNumber) {
      const num = parseInt(trimmed, 10);
      if (num >= 1 && num <= book.available) {
        // Jump to that hadith number  
        setLoading(true);
        try {
          const start = Math.max(1, num - 2);
          const end = Math.min(book.available, num + 2);
          const data = await fetchHadiths(book.id, start, end);
          const target = data.hadiths.filter(h => h.number === num);
          setSearchResults(target.length > 0 ? target : data.hadiths);
        } catch {
          setSearchResults([]);
        } finally {
          setLoading(false);
        }
      }
    } else {
      // Filter current page by Arabic text
      const filtered = allHadiths.filter(h =>
        h.arab.includes(trimmed) || h.number.toString().includes(trimmed)
      );
      setSearchResults(filtered);
    }
  }, [allHadiths, book]);

  const displayedHadiths = isSearching ? searchResults : allHadiths;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onClose} style={styles.backBtn}>
          <ChevronLeft size={26} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]} numberOfLines={1}>
            {book.name}
          </Text>
          <Text style={[styles.headerSub, { color: bookColor }]}>
            {book.available.toLocaleString()} احادیث
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Smart Search Bar */}
      <View style={[styles.searchBar, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <Search size={18} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          placeholder="حدیث نمبر یا متن تلاش کریں..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={handleSearch}
          keyboardType="default"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <X size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Info banner */}
      <View style={[styles.infoBanner, { backgroundColor: bookColor + '15', borderColor: bookColor + '30' }]}>
        <Book size={13} color={bookColor} />
        <Text style={[styles.infoBannerText, { color: bookColor }]}>
          {isSearching
            ? `${searchResults.length} نتائج ملے`
            : `صفحہ ${page} / ${totalPages} • ${book.name}`}
        </Text>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={bookColor} />
          <Text style={[styles.loadingTxt, { color: colors.textSecondary }]}>احادیث لوڈ ہو رہی ہیں...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <AlertCircle size={40} color={colors.textSecondary} />
          <Text style={[styles.errorTxt, { color: colors.textSecondary }]}>{error}</Text>
          <TouchableOpacity style={[styles.retryBtn, { borderColor: bookColor }]} onPress={() => loadPage(page)}>
            <Text style={[styles.retryTxt, { color: bookColor }]}>دوبارہ کوشش کریں</Text>
          </TouchableOpacity>
        </View>
      ) : displayedHadiths.length === 0 ? (
        <View style={styles.center}>
          <Text style={[styles.errorTxt, { color: colors.textSecondary }]}>کوئی نتیجہ نہیں ملا</Text>
        </View>
      ) : (
        <FlatList
          data={displayedHadiths}
          keyExtractor={(item) => item.number.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={[styles.hadithCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              {/* Number */}
              <View style={[styles.numBadge, { backgroundColor: bookColor + '20' }]}>
                <Text style={[styles.numText, { color: bookColor }]}>#{item.number}</Text>
              </View>
              {/* Arabic */}
              <Text style={[styles.arabicTxt, { color: colors.textPrimary }]} textBreakStrategy="simple">
                {item.arab}
              </Text>
              {/* Source */}
              <View style={[styles.sourceTag, { backgroundColor: bookColor + '12' }]}>
                <Text style={[styles.sourceTxt, { color: bookColor }]}>
                  {book.name} — حدیث {item.number}
                </Text>
              </View>
            </View>
          )}
        />
      )}

      {/* Pagination (hidden during search) */}
      {!isSearching && !loading && (
        <View style={[styles.pagination, { backgroundColor: colors.cardBackground, borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.pageBtn, page <= 1 && styles.disabled]}
            disabled={page <= 1}
            onPress={() => { const p = page - 1; setPage(p); loadPage(p); }}>
            <ChevronLeft size={20} color={page <= 1 ? colors.border : colors.textPrimary} />
            <Text style={[styles.pageBtnTxt, { color: page <= 1 ? colors.border : colors.textPrimary }]}>پچھلا</Text>
          </TouchableOpacity>
          <Text style={[styles.pageNum, { color: colors.textSecondary }]}>{page} / {totalPages}</Text>
          <TouchableOpacity
            style={[styles.pageBtn, page >= totalPages && styles.disabled]}
            disabled={page >= totalPages}
            onPress={() => { const p = page + 1; setPage(p); loadPage(p); }}>
            <Text style={[styles.pageBtnTxt, { color: page >= totalPages ? colors.border : colors.textPrimary }]}>اگلا</Text>
            <ChevronRight size={20} color={page >= totalPages ? colors.border : colors.textPrimary} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 60 : 50, paddingBottom: 14, paddingHorizontal: 16, borderBottomWidth: 1, gap: 12 },
  backBtn: { padding: 4 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  headerSub: { fontSize: 12, marginTop: 2, fontWeight: '600' },
  searchBar: { flexDirection: 'row', alignItems: 'center', margin: 12, padding: 12, borderRadius: 14, borderWidth: 1, gap: 10 },
  searchInput: { flex: 1, fontSize: 15, textAlign: 'right' },
  infoBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 12, marginBottom: 8, padding: 8, borderRadius: 10, borderWidth: 1 },
  infoBannerText: { fontSize: 12, fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 32 },
  loadingTxt: { fontSize: 15, marginTop: 4 },
  errorTxt: { fontSize: 15, textAlign: 'center' },
  retryBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, marginTop: 4 },
  retryTxt: { fontSize: 14, fontWeight: '600' },
  list: { padding: 12, gap: 14 },
  hadithCard: { borderRadius: 14, padding: 16, borderWidth: 1, gap: 12 },
  numBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  numText: { fontSize: 12, fontWeight: '700' },
  arabicTxt: { fontSize: 20, lineHeight: 38, textAlign: 'right', writingDirection: 'rtl', fontWeight: '500' },
  sourceTag: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  sourceTxt: { fontSize: 11, fontWeight: '600' },
  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderTopWidth: 1 },
  pageBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 8 },
  disabled: { opacity: 0.4 },
  pageBtnTxt: { fontSize: 14, fontWeight: '600' },
  pageNum: { fontSize: 14 },
});
