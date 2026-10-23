import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, G } from 'react-native-svg';
import { colors } from '../../constants/colors';
import { useExpenses } from '../../store/ExpensesContext';
import { Screen, SectionTitle, ui } from '../../components/budget-ui';
import { categoryTotals, inMonth } from '../../utils/budget';
import { useMoney } from '../../hooks/use-money';

const chartPalette = ['#216653', '#5B75B8', '#D18A4D', '#9A71B8', '#5B9D94', '#BA697A', '#8A944C'];
type Slice = { name: string; amount: number; color: string };

function SpendingChart({ data, total, label }: { data: Slice[]; total: number; label: string }) {
  const size = 220;
  const stroke = 22;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const description = total > 0 ? data.map(item => `${item.name}: ${Math.round(item.amount / total * 100)}%`).join(', ') : 'No spending in this period';
  return <View accessible accessibilityRole="image" accessibilityLabel={`Spending by category. ${description}. Total ${label}`} style={styles.chart}>
    <Svg width={size} height={size} aria-hidden={true}>
      <Circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={colors.border} strokeWidth={stroke} />
      <G transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        {total > 0 && data.map(item => {
          const length = item.amount / total * circumference;
          const segment = <Circle key={item.name} cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={item.color} strokeWidth={stroke} strokeDasharray={[length, Math.max(0, circumference - length)]} strokeDashoffset={-offset} />;
          offset += length;
          return segment;
        })}
      </G>
    </Svg>
    <View style={styles.chartCenter}><Text style={ui.small}>Total spent</Text><Text adjustsFontSizeToFit numberOfLines={1} style={styles.chartAmount}>{label}</Text></View>
  </View>;
}

export default function Stats() {
  const money = useMoney();
  const { expenses, categories } = useExpenses();
  const [offset, setOffset] = useState(0);
  const [allTime, setAllTime] = useState(false);
  const now = new Date();
  const month = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const selected = allTime ? expenses : inMonth(expenses, month);
  const total = selected.reduce((sum, expense) => sum + expense.amount, 0);
  const breakdown = categoryTotals(selected).map((item, index) => ({ ...item, color: categories.find(category => category.key === item.name)?.tint ?? chartPalette[index % chartPalette.length] }));
  return <Screen>
    <View style={styles.period}>{[false, true].map(value => <Pressable key={String(value)} accessibilityRole="button" accessibilityState={{ selected: allTime === value }} onPress={() => setAllTime(value)} style={[styles.segment, allTime === value && { backgroundColor: '#fff' }]}><Text style={{ color: colors.primary, fontWeight: '600' }}>{value ? 'All time' : 'Monthly'}</Text></Pressable>)}</View>
    {!allTime && <View style={styles.month}><Pressable accessibilityRole="button" accessibilityLabel="Previous month" style={styles.arrow} onPress={() => setOffset(offset - 1)}><Ionicons name="chevron-back" size={20} color={colors.primary} /></Pressable><Text style={ui.rowTitle}>{month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</Text><Pressable accessibilityRole="button" accessibilityLabel="Next month" accessibilityState={{ disabled: offset === 0 }} disabled={offset === 0} style={[styles.arrow, offset === 0 && { opacity: 0.25 }]} onPress={() => setOffset(offset + 1)}><Ionicons name="chevron-forward" size={20} color={colors.primary} /></Pressable></View>}
    <View style={[ui.card, { alignItems: 'center', paddingVertical: 24 }]}><Text style={ui.muted}>{allTime ? 'All-time spending' : 'Monthly spending'}</Text><SpendingChart data={breakdown} total={total} label={money(total)} /><Text style={ui.muted}>{selected.length} transaction{selected.length === 1 ? '' : 's'}</Text><View style={styles.summary}><View style={{ flex: 1 }}><Text style={ui.small}>Average expense</Text><Text style={ui.rowTitle}>{money(selected.length ? total / selected.length : 0)}</Text></View><View style={{ flex: 1 }}><Text style={ui.small}>Largest expense</Text><Text style={ui.rowTitle}>{money(selected.reduce((max, expense) => Math.max(max, expense.amount), 0))}</Text></View></View></View>
    <SectionTitle>Where your money goes</SectionTitle>
    {breakdown.length === 0 ? <Text style={[ui.muted, { textAlign: 'center' }]}>Add an expense to see your spending by category.</Text> : <View style={ui.card}>{breakdown.map((item, index) => {
      const share = total > 0 ? item.amount / total * 100 : 0;
      return <View key={item.name} style={[styles.between, { marginTop: index ? 20 : 0 }]}><View style={[styles.dot, { backgroundColor: item.color }]} /><View style={{ flex: 1 }}><Text style={ui.rowTitle}>{item.name}</Text><Text style={ui.small}>{Math.round(share)}% of spending</Text></View><Text style={ui.amount}>{money(item.amount)}</Text></View>;
    })}</View>}
  </Screen>;
}
const styles = StyleSheet.create({
  chart: { width: 220, height: 220, marginVertical: 20 },
  chartCenter: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 34 },
  chartAmount: { fontSize: 26, fontWeight: '700', color: colors.text, marginTop: 8, letterSpacing: -0.8, width: '100%', textAlign: 'center' },
  dot: { width: 12, height: 12, borderRadius: 6 },
  period: { flexDirection: 'row', padding: 4, borderRadius: 14, backgroundColor: colors.border, marginBottom: 12 },
  segment: { flex: 1, minHeight: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  month: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  arrow: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  total: { fontSize: 42, fontWeight: '600', color: colors.text, letterSpacing: -1.5, marginVertical: 10 },
  summary: { flexDirection: 'row', width: '100%', marginTop: 24, borderTopWidth: 1, borderColor: colors.border, paddingTop: 18, gap: 12 },
  between: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
