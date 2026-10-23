import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors } from '../constants/colors';
import { useExpenses } from '../store/ExpensesContext';
import { createCurrency } from '../constants/currencies';

export function ProfileHeader() {
  const [visible, setVisible] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState('');
  const [choosingCurrency, setChoosingCurrency] = useState(false);
  const [addingCurrency, setAddingCurrency] = useState(false);
  const [currencyCode, setCurrencyCode] = useState('');
  const [currencyName, setCurrencyName] = useState('');
  const [currencyError, setCurrencyError] = useState('');
  const { expenses, savings, reset, currency, setCurrency, availableCurrencies, addCurrency } = useExpenses();

  const cancelCurrency = () => {
    setAddingCurrency(false);
    setCurrencyCode('');
    setCurrencyName('');
    setCurrencyError('');
  };

  const saveCurrency = () => {
    const option = createCurrency(currencyCode, currencyName);
    if (!option) {
      setCurrencyError('Enter a three-letter code and a currency name.');
      return;
    }
    if (availableCurrencies.some(item => item.code === option.code)) {
      setCurrencyError(`${option.code} is already in your currency list. Choose it from Currency.`);
      return;
    }
    if (addCurrency(option.code, option.name)) cancelCurrency();
  };

  const close = () => {
    if (resetting) return;
    setVisible(false);
    setConfirmingReset(false);
    setChoosingCurrency(false);
    cancelCurrency();
    setError('');
  };

  const resetBudget = async () => {
    if (resetting) return;
    setResetting(true);
    setError('');
    try {
      await reset();
      setVisible(false);
      setConfirmingReset(false);
      router.replace('/setup');
    } catch {
      setError('Could not reset your budget. Please try again.');
    } finally {
      setResetting(false);
    }
  };

  return <>
    <View style={styles.header}>
      <Pressable accessibilityRole="button" accessibilityLabel="Open profile" onPress={() => setVisible(true)} style={({ pressed }) => [styles.avatar, pressed && { opacity: 0.65 }]}>
        <Ionicons name="person-outline" size={22} color={colors.primary} />
      </Pressable>
    </View>
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.backdrop}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close profile" style={StyleSheet.absoluteFill} onPress={close} />
        <View accessibilityViewIsModal style={styles.card}>
          <View style={styles.top}>
            <Text style={styles.title}>{confirmingReset ? 'Reset budget?' : addingCurrency ? 'Add currency' : 'Profile'}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Close profile panel" disabled={resetting} onPress={close} style={styles.close}>
              <Ionicons name="close" size={22} color={colors.text} />
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {confirmingReset ? <>
            <Text style={[styles.detail, { textAlign: 'left', marginVertical: 16 }]}>This will delete all expenses, savings goals, and custom categories, clear your balance, and restore the default categories. This cannot be undone.</Text>
            {error !== '' && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
            <Pressable accessibilityRole="button" disabled={resetting} onPress={() => { setConfirmingReset(false); setError(''); }} style={styles.cancelButton}><Text style={styles.name}>Cancel</Text></Pressable>
            <Pressable accessibilityRole="button" disabled={resetting} accessibilityState={{ disabled: resetting, busy: resetting }} onPress={resetBudget} style={[styles.resetButton, resetting && { opacity: 0.5 }]}><Ionicons name="refresh-outline" size={19} color="#B42318" /><Text style={styles.resetText}>{resetting ? 'Resetting…' : 'Reset all data'}</Text></Pressable>
          </> : addingCurrency ? <View style={{ gap: 14, paddingVertical: 16 }}>
            <Text style={[styles.detail, { textAlign: 'left' }]}>Add a currency to your list, then use it for your budget.</Text>
            <Text style={styles.currencyTitle}>Currency code</Text>
            <TextInput accessibilityLabel="Currency code" placeholder="e.g. TND" placeholderTextColor={colors.textMuted} value={currencyCode} onChangeText={text => { setCurrencyCode(text.toUpperCase()); setCurrencyError(''); }} maxLength={3} autoCapitalize="characters" autoCorrect={false} style={styles.input} />
            <Text style={styles.currencyTitle}>Currency name</Text>
            <TextInput accessibilityLabel="Currency name" placeholder="e.g. Tunisian dinar" placeholderTextColor={colors.textMuted} value={currencyName} onChangeText={text => { setCurrencyName(text); setCurrencyError(''); }} maxLength={50} autoCapitalize="words" returnKeyType="done" onSubmitEditing={saveCurrency} style={styles.input} />
            {currencyError !== '' && <Text accessibilityRole="alert" style={styles.error}>{currencyError}</Text>}
            <Pressable accessibilityRole="button" onPress={saveCurrency} style={styles.saveCurrency}><Text style={styles.saveCurrencyText}>Save and use currency</Text></Pressable>
            <Pressable accessibilityRole="button" onPress={cancelCurrency} style={styles.cancelButton}><Text style={styles.currencyTitle}>Cancel</Text></Pressable>
          </View> : <>
          <View style={[styles.avatar, { alignSelf: 'center', marginVertical: 12 }]}><Ionicons name="person-outline" size={22} color={colors.primary} /></View>
          <Text style={styles.name}>My budget</Text>
          <Text style={styles.detail}>Your budget is stored on this device.</Text>
          <View style={styles.summary}>
            <View style={styles.stat}><Text style={styles.number}>{expenses.length}</Text><Text style={styles.detail}>Expenses</Text></View>
            <View style={styles.stat}><Text style={styles.number}>{savings.length}</Text><Text style={styles.detail}>Savings goals</Text></View>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel={`Currency: ${currency}. Change currency`} accessibilityState={{ expanded: choosingCurrency }} onPress={() => setChoosingCurrency(!choosingCurrency)} style={styles.currencyButton}>
            <Ionicons name="cash-outline" size={21} color={colors.primary} />
            <View style={{ flex: 1 }}><Text style={styles.currencyTitle}>Currency</Text><Text style={[styles.detail, { textAlign: 'left' }]}>{currency} · {availableCurrencies.find(item => item.code === currency)?.name}</Text></View>
            <Ionicons name={choosingCurrency ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Add currency" onPress={() => { setAddingCurrency(true); setChoosingCurrency(false); }} style={styles.addCurrency}>
            <Ionicons name="add-circle-outline" size={20} color={colors.primary} /><Text style={styles.currencyTitle}>Add currency</Text>
          </Pressable>
          {choosingCurrency && <View accessibilityRole="radiogroup" accessibilityLabel="Budget currency" style={styles.currencyList}>
            {availableCurrencies.map(item => <Pressable key={item.code} accessibilityRole="radio" accessibilityLabel={`${item.code}, ${item.name}`} accessibilityState={{ checked: currency === item.code }} onPress={() => { setCurrency(item.code); setChoosingCurrency(false); }} style={[styles.currencyOption, currency === item.code && { backgroundColor: colors.primarySoft }]}>
              <View style={{ flex: 1 }}><Text style={styles.currencyTitle}>{item.code}{item.symbol !== item.code ? ` · ${item.symbol}` : ''}</Text><Text style={[styles.detail, { textAlign: 'left' }]}>{item.name}</Text></View>
              {currency === item.code && <Ionicons name="checkmark-circle" size={22} color={colors.primary} />}
            </Pressable>)}
          </View>}
          <Text style={[styles.detail, { textAlign: 'left', marginTop: 8 }]}>Applies to all amounts. Changing currency does not convert existing values.</Text>
          <Pressable accessibilityRole="button" onPress={() => setConfirmingReset(true)} style={styles.resetButton}><Ionicons name="refresh-outline" size={19} color="#B42318" /><Text style={styles.resetText}>Reset budget</Text></Pressable>
          </>}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  </>;
}

const styles = StyleSheet.create({
  input: { minHeight: 48, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: colors.text, fontSize: 15, backgroundColor: colors.bg },
  addCurrency: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12 },
  saveCurrency: { minHeight: 48, backgroundColor: colors.primary, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  saveCurrencyText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  currencyButton: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.bg, borderRadius: 14, padding: 14, marginTop: 20, minHeight: 64 },
  currencyTitle: { color: colors.text, fontSize: 14, fontWeight: '600' },
  currencyList: { marginTop: 8, gap: 4 },
  currencyOption: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, minHeight: 60 },
  resetButton: { minHeight: 48, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF0EE', borderRadius: 14, marginTop: 20 },
  resetText: { fontSize: 14, fontWeight: '700', color: '#B42318' },
  cancelButton: { minHeight: 48, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg, borderRadius: 14 },
  error: { color: '#B42318', fontSize: 13, marginBottom: 12 },
  header: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 16 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F5F8F0', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E6EFE5', boxShadow: '0 4px 12px rgba(23,46,40,0.05)' },
  backdrop: { flex: 1, backgroundColor: 'rgba(15,35,28,0.4)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: colors.card, borderRadius: 24, padding: 22, width: '100%', maxWidth: 400, maxHeight: '90%' },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 20, fontWeight: '700', color: colors.text },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 18, fontWeight: '700', color: colors.text, textAlign: 'center', marginBottom: 8 },
  detail: { fontSize: 13, lineHeight: 20, color: colors.textMuted, textAlign: 'center' },
  summary: { flexDirection: 'row', borderTopWidth: 1, borderColor: colors.border, paddingTop: 20, marginTop: 24 },
  stat: { flex: 1, alignItems: 'center', gap: 5 },
  number: { fontSize: 23, fontWeight: '700', color: colors.text },
});
