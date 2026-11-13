import { AppText as Text } from '../components/Typography';
﻿import { Link } from 'expo-router';
import { } from 'react-native';
import { Page, Card, ui } from '../components/DesignSystem';
import { useTheme } from '../contexts/ThemeContext';

export default function NotFoundScreen() {
  const { colors } = useTheme();
  return (
    <Page
      title="Let's find your way"
      subtitle="This page is no longer available."
    >
      <Card>
        <Text style={[ui.body, { color: colors.textSecondary }]}>
          Return home to continue your practice.
        </Text>
        <Link
          href="/"
          style={[ui.primaryButton, { color: colors.primary, fontSize: 17 }]}
        >
          Return home
        </Link>
      </Card>
    </Page>
  );
}
