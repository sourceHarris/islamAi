import React, { useState, useEffect } from 'react';
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
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';
import { API_BASE } from '../constants/config';

type Tab = 'login' | 'register';

// FastAPI can return detail as a string OR an array of validation objects.
function parseError(detail: any): string {
  if (!detail) return 'Something went wrong. Please try again.';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
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
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [regName, setRegName] = useState('');
  const [regRegNo, setRegRegNo] = useState('');
  const [regClass, setRegClass] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // ── Check backend is reachable ────────────────────────────────────────────
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch(`${API_BASE}/`, { method: 'GET' });
        setBackendOnline(res.ok);
      } catch {
        setBackendOnline(false);
      }
    };
    checkBackend();
  }, []);

  const saveSessionAndEnter = async (userData: object) => {
    await AsyncStorage.setItem('hidayah_user', JSON.stringify(userData));
    router.replace('/(tabs)');
  };

  const handleLogin = async () => {
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    if (backendOnline === false) {
      Alert.alert(
        '⚠️ Backend Offline',
        `Cannot reach the server at ${API_BASE}\n\nMake sure the backend is running:\n  cd backend\n  uvicorn main:app --host 0.0.0.0 --port 8000`,
        [{ text: 'OK' }]
      );
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
      const msg: string = e.message ?? '';
      if (msg.toLowerCase().includes('network') || msg.toLowerCase().includes('fetch')) {
        setError(`Cannot reach the server.\n\nMake sure the backend is running at:\n${API_BASE}`);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setError('Please fill in Name, Email and Password.');
      return;
    }
    if (regPassword.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }
    if (backendOnline === false) {
      Alert.alert(
        '⚠️ Backend Offline',
        `Cannot reach the server at ${API_BASE}\n\nMake sure the backend is running:\n  cd backend\n  uvicorn main:app --host 0.0.0.0 --port 8000`,
        [{ text: 'OK' }]
      );
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registration_number: regRegNo.trim() || null,
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
      const msg: string = e.message ?? '';
      if (msg.toLowerCase().includes('network') || msg.toLowerCase().includes('fetch')) {
        setError(`Cannot reach the server.\n\nMake sure the backend is running at:\n${API_BASE}`);
      } else {
        setError(msg);
      }
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

        {/* ── Backend status badge ── */}
        {backendOnline !== null && (
          <View style={[
            styles.statusBadge,
            { backgroundColor: backendOnline ? '#16a34a18' : '#ef444418', borderColor: backendOnline ? '#16a34a40' : '#ef444440' }
          ]}>
            <View style={[styles.statusDot, { backgroundColor: backendOnline ? '#16a34a' : '#ef4444' }]} />
            <Text style={[styles.statusText, { color: backendOnline ? '#16a34a' : '#ef4444' }]}>
              {backendOnline
                ? `Server connected (${API_BASE})`
                : `⚠️ Server offline — start the backend first!\n${API_BASE}`}
            </Text>
          </View>
        )}

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
              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: loading ? colors.border : colors.primary }]}
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
              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: loading ? colors.border : colors.primary }]}
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
  header: { alignItems: 'center', marginBottom: 24 },
  logo: { fontSize: 36, fontWeight: '800', marginBottom: 8 },
  subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20 },

  // Status badge
  statusBadge: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    borderRadius: 10, borderWidth: 1, padding: 10, marginBottom: 16,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  statusText: { fontSize: 12, flex: 1, lineHeight: 18 },

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

  // Error box (replaces bare red text)
  errorBox: {
    backgroundColor: '#fef2f2', borderColor: '#fecaca', borderWidth: 1,
    borderRadius: 10, padding: 12, marginTop: 4, marginBottom: 4,
  },
  errorText: { color: '#dc2626', fontSize: 13, lineHeight: 20 },

  btn: {
    borderRadius: 14, paddingVertical: 14,
    alignItems: 'center', marginTop: 8,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footer: { textAlign: 'center', marginTop: 32, fontSize: 16 },
});
