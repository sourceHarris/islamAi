// import { Stack } from 'expo-router';
// import { StatusBar } from 'expo-status-bar';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import { ThemeProvider } from '../contexts/ThemeContext';

// export default function RootLayout() {
//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <ThemeProvider>
//         <StatusBar style="light" />
//         <Stack
//           screenOptions={{
//             headerShown: false,
//             animation: 'slide_from_right',
//             contentStyle: { backgroundColor: 'transparent' },
//           }}
//         >
//           <Stack.Screen 
//             name="(tabs)" 
//             options={{ 
//               headerShown: false,
//             }} 
//           />
//           <Stack.Screen 
//             name="swipecards" 
//             options={{ 
//               headerShown: false,
//               presentation: 'card',
//             }} 
//           />
//           <Stack.Screen 
//             name="qibla" 
//             options={{ 
//               headerShown: false,
//             }} 
//           />
//           <Stack.Screen 
//             name="dhikr" 
//             options={{ 
//               headerShown: false,
//             }} 
//           />
//           <Stack.Screen 
//             name="dua" 
//             options={{ 
//               headerShown: false,
//             }} 
//           />
//           <Stack.Screen 
//             name="checklist" 
//             options={{ 
//               headerShown: false,
//             }} 
//           />
//         </Stack>
//       </ThemeProvider>
//     </GestureHandlerRootView>
//   );
// }

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as NavigationBar from 'expo-navigation-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';

function ThemedApp() {
  const { colors, theme } = useTheme();

  useEffect(() => {
    if (Platform.OS === 'android') {
      // ✅ Explicitly cast background color to string for TypeScript
      NavigationBar.setBackgroundColorAsync(String(colors.background));

      // ✅ Match navigation bar button color to theme
      NavigationBar.setButtonStyleAsync(theme === 'dark' ? 'light' : 'dark');
    }
  }, [colors, theme]);

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
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="swipecards" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen name="qibla" options={{ headerShown: false }} />
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
