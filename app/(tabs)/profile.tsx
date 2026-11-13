import { APP_TITLE } from '../../constants/branding';
import { displayName } from '../../utils/displayName';
import { AppText as Text } from '../../components/Typography';
import React, { useCallback, useState } from 'react';
import { Alert, Platform, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BookOpen, BookHeart, Bookmark, CheckCheck, LogOut } from 'lucide-react-native';
import { Page, RouteRow, Section, ui } from '../../components/DesignSystem';
import { useTheme } from '../../contexts/ThemeContext';

export default function ProfileScreen() {
  const { colors } = useTheme(); const router = useRouter();
  const [error, setError] = useState('');
  const [user, setUser] = useState<{ name?: string; email?: string; registration_number?: string; class_name?: string }>({});
  useFocusEffect(useCallback(() => { let active = true; AsyncStorage.getItem('hidayah_user').then(value => { try { if (active) setUser(value ? { ...JSON.parse(value), name: displayName(JSON.parse(value).name) } : {}); } catch { if (active) setUser({}); } }); return () => { active = false; }; }, []));
  const logout = () => {
    const run = async () => { try { await AsyncStorage.removeItem('hidayah_user'); router.replace('/login'); } catch { setError('Sign out could not be completed. Please try again.'); } };
    if (Platform.OS === 'web') { if (window.confirm('Sign out of Hidayah?')) void run(); }
    else Alert.alert('Sign out of Hidayah?', 'Your saved practice history will stay on this device.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Sign out', onPress: run }]);
  };
  const initials = (user.name || 'H').split(' ').map(word => word[0]).slice(0, 2).join('');
  return <Page title="Profile" subtitle="">
    <View style={{ alignItems: 'center', gap: 12, paddingVertical: 16 }}><View style={{ width: 78, height: 78, borderRadius: 39, backgroundColor: colors.primary + '12', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: colors.primary, fontSize: 27, fontWeight: '400' }}>{initials}</Text></View><Text style={{ color: colors.textPrimary, fontSize: 23, fontWeight: '500', textAlign: 'center' }}>{user.name || 'Welcome to Hidayah'}</Text>{!!user.email && <Text selectable style={[ui.caption, { color: colors.textSecondary, textAlign: 'center' }]}>{user.email}</Text>}</View>
    <Section title="Your practice"><RouteRow title="Practice history" detail="Recorded days and reading" icon={CheckCheck} route="/(tabs)/tracker" /><RouteRow title="Reading library" detail="Quran, Hadith, and saved surahs" icon={BookOpen} route="/(tabs)/quran" /><RouteRow title="Du'a book" detail="Personal prayers" icon={BookHeart} route="/dua" /></Section>
    <RouteRow title="Saved AI replies" detail="Reflections saved on this device" icon={Bookmark} route="/saved-replies" />
    {!!error && <Text accessibilityRole="alert" style={[ui.body, { color: colors.danger }]}>{error}</Text>}
    <TouchableOpacity accessibilityRole="button" onPress={logout} style={{ minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 12 }}><LogOut size={19} color={colors.textSecondary} /><Text style={[ui.body, { color: colors.textPrimary }]}>Sign out</Text></TouchableOpacity>
    <Text style={[ui.caption, { color: colors.textSecondary, textAlign: 'center' }]}>{APP_TITLE}</Text>
  </Page>;
}
