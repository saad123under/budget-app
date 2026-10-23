import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import { useExpenses } from '../store/ExpensesContext';
import { parseAmount } from '../utils/budget';
import { currencySymbol } from '../constants/currencies';

export default function Setup() {
  const insets = useSafeAreaInsets();
  const { setBalance, currency } = useExpenses();
  const [value, setValue] = useState('');

  const parsedAmount = parseAmount(value);
  const canContinue = parsedAmount !== null;

  const next = () => {
    if (parsedAmount === null) return;
    setBalance(parsedAmount);
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.root}
    >
      <View style={[styles.inner, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }]}>
        {/* Icon */}
        <View style={styles.heroIcon}>
          <Ionicons name="wallet-outline" size={40} color={colors.primary} />
        </View>

        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.sub}>
          Set your current balance to start seeing where your money goes.
        </Text>

        {/* Amount */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>STARTING BALANCE</Text>
          <View style={styles.amountRow}>
            <Text style={[styles.currency, currencySymbol(currency).length > 1 && { fontSize: 20 }]}>{currencySymbol(currency)}</Text>
            <TextInput
              value={value}
              onChangeText={(t) => setValue(t.replace(/[^0-9.]/g, ''))}
              placeholder="0.00"
              placeholderTextColor="#C7CCD6"
              keyboardType="decimal-pad"
              style={styles.input}
              autoFocus
            />
          </View>
        </View>

        <View style={{ flex: 1 }} />

        <Pressable
          onPress={next}
          disabled={!canContinue}
          style={[styles.btn, !canContinue && { opacity: 0.4 }]}
        >
          <Text style={styles.btnText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  inner: { flex: 1, paddingHorizontal: 24, width: '100%', maxWidth: 760, alignSelf: 'center' },

  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 26,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.6,
  },
  sub: {
    fontSize: 15,
    color: colors.textMuted,
    marginTop: 10,
    lineHeight: 22,
  },

  amountCard: {
    marginTop: 36,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  amountLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1,
  },
  amountRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  currency: { fontSize: 36, fontWeight: '800', color: colors.textMuted, marginRight: 4 },
  input: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.text,
    minWidth: 140,
    textAlign: 'center',
    letterSpacing: -1.5,
  },

  btn: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
