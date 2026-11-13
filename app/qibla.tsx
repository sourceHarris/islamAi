import { AppText as Text } from '../components/Typography';
﻿import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import * as Location from 'expo-location';
import { Compass, Navigation2 as Navigation } from 'lucide-react-native';
import { Page, Card, ui } from '../components/DesignSystem';
import { useTheme } from '../contexts/ThemeContext';

export default function QiblaScreen() {
  const { colors } = useTheme();
  const [bearing, setBearing] = useState<number | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [coordinates, setCoordinates] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const subscription = useRef<Location.LocationSubscription | null>(null);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      subscription.current?.remove();
    };
  }, []);
  const locate = async () => {
    setLoading(true);
    setError('');
    subscription.current?.remove();
    setHeading(null);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        if (mounted.current)
          setError(
            'Allow location access in your device settings, then try again.',
          );
        return;
      }
      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      if (!mounted.current) return;
      const lat = (coords.latitude * Math.PI) / 180,
        targetLat = (21.4225 * Math.PI) / 180,
        delta = ((39.8262 - coords.longitude) * Math.PI) / 180;
      const direction =
        ((Math.atan2(
          Math.sin(delta) * Math.cos(targetLat),
          Math.cos(lat) * Math.sin(targetLat) -
            Math.sin(lat) * Math.cos(targetLat) * Math.cos(delta),
        ) *
          180) /
          Math.PI +
          360) %
        360;
      setBearing(direction);
      setCoordinates(
        `${coords.latitude.toFixed(3)}°, ${coords.longitude.toFixed(3)}°`,
      );
      if (Platform.OS !== 'web') {
        try {
          const watch = await Location.watchHeadingAsync((value) => {
            if (mounted.current)
              setHeading(value.trueHeading >= 0 ? value.trueHeading : null);
          });
          if (mounted.current) subscription.current = watch;
          else watch.remove();
        } catch {
          /* The true-north bearing remains usable without a heading sensor. */
        }
      }
    } catch {
      if (mounted.current)
        setError(
          'Your location could not be found. Check location services and try again.',
        );
    } finally {
      if (mounted.current) setLoading(false);
    }
  };
  return (
    <Page title="Qibla" subtitle="Direction to the Kaaba." back>
      <Card>
        <View style={{ alignItems: 'center', paddingVertical: 30, gap: 24 }}>
          <View
            style={{
              width: 200,
              height: 200,
              borderRadius: 100,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.background,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
            }}
          >
            <Text style={[ui.caption, { color: colors.textSecondary }]}>
              {heading === null ? 'N \u00b7 TRUE NORTH' : 'QIBLA'}
            </Text>
            {bearing === null ? (
              <Compass size={64} color={colors.primary} strokeWidth={1} />
            ) : (
              <Navigation
                accessibilityLabel="Direction toward the Kaaba"
                size={64}
                color={colors.primary}
                strokeWidth={1.5}
                style={{
                  transform: [{ rotate: `${bearing - (heading ?? 0)}deg` }],
                }}
              />
            )}
          </View>
          <Text
            accessibilityLiveRegion="polite"
            style={{
              color: colors.textPrimary,
              fontSize: 38,
              fontWeight: '600',
            }}
          >
            {bearing === null ? 'Your Qibla' : `${Math.round(bearing)}°`}
          </Text>
          <Text
            style={[
              ui.body,
              { color: colors.textSecondary, textAlign: 'center' },
            ]}
          >
            {bearing === null
              ? 'Use your location to calculate the direction to the Kaaba.'
              : heading === null
                ? 'Clockwise from true north. Use a compass to orient yourself.'
                : 'Turn until the arrow points straight ahead.'}
          </Text>
          {!!coordinates && (
            <Text style={[ui.caption, { color: colors.textSecondary }]}>
              {coordinates}
            </Text>
          )}
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          disabled={loading}
          onPress={locate}
          style={[
            ui.primaryButton,
            { backgroundColor: colors.primary, opacity: loading ? 0.6 : 1 },
          ]}
        >
          {loading ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <Text style={[ui.rowTitle, { color: colors.onPrimary }]}>
              {bearing === null ? 'Use my location' : 'Refresh location'}
            </Text>
          )}
        </TouchableOpacity>
        {!!error && (
          <Text
            accessibilityRole="alert"
            style={[ui.body, { color: colors.textSecondary }]}
          >
            {error}
          </Text>
        )}
      </Card>
      <Text style={[ui.caption, { color: colors.textSecondary }]}>
        Location is used on this device to calculate the bearing. Keep your
        device flat and away from metal. Compass readings depend on your
        device&apos;s sensors.
      </Text>
    </Page>
  );
}
