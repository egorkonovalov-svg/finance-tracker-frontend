import React, { useEffect, useState } from 'react';
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';

import { useTheme } from '@/context/ThemeContext';
import { useApp } from '@/context/AppContext';
import { GlassCard } from '@/components/ui/glass-card';
import { CategoryChip } from '@/components/category-chip';
import { FontFamily, FontSize, Palette, Radius, Spacing, formatCurrency } from '@/constants/theme';
import type { TransactionType } from '@/types';

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { transactions, categories, currency, updateTransaction, removeTransaction } = useApp();

  const tx = transactions.find((t) => t.id === id);

  const [editing, setEditing] = useState(false);
  const [type, setType] = useState<TransactionType>(tx?.type ?? 'expense');
  const [amount, setAmount] = useState(tx?.amount.toString() ?? '');
  const [selectedCategory, setSelectedCategory] = useState(tx?.category ?? '');
  const [note, setNote] = useState(tx?.note ?? '');
  const [date, setDate] = useState(tx ? new Date(tx.date) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (tx) {
      setType(tx.type);
      setAmount(tx.amount.toString());
      setSelectedCategory(tx.category);
      setNote(tx.note ?? '');
      setDate(new Date(tx.date));
    }
  }, [tx]);

  if (!tx) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Transaction not found.</Text>
      </View>
    );
  }

  const accentColor = type === 'income' ? colors.income : colors.expense;
  const filteredCategories = categories.filter((c) => c.type === type || c.type === 'both');
  const cat = categories.find((c) => c.name === tx.category);

  const handleSave = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid amount.');
      return;
    }
    try {
      await updateTransaction(tx.id, {
        type,
        amount: parseFloat(amount),
        category: selectedCategory,
        note: note.trim() || undefined,
        date: date.toISOString(),
      });
      setEditing(false);
    } catch {
      Alert.alert('Error', 'Failed to update transaction.');
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Transaction', 'Are you sure you want to delete this transaction?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await removeTransaction(tx.id);
          router.back();
        },
      },
    ]);
  };

  // ── View Mode ──────────────────────────────────────────────────────────
  if (!editing) {
    return (
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingBottom: 40 }}>
        <Animated.View entering={FadeIn.duration(300)} style={styles.content}>
          {/* Amount */}
          <GlassCard radius={20} padding={24} style={{ alignItems: 'center' as const }}>
            <View style={[styles.typeBadge, { backgroundColor: accentColor + '18' }]}>
              <Ionicons
                name={tx.type === 'income' ? 'arrow-down-circle' : 'arrow-up-circle'}
                size={20}
                color={accentColor}
              />
              <Text style={[styles.typeBadgeText, { color: accentColor }]}>
                {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
              </Text>
            </View>
            <Text style={[styles.detailAmount, { color: accentColor }]}>
              {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
            </Text>
          </GlassCard>

          {/* Details */}
          <GlassCard radius={16} padding={16} style={{ marginTop: Spacing.lg }}>
            <DetailRow icon="folder-outline" label="Category" value={tx.category} iconColor={cat?.color ?? colors.icon} colors={colors} />
            <DetailRow icon="calendar-outline" label="Date" value={new Date(tx.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} iconColor={colors.primary} colors={colors} />
            {tx.note ? <DetailRow icon="document-text-outline" label="Note" value={tx.note} iconColor={colors.primary} colors={colors} /> : null}
            {tx.recurring ? <DetailRow icon="repeat" label="Recurring" value="Yes" iconColor={Palette.amber} colors={colors} /> : null}
          </GlassCard>

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={() => setEditing(true)}>
              <Ionicons name="pencil" size={18} color="#FFF" />
              <Text style={styles.actionLabel}>Edit</Text>
            </Pressable>
            <Pressable style={[styles.actionBtn, { backgroundColor: Palette.red }]} onPress={handleDelete}>
              <Ionicons name="trash" size={18} color="#FFF" />
              <Text style={styles.actionLabel}>Delete</Text>
            </Pressable>
          </View>
        </Animated.View>
      </ScrollView>
    );
  }

  // ── Edit Mode ──────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
        <Animated.View entering={FadeInUp.duration(300)} style={styles.content}>
          {/* Type toggle */}
          <GlassCard padding={6} radius={16}>
            <View style={styles.toggleRow}>
              <Pressable style={[styles.toggleBtn, type === 'expense' && { backgroundColor: Palette.red + '20' }]} onPress={() => setType('expense')}>
                <Text style={[styles.toggleLabel, { color: type === 'expense' ? Palette.red : colors.textMuted }]}>Expense</Text>
              </Pressable>
              <Pressable style={[styles.toggleBtn, type === 'income' && { backgroundColor: Palette.emerald + '20' }]} onPress={() => setType('income')}>
                <Text style={[styles.toggleLabel, { color: type === 'income' ? Palette.emerald : colors.textMuted }]}>Income</Text>
              </Pressable>
            </View>
          </GlassCard>

          {/* Amount */}
          <GlassCard padding={20} radius={16} style={{ marginTop: Spacing.lg }}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Amount</Text>
            <TextInput
              style={[styles.editAmount, { color: colors.text, borderBottomColor: accentColor }]}
              value={amount}
              onChangeText={(t) => setAmount(t.replace(/[^0-9.]/g, ''))}
              keyboardType="decimal-pad"
              accessibilityLabel="Edit amount"
            />
          </GlassCard>

          {/* Category */}
          <Text style={[styles.fieldLabel, { color: colors.text, marginTop: Spacing.lg, marginBottom: Spacing.sm }]}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filteredCategories.map((cat) => (
              <CategoryChip key={cat.id} category={cat} selected={selectedCategory === cat.name} onPress={() => setSelectedCategory(cat.name)} />
            ))}
          </ScrollView>

          {/* Date */}
          <GlassCard padding={14} radius={14} style={{ marginTop: Spacing.lg }}>
            <Pressable style={styles.dateRow} onPress={() => setShowDatePicker(true)}>
              <Ionicons name="calendar-outline" size={18} color={colors.primary} />
              <Text style={[styles.dateText, { color: colors.text }]}>
                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
            </Pressable>
          </GlassCard>
          <DateTimePickerModal
            isVisible={showDatePicker}
            mode="date"
            date={date}
            onConfirm={(d) => { setDate(d); setShowDatePicker(false); }}
            onCancel={() => setShowDatePicker(false)}
            isDarkModeEnabled={isDark}
          />

          {/* Note */}
          <GlassCard padding={14} radius={14} style={{ marginTop: Spacing.lg }}>
            <TextInput
              style={[styles.noteInput, { color: colors.text }]}
              value={note}
              onChangeText={setNote}
              placeholder="Note..."
              placeholderTextColor={colors.placeholder}
              multiline
              accessibilityLabel="Edit note"
            />
          </GlassCard>

          {/* Save / Cancel */}
          <View style={styles.actions}>
            <Pressable style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={handleSave}>
              <Ionicons name="checkmark" size={18} color="#FFF" />
              <Text style={styles.actionLabel}>Save</Text>
            </Pressable>
            <Pressable style={[styles.actionBtn, { backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.inputBorder }]} onPress={() => setEditing(false)}>
              <Text style={[styles.actionLabel, { color: colors.text }]}>Cancel</Text>
            </Pressable>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function DetailRow({ icon, label, value, iconColor, colors }: { icon: string; label: string; value: string; iconColor: string; colors: any }) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={18} color={iconColor} />
      <View style={styles.detailInfo}>
        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>{label}</Text>
        <Text style={[styles.detailValue, { color: colors.text }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: Spacing.xl },
  // View mode
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radius.full,
    gap: 6,
    marginBottom: Spacing.md,
  },
  typeBadgeText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.sm,
  },
  detailAmount: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize['4xl'],
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  detailInfo: { flex: 1 },
  detailLabel: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
  },
  detailValue: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.md,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: Spacing.xl,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: Radius.lg,
    gap: 6,
  },
  actionLabel: {
    fontFamily: FontFamily.headingMedium,
    fontSize: FontSize.md,
    color: '#FFF',
  },
  // Edit mode
  toggleRow: { flexDirection: 'row' },
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
  fieldLabel: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
  },
  editAmount: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize['3xl'],
    borderBottomWidth: 2,
    paddingBottom: 4,
    marginTop: Spacing.sm,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dateText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.md,
  },
  noteInput: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.md,
    minHeight: 50,
    textAlignVertical: 'top',
  },
  emptyText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.md,
  },
});
