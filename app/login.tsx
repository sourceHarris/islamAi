import React, { useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TextInputProps, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRight, BookOpen, Check, CircleAlert, Eye, EyeOff, Heart, LockKeyhole, Mail, Sparkles, UserRound } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path } from 'react-native-svg';
import { AppText as Text } from '../components/Typography';
import { HidayahMark } from '../components/HidayahMark';
import { useTheme, fonts } from '../contexts/ThemeContext';
import { APP_NAME, APP_VERSION } from '../constants/branding';
import { API_BASE } from '../constants/config';
import { fetchWithTimeout } from '../utils/fetchWithTimeout';

type Tab = 'login' | 'register';
function parseError(detail: unknown): string {
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map(e => e?.msg || 'Check your details.').join('\n');
  return 'Your request could not be completed. Please try again.';
}
function requestError(error: unknown): string {
  const message = error instanceof Error ? error.message : '';
  return /network|fetch/i.test(message) ? 'The login server could not be reached. Make sure the backend is running, then try again.'
    : message || 'Your request could not be completed. Please try again.';
}

export default function LoginScreen() {
  const { colors } = useTheme(), insets = useSafeAreaInsets(), { width } = useWindowDimensions();
  const router = useRouter(), busy = useRef(false);
  const [tab, setTab] = useState<Tab>('login'), [loading, setLoading] = useState(false), [error, setError] = useState('');
  const [loginEmail, setLoginEmail] = useState(''), [loginPassword, setLoginPassword] = useState('');
  const [name, setName] = useState(''), [email, setEmail] = useState('');
  const [password, setPassword] = useState(''), [confirmation, setConfirmation] = useState('');
  const loginPasswordInput = useRef<TextInput>(null), emailInput = useRef<TextInput>(null);
  const passwordInput = useRef<TextInput>(null), confirmationInput = useRef<TextInput>(null);
  const wide = width >= 900, register = tab === 'register';
  const change = (setter: (value: string) => void) => (value: string) => { setter(value); setError(''); };
  const submit = async () => {
    if (busy.current) return;
    if (register) {
      if (!name.trim() || !email.trim() || !password || !confirmation) { setError('Please complete all four fields.'); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError('Enter a valid email address.'); emailInput.current?.focus(); return; }
      if (password.length < 4) { setError('Password must be at least 4 characters.'); passwordInput.current?.focus(); return; }
      if (password !== confirmation) { setError('Passwords do not match. Please confirm your password.'); confirmationInput.current?.focus(); return; }
    } else if (!loginEmail.trim() || !loginPassword) { setError('Please enter your email and password.'); return; }
    busy.current = true; setLoading(true); setError('');
    try {
      const payload = register ? { name: name.trim(), email: email.trim().toLowerCase(), password }
        : { email: loginEmail.trim().toLowerCase(), password: loginPassword };
      const response = await fetchWithTimeout(API_BASE + (register ? '/register' : '/login'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(parseError(data.detail));
      if (!data || typeof data.name !== 'string' || typeof data.email !== 'string') throw new Error('Your session could not be loaded. Please try again.');
      await AsyncStorage.setItem('hidayah_user', JSON.stringify(data));
      router.replace('/(tabs)');
    } catch (cause) { setError(requestError(cause)); }
    finally { busy.current = false; setLoading(false); }
  };
  return <KeyboardAvoidingView style={[s.screen, { backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[s.scroll, wide && s.scrollWide]}>
      <View style={[s.shell, wide && s.shellWide]}>
        <View style={[s.introduction, wide && s.introductionWide]}>
          <View style={[s.wordmark, wide && { justifyContent: 'flex-start' }]}><HidayahMark size={46} /><View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Text style={[s.brand, { color: colors.primary }]}>{APP_NAME}</Text><Text style={[s.version, { color: colors.gold, backgroundColor: colors.goldSurface }]}>{APP_VERSION}</Text></View></View>
          <View style={[s.introCopy, !wide && { display: 'none' }]}>
            <View style={{ gap: 22 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}><View style={{ width: 26, height: 1, backgroundColor: colors.gold }} /><Text style={[s.eyebrow, { color: colors.gold }]}>A SPACE FOR YOUR HEART</Text></View>
              <Text style={[s.heroTitle, { color: colors.primary }]}>A little closer,{ '\n' }every day.</Text>
              <Text style={[s.heroDescription, { color: colors.textSecondary }]}>Return to the Quran. Find comfort in remembrance. Make room for a moment of reflection.</Text>
            </View>
            <View style={{ gap: 18 }}>
              <Text lang="ar" style={[s.basmala, { color: colors.primary }]}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20 }}>{[[BookOpen, 'Quran & Sunnah'], [Heart, 'Daily reflection']].map(([Icon, label]) => { const Symbol = Icon as typeof BookOpen; return <View key={String(label)} style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}><Symbol size={16} color={colors.gold} /><Text style={[s.small, { color: colors.textSecondary }]}>{String(label)}</Text></View>; })}</View>
            </View>
          </View>
          {!wide && <Text style={[s.mobileTagline, { color: colors.textSecondary }]}>A little closer, every day.</Text>}
        </View>

        <View style={[s.formColumn, wide && { maxWidth: 460 }]}>
          <View style={[s.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <View pointerEvents="none" style={s.cardDecoration}><Svg width={132} height={132} viewBox="0 0 100 100" accessible={false}><Path d="M50 0L61.8 38.2L100 50L61.8 61.8L50 100L38.2 61.8L0 50L38.2 38.2Z" fill={colors.primary} opacity={0.04} /></Svg></View>
            <View style={{ gap: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}><Sparkles size={15} color={colors.gold} /><Text style={[s.eyebrow, { color: colors.gold }]}>YOUR DAILY SANCTUARY</Text></View>
              <Text accessibilityRole="header" style={[s.formTitle, { color: colors.primary }]}>{register ? 'Begin your journey' : 'Welcome back'}</Text>
              <Text style={[s.description, { color: colors.textSecondary }]}>{register ? 'Create a space for prayer, reflection, and a little more peace.' : 'A quiet moment awaits. Sign in to continue your journey.'}</Text>
            </View>
            <View accessibilityRole="tablist" accessibilityLabel="Account access" style={[s.tabs, { backgroundColor: colors.surface }]}>
              {(['login', 'register'] as const).map(value => <TouchableOpacity key={value} accessibilityRole="tab" accessibilityLabel={value === 'login' ? 'Login tab' : 'Register tab'} accessibilityState={{ selected: tab === value, disabled: loading }} disabled={loading} onPress={() => { setTab(value); setError(''); }} style={[s.tab, tab === value && { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                <Text style={[s.tabText, { color: tab === value ? colors.primary : colors.textSecondary }]}>{value === 'login' ? 'Login' : 'Register'}</Text>
              </TouchableOpacity>)}
            </View>
            <View style={{ gap: 17 }}>
              {register ? <>
                <Field key="name" label="Full name" value={name} onChange={change(setName)} placeholder="Your name" icon={UserRound} autoCapitalize="words" autoComplete="name" textContentType="name" editable={!loading} onSubmit={() => emailInput.current?.focus()} />
                <Field key="register-email" label="Email" inputRef={emailInput} value={email} onChange={change(setEmail)} placeholder="you@example.com" icon={Mail} keyboardType="email-address" autoComplete="email" textContentType="emailAddress" editable={!loading} onSubmit={() => passwordInput.current?.focus()} />
                <Field key="register-password" label="Password" inputRef={passwordInput} value={password} onChange={change(setPassword)} placeholder="Create a password" hint="At least 4 characters" icon={LockKeyhole} secure autoComplete="new-password" textContentType="newPassword" editable={!loading} onSubmit={() => confirmationInput.current?.focus()} />
                <Field key="confirmation" label="Confirm password" inputRef={confirmationInput} value={confirmation} onChange={change(setConfirmation)} placeholder="Enter your password again" icon={LockKeyhole} secure autoComplete="new-password" textContentType="newPassword" editable={!loading} onSubmit={() => void submit()} last />
                {!!password && !!confirmation && password === confirmation && <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><Check size={15} color={colors.primary} /><Text style={[s.small, { color: colors.primary }]}>Passwords match</Text></View>}
              </> : <>
                <Field key="login-email" label="Email" value={loginEmail} onChange={change(setLoginEmail)} placeholder="you@example.com" icon={Mail} keyboardType="email-address" autoComplete="email" textContentType="username" editable={!loading} onSubmit={() => loginPasswordInput.current?.focus()} />
                <Field key="login-password" label="Password" inputRef={loginPasswordInput} value={loginPassword} onChange={change(setLoginPassword)} placeholder="Your password" icon={LockKeyhole} secure autoComplete="current-password" textContentType="password" editable={!loading} onSubmit={() => void submit()} last />
              </>}
            </View>
            {!!error && <View accessibilityRole="alert" accessibilityLiveRegion="polite" style={[s.error, { backgroundColor: colors.dangerSurface, borderColor: colors.danger + '30' }]}><CircleAlert size={17} color={colors.danger} /><Text style={[s.errorText, { color: colors.danger }]}>{error}</Text></View>}
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={register ? 'Create account' : 'Login'} accessibilityState={{ disabled: loading, busy: loading }} disabled={loading} onPress={() => void submit()} style={[s.submit, { backgroundColor: colors.primary, opacity: loading ? .7 : 1 }]}>
              {loading ? <ActivityIndicator color={colors.onPrimary} /> : <><Text style={[s.submitText, { color: colors.onPrimary }]}>{register ? 'Create account' : 'Login'}</Text><ArrowRight size={19} color={colors.onPrimary} /></>}
            </TouchableOpacity>
            <Text style={[s.formNote, { color: colors.textSecondary }]}>{register ? 'Start with your name and email. Your journey is your own.' : 'Quran, remembrance, and reflection — all in one place.'}</Text>
          </View>
          <View style={s.footer}><View style={{ width: 28, height: 1, backgroundColor: colors.border }} /><Text style={[s.footerText, { color: colors.gold }]}>WITH EVERY STEP, A LITTLE CLOSER</Text><View style={{ width: 28, height: 1, backgroundColor: colors.border }} /></View>
        </View>
      </View>
    </ScrollView>
  </KeyboardAvoidingView>;
}

type FieldProps = Pick<TextInputProps, 'autoComplete' | 'textContentType' | 'autoCapitalize' | 'keyboardType' | 'editable'> & {
  label: string; value: string; onChange: (value: string) => void; placeholder: string;
  icon: typeof Mail; secure?: boolean; hint?: string; last?: boolean; inputRef?: React.RefObject<TextInput | null>; onSubmit: () => void;
};
function Field({ label, value, onChange, placeholder, icon: Icon, secure = false, hint, last, inputRef, onSubmit, ...props }: FieldProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false), [visible, setVisible] = useState(false);
  return <View style={{ gap: 7 }}>
    <Text style={[s.label, { color: colors.textPrimary }]}>{label}</Text>
    <View style={[s.field, { backgroundColor: focused ? colors.cardBackground : '#F7FBF8', borderColor: focused ? colors.primary : colors.border }]}>
      <Icon size={18} strokeWidth={1.5} color={focused ? colors.primary : colors.secondary} />
      <TextInput ref={inputRef} accessibilityLabel={label} accessibilityHint={hint} value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={colors.textSecondary}
        secureTextEntry={secure && !visible} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={[s.input, { color: colors.textPrimary }]} autoCapitalize="none" autoCorrect={false} spellCheck={false} importantForAutofill="yes"
        returnKeyType={last ? 'go' : 'next'} onSubmitEditing={onSubmit} blurOnSubmit={!!last} {...props} />
      {secure && <TouchableOpacity accessibilityRole="button" accessibilityLabel={(visible ? 'Hide ' : 'Show ') + label.toLowerCase()} onPress={() => setVisible(v => !v)} disabled={props.editable === false} style={s.eye}>{visible ? <EyeOff size={18} strokeWidth={1.5} color={colors.secondary} /> : <Eye size={18} strokeWidth={1.5} color={colors.secondary} />}</TouchableOpacity>}
    </View>
    {!!hint && <Text style={[s.hint, { color: colors.textSecondary }]}>{hint}</Text>}
  </View>;
}
const s = StyleSheet.create({
  screen: { flex: 1 }, scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 32 }, scrollWide: { paddingHorizontal: 48, paddingVertical: 52 },
  shell: { width: '100%', maxWidth: 460, alignSelf: 'center', gap: 26 }, shellWide: { maxWidth: 1040, flexDirection: 'row', alignItems: 'center', gap: 72 },
  introduction: { alignItems: 'center', gap: 12 }, introductionWide: { flex: 1, alignItems: 'flex-start', gap: 60 }, wordmark: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  brand: { fontFamily: fonts.display, fontSize: 34, lineHeight: 42, fontWeight: '600', letterSpacing: -.5 }, version: { fontFamily: fonts.body, fontSize: 11, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  mobileTagline: { fontFamily: fonts.body, fontSize: 13, lineHeight: 20 }, introCopy: { gap: 48 }, heroTitle: { fontFamily: fonts.display, fontSize: 62, lineHeight: 64, letterSpacing: -1.5 },
  heroDescription: { fontFamily: fonts.body, fontSize: 16, lineHeight: 28, maxWidth: 380 }, basmala: { fontFamily: fonts.arabic, fontSize: 27, lineHeight: 52, writingDirection: 'rtl', textAlign: 'left' },
  formColumn: { flex: 1, width: '100%' }, card: { borderWidth: 1, borderRadius: 24, padding: 24, gap: 24, overflow: 'hidden', shadowColor: '#134E3A', shadowOffset: { width: 0, height: 8 }, shadowOpacity: .04, shadowRadius: 28 },
  cardDecoration: { position: 'absolute', top: -36, right: -42 }, eyebrow: { fontFamily: fonts.body, fontSize: 11, lineHeight: 16, fontWeight: '600', letterSpacing: 1.3 },
  formTitle: { fontFamily: fonts.display, fontSize: 36, lineHeight: 42, letterSpacing: -.5, fontWeight: '500' }, description: { fontFamily: fonts.body, fontSize: 13, lineHeight: 21, maxWidth: 340 },
  tabs: { flexDirection: 'row', padding: 4, borderRadius: 12, gap: 4 }, tab: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 9, borderWidth: 1, borderColor: 'transparent' },
  tabText: { fontFamily: fonts.body, fontSize: 13, fontWeight: '600' }, label: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19, fontWeight: '500' },
  field: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 11, paddingLeft: 14, paddingRight: 4 }, input: { flex: 1, minWidth: 0, minHeight: 50, paddingVertical: 12, fontFamily: fonts.body, fontSize: 14 },
  eye: { width: 44, height: 46, alignItems: 'center', justifyContent: 'center' }, hint: { fontFamily: fonts.body, fontSize: 11, lineHeight: 16 },
  small: { fontFamily: fonts.body, fontSize: 12, lineHeight: 18 }, error: { padding: 12, flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderWidth: 1, borderRadius: 10 }, errorText: { fontFamily: fonts.body, fontSize: 12, lineHeight: 19, flex: 1 },
  submit: { flexDirection: 'row', gap: 10, minHeight: 52, borderRadius: 13, justifyContent: 'center', alignItems: 'center' }, submitText: { fontFamily: fonts.body, fontSize: 14, lineHeight: 22, fontWeight: '600' },
  formNote: { fontFamily: fonts.body, fontSize: 11, lineHeight: 18, textAlign: 'center' }, footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, paddingTop: 22 },
  footerText: { fontFamily: fonts.body, fontSize: 11, lineHeight: 17, letterSpacing: .5, textAlign: 'center', flexShrink: 1 },
});
