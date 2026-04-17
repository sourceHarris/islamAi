import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { 
  User, 
  Settings, 
  Bell, 
  Heart, 
  BookMarked, 
  Calendar,
  LogOut,
  ChevronRight,
  Moon,
  Sun,
  Hash,
  GraduationCap,
  Mail,
} from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { colors, theme, toggleTheme } = useTheme();
  const router = useRouter();

  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRegNo, setUserRegNo] = useState('');
  const [userClass, setUserClass] = useState('');

  // Load the logged-in user from AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem('hidayah_user').then((stored) => {
      if (stored) {
        const u = JSON.parse(stored);
        setUserName(u.name ?? '');
        setUserEmail(u.email ?? '');
        setUserRegNo(u.registration_number ?? '');
        setUserClass(u.class_name ?? '');
      }
    });
  }, []);

  // ── Logout handler ─────────────────────────────────────────────────────────
  const handleLogout = () => {
    const doLogout = async () => {
      await AsyncStorage.removeItem('hidayah_user');
      router.replace('/login');
    };

    if (Platform.OS === 'web') {
      // Alert.alert doesn't work in browsers — use native confirm
      if (window.confirm('Are you sure you want to logout?')) {
        doLogout();
      }
    } else {
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Logout', style: 'destructive', onPress: doLogout },
        ]
      );
    }
  };
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
        <View style={styles.profileImageContainer}>
          <View style={[styles.profileImage, { backgroundColor: colors.primary + '20', borderColor: colors.border }]}>
            <User size={40} color={colors.primary} />
          </View>
        </View>
        <Text style={[styles.userName, { color: colors.textPrimary }]}>
          {userName || 'Guest User'}
        </Text>
        <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
          {userEmail || 'Not logged in'}
        </Text>

        {/* reg number + class badges */}
        {(userRegNo || userClass) ? (
          <View style={styles.badgeRow}>
            {userRegNo ? (
              <View style={[styles.badge, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '40' }]}>
                <Hash size={12} color={colors.primary} />
                <Text style={[styles.badgeText, { color: colors.primary }]}>{userRegNo}</Text>
              </View>
            ) : null}
            {userClass ? (
              <View style={[styles.badge, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '40' }]}>
                <GraduationCap size={12} color={colors.primary} />
                <Text style={[styles.badgeText, { color: colors.primary }]}>{userClass}</Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: colors.primary }]}>0</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Days Active</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: colors.primary }]}>0</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Prayer Streak</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: colors.primary }]}>0</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Dhikr Count</Text>
        </View>
      </View>

      {/* Appearance */}
      <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>APPEARANCE</Text>
        
        <View style={styles.themeToggleContainer}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIcon, { backgroundColor: colors.background, borderColor: colors.border }]}>
              {theme === 'dark' ? (
                <Moon size={20} color={colors.primary} />
              ) : (
                <Sun size={20} color={colors.primary} />
              )}
            </View>
            <View>
              <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>Dark Mode</Text>
              <Text style={[styles.menuItemSubtext, { color: colors.textSecondary }]}>
                {theme === 'dark' ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
          </View>
          <Switch
            value={theme === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{ false: '#d1d5db', true: colors.primary }}
            thumbColor="#ffffff"
          />
        </View>
      </View>

      {/* Account */}
      <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ACCOUNT</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIcon, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Settings size={20} color={colors.primary} />
            </View>
            <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>Settings</Text>
          </View>
          <ChevronRight size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIcon, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Bell size={20} color={colors.primary} />
            </View>
            <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>Notifications</Text>
          </View>
          <ChevronRight size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIcon, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Heart size={20} color={colors.primary} />
            </View>
            <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>Favorites</Text>
          </View>
          <ChevronRight size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIcon, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <BookMarked size={20} color={colors.primary} />
            </View>
            <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>Bookmarks</Text>
          </View>
          <ChevronRight size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIcon, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Calendar size={20} color={colors.primary} />
            </View>
            <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>Prayer History</Text>
          </View>
          <ChevronRight size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: colors.cardBackground, borderColor: '#fee2e2' }]}
        onPress={handleLogout}
        activeOpacity={0.7}
      >
        <LogOut size={20} color="#ef4444" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>Hidayah v1.0.0</Text>
        <Text style={[styles.footerText, { color: colors.textSecondary, marginTop: 4 }]}>
          بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  profileImageContainer: { marginBottom: 16 },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  userName: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  userEmail: { fontSize: 15, marginBottom: 12 },
  badgeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeText: { fontSize: 12, fontWeight: '600' },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  statValue: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  statLabel: { fontSize: 12, textAlign: 'center' },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 12,
    marginTop: 8,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  themeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
  },
  menuItemText: { fontSize: 16, fontWeight: '500' },
  menuItemSubtext: { fontSize: 12, marginTop: 2 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  logoutText: { fontSize: 16, fontWeight: '600', color: '#ef4444' },
  footer: { alignItems: 'center', paddingBottom: 40 },
  footerText: { fontSize: 14 },
});