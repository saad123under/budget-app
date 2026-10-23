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
import { useExpenses } from '../store/ExpensesContext';
import { parseAmount } from '../utils/budget';
import { currencySymbol } from '../constants/currencies';

const iconOptions = [
  'car-sport-outline', 'home-outline', 'airplane-outline', 'phone-portrait-outline',
  'laptop-outline', 'watch-outline', 'gift-outline', 'school-outline',
  'bicycle-outline', 'camera-outline', 'boat-outline', 'diamond-outline',
];

const colorOptions = [
  { bg: '#EDE9FE', tint: '#6C4EF6' },
  { bg: '#DDE7FF', tint: '#2F6BFF' },
  { bg: '#FFE1EC', tint: '#EC4899' },
  { bg: '#FFEDE3', tint: '#FF7A45' },
  { bg: '#E8F5EC', tint: '#22C55E' },
  { bg: '#CCFBF1', tint: '#14B8A6' },
  { bg: '#FEF3C7', tint: '#F59E0B' },
];

export default function AddGoal() {
  const insets = useSafeAreaInsets();
  const { addGoal, currency } = useExpenses();

  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [icon, setIcon] = useState(iconOptions[0]);
  const [color, setColor] = useState(colorOptions[0]);

  const parsedTarget = parseAmount(target);
  const canSave = name.trim().length > 0 && parsedTarget !== null;

  const save = () => {
    if (!canSave || parsedTarget === null) return;
    addGoal({
      name: name.trim(),
      target: parsedTarget,
      icon,
      color: color.bg,
      tint: color.tint,
    });
    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.bg }}
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
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="close" size={20} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>New Savings Goal</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Target amount */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>TARGET AMOUNT</Text>
          <View style={styles.amountRow}>
            <Text style={[styles.currency, currencySymbol(currency).length > 1 && { fontSize: 20 }]}>{currencySymbol(currency)}</Text>
            <TextInput
              value={target}
              onChangeText={(t) => setTarget(t.replace(/[^0-9.]/g, ''))}
              placeholder="0.00"
              placeholderTextColor="#C7CCD6"
              keyboardType="decimal-pad"
              style={styles.amountInput}
              autoFocus
            />
          </View>
        </View>

        {/* Name */}
        <Text style={styles.fieldLabel}>WHAT ARE YOU SAVING FOR?</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. New Car, Apartment, Vacation"
          placeholderTextColor="#B9BFC9"
          style={styles.input}
        />

        {/* Icon */}
        <Text style={styles.fieldLabel}>ICON</Text>
        <View style={styles.iconGrid}>
          {iconOptions.map((ic) => (
            <Pressable
              key={ic}
              onPress={() => setIcon(ic)}
              style={[
                styles.iconChip,
                icon === ic && { backgroundColor: color.bg, borderColor: color.tint },
              ]}
            >
              <Ionicons
                name={ic as any}
                size={20}
                color={icon === ic ? color.tint : colors.text}
              />
            </Pressable>
          ))}
        </View>

        {/* Color */}
        <Text style={styles.fieldLabel}>COLOR</Text>
        <View style={styles.colorRow}>
          {colorOptions.map((c, i) => (
            <Pressable
              key={i}
              onPress={() => setColor(c)}
              style={[
                styles.colorDot,
                { backgroundColor: c.tint },
                color.tint === c.tint && { borderWidth: 3, borderColor: colors.text },
              ]}
            />
          ))}
        </View>

        {/* Save */}
        <Pressable
          onPress={save}
          disabled={!canSave}
          style={[styles.saveBtn, !canSave && { opacity: 0.4 }]}
        >
          <Text style={styles.saveText}>Create Goal</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: '#fff', borderRadius: 22, padding: 22, alignItems: 'center',
    borderWidth: 1, borderColor: colors.border, marginBottom: 24,
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

  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  iconChip: {
    width: 48, height: 48, borderRadius: 14,
    borderWidth: 1.5, borderColor: colors.border, backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
  },

  colorRow: { flexDirection: 'row', gap: 10, marginBottom: 30 },
  colorDot: { width: 34, height: 34, borderRadius: 17 },

  saveBtn: {
    backgroundColor: colors.primary, borderRadius: 18, paddingVertical: 16,
    alignItems: 'center',
    shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 }, elevation: 6,
  },
  saveText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
