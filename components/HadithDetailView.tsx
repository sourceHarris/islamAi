import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Share, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronLeft, ChevronRight, Search, Share2, X } from 'lucide-react-native';
import { AppText as Text } from './Typography';
import { Card, ui } from './DesignSystem';
import { fonts } from '../contexts/ThemeContext';
import { fetchHadithByNumber, fetchHadiths, hadithSections, hadithCoverage, HadithBook, HadithItem } from '../services/hadithApi';

interface Props { book: HadithBook; onClose: () => void; colors: any }
const PAGE_SIZE = 20;
export default function HadithDetailView({ book, onClose, colors }: Props) {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<HadithItem[]>([]);
  const [loading, setLoading] = useState(true), [error, setError] = useState('');
  const [warning, setWarning] = useState(''), [page, setPage] = useState(1);
  const [pageSkip, setPageSkip] = useState(0);
  const [query, setQuery] = useState(''), [numberSearch, setNumberSearch] = useState(false);
  const [chaptersVisible, setChaptersVisible] = useState(false);
  const [language, setLanguage] = useState<'english' | 'urdu'>('english');
  const request = useRef(0), list = useRef<FlatList<HadithItem>>(null);
  const totalPages = Math.ceil(book.available / PAGE_SIZE);
  const chapters = hadithSections(book.id);
  const coverage = hadithCoverage(book.id);
  const load = useCallback(async (pageNum: number, number?: number) => {
    const current = ++request.current;
    setLoading(true); setError(''); setWarning('');
    try {
      const result = number !== undefined ? await fetchHadithByNumber(book.id, number)
        : await fetchHadiths(book.id, (pageNum - 1) * PAGE_SIZE + 1, Math.min(pageNum * PAGE_SIZE, book.available));
      if (current !== request.current) return;
      setItems(result.hadiths); setWarning(result.translationWarning || '');
      list.current?.scrollToOffset({ offset: 0, animated: false });
    } catch (e) {
      if (current === request.current) { setItems([]); setError(e instanceof Error ? e.message : 'Hadith could not be loaded.'); }
    } finally { if (current === request.current) setLoading(false); }
  }, [book]);
  const cancelRequests = useCallback(() => { request.current++; }, []);
  useEffect(() => { void load(1); return cancelRequests; }, [load, cancelRequests]);
  const normalized = query.trim().replace(/[٠-٩۰-۹]/g, ch => String('٠١٢٣٤٥٦٧٨٩'.indexOf(ch) >= 0 ? '٠١٢٣٤٥٦٧٨٩'.indexOf(ch) : '۰۱۲۳۴۵۶۷۸۹'.indexOf(ch)));
  const numeric = /^\d+(\.\d+)?$/.test(normalized);
  const search = () => {
    if (numeric) { setNumberSearch(true); void load(page, Number(normalized)); }
  };
  const changeQuery = (value: string) => {
    setQuery(value);
    // Invalidate an in-flight number request so it cannot overwrite a cleared search.
    if (numberSearch) { setNumberSearch(false); void load(page); }
  };
  const move = (next: number, skip = 0) => { setPage(next); setPageSkip(skip); setQuery(''); setNumberSearch(false); void load(next); };
  const textQuery = normalized.normalize('NFD').replace(/[\u064B-\u065F\u0670]/g, '').toLowerCase();
  const pageItems = numberSearch ? items : items.slice(pageSkip);
  const displayed = !textQuery || numeric ? pageItems : pageItems.filter(item =>
    [item.arab, item.english, item.urdu, item.section].join(' ').normalize('NFD').replace(/[\u064B-\u065F\u0670]/g, '').toLowerCase().includes(textQuery));
  return <View style={{ flex: 1, paddingTop: insets.top, paddingBottom: 80 + insets.bottom, backgroundColor: colors.background }}>
    <View style={[ui.row, { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderColor: colors.border }]}>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Back to Hadith books" onPress={onClose} style={ui.back}><ArrowLeft size={23} color={colors.textPrimary} /></TouchableOpacity>
      <View style={{ flex: 1 }}><Text accessibilityRole="header" style={[ui.sectionTitle, { color: colors.textPrimary }]}>{book.name}</Text><Text style={[ui.small, { color: colors.textSecondary }]}>{book.available.toLocaleString()} narrations · publisher numbering</Text></View>
    </View>
    <View style={{ width: '100%', maxWidth: 620, alignSelf: 'center', padding: 16, gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 12, backgroundColor: colors.cardBackground, paddingHorizontal: 10 }}>
        <TextInput accessibilityLabel="Search Hadith number or this page" value={query} onChangeText={changeQuery} onSubmitEditing={search}
          placeholder="Hadith number, or text on this page" placeholderTextColor={colors.textSecondary}
          style={{ flex: 1, minWidth: 0, minHeight: 48, fontFamily: fonts.body, color: colors.textPrimary }} returnKeyType="search" />
        {!!query && <TouchableOpacity accessibilityRole="button" accessibilityLabel="Clear Hadith search" onPress={() => changeQuery('')} style={ui.back}><X size={18} color={colors.textSecondary} /></TouchableOpacity>}
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Find Hadith number" onPress={search} style={ui.back}><Search size={19} color={colors.primary} /></TouchableOpacity>
      </View>
      <View style={ui.row}>
        <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded: chaptersVisible }} onPress={() => setChaptersVisible(v => !v)} style={{ minHeight: 44, justifyContent: 'center', flex: 1 }}><Text style={[ui.caption, { color: colors.primary }]}>{chaptersVisible ? 'Close chapters' : 'Browse chapters'} · {chapters.length}</Text></TouchableOpacity>
        {(['english', 'urdu'] as const).map(lang => <TouchableOpacity key={lang} accessibilityRole="button" accessibilityState={{ selected: language === lang, disabled: lang === 'urdu' && !coverage.languages.includes('Urdu') }} disabled={lang === 'urdu' && !coverage.languages.includes('Urdu')} onPress={() => setLanguage(lang)}
          style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: 12, borderRadius: 8, backgroundColor: language === lang ? colors.surfaceMuted : 'transparent' }}>
          <Text style={[ui.caption, { color: colors.textPrimary }]}>{lang === 'english' ? 'English' : 'اردو'}</Text></TouchableOpacity>)}
      </View>
      <Text style={[ui.small, { color: colors.textSecondary }]}>Hadith API · Arabic with English / Urdu where supplied. Chapters cache on this device. Text search covers this page; submit a number to search the collection.</Text>
      {!!coverage.missingArabic && <Text style={[ui.small, { color: colors.textSecondary }]}>{coverage.missingArabic} empty Arabic records in the source are excluded from the available count. Publisher numbering is kept.</Text>}
    </View>
    {chaptersVisible ? <FlatList data={chapters} keyExtractor={item => String(item.id)} contentContainerStyle={[ui.page, { paddingBottom: 110 + insets.bottom }]}
      renderItem={({ item }) => <TouchableOpacity accessibilityRole="button" onPress={() => { setChaptersVisible(false); move(Math.ceil(item.start / PAGE_SIZE), (item.start - 1) % PAGE_SIZE); }} style={[ui.route, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}><Text style={[ui.body, { color: colors.textPrimary }]}>{item.id}. {item.title}</Text></TouchableOpacity>} />
    : loading ? <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}><ActivityIndicator color={colors.primary} /><Text style={[ui.body, { color: colors.textSecondary }]}>Loading real Hadith text…</Text></View>
    : error ? <View style={[ui.page, { gap: 16 }]}><Text accessibilityRole="alert" style={[ui.body, { color: colors.textSecondary }]}>{error}</Text><TouchableOpacity accessibilityRole="button" onPress={() => void load(page, numberSearch && numeric ? Number(normalized) : undefined)} style={ui.primaryButton}><Text style={[ui.rowTitle, { color: colors.primary }]}>Try again</Text></TouchableOpacity></View>
    : <FlatList ref={list} data={displayed} keyExtractor={(item, i) => item.number + '-' + i} contentContainerStyle={[ui.page, { paddingBottom: 30 }]} showsVerticalScrollIndicator={false}
      ListHeaderComponent={warning ? <Text accessibilityRole="alert" style={[ui.caption, { color: colors.textSecondary }]}>{warning}</Text> : null}
      ListEmptyComponent={<Text style={[ui.body, { color: colors.textSecondary }]}>No results on this page. Try another page or a Hadith number.</Text>}
      renderItem={({ item }) => <Card>
        <View style={ui.row}><Text style={[ui.rowTitle, { color: colors.primary }]}>Hadith {item.number}</Text><TouchableOpacity accessibilityRole="button" accessibilityLabel={'Share Hadith ' + item.number} onPress={() => void Share.share({ message: [item.arab, item[language], book.name + ' · Hadith ' + item.number].filter(Boolean).join('\n\n') }).catch(() => setWarning('Sharing is not supported here. You can select and copy the text.'))} style={ui.back}><Share2 size={18} color={colors.textSecondary} /></TouchableOpacity></View>
        {!!item.section && <Text style={[ui.caption, { color: colors.textSecondary }]}>{item.section}</Text>}
        <Text selectable lang="ar" style={[ui.arabic, { color: colors.textPrimary }]}>{item.arab}</Text>
        <View style={{ borderTopWidth: 1, borderColor: colors.border, paddingTop: 14, gap: 6 }}>
          <Text style={[ui.small, { color: colors.primary }]}>{language === 'english' ? 'ENGLISH · HADITH API EDITION' : 'اردو · HADITH API EDITION'}</Text>
          <Text selectable lang={language === 'urdu' ? 'ur' : 'en'} style={[language === 'urdu' ? ui.urdu : ui.body, { color: colors.textPrimary }]}>{item[language] || 'This translation is not supplied for this narration.'}</Text>
        </View>
        {!!item.grades?.length && <Text style={[ui.caption, { color: colors.textSecondary }]}>Publisher grades: {item.grades.map(g => g.name + ': ' + g.grade).join(' · ')}</Text>}
        <Text style={[ui.small, { color: colors.textSecondary }]}>{book.name} · Hadith {item.number}. Numbering may differ between editions.</Text>
      </Card>} />}
    {!chaptersVisible && !loading && <View style={[ui.row, { padding: 10, paddingBottom: 8, backgroundColor: colors.cardBackground, borderTopWidth: 1, borderColor: colors.border }]}>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Previous Hadith page" disabled={page <= 1 || numberSearch} onPress={() => move(page - 1)} style={[ui.back, { opacity: page <= 1 || numberSearch ? .3 : 1 }]}><ChevronLeft size={23} color={colors.primary} /></TouchableOpacity>
      {numberSearch ? <TouchableOpacity accessibilityRole="button" onPress={() => move(page)} style={ui.primaryButton}><Text style={[ui.caption, { color: colors.primary }]}>Back to page {page}</Text></TouchableOpacity> : <Text style={[ui.caption, { color: colors.textSecondary }]}>Page {page} / {totalPages}</Text>}
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Next Hadith page" disabled={page >= totalPages || numberSearch} onPress={() => move(page + 1)} style={[ui.back, { opacity: page >= totalPages || numberSearch ? .3 : 1 }]}><ChevronRight size={23} color={colors.primary} /></TouchableOpacity>
    </View>}
  </View>;
}
