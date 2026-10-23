import type { ComponentProps, ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import type { Expense } from '../store/ExpensesContext';
import { useMoney } from '../hooks/use-money';

type Icon = ComponentProps<typeof Ionicons>['name'];
export function Screen({ children, background }: { children: ReactNode; background?: ReactNode }) {
  const insets = useSafeAreaInsets();
  return <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 120 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
    {background}
    <View style={{ width: '100%', paddingHorizontal: 22 }}>
      <View style={{ width: '100%', maxWidth: 760, alignSelf: 'center' }}>{children}</View>
    </View>
  </ScrollView>;
}
export function Heading({ title, subtitle }: { title: string; subtitle?: string }) {
  return <View style={{ marginBottom: 26 }}><Text style={ui.title}>{title}</Text>{subtitle ? <Text style={ui.muted}>{subtitle}</Text> : null}</View>;
}
export function Action({ label, icon, onPress, secondary = false }: { label: string; icon: Icon; onPress: () => void; secondary?: boolean }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [ui.action, secondary && { backgroundColor: colors.primarySoft }, pressed && { opacity: 0.7 }]}><Ionicons name={icon} size={19} color={secondary ? colors.primary : '#fff'} /><Text style={{ color: secondary ? colors.primary : '#fff', fontWeight: '700', fontSize: 13 }}>{label}</Text></Pressable>;
}
export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return <View style={ui.section}><Text style={ui.sectionTitle}>{children}</Text>{action}</View>;
}
export function Empty({ icon, title, detail, action }: { icon: Icon; title: string; detail: string; action?: ReactNode }) {
  return <View style={[ui.card, { alignItems: 'center', paddingVertical: 30, gap: 12 }]}><View style={ui.icon}><Ionicons name={icon} size={24} color={colors.primary} /></View><Text style={ui.sectionTitle}>{title}</Text><Text style={[ui.muted, { textAlign: 'center', maxWidth: 270 }]}>{detail}</Text>{action}</View>;
}
export function Transaction({ expense, action }: { expense: Expense; action?: ReactNode }) {
  const money = useMoney();
  return <View style={ui.transaction}><View style={[ui.icon, { backgroundColor: expense.color }]}><Ionicons name={expense.icon as Icon} size={21} color={colors.text} /></View><View style={{ flex: 1 }}><Text style={ui.rowTitle}>{expense.title}</Text><Text style={ui.small}>{expense.category} · {new Date(expense.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</Text>{expense.type === 'subscription' && <View style={ui.subscription}><Ionicons name="repeat-outline" size={11} color={colors.primary} /><Text style={ui.subscriptionText}>Subscription</Text></View>}</View><Text style={[ui.amount, { flexShrink: 1 }]}>−{money(expense.amount)}</Text>{action}</View>;
}
export const ui = StyleSheet.create({
  subscription: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 4, backgroundColor: colors.primarySoft, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3, marginTop: 6 },
  subscriptionText: { fontSize: 10, fontWeight: '600', color: colors.primary },
  title: { fontSize: 32, fontWeight: '700', color: colors.text, letterSpacing: -1.2, marginBottom: 6 },
  muted: { fontSize: 13, color: colors.textMuted, lineHeight: 20 },
  small: { fontSize: 11, color: colors.textMuted, marginTop: 5 },
  card: { backgroundColor: colors.card, borderRadius: 22, padding: 20, borderWidth: 1, borderColor: colors.border },
  section: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 28, marginBottom: 14, gap: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text, letterSpacing: -0.4 },
  action: { minHeight: 48, paddingHorizontal: 16, borderRadius: 14, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  icon: { width: 44, height: 44, borderRadius: 15, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  transaction: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 15, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  rowTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  amount: { fontSize: 14, fontWeight: '700', color: colors.text, fontVariant: ['tabular-nums'] },
  link: { color: colors.primary, fontWeight: '700', fontSize: 13, paddingVertical: 10 },
  track: { height: 7, backgroundColor: colors.border, borderRadius: 8, overflow: 'hidden', marginTop: 12 },
});

