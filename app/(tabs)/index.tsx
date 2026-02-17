import React, { useCallback } from 'react';
import {
  FlatList,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { useTheme } from '@/context/ThemeContext';
import { useApp } from '@/context/AppContext';
import { useCurrency } from '@/hooks/useCurrency';
import { GlassCard } from '@/components/ui/glass-card';
import { SummaryCard } from '@/components/summary-card';
import { TransactionRow } from '@/components/transaction-row';
import { FontFamily, FontSize, Palette, Spacing } from '@/constants/theme';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useTheme();
  const { transactions, stats, loading, refresh } = useApp();
  const { convertAndFormat } = useCurrency();

  const recentTxs = transactions.slice(0, 5);

  const totalBalance = stats?.balance ?? 0;
  const totalIncome = stats?.total_income ?? 0;
  const totalExpenses = stats?.total_expenses ?? 0;

  const greeting = getGreeting();

  const onRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 120, paddingTop: insets.top }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
        <Text style={[styles.greeting, { color: colors.textSecondary }]}>{greeting}</Text>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Your Finances</Text>
      </Animated.View>

      {/* ── Balance Card ───────────────────────────────────────────────── */}
      <Animated.View entering={FadeInUp.delay(100).duration(500)} style={styles.section}>
        <GlassCard radius={24} padding={0}>
          <LinearGradient
            colors={isDark ? [Palette.indigoDark, '#1a1145'] : [Palette.indigo, Palette.indigoLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.balanceGradient}
          >
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Text style={styles.balanceAmount}>{convertAndFormat(totalBalance)}</Text>
            <View style={styles.balanceRow}>
              <View style={styles.balanceItem}>
                <Text style={styles.balanceMiniLabel}>Income</Text>
                <Text style={styles.balanceMiniValue}>{convertAndFormat(totalIncome)}</Text>
              </View>
              <View style={[styles.balanceDivider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
              <View style={styles.balanceItem}>
                <Text style={styles.balanceMiniLabel}>Expenses</Text>
                <Text style={styles.balanceMiniValue}>{convertAndFormat(totalExpenses)}</Text>
              </View>
            </View>
          </LinearGradient>
        </GlassCard>
      </Animated.View>

      {/* ── Summary Cards ──────────────────────────────────────────────── */}
      <View style={styles.summaryRow}>
        <SummaryCard
          title="Income"
          value={convertAndFormat(totalIncome)}
          icon="arrow-down-circle"
          iconColor={Palette.emerald}
          delay={200}
        />
        <View style={{ width: Spacing.md }} />
        <SummaryCard
          title="Expenses"
          value={convertAndFormat(totalExpenses)}
          icon="arrow-up-circle"
          iconColor={Palette.red}
          delay={300}
        />
        <View style={{ width: Spacing.md }} />
        <SummaryCard
          title="Savings"
          value={convertAndFormat(totalBalance)}
          icon="wallet"
          iconColor={Palette.indigo}
          delay={400}
        />
      </View>

      {/* ── Recent Transactions ────────────────────────────────────────── */}
      <Animated.View entering={FadeInUp.delay(400).duration(400)} style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Transactions</Text>
        {recentTxs.length === 0 ? (
          <GlassCard padding={24}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No transactions yet. Tap the + button to add one!
            </Text>
          </GlassCard>
        ) : (
          <GlassCard padding={8}>
            {recentTxs.map((tx, i) => (
              <TransactionRow key={tx.id} transaction={tx} index={i} />
            ))}
          </GlassCard>
        )}
      </Animated.View>
    </ScrollView>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  greeting: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.md,
  },
  headerTitle: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize['3xl'],
    marginTop: 2,
  },
  section: {
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
  },
  // Balance card
  balanceGradient: {
    padding: 24,
    borderRadius: 24,
  },
  balanceLabel: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.7)',
  },
  balanceAmount: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize['4xl'],
    color: '#FFFFFF',
    marginTop: 4,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  balanceItem: {
    flex: 1,
  },
  balanceDivider: {
    width: 1,
    height: 32,
    marginHorizontal: 16,
  },
  balanceMiniLabel: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.6)',
  },
  balanceMiniValue: {
    fontFamily: FontFamily.headingMedium,
    fontSize: FontSize.lg,
    color: '#FFFFFF',
    marginTop: 2,
  },
  // Summary row
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
  },
  // Section title
  sectionTitle: {
    fontFamily: FontFamily.headingMedium,
    fontSize: FontSize.xl,
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.md,
    textAlign: 'center',
  },
});
