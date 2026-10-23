import { useState, type ComponentProps } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors } from '../../constants/colors';
import { useExpenses, type SavingGoal } from '../../store/ExpensesContext';
import { parseAmount } from '../../utils/budget';
import { useMoney } from '../../hooks/use-money';
import { currencySymbol } from '../../constants/currencies';
import { Action, Screen } from '../../components/budget-ui';

type Icon = ComponentProps<typeof Ionicons>['name'];
type GoalAction = { kind: 'deposit' | 'manage' | 'delete'; goal: SavingGoal };
const exampleGoal: SavingGoal = { id: 'example', name: 'Trip fund', target: 1000, saved: 350, icon: 'airplane-outline', color: '#E5EFE8', tint: '#216653', deposits: [] };

function GoalCard({ goal, example = false, onDeposit, onManage }: {
  goal: SavingGoal; example?: boolean; onDeposit?: () => void; onManage?: () => void;
}) {
  const money = useMoney();
  const percent = goal.target > 0 ? Math.round(Math.max(0, Math.min(goal.saved / goal.target, 1)) * 100) : 0;
  const complete = goal.target > 0 && goal.saved >= goal.target;
  return <View style={[styles.goalCard, example && { opacity: 0.5 }]}>
    {example && <Text style={styles.exampleBadge}>Example goal</Text>}
    <View style={styles.goalHeader}>
      <View style={[styles.goalIcon, { backgroundColor: goal.color }]}><Ionicons name={goal.icon as Icon} size={23} color={goal.tint} /></View>
      <View style={{ flex: 1 }}><Text numberOfLines={2} style={styles.goalName}>{goal.name}</Text><Text style={styles.goalTarget}>Target {money(goal.target)}</Text></View>
      {!example && <Pressable accessibilityRole="button" accessibilityLabel={`Manage ${goal.name}`} onPress={onManage} style={styles.iconButton}><Ionicons name="ellipsis-horizontal" size={21} color={colors.textMuted} /></Pressable>}
    </View>
    <View style={styles.progressHeading}>
      <Text adjustsFontSizeToFit numberOfLines={1} style={styles.savedAmount}>{money(goal.saved)}</Text>
      <View style={[styles.percentBadge, complete && { backgroundColor: colors.primarySoft }]}>
        {complete && <Ionicons name="checkmark" size={13} color={colors.primary} />}
        <Text style={styles.percent}>{percent}%</Text>
      </View>
    </View>
    <View accessibilityRole="progressbar" accessibilityLabel={`${example ? 'Example: ' : ''}${goal.name} progress`} accessibilityValue={{ min: 0, max: 100, now: percent }} style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${percent}%`, backgroundColor: goal.tint }]} />
    </View>
    <View style={styles.progressFoot}><Text style={styles.small}>Saved</Text><Text style={[styles.small, complete && { color: colors.primary }]}>{complete ? 'Goal reached' : `${money(Math.max(0, goal.target - goal.saved))} to go`}</Text></View>
    {!example && <Pressable accessibilityRole="button" accessibilityLabel={`Add money to ${goal.name}`} onPress={onDeposit} style={({ pressed }) => [styles.depositButton, pressed && styles.pressed]}>
      <Text style={styles.depositButtonText}>Add money</Text><Ionicons name="arrow-forward" size={17} color={colors.primary} />
    </Pressable>}
  </View>;
}

export default function Savings() {
  const money = useMoney();
  const insets = useSafeAreaInsets();
  const { savings, totalSaved, balance, removeGoal, deposit, currency } = useExpenses();
  const [action, setAction] = useState<GoalAction | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const activeGoal = action ? savings.find(goal => goal.id === action.goal.id) ?? action.goal : undefined;
  const completed = savings.filter(goal => goal.target > 0 && goal.saved >= goal.target).length;
  const parsed = parseAmount(amount);
  const availableCents = Math.max(0, Math.round(balance * 100));
  const canDeposit = parsed !== null && Math.round(parsed * 100) <= availableCents;
  const amountError = amount === '' ? '' : parsed === null ? 'Enter an amount above zero, with up to two decimal places.' : !canDeposit ? `You have ${money(availableCents / 100)} available.` : '';
  const quickAmounts = [25, 50, 100].filter(value => value * 100 <= availableCents);

  const openDeposit = (goal: SavingGoal) => {
    setAmount('');
    setAction({ kind: 'deposit', goal });
    setSheetVisible(true);
  };
  const close = () => setSheetVisible(false);
  const confirmDeposit = () => {
    if (!activeGoal || !canDeposit || parsed === null) return;
    deposit(activeGoal.id, parsed);
    close();
  };

  return <>
    <Screen>
      <View style={styles.totalCard}>
        <View style={styles.totalHeader}><Text style={styles.totalLabel}>Total saved</Text><View style={styles.totalIcon}><Ionicons name="wallet-outline" size={21} color="#E5D7B6" /></View></View>
        <Text adjustsFontSizeToFit numberOfLines={1} style={styles.totalAmount}>{money(totalSaved)}</Text>
        <View style={styles.totalFooter}>
          <Text style={styles.totalMeta}>{savings.length} goal{savings.length === 1 ? '' : 's'}</Text>
          <View style={styles.totalDot} />
          <Text style={styles.totalMeta}>{completed} completed</Text>
        </View>
      </View>

      {savings.length === 0 ? <View style={{ marginTop: 24, gap: 18 }}>
        <GoalCard goal={exampleGoal} example />
        <Text style={styles.exampleDetail}>Set a target. Make room for what matters to you.</Text>
        <Action icon="flag-outline" label="Create your first goal" onPress={() => router.push('/add-goal')} />
      </View> : <>
        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Your goals</Text><Text style={styles.small}>{savings.length - completed} in progress</Text></View>
        <View style={{ gap: 16 }}>{savings.map(goal => <GoalCard key={goal.id} goal={goal} onDeposit={() => openDeposit(goal)} onManage={() => { setAction({ kind: 'manage', goal }); setSheetVisible(true); }} />)}</View>
      </>}
    </Screen>

    <Modal visible={sheetVisible && !!activeGoal} transparent animationType="fade" onRequestClose={close}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.backdrop}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close goal panel" style={StyleSheet.absoluteFill} onPress={close} />
        <View accessibilityViewIsModal style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <View style={styles.sheetHeader}><Text style={styles.sheetTitle}>{action?.kind === 'deposit' ? 'Add money' : action?.kind === 'delete' ? 'Delete goal?' : 'Manage goal'}</Text><Pressable accessibilityRole="button" accessibilityLabel="Close goal details" onPress={close} style={styles.iconButton}><Ionicons name="close" size={22} color={colors.text} /></Pressable></View>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={styles.selectedGoal}><View style={[styles.goalIcon, { backgroundColor: activeGoal?.color }]}><Ionicons name={(activeGoal?.icon ?? 'flag-outline') as Icon} size={22} color={activeGoal?.tint ?? colors.primary} /></View><View style={{ flex: 1 }}><Text style={styles.goalName}>{activeGoal?.name}</Text><Text style={styles.goalTarget}>{money(activeGoal?.saved ?? 0)} of {money(activeGoal?.target ?? 0)}</Text></View></View>
            {action?.kind === 'deposit' ? <>
              <View style={styles.availableRow}><Text style={styles.small}>Available balance</Text><Text style={styles.availableAmount}>{money(availableCents / 100)}</Text></View>
              <View style={[styles.amountField, amountError !== '' && { borderColor: '#B42318' }]}>
                <Text style={styles.currency}>{currencySymbol(currency)}</Text>
                <TextInput accessibilityLabel="Savings deposit amount" value={amount} onChangeText={text => setAmount(text.replace(/,/g, '.').replace(/[^0-9.]/g, ''))} placeholder="0.00" placeholderTextColor="#8D9A90" keyboardType="decimal-pad" style={styles.amountInput} />
              </View>
              {amountError !== '' && <Text accessibilityRole="alert" style={styles.error}>{amountError}</Text>}
              {availableCents > 0 && <View style={styles.quickAmounts}>{quickAmounts.map(value => <Pressable accessibilityRole="button" key={value} onPress={() => setAmount(value.toFixed(2))} style={styles.quickButton}><Text style={styles.quickText}>{money(value)}</Text></Pressable>)}<Pressable accessibilityRole="button" accessibilityLabel="Use all available balance" onPress={() => setAmount((availableCents / 100).toFixed(2))} style={styles.quickButton}><Text style={styles.quickText}>Max</Text></Pressable></View>}
              <Text style={styles.sheetHelp}>{availableCents === 0 ? 'No available balance to set aside right now.' : canDeposit && activeGoal && activeGoal.target > 0 ? `Your goal will be ${Math.min(100, Math.round((activeGoal.saved + (parsed ?? 0)) / activeGoal.target * 100))}% complete.` : 'Money moves from your available balance into this goal.'}</Text>
              <Pressable accessibilityRole="button" disabled={!canDeposit} accessibilityState={{ disabled: !canDeposit }} onPress={confirmDeposit} style={[styles.primaryButton, !canDeposit && { opacity: 0.4 }]}><Text style={styles.primaryText}>{canDeposit ? `Add ${money(parsed ?? 0)}` : 'Add money'}</Text><Ionicons name="arrow-forward" size={18} color="#fff" /></Pressable>
            </> : action?.kind === 'delete' ? <>
              <Text style={[styles.sheetHelp, { marginTop: 0 }]}>This goal and its deposit history will be deleted. Its saved money returns to your available balance. This cannot be undone.</Text>
              <Pressable accessibilityRole="button" onPress={close} style={styles.secondaryButton}><Text style={styles.depositButtonText}>Keep goal</Text></Pressable>
              <Pressable accessibilityRole="button" onPress={() => { if (activeGoal) removeGoal(activeGoal.id); close(); }} style={styles.deleteButton}><Ionicons name="trash-outline" size={18} color="#B42318" /><Text style={styles.deleteText}>Delete goal</Text></Pressable>
            </> : <>
              <Pressable accessibilityRole="button" onPress={() => { if (activeGoal) openDeposit(activeGoal); }} style={styles.primaryButton}><Text style={styles.primaryText}>Add money</Text><Ionicons name="arrow-forward" size={18} color="#fff" /></Pressable>
              <Pressable accessibilityRole="button" onPress={() => { if (activeGoal) setAction({ kind: 'delete', goal: activeGoal }); }} style={styles.deleteButton}><Ionicons name="trash-outline" size={18} color="#B42318" /><Text style={styles.deleteText}>Delete goal</Text></Pressable>
            </>}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  </>;
}

const styles = StyleSheet.create({
  totalCard: { backgroundColor: '#173F34', borderColor: '#355B4B', borderWidth: 1, borderRadius: 26, padding: 24, boxShadow: '0 12px 28px rgba(23,63,52,0.12)' },
  totalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  totalLabel: { color: '#D6E0D1', fontSize: 13, fontWeight: '500' },
  totalIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#2B5145', borderWidth: 1, borderColor: '#466357', alignItems: 'center', justifyContent: 'center' },
  totalAmount: { color: '#FAF7EE', fontSize: 38, fontWeight: '500', letterSpacing: -1.4, fontVariant: ['tabular-nums'], marginTop: 12, marginBottom: 24 },
  totalFooter: { borderTopWidth: 1, borderColor: '#426152', paddingTop: 16, flexDirection: 'row', alignItems: 'center', gap: 10 },
  totalMeta: { color: '#D6E0D1', fontSize: 12 },
  totalDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#A5BAA8' },
  sectionHeader: { marginTop: 28, marginBottom: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: '600', letterSpacing: -0.4 },
  goalCard: { backgroundColor: '#FFFEFB', borderWidth: 1, borderColor: '#E7EAE2', borderRadius: 24, padding: 20, boxShadow: '0 6px 22px rgba(23,46,40,0.04)' },
  goalHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 22 },
  goalIcon: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  goalName: { color: colors.text, fontSize: 16, fontWeight: '600', letterSpacing: -0.3 },
  goalTarget: { color: colors.textMuted, fontSize: 11, lineHeight: 17, marginTop: 5 },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  progressHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  savedAmount: { flexShrink: 1, color: colors.text, fontSize: 25, fontWeight: '500', letterSpacing: -0.7, fontVariant: ['tabular-nums'] },
  percentBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#F0F3EB', borderRadius: 10 },
  percent: { color: colors.primary, fontSize: 12, fontWeight: '600' },
  progressTrack: { height: 7, borderRadius: 8, backgroundColor: '#E6EAE0', overflow: 'hidden', marginTop: 16 },
  progressFill: { height: '100%', borderRadius: 8 },
  progressFoot: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginTop: 10 },
  small: { color: colors.textMuted, fontSize: 11, lineHeight: 17 },
  depositButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#EDF2E9', borderRadius: 12, paddingHorizontal: 14, marginTop: 20 },
  depositButtonText: { color: colors.primary, fontSize: 13, fontWeight: '600' },
  exampleBadge: { alignSelf: 'flex-start', color: colors.textMuted, fontSize: 10, backgroundColor: colors.bg, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 7, marginBottom: 18 },
  exampleDetail: { color: colors.textMuted, fontSize: 13, lineHeight: 20, textAlign: 'center', paddingHorizontal: 8 },
  backdrop: { flex: 1, backgroundColor: 'rgba(13,32,25,0.4)', justifyContent: 'flex-end', alignItems: 'center' },
  sheet: { width: '100%', maxWidth: 760, maxHeight: '90%', backgroundColor: '#FFFEFB', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 22, paddingTop: 18 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  sheetTitle: { color: colors.text, fontSize: 21, fontWeight: '600', letterSpacing: -0.5 },
  selectedGoal: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 20, marginBottom: 18, borderBottomWidth: 1, borderColor: colors.border },
  availableRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, gap: 12 },
  availableAmount: { color: colors.text, fontSize: 12, fontWeight: '600' },
  amountField: { minHeight: 84, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 18, borderWidth: 1, borderColor: '#DEE5D8', backgroundColor: '#F5F6EF', paddingHorizontal: 18 },
  currency: { color: colors.textMuted, fontSize: 18, fontWeight: '500' },
  amountInput: { flex: 1, minWidth: 0, fontSize: 34, fontWeight: '500', color: colors.text, paddingVertical: 18, fontVariant: ['tabular-nums'] },
  quickAmounts: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  quickButton: { minHeight: 44, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  quickText: { color: colors.primary, fontSize: 12, fontWeight: '600' },
  sheetHelp: { color: colors.textMuted, fontSize: 12, lineHeight: 19, marginTop: 16, marginBottom: 20 },
  primaryButton: { minHeight: 50, backgroundColor: colors.primary, borderRadius: 15, flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  primaryText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  secondaryButton: { minHeight: 48, backgroundColor: colors.primarySoft, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  deleteButton: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12, borderRadius: 14, backgroundColor: '#FFF0ED' },
  deleteText: { color: '#B42318', fontSize: 13, fontWeight: '600' },
  error: { color: '#B42318', fontSize: 12, lineHeight: 18, marginTop: 10 },
  pressed: { opacity: 0.65 },
});
