import React, { useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  Platform,
  StyleSheet,
  View,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';

export function AppBackdrop() {
  const { colors } = useTheme();
  return <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]} />;
}

// A cross-platform approximation of the floating glass control layer.
// Android keeps a translucent fill; iOS/web add backdrop blur.
export function GlassSurface({
  children,
  style,
  appearance,
}: {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  appearance?: 'light' | 'dark';
}) {
  const { theme, colors } = useTheme();
  const [opaque, setOpaque] = useState(Platform.OS === 'android');
  useEffect(() => {
    if (Platform.OS === 'web') {
      const media = [
        '(prefers-reduced-transparency: reduce)',
        '(prefers-contrast: more)',
        '(forced-colors: active)',
        '(prefers-reduced-motion: reduce)',
      ].map((query) => window.matchMedia(query));
      const update = () => setOpaque(media.some((query) => query.matches));
      update();
      media.forEach((query) => query.addEventListener('change', update));
      return () =>
        media.forEach((query) => query.removeEventListener('change', update));
    }
    if (Platform.OS === 'android') {
      setOpaque(true);
      return;
    }
    let mounted = true;
    const update = async () => {
      const [transparency, motion] = await Promise.all([
        AccessibilityInfo.isReduceTransparencyEnabled(),
        AccessibilityInfo.isReduceMotionEnabled(),
      ]);
      if (mounted)
        setOpaque(Platform.OS === 'android' || transparency || motion);
    };
    void update();
    const subscription = AccessibilityInfo.addEventListener(
      'reduceTransparencyChanged',
      () => void update(),
    );
    const motionSubscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      () => void update(),
    );
    return () => {
      mounted = false;
      subscription.remove();
      motionSubscription.remove();
    };
  }, []);
  const dark = (appearance ?? theme) === 'dark';
  return (
    <View
      style={[
        {
          borderRadius: 28,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: opaque
            ? appearance === 'dark'
              ? '#163331'
              : colors.cardBackground
            : dark
              ? '#0A1512EB'
              : '#F1FCF7EB',
        },
        style,
        opaque && {
          backgroundColor:
            appearance === 'dark' ? '#163331' : colors.cardBackground,
        },
      ]}
    >
      {!opaque && (
        <BlurView
          intensity={65}
          tint={dark ? 'systemChromeMaterialDark' : 'systemChromeMaterialLight'}
          style={StyleSheet.absoluteFill}
        />
      )}
      <LinearGradient
        pointerEvents="none"
        colors={
          dark
            ? ['#FFFFFF00', '#FFFFFF00', '#FFFFFF00']
            : ['#FFFFFF00', '#FFFFFF00', '#FFFFFF00']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {React.Children.map(children, (child) => {
        if (!React.isValidElement<{ style?: StyleProp<ViewStyle> }>(child))
          return child;
        return React.cloneElement(child, {
          style: [child.props.style, { position: 'relative', zIndex: 1 }],
        });
      })}
    </View>
  );
}
