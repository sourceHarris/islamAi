import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as NavigationBar from 'expo-navigation-bar';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

function ThemedApp() {
  const { colors, theme } = useTheme();
  const router = useRouter();
  const segments = useSegments();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync(String(colors.background));
      NavigationBar.setButtonStyleAsync(theme === 'dark' ? 'light' : 'dark');
    }
  }, [colors, theme]);

  // ── Auth gate: check if user is logged in ─────────────────────────────────
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const stored = await AsyncStorage.getItem('hidayah_user');
        const inAuthFlow = segments[0] === 'login';

        if (!stored && !inAuthFlow) {
          // Not logged in → send to login screen
          router.replace('/login');
        } else if (stored && inAuthFlow) {
          // Already logged in but on login page → send to app
          router.replace('/(tabs)');
        }
      } catch {
        router.replace('/login');
      } finally {
        setAuthChecked(true);
      }
    };
    checkAuth();
  }, []);

  if (!authChecked) return null; // Blank screen while checking — avoids flicker

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        style={theme === 'dark' ? 'light' : 'dark'}
      />

      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: 'transparent' },
        }}
      >
        <Stack.Screen name="login" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="swipecards" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen name="dhikr" options={{ headerShown: false }} />
        <Stack.Screen name="dua" options={{ headerShown: false }} />
        <Stack.Screen name="checklist" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <ThemedApp />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

