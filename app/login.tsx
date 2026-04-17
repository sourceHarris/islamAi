import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';

// ── API Backend URL ────────────────────────────────────────────────────────
// Physical phone on same WiFi → use PC's LAN IP
// Expo Web (browser on PC)   → use http://localhost:8001
const API_BASE = 'http://192.168.1.8:8001';

type Tab = 'login' | 'register';

// FastAPI can return detail as a string OR an array of validation objects.
// This helper always gives back a plain readable string.
function parseError(detail: any): string {
  if (!detail) return 'Something went wrong. Please try again.';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    // Pydantic validation error: [{loc, msg, type}, ...]
    return detail.map((e: any) => {
      const field = e.loc ? e.loc[e.loc.length - 1] : '';
      return field ? `${field}: ${e.msg}` : e.msg;
    }).join('\n');
  }
  return JSON.stringify(detail);
}

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [tab, setTab] = useState<Tab>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [regName, setRegName] = useState('');
  const [regRegNo, setRegRegNo] = useState('');
  const [regClass, setRegClass] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const saveSessionAndEnter = async (userData: object) => {
    await AsyncStorage.setItem('hidayah_user', JSON.stringify(userData));
    router.replace('/(tabs)');
  };

  const handleLogin = async () => {
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail.trim().toLowerCase(),
          password: loginPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(parseError(data.detail));
      await saveSessionAndEnter(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setError('Please fill in Name, Email and Password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registration_number: regRegNo.trim() || null,   // optional — backend auto-generates
          name: regName.trim(),
          class_name: regClass.trim() || null,
          email: regEmail.trim().toLowerCase(),
          password: regPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(parseError(data.detail));
      await saveSessionAndEnter(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={[styles.logo, { color: colors.primary }]}>🕌 Hidayah</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Your Islamic Spiritual Wellness Companion
          </Text>
        </View>

        {/* ── Tab switcher ── */}
        <View style={[styles.tabBar, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.tab, tab === 'login' && { backgroundColor: colors.primary }]}
            onPress={() => { setTab('login'); setError(''); }}>
            <Text style={[styles.tabText, { color: tab === 'login' ? '#fff' : colors.textSecondary }]}>
              Login
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === 'register' && { backgroundColor: colors.primary }]}
            onPress={() => { setTab('register'); setError(''); }}>
            <Text style={[styles.tabText, { color: tab === 'register' ? '#fff' : colors.textSecondary }]}>
              Register
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Form Card ── */}
        <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          {tab === 'login' ? (
            <>
              <Text style={[styles.formTitle, { color: colors.textPrimary }]}>Welcome Back</Text>
              <Field label="Email" value={loginEmail} onChange={setLoginEmail}
                placeholder="your@email.com" colors={colors} keyboard="email-address" />
              <Field label="Password" value={loginPassword} onChange={setLoginPassword}
                placeholder="Your password" secure colors={colors} />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: colors.primary }]}
                onPress={handleLogin} disabled={loading}>
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.btnText}>Login</Text>}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={[styles.formTitle, { color: colors.textPrimary }]}>Create Account</Text>
              <Field label="Full Name *" value={regName} onChange={setRegName}
                placeholder="Your full name" colors={colors} autoCapitalize="words" />
              <Field label="Email *" value={regEmail} onChange={setRegEmail}
                placeholder="your@email.com" colors={colors} keyboard="email-address" />
              <Field label="Password *" value={regPassword} onChange={setRegPassword}
                placeholder="Minimum 4 characters" secure colors={colors} />
              <Field label="Registration Number (optional)" value={regRegNo} onChange={setRegRegNo}
                placeholder="e.g. SE120222032" colors={colors} autoCapitalize="characters" />
              <Field label="Class (optional)" value={regClass} onChange={setRegClass}
                placeholder="e.g. BSSE-6A" colors={colors} />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: colors.primary }]}
                onPress={handleRegister} disabled={loading}>
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.btnText}>Create Account</Text>}
              </TouchableOpacity>
            </>
          )}
        </View>

        <Text style={[styles.footer, { color: colors.textSecondary }]}>
          بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ── Reusable field component ─────────────────────────────────────────────────
function Field({
  label, value, onChange, placeholder, secure = false, colors, keyboard = 'default', autoCapitalize = 'none'
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder: string; secure?: boolean; colors: any;
  keyboard?: any; autoCapitalize?: any;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        secureTextEntry={secure}
        keyboardType={keyboard}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24, paddingTop: 60 },
  header: { alignItems: 'center', marginBottom: 32 },
  logo: { fontSize: 36, fontWeight: '800', marginBottom: 8 },
  subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  tabBar: {
    flexDirection: 'row', borderRadius: 12, borderWidth: 1,
    overflow: 'hidden', marginBottom: 20,
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
  tabText: { fontSize: 15, fontWeight: '600' },
  card: {
    borderRadius: 20, borderWidth: 1, padding: 24, gap: 4,
  },
  formTitle: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  fieldGroup: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: {
    borderWidth: 1, borderRadius: 12, paddingHorizontal: 16,
    paddingVertical: 12, fontSize: 15,
  },
  error: { color: '#ef4444', fontSize: 13, marginTop: 4, marginBottom: 4 },
  btn: {
    borderRadius: 14, paddingVertical: 14,
    alignItems: 'center', marginTop: 8,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footer: { textAlign: 'center', marginTop: 32, fontSize: 16 },
});
