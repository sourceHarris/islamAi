// import React from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   Dimensions,
// } from 'react-native';
// import { BookOpen, Compass, Clock, BookHeart, Flame, CircleDot, Moon, Sparkles, TrendingUp, Layers } from 'lucide-react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { useTheme } from '../contexts/ThemeContext';
// import { useRouter } from 'expo-router';

// const { width } = Dimensions.get('window');

// export default function HomeScreen() {
//   const { colors } = useTheme();
//   const router = useRouter();
//   const userName = "Muhammad Huzaifa";
  
//   return (
//     <View style={[styles.container, { backgroundColor: colors.background }]}>
//       {/* FIXED HEADER - This stays at top */}
//       <LinearGradient
//         colors={[colors.primary, colors.primary + 'CC', colors.primary + '88']}
//         style={styles.fixedHeader}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 1 }}>
//         <View style={styles.heroContent}>
//           <Text style={styles.greeting}>السلام عليكم</Text>
//           <Text style={styles.heroTitle}>{userName}</Text>
          
//           {/* Quranic Verse */}
//           <View style={styles.verseContainer}>
//             <Text style={styles.arabicVerse}>إِنَّ مَعَ الْعُسْرِ يُسْرًا</Text>
//             <Text style={styles.urduTranslation}>بیشک تنگی کے ساتھ آسانی ہے</Text>
//           </View>
//         </View>
        
//         {/* Floating Stats */}
//         <View style={styles.floatingStats}>
//           <View style={[styles.statBubble, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
//             <Flame size={20} color="#fff" />
//             <Text style={styles.statBubbleNumber}>7</Text>
//             <Text style={styles.statBubbleLabel}>Days</Text>
//           </View>
//           <View style={[styles.statBubble, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
//             <BookOpen size={20} color="#fff" />
//             <Text style={styles.statBubbleNumber}>12</Text>
//             <Text style={styles.statBubbleLabel}>Juz</Text>
//           </View>
//         </View>
//       </LinearGradient>

//       {/* SCROLLABLE CONTENT */}
//       <ScrollView 
//         style={styles.scrollContent}
//         showsVerticalScrollIndicator={false}>
        
//         <View style={styles.contentSection}>
//           {/* Next Prayer Card */}
//           <View style={[styles.nextPrayerCard, { backgroundColor: colors.cardBackground }]}>
//             <View style={styles.nextPrayerHeader}>
//               <View style={[styles.iconCircle, { backgroundColor: colors.primary + '20' }]}>
//                 <Clock size={24} color={colors.primary} />
//               </View>
//               <View style={styles.nextPrayerInfo}>
//                 <Text style={[styles.nextPrayerLabel, { color: colors.textSecondary }]}>Next Prayer</Text>
//                 <Text style={[styles.nextPrayerName, { color: colors.primary }]}>Asr</Text>
//               </View>
//             </View>
//             <Text style={[styles.nextPrayerTime, { color: colors.textPrimary }]}>3:45 PM</Text>
//             <Text style={[styles.nextPrayerCountdown, { color: colors.textSecondary }]}>in 2 hours 15 minutes</Text>
//           </View>

//           {/* Quick Actions */}
//           <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Quick Access</Text>
//           <View style={styles.quickGrid}>
//             <TouchableOpacity 
//               style={[styles.quickCard, { backgroundColor: colors.cardBackground }]}
//               onPress={() => router.push('/qibla')}
//               activeOpacity={0.7}>
//               <View style={[styles.quickIconContainer, { backgroundColor: colors.primary + '15' }]}>
//                 <Compass size={28} color={colors.primary} />
//               </View>
//               <Text style={[styles.quickLabel, { color: colors.textPrimary }]}>Qibla</Text>
//             </TouchableOpacity>

//             <TouchableOpacity 
//               style={[styles.quickCard, { backgroundColor: colors.cardBackground }]}
//               onPress={() => router.push('/dhikr')}
//               activeOpacity={0.7}>
//               <View style={[styles.quickIconContainer, { backgroundColor: colors.primary + '15' }]}>
//                 <CircleDot size={28} color={colors.primary} />
//               </View>
//               <Text style={[styles.quickLabel, { color: colors.textPrimary }]}>Dhikr</Text>
//             </TouchableOpacity>

//             <TouchableOpacity 
//               style={[styles.quickCard, { backgroundColor: colors.cardBackground }]}
//               onPress={() => router.push('/dua')}
//               activeOpacity={0.7}>
//               <View style={[styles.quickIconContainer, { backgroundColor: colors.primary + '15' }]}>
//                 <BookHeart size={28} color={colors.primary} />
//               </View>
//               <Text style={[styles.quickLabel, { color: colors.textPrimary }]}>Du'a</Text>
//             </TouchableOpacity>

//             <TouchableOpacity 
//               style={[styles.quickCard, { backgroundColor: colors.cardBackground }]}
//               onPress={() => router.push('/swipecards')}
//               activeOpacity={0.7}>
//               <View style={[styles.quickIconContainer, { backgroundColor: colors.primary + '15' }]}>
//                 <Layers size={28} color={colors.primary} />
//               </View>
//               <Text style={[styles.quickLabel, { color: colors.textPrimary }]}>Cards</Text>
//             </TouchableOpacity>
//           </View>

//           {/* Progress Cards */}
//           <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Your Progress</Text>
//           <View style={styles.progressCards}>
//             <View style={[styles.progressCard, { backgroundColor: colors.cardBackground }]}>
//               <View style={styles.progressHeader}>
//                 <View style={[styles.progressIconBg, { backgroundColor: '#f59e0b' + '20' }]}>
//                   <Flame size={24} color="#f59e0b" />
//                 </View>
//                 <TrendingUp size={16} color={colors.textSecondary} />
//               </View>
//               <Text style={[styles.progressNumber, { color: colors.textPrimary }]}>7</Text>
//               <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>Day Streak</Text>
//               <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
//                 <View style={[styles.progressFill, { width: '70%', backgroundColor: '#f59e0b' }]} />
//               </View>
//             </View>

//             <View style={[styles.progressCard, { backgroundColor: colors.cardBackground }]}>
//               <View style={styles.progressHeader}>
//                 <View style={[styles.progressIconBg, { backgroundColor: colors.primary + '20' }]}>
//                   <BookOpen size={24} color={colors.primary} />
//                 </View>
//                 <TrendingUp size={16} color={colors.textSecondary} />
//               </View>
//               <Text style={[styles.progressNumber, { color: colors.textPrimary }]}>12</Text>
//               <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>Quran Days</Text>
//               <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
//                 <View style={[styles.progressFill, { width: '60%', backgroundColor: colors.primary }]} />
//               </View>
//             </View>
//           </View>

//           {/* Today's Prayers */}
//           <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Today's Prayers</Text>
//           <View style={[styles.prayersList, { backgroundColor: colors.cardBackground }]}>
//             {[
//               { name: 'Fajr', time: '5:30 AM', completed: true },
//               { name: 'Dhuhr', time: '12:45 PM', completed: true },
//               { name: 'Asr', time: '3:45 PM', completed: false },
//               { name: 'Maghrib', time: '6:20 PM', completed: false },
//               { name: 'Isha', time: '7:50 PM', completed: false },
//             ].map((prayer, index) => (
//               <View key={index} style={[styles.prayerItem, { borderBottomColor: colors.border }]}>
//                 <View style={styles.prayerLeft}>
//                   {prayer.completed ? (
//                     <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
//                       <Text style={styles.checkMark}>✓</Text>
//                     </View>
//                   ) : (
//                     <View style={[styles.emptyCircle, { borderColor: colors.border }]} />
//                   )}
//                   <Text style={[styles.prayerName, { color: colors.textPrimary }]}>{prayer.name}</Text>
//                 </View>
//                 <Text style={[styles.prayerTime, { color: colors.textSecondary }]}>{prayer.time}</Text>
//               </View>
//             ))}
//           </View>

//           {/* Islamic Date */}
//           <View style={[styles.dateCard, { backgroundColor: colors.cardBackground }]}>
//             <Moon size={24} color={colors.primary} />
//             <View style={styles.dateInfo}>
//               <Text style={[styles.islamicDate, { color: colors.primary }]}>15 Ramadan 1446</Text>
//               <Text style={[styles.gregorianDate, { color: colors.textSecondary }]}>October 8, 2025</Text>
//             </View>
//           </View>
//         </View>
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   fixedHeader: {
//     paddingTop: 60,
//     paddingBottom: 40,
//     paddingHorizontal: 20,
//     borderBottomLeftRadius: 32,
//     borderBottomRightRadius: 32,
//   },
//   scrollContent: {
//     flex: 1,
//   },
//   heroContent: {
//     alignItems: 'center',
//   },
//   greeting: {
//     fontSize: 28,
//     color: '#ffffff',
//     fontWeight: '600',
//     marginBottom: 8,
//   },
//   heroTitle: {
//     fontSize: 32,
//     fontWeight: 'bold',
//     color: '#ffffff',
//     marginBottom: 16,
//   },
//   verseContainer: {
//     alignItems: 'center',
//     paddingHorizontal: 20,
//   },
//   arabicVerse: {
//     fontSize: 20,
//     color: '#ffffff',
//     fontWeight: '600',
//     marginBottom: 6,
//     textAlign: 'center',
//   },
//   urduTranslation: {
//     fontSize: 14,
//     color: '#ffffff',
//     opacity: 0.9,
//     textAlign: 'center',
//   },
//   floatingStats: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     marginTop: 24,
//     gap: 16,
//   },
//   statBubble: {
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     borderRadius: 20,
//     alignItems: 'center',
//     flexDirection: 'row',
//     gap: 8,
//   },
//   statBubbleNumber: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#ffffff',
//   },
//   statBubbleLabel: {
//     fontSize: 12,
//     color: '#ffffff',
//     opacity: 0.9,
//   },
//   contentSection: {
//     paddingHorizontal: 20,
//     paddingTop: 20,
//     paddingBottom: 40,
//   },
//   nextPrayerCard: {
//     padding: 24,
//     borderRadius: 24,
//     marginBottom: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 12,
//     elevation: 5,
//   },
//   nextPrayerHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   iconCircle: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 12,
//   },
//   nextPrayerInfo: {
//     flex: 1,
//   },
//   nextPrayerLabel: {
//     fontSize: 14,
//     fontWeight: '500',
//     marginBottom: 2,
//   },
//   nextPrayerName: {
//     fontSize: 20,
//     fontWeight: 'bold',
//   },
//   nextPrayerTime: {
//     fontSize: 36,
//     fontWeight: 'bold',
//     marginBottom: 4,
//   },
//   nextPrayerCountdown: {
//     fontSize: 15,
//   },
//   sectionTitle: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     marginBottom: 16,
//   },
//   quickGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 12,
//     marginBottom: 32,
//   },
//   quickCard: {
//     width: (width - 56) / 4,
//     aspectRatio: 1,
//     borderRadius: 20,
//     alignItems: 'center',
//     justifyContent: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.08,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   quickIconContainer: {
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 8,
//   },
//   quickLabel: {
//     fontSize: 12,
//     fontWeight: '600',
//   },
//   progressCards: {
//     flexDirection: 'row',
//     gap: 12,
//     marginBottom: 32,
//   },
//   progressCard: {
//     flex: 1,
//     padding: 20,
//     borderRadius: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.08,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   progressHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   progressIconBg: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   progressNumber: {
//     fontSize: 32,
//     fontWeight: 'bold',
//     marginBottom: 4,
//   },
//   progressLabel: {
//     fontSize: 14,
//     fontWeight: '500',
//     marginBottom: 12,
//   },
//   progressBar: {
//     height: 6,
//     borderRadius: 3,
//     overflow: 'hidden',
//   },
//   progressFill: {
//     height: '100%',
//     borderRadius: 3,
//   },
//   prayersList: {
//     borderRadius: 20,
//     padding: 4,
//     marginBottom: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.08,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   prayerItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 16,
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//   },
//   prayerLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   checkCircle: {
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 12,
//   },
//   checkMark: {
//     color: '#ffffff',
//     fontSize: 14,
//     fontWeight: 'bold',
//   },
//   emptyCircle: {
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     borderWidth: 2,
//     marginRight: 12,
//   },
//   prayerName: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   prayerTime: {
//     fontSize: 15,
//     fontWeight: '500',
//   },
//   dateCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 20,
//     borderRadius: 20,
//     gap: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.08,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   dateInfo: {
//     flex: 1,
//   },
//   islamicDate: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 2,
//   },
//   gregorianDate: {
//     fontSize: 14,
//   },
// });


// -------------- new code ----------------------

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from '../contexts/ThemeContext';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: 'transparent' },
          }}
        >
          <Stack.Screen 
            name="(tabs)" 
            options={{ 
              headerShown: false,
            }} 
          />
          <Stack.Screen 
            name="swipecards" 
            options={{ 
              headerShown: false,
              presentation: 'card',
            }} 
          />
          <Stack.Screen 
            name="qibla" 
            options={{ 
              headerShown: false,
            }} 
          />
          <Stack.Screen 
            name="dhikr" 
            options={{ 
              headerShown: false,
            }} 
          />
          <Stack.Screen 
            name="dua" 
            options={{ 
              headerShown: false,
            }} 
          />
          <Stack.Screen 
            name="checklist" 
            options={{ 
              headerShown: false,
            }} 
          />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}