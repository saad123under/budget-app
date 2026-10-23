import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors } from '../../constants/colors';
import { useExpenses, type Expense } from '../../store/ExpensesContext';
import { Action, Empty, Screen, Transaction, ui } from '../../components/budget-ui';
import { inMonth } from '../../utils/budget';
import { useMoney } from '../../hooks/use-money';

export default function Expenses() {
  const money = useMoney();
  const { expenses, removeExpense } = useExpenses();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [monthly, setMonthly] = useState(false);
  const [pending, setPending] = useState<Expense | null>(null);
  const categories = [...new Set(expenses.map(expense => expense.category))];
  const filtered = (monthly ? inMonth(expenses, new Date()) : expenses).filter(expense => (!category || expense.category === category) && `${expense.title} ${expense.category}`.toLowerCase().includes(query.trim().toLowerCase())).sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
  const groups = new Map<string, Expense[]>();
  filtered.forEach(expense => {
    const label = new Date(expense.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    groups.set(label, [...(groups.get(label) ?? []), expense]);
  });
  return <>
    <Screen>
      {expenses.length === 0 && <View style={{ gap: 18 }}>
        <View style={[ui.card, { opacity: 0.5 }]}>
          <Text style={styles.exampleLabel}>Example expenses</Text>
          {([
            { title: 'Groceries', category: 'Food', amount: 42.5, icon: 'bag-outline', color: '#E5EFE8' },
            { title: 'Bus ride', category: 'Transport', amount: 12, icon: 'bus-outline', color: '#E8EDF6' },
          ] as const).map(item => <View key={item.title} style={ui.transaction}>
            <View style={[ui.icon, { backgroundColor: item.color }]}><Ionicons name={item.icon} size={21} color={colors.primary} /></View>
            <View style={{ flex: 1 }}><Text style={ui.rowTitle}>{item.title}</Text><Text style={ui.small}>{item.category}</Text></View>
            <Text style={ui.amount}>−{money(item.amount)}</Text>
          </View>)}
        </View>
        <Text style={[ui.muted, { textAlign: 'center' }]}>Your spending, in one place. Add an expense to start your list.</Text>
        <Action icon="receipt-outline" label="Add your first expense" onPress={() => router.push('/add')} />
      </View>}
      {expenses.length > 0 && <>
      <View style={styles.search}><Ionicons name="search-outline" size={20} color={colors.textMuted} /><TextInput accessibilityLabel="Search expenses" value={query} onChangeText={setQuery} placeholder="Search by name or category" placeholderTextColor={colors.textMuted} style={styles.input} />{query !== '' && <Pressable accessibilityLabel="Clear search" accessibilityRole="button" onPress={() => setQuery('')} style={styles.clear}><Ionicons name="close-circle" size={20} color={colors.textMuted} /></Pressable>}</View>
      <View style={styles.period}>{[false, true].map(value => <Pressable key={String(value)} accessibilityRole="button" accessibilityState={{ selected: monthly === value }} onPress={() => setMonthly(value)} style={[styles.periodButton, monthly === value && styles.selected]}><Text style={{ color: monthly === value ? colors.primary : colors.textMuted, fontWeight: '600' }}>{value ? 'This month' : 'All time'}</Text></Pressable>)}</View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 14 }}>
        {[null, ...categories].map(value => <Pressable key={value ?? '__all'} accessibilityRole="button" accessibilityState={{ selected: category === value }} onPress={() => setCategory(value)} style={[styles.chip, category === value && { backgroundColor: colors.primary, borderColor: colors.primary }]}><Text style={{ color: category === value ? '#fff' : colors.textMuted, fontWeight: '600', fontSize: 12 }}>{value ?? 'All categories'}</Text></Pressable>)}
      </ScrollView>
      <View style={styles.summary}><Text style={ui.muted}>{filtered.length} matching expenses</Text><Text style={ui.sectionTitle}>{money(filtered.reduce((sum, expense) => sum + expense.amount, 0))}</Text></View>
      {filtered.length === 0 ? <Empty icon="search-outline" title={expenses.length ? 'No matches yet' : 'Your story starts here'} detail={expenses.length ? 'Try a different search or clear your filters.' : 'Keep track of everyday spending with your first expense.'} action={expenses.length ? <Action secondary icon="refresh-outline" label="Clear filters" onPress={() => { setQuery(''); setCategory(null); setMonthly(false); }} /> : <Action icon="add" label="Add expense" onPress={() => router.push('/add')} />} /> : [...groups].map(([label, items]) => <View key={label}><Text style={styles.date}>{label}</Text><View style={[ui.card, { paddingVertical: 3 }]}>{items.map(expense => <Transaction key={expense.id} expense={expense} action={<Pressable accessibilityRole="button" accessibilityLabel={`Delete ${expense.title}`} onPress={() => setPending(expense)} style={styles.clear}><Ionicons name="trash-outline" size={17} color={colors.textMuted} /></Pressable>} />)}</View></View>)}
      </>}
    </Screen>
    <Modal visible={pending !== null} transparent animationType="fade" onRequestClose={() => setPending(null)}><View style={styles.backdrop}><View style={[ui.card, { width: '100%', maxWidth: 400, gap: 18 }]}><Text style={ui.sectionTitle}>Delete this expense?</Text><Text style={ui.muted}>{pending?.title} · {money(pending?.amount ?? 0)}. This amount will return to your available balance.</Text><Action secondary label="Keep expense" icon="close-outline" onPress={() => setPending(null)} /><Action label="Delete expense" icon="trash-outline" onPress={() => { if (pending) removeExpense(pending.id); setPending(null); }} /></View></View></Modal>
  </>;
}
const styles = StyleSheet.create({
  exampleLabel: { alignSelf: 'flex-start', fontSize: 11, color: colors.textMuted, backgroundColor: colors.bg, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, marginBottom: 6 },
  search: { flexDirection: 'row', alignItems: 'center', paddingLeft: 15, gap: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 16, backgroundColor: '#fff', minHeight: 54 },
  input: { flex: 1, color: colors.text, fontSize: 14, paddingVertical: 15 },
  clear: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  period: { flexDirection: 'row', padding: 4, borderRadius: 14, backgroundColor: colors.border, marginVertical: 16 },
  periodButton: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  selected: { backgroundColor: '#fff' },
  chip: { paddingHorizontal: 16, minHeight: 44, justifyContent: 'center', borderRadius: 24, borderWidth: 1, borderColor: colors.border, backgroundColor: '#fff' },
  summary: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 12 },
  date: { fontSize: 12, fontWeight: '600', color: colors.textMuted, marginTop: 18, marginBottom: 10 },
  backdrop: { flex: 1, backgroundColor: 'rgba(15,35,28,0.45)', alignItems: 'center', justifyContent: 'center', padding: 24 },
});

