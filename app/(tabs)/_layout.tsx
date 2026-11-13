import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { View, useWindowDimensions } from 'react-native';
import { useTheme, fonts } from '../../contexts/ThemeContext';
import { GlassSurface } from '../../components/Glass';

export default function TabLayout() {
  const { colors, theme } = useTheme(); const insets = useSafeAreaInsets(); const { fontScale } = useWindowDimensions();
  const height = 80 + insets.bottom + (fontScale > 1.3 ? 14 : 0);
  return <Tabs screenOptions={{
    headerShown: false, tabBarHideOnKeyboard: true,
    tabBarStyle: { position: 'absolute', bottom: 0, height, paddingTop: 8, paddingBottom: Math.max(insets.bottom, 8), borderTopWidth: 0, backgroundColor: 'transparent', elevation: 0 },
    tabBarBackground: () => <GlassSurface style={{ flex: 1, borderRadius: 0, borderWidth: 0, borderTopWidth: 1 }} />,
    tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.textSecondary,
    tabBarItemStyle: { paddingVertical: 4 }, tabBarLabelStyle: { fontFamily: fonts.body, fontSize: 11, marginTop: 4 },
    tabBarLabelPosition: 'below-icon',
  }}>
    <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color }) => <MaterialCommunityIcons name="mosque-outline" size={24} color={color} /> }} />
    <Tabs.Screen name="quran" options={{ title: 'Quran', tabBarIcon: ({ color }) => <MaterialCommunityIcons name="book-open-page-variant-outline" size={24} color={color} /> }} />
    <Tabs.Screen name="chatbot" options={{ title: 'Ask', tabBarIcon: () => <View style={{ width: 56, height: 56, marginTop: -20, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: theme === 'dark' ? '#34D399' : colors.hero, borderWidth: 1.5, borderColor: colors.gold }}><MaterialIcons name="auto-awesome" size={28} color={theme === 'dark' ? colors.onPrimary : '#E9C176'} /></View> }} />
    <Tabs.Screen name="tracker" options={{ title: 'Tracker', tabBarIcon: ({ color }) => <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={24} color={color} /> }} />
    <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account-outline" size={24} color={color} /> }} />
  </Tabs>;
}
