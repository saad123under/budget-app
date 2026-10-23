import { useId, useState } from 'react';
import { Text, View, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, homeGradient } from '../../constants/colors';
import { useExpenses } from '../../store/ExpensesContext';
import { Screen, Transaction } from '../../components/budget-ui';
import { ProfileHeader } from '../../components/profile-header';
import { inMonth } from '../../utils/budget';
import { useMoney } from '../../hooks/use-money';

const balanceFormatter = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function HomeBackdrop() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const id = `home-${useId().replace(/:/g, '')}`;
  return <Svg
    width={width}
    height={insets.top + 440}
    viewBox="0 0 400 440"
    preserveAspectRatio="none"
    pointerEvents="none"
    aria-hidden={true}
    style={styles.background}
  >
    <Defs>
      <LinearGradient id={`${id}-base`} x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor={homeGradient.eucalyptus} />
        <Stop offset="42%" stopColor={homeGradient.sage} />
        <Stop offset="82%" stopColor={homeGradient.mist} />
        <Stop offset="100%" stopColor={homeGradient.ivory} />
      </LinearGradient>
      <RadialGradient id={`${id}-warm`} cx="0%" cy="5%" rx="95%" ry="62%">
        <Stop offset="0%" stopColor={homeGradient.champagne} stopOpacity={0.4} />
        <Stop offset="100%" stopColor={homeGradient.champagne} stopOpacity={0} />
      </RadialGradient>
      <RadialGradient id={`${id}-light`} cx="100%" cy="30%" rx="65%" ry="55%">
        <Stop offset="0%" stopColor={homeGradient.mint} stopOpacity={0.32} />
        <Stop offset="100%" stopColor={homeGradient.mint} stopOpacity={0} />
      </RadialGradient>
    </Defs>
    <Rect width="400" height="440" fill={`url(#${id}-base)`} />
    <Rect width="400" height="440" fill={`url(#${id}-warm)`} />
    <Rect width="400" height="440" fill={`url(#${id}-light)`} />
  </Svg>;
}

export default function Home() {
  const money = useMoney();
  const { expenses, balance, totalSaved, currency } = useExpenses();
  const [hidden, setHidden] = useState(false);
  const monthSpent = inMonth(expenses, new Date()).reduce((sum, expense) => sum + expense.amount, 0);
  const recent = [...expenses]
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
    .slice(0, 4);
  const display = (value: number) => hidden ? '••••' : money(value);

  return <Screen background={<HomeBackdrop />}>
    <ProfileHeader />
    <View style={styles.balanceSection}>
      <View style={styles.balanceHeading}>
        <Text style={styles.balanceLabel}>Available balance</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={hidden ? 'Show balances' : 'Hide balances'}
          onPress={() => setHidden(!hidden)}
          style={styles.eye}
        >
          <Ionicons name={hidden ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.text} />
        </Pressable>
      </View>
      <View accessible accessibilityLabel={`Available balance: ${display(balance)}`} style={styles.balanceRow}>
        <View style={styles.currencyBadge}><Text style={styles.currencyCode}>{currency}</Text></View>
        <Text
          adjustsFontSizeToFit
          numberOfLines={1}
          style={[styles.balance, balance < 0 && { color: '#B42318' }]}
        >
          {hidden ? '••••' : balanceFormatter.format(balance)}
        </Text>
      </View>
      {balance < 0 && <Text style={styles.overBalance}>Your expenses and savings exceed your starting balance.</Text>}
    </View>

    <View style={styles.overview}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Spent this month: ${display(monthSpent)}. View expenses`}
        accessibilityHint="Opens your expense list"
        onPress={() => router.push('/(tabs)/expenses')}
        style={({ pressed }) => [styles.stat, styles.spentStat, pressed && styles.pressed]}
      >
        <View style={styles.statHeading}>
          <View style={[styles.statIcon, styles.spentIcon]}>
            <Ionicons name="card-outline" size={23} color="#9A6338" />
          </View>
          <Ionicons name="arrow-up-outline" size={17} color="#9A6338" style={styles.direction} />
        </View>
        <Text adjustsFontSizeToFit numberOfLines={1} style={[styles.statValue, styles.spentValue]}>{display(monthSpent)}</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Total saved: ${display(totalSaved)}. View savings`}
        accessibilityHint="Opens your savings goals"
        onPress={() => router.push('/(tabs)/savings')}
        style={({ pressed }) => [styles.stat, styles.savedStat, pressed && styles.pressed]}
      >
        <View style={styles.statHeading}>
          <View style={[styles.statIcon, styles.savedIcon]}>
            <Ionicons name="wallet-outline" size={23} color="#E5D7B6" />
          </View>
          <Ionicons name="arrow-down-outline" size={17} color="#E5D7B6" style={styles.direction} />
        </View>
        <Text adjustsFontSizeToFit numberOfLines={1} style={[styles.statValue, styles.savedValue]}>{display(totalSaved)}</Text>
      </Pressable>
    </View>

    <View style={styles.actions}>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/add')}
        style={({ pressed }) => [styles.addExpense, pressed && styles.pressed]}
      >
        <View style={styles.actionIcon}><Ionicons name="add" size={18} color={colors.primary} /></View>
        <Text style={styles.addText}>Add expense</Text>
      </Pressable>
      <View style={styles.actionDivider} />
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/categories')}
        style={({ pressed }) => [styles.categories, pressed && styles.pressed]}
      >
        <View style={styles.actionIcon}><Ionicons name="pricetags-outline" size={17} color={colors.primary} /></View>
        <Text style={styles.categoriesText}>Categories</Text>
      </Pressable>
    </View>

    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Recent activity</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="View all expenses"
        onPress={() => router.push('/(tabs)/expenses')}
        style={({ pressed }) => [styles.viewAll, pressed && styles.pressed]}
      >
        <Text style={styles.viewAllText}>View all</Text>
        <Ionicons name="chevron-forward" size={14} color={colors.primary} />
      </Pressable>
    </View>
    {recent.length > 0 ? <View style={styles.activity}>
      {recent.map(expense => <Transaction key={expense.id} expense={expense} />)}
    </View> : <View style={styles.empty}>
      <View style={styles.emptyIcon}><Ionicons name="receipt-outline" size={23} color={colors.textMuted} /></View>
      <Text style={styles.emptyTitle}>No expenses yet</Text>
      <Text style={styles.emptyDetail}>Your latest expenses will appear here.</Text>
    </View>}
  </Screen>;
}

const styles = StyleSheet.create({
  background: { position: 'absolute', top: 0, left: 0 },
  balanceSection: { alignItems: 'center', paddingTop: 4, paddingBottom: 32 },
  balanceHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 2 },
  balanceLabel: { color: colors.text, fontSize: 12, fontWeight: '500', letterSpacing: 0.2 },
  eye: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  balanceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', marginTop: 4 },
  currencyBadge: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 9, borderWidth: 1, borderColor: 'rgba(255,255,255,0.65)', backgroundColor: 'rgba(250,248,239,0.5)' },
  currencyCode: { fontSize: 11, fontWeight: '600', letterSpacing: 1, color: '#294C3F' },
  balance: { flexShrink: 1, textAlign: 'center', fontSize: 50, fontWeight: '500', letterSpacing: -2.2, color: colors.text, fontVariant: ['tabular-nums'] },
  overBalance: { fontSize: 12, lineHeight: 18, textAlign: 'center', color: '#B42318', marginTop: 12, maxWidth: 290 },
  overview: { flexDirection: 'row', gap: 12 },
  stat: { flex: 1, borderRadius: 24, padding: 19, minHeight: 136, justifyContent: 'space-between', gap: 22, borderWidth: 1 },
  spentStat: { backgroundColor: '#FFFDFA', borderColor: '#F0E8DC', boxShadow: '0 8px 24px rgba(59,49,30,0.045)' },
  savedStat: { backgroundColor: '#173F34', borderColor: '#355B4B', boxShadow: '0 10px 24px rgba(23,63,52,0.12)' },
  statHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  spentIcon: { backgroundColor: '#F4EBDF' },
  savedIcon: { backgroundColor: '#2B5145', borderWidth: 1, borderColor: '#466357' },
  direction: { transform: [{ rotate: '45deg' }] },
  statValue: { fontSize: 23, fontWeight: '500', letterSpacing: -0.7, fontVariant: ['tabular-nums'] },
  spentValue: { color: '#85522E' },
  savedValue: { color: '#FAF7EE' },
  actions: { flexDirection: 'row', alignItems: 'center', marginTop: 16, padding: 6, backgroundColor: '#FFFEFB', borderWidth: 1, borderColor: '#E8E9E0', borderRadius: 19, boxShadow: '0 5px 18px rgba(23,46,40,0.035)' },
  addExpense: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 13, minHeight: 48, paddingHorizontal: 6 },
  addText: { color: colors.primary, fontSize: 12, fontWeight: '600' },
  actionIcon: { width: 28, height: 28, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EDF2E9' },
  actionDivider: { width: 1, height: 24, backgroundColor: '#E5E8DD' },
  categories: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 13, minHeight: 48, paddingHorizontal: 6 },
  categoriesText: { color: colors.primary, fontSize: 12, fontWeight: '600' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 30, marginBottom: 10 },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: '600', letterSpacing: -0.4 },
  viewAll: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 4, paddingLeft: 12 },
  viewAllText: { fontSize: 12, fontWeight: '600', color: colors.primary },
  activity: { backgroundColor: colors.card, borderWidth: 1, borderColor: '#E7EAE2', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 2, boxShadow: '0 6px 22px rgba(23,46,40,0.035)' },
  empty: { alignItems: 'center', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingVertical: 28, gap: 10 },
  emptyIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  emptyTitle: { color: colors.text, fontSize: 14, fontWeight: '600' },
  emptyDetail: { color: colors.textMuted, fontSize: 12, lineHeight: 18, textAlign: 'center' },
  pressed: { opacity: 0.65 },
});
