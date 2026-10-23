import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import { useExpenses, type ExpenseType } from '../store/ExpensesContext';
import { parseAmount } from '../utils/budget';
import { currencySymbol } from '../constants/currencies';

export default function AddTransaction() {
  const insets = useSafeAreaInsets();
  const { categories, addExpense, currency } = useExpenses();

  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [expenseType, setExpenseType] = useState<ExpenseType>('single');
  const [categoryKey, setCategoryKey] = useState(categories[0]?.key ?? '');
  const category = categories.find(item => item.key === categoryKey) ?? categories[0] ?? null;

  const parsedAmount = parseAmount(amount);
  const canSave = parsedAmount !== null && title.trim().length > 0 && !!category;

  const save = () => {
    if (!canSave || !category || parsedAmount === null) return;
    addExpense({
      type: expenseType,
      title: title.trim(),
      amount: parsedAmount,
      category: category.key,
      date: new Date().toISOString(),
      icon: category.icon,
      color: category.color,
    });
    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.root}
    >
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: 20,
          width: '100%', maxWidth: 760, alignSelf: 'center',
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="close" size={20} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Add expense</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Amount */}
        <View accessibilityRole="radiogroup" accessibilityLabel="Expense type" style={styles.typeSelector}>
          {([
            { value: 'single', label: 'One-time', icon: 'receipt-outline' },
            { value: 'subscription', label: 'Subscription', icon: 'repeat-outline' },
          ] as const).map(option => <Pressable key={option.value} accessibilityRole="radio" accessibilityLabel={option.label} accessibilityState={{ checked: expenseType === option.value }} onPress={() => setExpenseType(option.value)} style={[styles.typeOption, expenseType === option.value && styles.typeSelected]}>
            <Ionicons name={option.icon} size={18} color={expenseType === option.value ? colors.primary : colors.textMuted} />
            <Text style={[styles.typeText, expenseType === option.value && { color: colors.primary }]}>{option.label}</Text>
          </Pressable>)}
        </View>
        {expenseType === 'subscription' && <Text style={styles.typeHint}>For recurring bills and memberships. Log each payment when it happens.</Text>}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>AMOUNT</Text>
          <View style={styles.amountRow}>
            <Text style={[styles.currency, currencySymbol(currency).length > 1 && { fontSize: 20 }]}>{currencySymbol(currency)}</Text>
            <TextInput
              accessibilityLabel="Expense amount"
              value={amount}
              onChangeText={(t) => setAmount(t.replace(/[^0-9.]/g, ''))}
              placeholder="0.00"
              placeholderTextColor="#C7CCD6"
              keyboardType="decimal-pad"
              style={styles.amountInput}
              autoFocus
            />
          </View>
        </View>

        {/* Description */}
        {amount !== '' && parsedAmount === null && <Text style={{ color: colors.orange, marginBottom: 16 }}>Enter an amount above zero with up to two decimal places.</Text>}
        <Text style={styles.fieldLabel}>DESCRIPTION</Text>
        <TextInput
          accessibilityLabel="Expense description"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Lunch with team"
          placeholderTextColor="#B9BFC9"
          style={styles.input}
        />

        {/* Category header with add button */}
        <View style={styles.categoryHeader}>
          <Text style={styles.fieldLabel}>CATEGORY</Text>
          <Pressable
            onPress={() => {
              router.push('/categories');
            }}
            style={styles.addCatBtn}
            hitSlop={8}
          >
            <Ionicons name="add" size={14} color={colors.primary} />
            <Text style={styles.addCatText}>New</Text>
          </Pressable>
        </View>

        {categories.length === 0 ? (
          <Pressable
            onPress={() => {
              router.push('/categories');
            }}
            style={styles.emptyCat}
          >
            <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
            <Text style={styles.emptyCatText}>Add a category first</Text>
          </Pressable>
        ) : (
          <View style={styles.catGrid}>
            {categories.map((c) => {
              const active = category?.key === c.key;
              return (
                <Pressable
                  key={c.key}
                  onPress={() => setCategoryKey(c.key)}
                  style={[
                    styles.catCard,
                    active && { borderColor: c.tint, backgroundColor: c.color },
                  ]}
                >
                  <View style={[styles.catIcon, { backgroundColor: c.color }]}>
                    <Ionicons name={c.icon as any} size={18} color={c.tint} />
                  </View>
                  <Text
                    style={[
                      styles.catText,
                      active && { color: c.tint, fontWeight: '700' },
                    ]}
                  >
                    {c.key}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Save */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={expenseType === 'subscription' ? 'Add subscription' : 'Add expense'}
          onPress={save}
          disabled={!canSave}
          style={[styles.saveBtn, !canSave && { opacity: 0.4 }]}
        >
          <Text style={styles.saveText}>{expenseType === 'subscription' ? 'Add subscription' : 'Add expense'}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  typeSelector: { flexDirection: 'row', gap: 6, padding: 4, backgroundColor: colors.border, borderRadius: 16, marginBottom: 20 },
  typeOption: { flex: 1, flexDirection: 'row', gap: 7, alignItems: 'center', justifyContent: 'center', minHeight: 48, borderRadius: 12 },
  typeSelected: { backgroundColor: colors.card },
  typeText: { fontSize: 13, fontWeight: '700', color: colors.textMuted },
  typeHint: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: -8, marginBottom: 18, paddingHorizontal: 4 },
  root: { flex: 1, backgroundColor: colors.bg },

  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 24,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: colors.text },

  amountCard: {
    backgroundColor: '#fff', borderRadius: 22, padding: 22,
    alignItems: 'center', borderWidth: 1, borderColor: colors.border,
    marginBottom: 24,
  },
  amountLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '700', letterSpacing: 0.8 },
  amountRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  currency: { fontSize: 32, fontWeight: '800', color: colors.textMuted, marginRight: 4 },
  amountInput: {
    fontSize: 42, fontWeight: '800', color: colors.text,
    minWidth: 120, textAlign: 'center', letterSpacing: -1,
  },

  fieldLabel: {
    fontSize: 11, fontWeight: '700', color: colors.textMuted,
    marginBottom: 8, marginTop: 4, letterSpacing: 0.8,
  },
  input: {
    backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: colors.text, borderWidth: 1, borderColor: colors.border,
    marginBottom: 20,
  },

  categoryHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 4, marginBottom: 8,
  },
  addCatBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 10, paddingVertical: 5,
    backgroundColor: colors.primarySoft, borderRadius: 20,
    marginBottom: 8,
  },
  addCatText: { fontSize: 12, fontWeight: '700', color: colors.primary },

  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 30 },
  catCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 10,
    borderRadius: 16, borderWidth: 1.5, borderColor: colors.border,
  },
  catIcon: {
    width: 28, height: 28, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  catText: { fontSize: 13, color: colors.text, fontWeight: '600' },

  emptyCat: {
    flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center',
    paddingVertical: 20, backgroundColor: '#fff', borderRadius: 16,
    borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed',
    marginBottom: 30,
  },
  emptyCatText: { color: colors.primary, fontWeight: '700', fontSize: 13 },

  saveBtn: {
    backgroundColor: colors.primary, borderRadius: 18, paddingVertical: 16,
    alignItems: 'center',
    shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 }, elevation: 6,
  },
  saveText: { color: '#fff', fontWeight: '800', fontSize: 15, letterSpacing: 0.2 },
});
