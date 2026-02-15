import React, { useMemo, useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BarChart, PieChart } from 'react-native-chart-kit';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/context/ThemeContext';
import { useApp } from '@/context/AppContext';
import { GlassCard } from '@/components/ui/glass-card';
import { FontFamily, FontSize, Palette, Radius, Spacing, formatCurrency } from '@/constants/theme';

const screenWidth = Dimensions.get('window').width;

type Period = 'month' | 'quarter' | 'year';

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { transactions, categories, currency, stats } = useApp();
  const [period, setPeriod] = useState<Period>('month');

  // ── Filter transactions by period ──────────────────────────────────────
  const periodTxs = useMemo(() => {
    const now = new Date();
    let cutoff: Date;
    if (period === 'month') {
      cutoff = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'quarter') {
      cutoff = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    } else {
      cutoff = new Date(now.getFullYear(), 0, 1);
    }
    return transactions.filter((tx) => new Date(tx.date) >= cutoff);
  }, [transactions, period]);

  const totalIncome = periodTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpenses = periodTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  // ── Expense by category (pie chart) ────────────────────────────────────
  const pieData = useMemo(() => {
    const map: Record<string, number> = {};
    periodTxs.filter((t) => t.type === 'expense').forEach((t) => {
      map[t.category] = (map[t.category] ?? 0) + t.amount;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([name, amount]) => {
        const cat = categories.find((c) => c.name === name);
        return {
          name,
          amount,
          color: cat?.color ?? '#6B7280',
          legendFontColor: colors.textSecondary,
          legendFontSize: 12,
        };
      });
  }, [periodTxs, categories, colors]);

  // ── Daily bar data (last 7 days) ───────────────────────────────────────
  const barData = useMemo(() => {
    const days: string[] = [];
    const incomeVals: number[] = [];
    const expenseVals: number[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const shortDay = d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2);
      days.push(shortDay);

      const dayTxs = transactions.filter((tx) => tx.date.slice(0, 10) === dateStr);
      incomeVals.push(dayTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0));
      expenseVals.push(dayTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0));
    }

    return {
      labels: days,
      datasets: [
        { data: expenseVals, color: () => Palette.red },
      ],
    };
  }, [transactions]);

  const chartConfig = {
    backgroundGradientFrom: 'transparent',
    backgroundGradientTo: 'transparent',
    color: (opacity = 1) => isDark ? `rgba(129,140,248,${opacity})` : `rgba(79,70,229,${opacity})`,
    labelColor: () => colors.textSecondary,
    decimalPlaces: 0,
    barPercentage: 0.5,
    propsForBackgroundLines: {
      stroke: colors.separator,
      strokeDasharray: '',
    },
    fillShadowGradientFrom: Palette.indigo,
    fillShadowGradientTo: Palette.indigoLight,
    fillShadowGradientOpacity: 0.3,
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 120, paddingTop: insets.top }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      <Animated.View entering={FadeInUp.duration(400)} style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Analytics</Text>
      </Animated.View>

      {/* ── Period Selector ────────────────────────────────────────── */}
      <View style={styles.periodRow}>
        {(['month', 'quarter', 'year'] as Period[]).map((p) => {
          const active = period === p;
          return (
            <Pressable
              key={p}
              style={[styles.periodChip, { backgroundColor: active ? colors.primary + '20' : colors.inputBg, borderColor: active ? colors.primary : colors.inputBorder }]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[styles.periodLabel, { color: active ? colors.primary : colors.textSecondary }]}>
                {p === 'month' ? 'This Month' : p === 'quarter' ? '3 Months' : 'This Year'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* ── Income vs Expenses Summary ─────────────────────────────── */}
      <Animated.View entering={FadeInUp.delay(100).duration(400)} style={styles.section}>
        <GlassCard padding={20} radius={20}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Ionicons name="arrow-down-circle" size={22} color={Palette.emerald} />
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Income</Text>
              <Text style={[styles.summaryValue, { color: Palette.emerald }]}>
                {formatCurrency(totalIncome, currency)}
              </Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: colors.separator }]} />
            <View style={styles.summaryItem}>
              <Ionicons name="arrow-up-circle" size={22} color={Palette.red} />
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Expenses</Text>
              <Text style={[styles.summaryValue, { color: Palette.red }]}>
                {formatCurrency(totalExpenses, currency)}
              </Text>
            </View>
          </View>
        </GlassCard>
      </Animated.View>

      {/* ── Bar Chart (Last 7 Days) ────────────────────────────────── */}
      <Animated.View entering={FadeInUp.delay(200).duration(400)} style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Last 7 Days</Text>
        <GlassCard padding={16} radius={20}>
          <BarChart
            data={barData}
            width={screenWidth - 80}
            height={200}
            chartConfig={chartConfig}
            yAxisLabel=""
            yAxisSuffix=""
            fromZero
            showBarTops={false}
            withInnerLines
            style={styles.chart}
          />
        </GlassCard>
      </Animated.View>

      {/* ── Pie Chart (Expenses by Category) ───────────────────────── */}
      {pieData.length > 0 && (
        <Animated.View entering={FadeInUp.delay(300).duration(400)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Expenses by Category</Text>
          <GlassCard padding={16} radius={20}>
            <PieChart
              data={pieData}
              width={screenWidth - 80}
              height={200}
              chartConfig={chartConfig}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="0"
              absolute={false}
            />
          </GlassCard>
        </Animated.View>
      )}

      {/* ── Top Categories ─────────────────────────────────────────── */}
      {pieData.length > 0 && (
        <Animated.View entering={FadeInUp.delay(400).duration(400)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Categories</Text>
          <GlassCard padding={12} radius={16}>
            {pieData.slice(0, 5).map((item, i) => {
              const cat = categories.find((c) => c.name === item.name);
              return (
                <View key={item.name} style={styles.topCatRow}>
                  <View style={[styles.topCatIcon, { backgroundColor: item.color + '18' }]}>
                    <Ionicons name={(cat?.icon as keyof typeof Ionicons.glyphMap) ?? 'ellipsis-horizontal'} size={16} color={item.color} />
                  </View>
                  <Text style={[styles.topCatName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                  <Text style={[styles.topCatAmount, { color: colors.textSecondary }]}>
                    {formatCurrency(item.amount, currency)}
                  </Text>
                </View>
              );
            })}
          </GlassCard>
        </Animated.View>
      )}
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
  periodRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  periodChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  periodLabel: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.sm,
  },
  section: {
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
  },
  sectionTitle: {
    fontFamily: FontFamily.headingMedium,
    fontSize: FontSize.lg,
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  summaryDivider: {
    width: 1,
    height: 48,
    marginHorizontal: 12,
  },
  summaryLabel: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
  },
  summaryValue: {
    fontFamily: FontFamily.headingMedium,
    fontSize: FontSize.xl,
  },
  chart: {
    borderRadius: 12,
    marginLeft: -16,
  },
  topCatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
  },
  topCatIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topCatName: {
    flex: 1,
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.md,
  },
  topCatAmount: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.md,
  },
});
