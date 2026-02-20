import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useRouter } from 'expo-router';

import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/services/api-client';
import { GlassCard } from '@/components/ui/glass-card';
import { FontFamily, FontSize, Palette, Radius, Spacing } from '@/constants/theme';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

function extractErrorMessage(e: unknown, fallback: string): string {
  if (e instanceof ApiError) {
    const body = e.body as Record<string, unknown> | null;
    return (body?.detail as string) ?? (body?.message as string) ?? fallback;
  }
  if (e instanceof Error) return e.message;
  return fallback;
}

type AuthMode = 'login' | 'signup';

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { login, signup, socialAuth } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isLogin = mode === 'login';

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }
    if (!EMAIL_RE.test(trimmedEmail)) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }
    if (!isLogin && password.length < MIN_PASSWORD_LENGTH) {
      Alert.alert('Weak password', `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    setSubmitting(true);
    try {
      const res = isLogin
        ? await login({ email: trimmedEmail, password })
        : await signup({ email: trimmedEmail, password, name: name.trim() || undefined });
      router.push({
        pathname: '/verify-code',
        params: { session_id: res.session_id, email: trimmedEmail },
      });
    } catch (e: unknown) {
      Alert.alert('Error', extractErrorMessage(e, 'Something went wrong.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setSubmitting(true);
    try {
      await socialAuth({ provider: 'google', id_token: 'google-mock-token' });
    } catch (e: unknown) {
      Alert.alert('Error', extractErrorMessage(e, 'Google sign-in failed.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAppleSignIn = async () => {
    setSubmitting(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (credential.identityToken) {
        await socialAuth({ provider: 'apple', id_token: credential.identityToken });
      }
    } catch (e: unknown) {
      const err = e as { code?: string };
      if (err.code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('Error', extractErrorMessage(e, 'Apple sign-in failed.'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40, paddingTop: insets.top + 20 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header ─────────────────────────────────────────────────── */}
        <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
          <View style={[styles.iconCircle, { backgroundColor: Palette.indigo + '14' }]}>
            <Ionicons name="wallet" size={36} color={Palette.indigo} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            {isLogin ? 'Welcome back' : 'Create account'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {isLogin ? 'Sign in to continue' : 'Start tracking your finances'}
          </Text>
        </Animated.View>

        {/* ── Mode Toggle ────────────────────────────────────────────── */}
        <Animated.View entering={FadeInUp.delay(100).duration(400)} style={styles.section}>
          <GlassCard padding={6} radius={16}>
            <View style={styles.toggleRow}>
              <Pressable
                style={[styles.toggleBtn, isLogin && { backgroundColor: Palette.indigo + '20' }]}
                onPress={() => setMode('login')}
              >
                <Text style={[styles.toggleLabel, { color: isLogin ? Palette.indigo : colors.textMuted }]}>
                  Log In
                </Text>
              </Pressable>
              <Pressable
                style={[styles.toggleBtn, !isLogin && { backgroundColor: Palette.indigo + '20' }]}
                onPress={() => setMode('signup')}
              >
                <Text style={[styles.toggleLabel, { color: !isLogin ? Palette.indigo : colors.textMuted }]}>
                  Sign Up
                </Text>
              </Pressable>
            </View>
          </GlassCard>
        </Animated.View>

        {/* ── Form ───────────────────────────────────────────────────── */}
        <Animated.View entering={FadeInUp.delay(200).duration(400)} style={styles.section}>
          <GlassCard padding={20} radius={20}>
            {!isLogin && (
              <View style={styles.fieldWrap}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Name</Text>
                <View style={[styles.inputRow, { borderColor: colors.inputBorder, backgroundColor: colors.inputBg }]}>
                  <Ionicons name="person-outline" size={18} color={colors.textMuted} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    value={name}
                    onChangeText={setName}
                    placeholder="Your name"
                    placeholderTextColor={colors.placeholder}
                    autoCapitalize="words"
                    autoComplete="name"
                    accessibilityLabel="Name"
                  />
                </View>
              </View>
            )}

            <View style={styles.fieldWrap}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Email</Text>
              <View style={[styles.inputRow, { borderColor: colors.inputBorder, backgroundColor: colors.inputBg }]}>
                <Ionicons name="mail-outline" size={18} color={colors.textMuted} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.placeholder}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  accessibilityLabel="Email"
                />
              </View>
            </View>

            <View style={styles.fieldWrap}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Password</Text>
              <View style={[styles.inputRow, { borderColor: colors.inputBorder, backgroundColor: colors.inputBg }]}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Min. 6 characters"
                  placeholderTextColor={colors.placeholder}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  accessibilityLabel="Password"
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.textMuted}
                  />
                </Pressable>
              </View>
            </View>

            <Pressable
              style={[styles.primaryBtn, { backgroundColor: Palette.indigo, opacity: submitting ? 0.7 : 1 }]}
              onPress={handleSubmit}
              disabled={submitting}
              accessibilityLabel={isLogin ? 'Log in' : 'Sign up'}
              accessibilityRole="button"
            >
              <Text style={styles.primaryBtnText}>
                {submitting ? 'Please wait...' : isLogin ? 'Log In' : 'Sign Up'}
              </Text>
            </Pressable>
          </GlassCard>
        </Animated.View>

        {/* ── Divider ────────────────────────────────────────────────── */}
        <Animated.View entering={FadeInUp.delay(300).duration(400)} style={styles.dividerRow}>
          <View style={[styles.dividerLine, { backgroundColor: colors.separator }]} />
          <Text style={[styles.dividerText, { color: colors.textMuted }]}>or continue with</Text>
          <View style={[styles.dividerLine, { backgroundColor: colors.separator }]} />
        </Animated.View>

        {/* ── Social Buttons ─────────────────────────────────────────── */}
        <Animated.View entering={FadeInUp.delay(400).duration(400)} style={styles.section}>
          <View style={styles.socialRow}>
            <Pressable
              style={[styles.socialBtn, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
              onPress={handleGoogleSignIn}
              disabled={submitting}
              accessibilityLabel="Sign in with Google"
              accessibilityRole="button"
            >
              <Ionicons name="logo-google" size={20} color="#DB4437" />
              <Text style={[styles.socialBtnText, { color: colors.text }]}>Google</Text>
            </Pressable>

            {Platform.OS === 'ios' && (
              <Pressable
                style={[styles.socialBtn, { backgroundColor: '#000000', borderColor: '#000000' }]}
                onPress={handleAppleSignIn}
                disabled={submitting}
                accessibilityLabel="Sign in with Apple"
                accessibilityRole="button"
              >
                <Ionicons name="logo-apple" size={20} color="#FFFFFF" />
                <Text style={[styles.socialBtnText, { color: '#FFFFFF' }]}>Apple</Text>
              </Pressable>
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize['3xl'],
  },
  subtitle: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.md,
    marginTop: Spacing.xs,
  },
  section: {
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
  },
  // Toggle
  toggleRow: {
    flexDirection: 'row',
  },
  toggleBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  toggleLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.md,
  },
  // Form fields
  fieldWrap: {
    marginBottom: Spacing.lg,
  },
  fieldLabel: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    marginBottom: Spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    gap: 10,
  },
  input: {
    flex: 1,
    fontFamily: FontFamily.body,
    fontSize: FontSize.md,
    padding: 0,
  },
  // Primary button
  primaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: Radius.lg,
    marginTop: Spacing.sm,
    shadowColor: Palette.indigo,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryBtnText: {
    fontFamily: FontFamily.headingMedium,
    fontSize: FontSize.lg,
    color: '#FFFFFF',
  },
  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  dividerText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
  },
  // Social buttons
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: 8,
  },
  socialBtnText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.md,
  },
});
