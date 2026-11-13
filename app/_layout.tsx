import { useFonts } from 'expo-font';
import { useReducedMotion } from 'react-native-reanimated';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as NavigationBar from 'expo-navigation-bar';
import { useEffect, useState } from 'react';
import { Platform, ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Head from 'expo-router/head';
import { APP_TITLE } from '../constants/branding';

function ThemedApp() {
  const { colors, theme } = useTheme();
  const reduceMotion = useReducedMotion();
  const router = useRouter();
  const segments = useSegments();
  const [authChecked, setAuthChecked] = useState(false);
  useEffect(() => {
    if (Platform.OS === 'web') document.documentElement.style.colorScheme = 'light';
  }, []);

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync(String(colors.background));
      NavigationBar.setButtonStyleAsync(theme === 'dark' ? 'light' : 'dark');
    }
  }, [colors, theme]);

  // ── Auth gate: re-evaluates on every route change ─────────────────────────
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
  }, [segments, router]); // ← runs on every segment/route change, not just mount

  if (!authChecked) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <Head>
        <title>{APP_TITLE}</title>
        <meta name="color-scheme" content="light" />
        <meta name="theme-color" content={colors.background} />
        <link rel="icon" type="image/svg+xml" href="/hidayah-favicon.svg?v=2.0" />
      </Head>
      <StatusBar
        translucent
        backgroundColor="transparent"
        style={theme === 'dark' ? 'light' : 'dark'}
      />

      <Stack
        screenOptions={{
          headerShown: false,
          animation: reduceMotion ? 'none' : 'slide_from_right',
          contentStyle: { backgroundColor: 'transparent' },
        }}
      >
        <Stack.Screen
          name="login"
          options={{
            headerShown: false,
            animation: reduceMotion ? 'none' : 'fade',
          }}
        />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="swipecards"
          options={{ headerShown: false, presentation: 'card' }}
        />
        <Stack.Screen name="dhikr" options={{ headerShown: false }} />
        <Stack.Screen name="dua" options={{ headerShown: false }} />
        <Stack.Screen name="checklist" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Jakarta: require('../assets/fonts/PlusJakartaSans.ttf'), Garamond: require('../assets/fonts/EBGaramond.ttf'), GaramondItalic: require('../assets/fonts/EBGaramond-Italic.ttf'), Amiri: require('../assets/fonts/Amiri-Regular.ttf') });
  if (!fontsLoaded && !fontError) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator accessibilityLabel="Loading Hidayah" /></View>;
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
