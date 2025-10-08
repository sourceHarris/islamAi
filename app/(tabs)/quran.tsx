// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   TextInput,
//   FlatList,
//   Dimensions,
// } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Search, BookOpen, Play, Bookmark, Volume2, Star } from 'lucide-react-native';

// const { width } = Dimensions.get('window');

// interface Surah {
//   number: number;
//   name: string;
//   arabicName: string;
//   englishName: string;
//   verses: number;
//   revelation: 'Meccan' | 'Medinan';
//   progress?: number;
// }

// interface RecentReading {
//   surah: string;
//   verse: number;
//   timestamp: string;
// }

// export default function QuranScreen() {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedTab, setSelectedTab] = useState<'surahs' | 'bookmarks' | 'recent'>('surahs');

//   const [surahs] = useState<Surah[]>([
//     { number: 1, name: 'Al-Fatihah', arabicName: 'الفاتحة', englishName: 'The Opening', verses: 7, revelation: 'Meccan', progress: 100 },
//     { number: 2, name: 'Al-Baqarah', arabicName: 'البقرة', englishName: 'The Cow', verses: 286, revelation: 'Medinan', progress: 45 },
//     { number: 3, name: 'Al-'Imran', arabicName: 'آل عمران', englishName: 'Family of Imran', verses: 200, revelation: 'Medinan', progress: 0 },
//     { number: 4, name: 'An-Nisa', arabicName: 'النساء', englishName: 'The Women', verses: 176, revelation: 'Medinan', progress: 0 },
//     { number: 5, name: 'Al-Ma\'idah', arabicName: 'المائدة', englishName: 'The Table Spread', verses: 120, revelation: 'Medinan', progress: 0 },
//     { number: 6, name: 'Al-An\'am', arabicName: 'الأنعام', englishName: 'The Cattle', verses: 165, revelation: 'Meccan', progress: 0 },
//   ]);

//   const [recentReadings] = useState<RecentReading[]>([
//     { surah: 'Al-Baqarah', verse: 255, timestamp: '2 hours ago' },
//     { surah: 'Al-Fatihah', verse: 7, timestamp: 'Yesterday' },
//     { surah: 'Al-Mulk', verse: 15, timestamp: '2 days ago' },
//   ]);

//   const [bookmarkedVerses] = useState([
//     { surah: 'Al-Baqarah', verse: 255, text: 'Ayat al-Kursi' },
//     { surah: 'Al-Ikhlas', verse: 1, text: 'Say: He is Allah, the One!' },
//     { surah: 'Al-Fatiha', verse: 6, text: 'Guide us to the straight path' },
//   ]);

//   const filteredSurahs = surahs.filter(surah =>
//     surah.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     surah.englishName.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const renderSurahItem = ({ item }: { item: Surah }) => (
//     <TouchableOpacity style={styles.surahCard}>
//       <View style={styles.surahHeader}>
//         <View style={styles.surahNumber}>
//           <Text style={styles.surahNumberText}>{item.number}</Text>
//         </View>
//         <View style={styles.surahInfo}>
//           <Text style={styles.surahName}>{item.name}</Text>
//           <Text style={styles.surahArabic}>{item.arabicName}</Text>
//           <Text style={styles.surahDetails}>
//             {item.englishName} • {item.verses} verses • {item.revelation}
//           </Text>
//         </View>
//         <View style={styles.surahActions}>
//           <TouchableOpacity style={styles.actionButton}>
//             <Play size={16} color="#3b82f6" />
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.actionButton}>
//             <Bookmark size={16} color="#6b7280" />
//           </TouchableOpacity>
//         </View>
//       </View>
      
//       {item.progress !== undefined && item.progress > 0 && (
//         <View style={styles.progressContainer}>
//           <View style={styles.progressBar}>
//             <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
//           </View>
//           <Text style={styles.progressText}>{item.progress}% complete</Text>
//         </View>
//       )}
//     </TouchableOpacity>
//   );

//   const renderRecentItem = ({ item }: { item: RecentReading }) => (
//     <TouchableOpacity style={styles.recentCard}>
//       <View style={styles.recentInfo}>
//         <Text style={styles.recentSurah}>{item.surah}</Text>
//         <Text style={styles.recentVerse}>Verse {item.verse}</Text>
//         <Text style={styles.recentTime}>{item.timestamp}</Text>
//       </View>
//       <TouchableOpacity style={styles.continueButton}>
//         <Text style={styles.continueButtonText}>Continue</Text>
//       </TouchableOpacity>
//     </TouchableOpacity>
//   );

//   const renderBookmarkItem = ({ item }: { item: any }) => (
//     <TouchableOpacity style={styles.bookmarkCard}>
//       <View style={styles.bookmarkInfo}>
//         <Text style={styles.bookmarkSurah}>{item.surah}</Text>
//         <Text style={styles.bookmarkVerse}>Verse {item.verse}</Text>
//         <Text style={styles.bookmarkText}>{item.text}</Text>
//       </View>
//       <TouchableOpacity style={styles.bookmarkAction}>
//         <Star size={16} color="#f59e0b" fill="#f59e0b" />
//       </TouchableOpacity>
//     </TouchableOpacity>
//   );

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <LinearGradient
//         colors={['#1e3a8a', '#3b82f6']}
//         style={styles.header}>
//         <Text style={styles.headerTitle}>Holy Quran</Text>
//         <Text style={styles.headerSubtitle}>Read, Listen & Reflect</Text>
//       </LinearGradient>

//       {/* Search Bar */}
//       <View style={styles.searchContainer}>
//         <View style={styles.searchBar}>
//           <Search size={20} color="#6b7280" />
//           <TextInput
//             style={styles.searchInput}
//             placeholder="Search surahs..."
//             value={searchQuery}
//             onChangeText={setSearchQuery}
//             placeholderTextColor="#9ca3af"
//           />
//         </View>
//       </View>

//       {/* Tabs */}
//       <View style={styles.tabContainer}>
//         <TouchableOpacity
//           style={[styles.tab, selectedTab === 'surahs' && styles.activeTab]}
//           onPress={() => setSelectedTab('surahs')}>
//           <BookOpen size={16} color={selectedTab === 'surahs' ? '#3b82f6' : '#6b7280'} />
//           <Text style={[styles.tabText, selectedTab === 'surahs' && styles.activeTabText]}>
//             Surahs
//           </Text>
//         </TouchableOpacity>
        
//         <TouchableOpacity
//           style={[styles.tab, selectedTab === 'recent' && styles.activeTab]}
//           onPress={() => setSelectedTab('recent')}>
//           <Volume2 size={16} color={selectedTab === 'recent' ? '#3b82f6' : '#6b7280'} />
//           <Text style={[styles.tabText, selectedTab === 'recent' && styles.activeTabText]}>
//             Recent
//           </Text>
//         </TouchableOpacity>
        
//         <TouchableOpacity
//           style={[styles.tab, selectedTab === 'bookmarks' && styles.activeTab]}
//           onPress={() => setSelectedTab('bookmarks')}>
//           <Bookmark size={16} color={selectedTab === 'bookmarks' ? '#3b82f6' : '#6b7280'} />
//           <Text style={[styles.tabText, selectedTab === 'bookmarks' && styles.activeTabText]}>
//             Bookmarks
//           </Text>
//         </TouchableOpacity>
//       </View>

//       {/* Content */}
//       <View style={styles.content}>
//         {selectedTab === 'surahs' && (
//           <FlatList
//             data={filteredSurahs}
//             renderItem={renderSurahItem}
//             keyExtractor={(item) => item.number.toString()}
//             showsVerticalScrollIndicator={false}
//             contentContainerStyle={styles.listContainer}
//           />
//         )}
        
//         {selectedTab === 'recent' && (
//           <FlatList
//             data={recentReadings}
//             renderItem={renderRecentItem}
//             keyExtractor={(item, index) => index.toString()}
//             showsVerticalScrollIndicator={false}
//             contentContainerStyle={styles.listContainer}
//           />
//         )}
        
//         {selectedTab === 'bookmarks' && (
//           <FlatList
//             data={bookmarkedVerses}
//             renderItem={renderBookmarkItem}
//             keyExtractor={(item, index) => index.toString()}
//             showsVerticalScrollIndicator={false}
//             contentContainerStyle={styles.listContainer}
//           />
//         )}
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f8fafc',
//   },
//   header: {
//     paddingTop: 60,
//     paddingBottom: 30,
//     paddingHorizontal: 20,
//     alignItems: 'center',
//   },
//   headerTitle: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#ffffff',
//     marginBottom: 4,
//   },
//   headerSubtitle: {
//     fontSize: 16,
//     color: '#e0f2fe',
//     fontWeight: '500',
//   },
//   searchContainer: {
//     paddingHorizontal: 20,
//     marginTop: -15,
//     marginBottom: 20,
//   },
//   searchBar: {
//     backgroundColor: '#ffffff',
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderRadius: 12,
//     elevation: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   searchInput: {
//     flex: 1,
//     marginLeft: 12,
//     fontSize: 16,
//     color: '#1f2937',
//   },
//   tabContainer: {
//     flexDirection: 'row',
//     paddingHorizontal: 20,
//     marginBottom: 20,
//     backgroundColor: '#ffffff',
//     marginHorizontal: 20,
//     borderRadius: 12,
//     padding: 4,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//   },
//   tab: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 12,
//     borderRadius: 8,
//   },
//   activeTab: {
//     backgroundColor: '#eff6ff',
//   },
//   tabText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#6b7280',
//     marginLeft: 6,
//   },
//   activeTabText: {
//     color: '#3b82f6',
//   },
//   content: {
//     flex: 1,
//   },
//   listContainer: {
//     paddingHorizontal: 20,
//     paddingBottom: 100,
//   },
//   surahCard: {
//     backgroundColor: '#ffffff',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 12,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   surahHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   surahNumber: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: '#3b82f6',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 16,
//   },
//   surahNumberText: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#ffffff',
//   },
//   surahInfo: {
//     flex: 1,
//   },
//   surahName: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#1f2937',
//     marginBottom: 2,
//   },
//   surahArabic: {
//     fontSize: 16,
//     color: '#3b82f6',
//     fontWeight: '600',
//     marginBottom: 4,
//   },
//   surahDetails: {
//     fontSize: 12,
//     color: '#6b7280',
//   },
//   surahActions: {
//     flexDirection: 'row',
//     gap: 8,
//   },
//   actionButton: {
//     padding: 8,
//     borderRadius: 8,
//     backgroundColor: '#f1f5f9',
//   },
//   progressContainer: {
//     marginTop: 12,
//     paddingTop: 12,
//     borderTopWidth: 1,
//     borderTopColor: '#f1f5f9',
//   },
//   progressBar: {
//     height: 4,
//     backgroundColor: '#e5e7eb',
//     borderRadius: 2,
//     marginBottom: 6,
//   },
//   progressFill: {
//     height: '100%',
//     backgroundColor: '#10b981',
//     borderRadius: 2,
//   },
//   progressText: {
//     fontSize: 12,
//     color: '#6b7280',
//     fontWeight: '500',
//   },
//   recentCard: {
//     backgroundColor: '#ffffff',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 12,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   recentInfo: {
//     flex: 1,
//   },
//   recentSurah: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#1f2937',
//     marginBottom: 2,
//   },
//   recentVerse: {
//     fontSize: 14,
//     color: '#6b7280',
//     marginBottom: 4,
//   },
//   recentTime: {
//     fontSize: 12,
//     color: '#9ca3af',
//   },
//   continueButton: {
//     backgroundColor: '#3b82f6',
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 8,
//   },
//   continueButtonText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#ffffff',
//   },
//   bookmarkCard: {
//     backgroundColor: '#ffffff',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 12,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   bookmarkInfo: {
//     flex: 1,
//   },
//   bookmarkSurah: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#1f2937',
//     marginBottom: 2,
//   },
//   bookmarkVerse: {
//     fontSize: 14,
//     color: '#6b7280',
//     marginBottom: 4,
//   },
//   bookmarkText: {
//     fontSize: 14,
//     color: '#4b5563',
//     fontStyle: 'italic',
//   },
//   bookmarkAction: {
//     padding: 8,
//   },
// });

//new theme

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Dimensions,
} from 'react-native';
import { Search, BookOpen, Play, Bookmark, Volume2, Star } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';

const { width } = Dimensions.get('window');

interface Surah {
  number: number;
  name: string;
  arabicName: string;
  englishName: string;
  verses: number;
  revelation: 'Meccan' | 'Medinan';
  progress?: number;
}

interface RecentReading {
  surah: string;
  verse: number;
  timestamp: string;
}

export default function QuranScreen() {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'surahs' | 'bookmarks' | 'recent'>('surahs');

  const [surahs] = useState<Surah[]>([
    { number: 1, name: 'Al-Fatihah', arabicName: 'الفاتحة', englishName: 'The Opening', verses: 7, revelation: 'Meccan', progress: 100 },
    { number: 2, name: 'Al-Baqarah', arabicName: 'البقرة', englishName: 'The Cow', verses: 286, revelation: 'Medinan', progress: 45 },
    { number: 3, name: 'Al-Imran', arabicName: 'آل عمران', englishName: 'Family of Imran', verses: 200, revelation: 'Medinan', progress: 0 },
    { number: 4, name: 'An-Nisa', arabicName: 'النساء', englishName: 'The Women', verses: 176, revelation: 'Medinan', progress: 0 },
    { number: 5, name: 'Al-Ma\'idah', arabicName: 'المائدة', englishName: 'The Table Spread', verses: 120, revelation: 'Medinan', progress: 0 },
    { number: 6, name: 'Al-An\'am', arabicName: 'الأنعام', englishName: 'The Cattle', verses: 165, revelation: 'Meccan', progress: 0 },
  ]);

  const [recentReadings] = useState<RecentReading[]>([
    { surah: 'Al-Baqarah', verse: 255, timestamp: '2 hours ago' },
    { surah: 'Al-Fatihah', verse: 7, timestamp: 'Yesterday' },
    { surah: 'Al-Mulk', verse: 15, timestamp: '2 days ago' },
  ]);

  const [bookmarkedVerses] = useState([
    { surah: 'Al-Baqarah', verse: 255, text: 'Ayat al-Kursi' },
    { surah: 'Al-Ikhlas', verse: 1, text: 'Say: He is Allah, the One!' },
    { surah: 'Al-Fatiha', verse: 6, text: 'Guide us to the straight path' },
  ]);

  const filteredSurahs = surahs.filter(surah =>
    surah.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    surah.englishName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderSurahItem = ({ item }: { item: Surah }) => (
    <TouchableOpacity style={[styles.surahCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
      <View style={styles.surahHeader}>
        <View style={[styles.surahNumber, { backgroundColor: colors.primary }]}>
          <Text style={styles.surahNumberText}>{item.number}</Text>
        </View>
        <View style={styles.surahInfo}>
          <Text style={[styles.surahName, { color: colors.textPrimary }]}>{item.name}</Text>
          <Text style={[styles.surahArabic, { color: colors.primary }]}>{item.arabicName}</Text>
          <Text style={[styles.surahDetails, { color: colors.textSecondary }]}>
            {item.englishName} • {item.verses} verses • {item.revelation}
          </Text>
        </View>
        <View style={styles.surahActions}>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.background }]}>
            <Play size={16} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.background }]}>
            <Bookmark size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
      
      {item.progress !== undefined && item.progress > 0 && (
        <View style={[styles.progressContainer, { borderTopColor: colors.border }]}>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View style={[styles.progressFill, { width: `${item.progress}%`, backgroundColor: colors.primary }]} />
          </View>
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>{item.progress}% complete</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderRecentItem = ({ item }: { item: RecentReading }) => (
    <TouchableOpacity style={[styles.recentCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
      <View style={styles.recentInfo}>
        <Text style={[styles.recentSurah, { color: colors.textPrimary }]}>{item.surah}</Text>
        <Text style={[styles.recentVerse, { color: colors.textSecondary }]}>Verse {item.verse}</Text>
        <Text style={[styles.recentTime, { color: colors.textSecondary }]}>{item.timestamp}</Text>
      </View>
      <TouchableOpacity style={[styles.continueButton, { backgroundColor: colors.primary }]}>
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderBookmarkItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={[styles.bookmarkCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
      <View style={styles.bookmarkInfo}>
        <Text style={[styles.bookmarkSurah, { color: colors.textPrimary }]}>{item.surah}</Text>
        <Text style={[styles.bookmarkVerse, { color: colors.textSecondary }]}>Verse {item.verse}</Text>
        <Text style={[styles.bookmarkText, { color: colors.textSecondary }]}>{item.text}</Text>
      </View>
      <TouchableOpacity style={styles.bookmarkAction}>
        <Star size={16} color="#f59e0b" fill="#f59e0b" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header - No Gradient */}
      <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Holy Quran</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Read, Listen & Reflect</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search surahs..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.textSecondary}
          />
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'surahs' && { backgroundColor: colors.primary + '20' }]}
          onPress={() => setSelectedTab('surahs')}>
          <BookOpen size={16} color={selectedTab === 'surahs' ? colors.primary : colors.textSecondary} />
          <Text style={[styles.tabText, { color: selectedTab === 'surahs' ? colors.primary : colors.textSecondary }]}>
            Surahs
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'recent' && { backgroundColor: colors.primary + '20' }]}
          onPress={() => setSelectedTab('recent')}>
          <Volume2 size={16} color={selectedTab === 'recent' ? colors.primary : colors.textSecondary} />
          <Text style={[styles.tabText, { color: selectedTab === 'recent' ? colors.primary : colors.textSecondary }]}>
            Recent
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'bookmarks' && { backgroundColor: colors.primary + '20' }]}
          onPress={() => setSelectedTab('bookmarks')}>
          <Bookmark size={16} color={selectedTab === 'bookmarks' ? colors.primary : colors.textSecondary} />
          <Text style={[styles.tabText, { color: selectedTab === 'bookmarks' ? colors.primary : colors.textSecondary }]}>
            Bookmarks
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {selectedTab === 'surahs' && (
          <FlatList
            data={filteredSurahs}
            renderItem={renderSurahItem}
            keyExtractor={(item) => item.number.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        )}
        
        {selectedTab === 'recent' && (
          <FlatList
            data={recentReadings}
            renderItem={renderRecentItem}
            keyExtractor={(item, index) => index.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        )}
        
        {selectedTab === 'bookmarks' && (
          <FlatList
            data={bookmarkedVerses}
            renderItem={renderBookmarkItem}
            keyExtractor={(item, index) => index.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>
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
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  content: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  surahCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  surahHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  surahNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  surahNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  surahInfo: {
    flex: 1,
  },
  surahName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  surahArabic: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  surahDetails: {
    fontSize: 12,
  },
  surahActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
  },
  progressContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
  },
  recentCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  recentInfo: {
    flex: 1,
  },
  recentSurah: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  recentVerse: {
    fontSize: 14,
    marginBottom: 4,
  },
  recentTime: {
    fontSize: 12,
  },
  continueButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  continueButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  bookmarkCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  bookmarkInfo: {
    flex: 1,
  },
  bookmarkSurah: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  bookmarkVerse: {
    fontSize: 14,
    marginBottom: 4,
  },
  bookmarkText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  bookmarkAction: {
    padding: 8,
  },
});