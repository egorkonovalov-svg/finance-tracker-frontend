import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { useTheme } from '@/context/ThemeContext';
import { useApp } from '@/context/AppContext';
import { GlassCard } from '@/components/ui/glass-card';
import { FontFamily, FontSize, Palette, Radius, Spacing } from '@/constants/theme';
import type { SupportedCurrency } from '@/types';

const CURRENCIES: { value: SupportedCurrency; label: string; symbol: string }[] = [
  { value: 'USD', label: 'US Dollar', symbol: '$' },
  { value: 'EUR', label: 'Euro', symbol: '€' },
  { value: 'RUB', label: 'Russian Ruble', symbol: '₽' },
  { value: 'GBP', label: 'British Pound', symbol: '£' },
  { value: 'JPY', label: 'Japanese Yen', symbol: '¥' },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isDark, mode, setMode, colors } = useTheme();
  const { currency, setCurrency } = useApp();
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 120, paddingTop: insets.top }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      <Animated.View entering={FadeInUp.duration(400)} style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
      </Animated.View>

      {/* ── Appearance ─────────────────────────────────────────────── */}
      <Animated.View entering={FadeInUp.delay(100).duration(400)} style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>APPEARANCE</Text>
        <GlassCard padding={0} radius={16}>
          {/* Dark mode toggle */}
          <View style={[styles.row, { borderBottomColor: colors.separator }]}>
            <Ionicons name={isDark ? 'moon' : 'sunny'} size={20} color={colors.primary} />
            <Text style={[styles.rowLabel, { color: colors.text }]}>Dark Mode</Text>
            <Switch
              value={isDark}
              onValueChange={() => setMode(isDark ? 'light' : 'dark')}
              trackColor={{ false: colors.inputBg, true: Palette.indigo + '60' }}
              thumbColor={isDark ? Palette.indigoLight : '#FFF'}
              accessibilityLabel="Toggle dark mode"
            />
          </View>

          {/* Theme mode selector */}
          <View style={styles.themeModes}>
            {(['light', 'dark', 'system'] as const).map((m) => {
              const active = mode === m;
              const icon = m === 'light' ? 'sunny-outline' : m === 'dark' ? 'moon-outline' : 'phone-portrait-outline';
              return (
                <Pressable
                  key={m}
                  style={[styles.themeModeBtn, { backgroundColor: active ? colors.primary + '15' : 'transparent', borderColor: active ? colors.primary : colors.inputBorder }]}
                  onPress={() => setMode(m)}
                >
                  <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={16} color={active ? colors.primary : colors.textMuted} />
                  <Text style={[styles.themeModeLabel, { color: active ? colors.primary : colors.textSecondary }]}>
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </GlassCard>
      </Animated.View>

      {/* ── Currency ───────────────────────────────────────────────── */}
      <Animated.View entering={FadeInUp.delay(200).duration(400)} style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>CURRENCY</Text>
        <GlassCard padding={0} radius={16}>
          <Pressable style={[styles.row, { borderBottomColor: colors.separator }]} onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}>
            <Ionicons name="wallet-outline" size={20} color={colors.primary} />
            <Text style={[styles.rowLabel, { color: colors.text }]}>Currency</Text>
            <Text style={[styles.rowValue, { color: colors.textSecondary }]}>
              {CURRENCIES.find((c) => c.value === currency)?.symbol} {currency}
            </Text>
            <Ionicons name={showCurrencyPicker ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
          </Pressable>

          {showCurrencyPicker &&
            CURRENCIES.map((cur) => (
              <Pressable
                key={cur.value}
                style={[styles.currencyOption, { backgroundColor: currency === cur.value ? colors.primary + '10' : 'transparent' }]}
                onPress={() => { setCurrency(cur.value); setShowCurrencyPicker(false); }}
              >
                <Text style={[styles.currencySymbol, { color: currency === cur.value ? colors.primary : colors.textMuted }]}>
                  {cur.symbol}
                </Text>
                <Text style={[styles.currencyLabel, { color: colors.text }]}>{cur.label}</Text>
                {currency === cur.value && <Ionicons name="checkmark" size={18} color={colors.primary} />}
              </Pressable>
            ))
          }
        </GlassCard>
      </Animated.View>

      {/* ── Categories ─────────────────────────────────────────────── */}
      <Animated.View entering={FadeInUp.delay(300).duration(400)} style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>DATA</Text>
        <GlassCard padding={0} radius={16}>
          <Pressable
            style={[styles.row, { borderBottomColor: colors.separator }]}
            onPress={() => router.push('/categories')}
          >
            <Ionicons name="grid-outline" size={20} color={colors.primary} />
            <Text style={[styles.rowLabel, { color: colors.text }]}>Manage Categories</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </Pressable>
        </GlassCard>
      </Animated.View>

      {/* ── About ──────────────────────────────────────────────────── */}
      <Animated.View entering={FadeInUp.delay(400).duration(400)} style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ABOUT</Text>
        <GlassCard padding={16} radius={16}>
          <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
            FinTrack v1.0.0
          </Text>
          <Text style={[styles.aboutText, { color: colors.textMuted, marginTop: 4 }]}>
            Personal finance tracking app
          </Text>
        </GlassCard>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize['3xl'],
  },
  section: {
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
  },
  sectionTitle: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: {
    flex: 1,
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.md,
  },
  rowValue: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.md,
    marginRight: 4,
  },
  themeModes: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  themeModeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 6,
  },
  themeModeLabel: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.sm,
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  currencySymbol: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.xl,
    width: 28,
    textAlign: 'center',
  },
  currencyLabel: {
    flex: 1,
    fontFamily: FontFamily.body,
    fontSize: FontSize.md,
  },
  aboutText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
});
