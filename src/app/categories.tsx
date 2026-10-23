import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import { useExpenses, Category } from '../store/ExpensesContext';

const iconOptions = [
  'fast-food-outline', 'car-outline', 'bag-outline', 'receipt-outline',
  'home-outline', 'airplane-outline', 'game-controller-outline', 'fitness-outline',
  'cafe-outline', 'shirt-outline', 'book-outline', 'gift-outline',
];

const colorOptions = [
  { bg: '#EDE9FE', tint: '#6C4EF6' },
  { bg: '#DDE7FF', tint: '#2F6BFF' },
  { bg: '#FFE1EC', tint: '#EC4899' },
  { bg: '#FFEDE3', tint: '#FF7A45' },
  { bg: '#E8F5EC', tint: '#22C55E' },
  { bg: '#FEF3C7', tint: '#F59E0B' },
  { bg: '#F3E8FF', tint: '#8B5CF6' },
];

export default function CategoriesScreen() {
  const insets = useSafeAreaInsets();
  const { categories, addCategory, removeCategory } = useExpenses();

  const [name, setName] = useState('');
  const [icon, setIcon] = useState(iconOptions[0]);
  const [color, setColor] = useState(colorOptions[0]);
  const [showForm, setShowForm] = useState(false);

  const save = () => {
    if (!name.trim()) return;
    if (categories.some((c) => c.key.toLowerCase() === name.trim().toLowerCase())) {
      Alert.alert('Duplicate', 'A category with that name already exists.');
      return;
    }
    const newCat: Category = {
      key: name.trim(),
      icon,
      color: color.bg,
      tint: color.tint,
    };
    addCategory(newCat);
    setName('');
    setShowForm(false);
  };

  const remove = (key: string) => {
    Alert.alert('Delete category?', `"${key}" will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeCategory(key) },
    ]);
  };

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: 20,
          width: '100%', maxWidth: 760, alignSelf: 'center',
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="close" size={20} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Categories</Text>
          <Pressable onPress={() => setShowForm((v) => !v)} style={styles.iconBtn}>
            <Ionicons name={showForm ? 'close' : 'add'} size={20} color={colors.text} />
          </Pressable>
        </View>

        {/* New category form */}
        {showForm && (
          <View style={styles.formCard}>
            <Text style={styles.fieldLabel}>NAME</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Subscriptions"
              placeholderTextColor="#B9BFC9"
              style={styles.input}
              autoFocus
            />

            <Text style={styles.fieldLabel}>ICON</Text>
            <View style={styles.iconRow}>
              {iconOptions.map((ic) => (
                <Pressable
                  key={ic}
                  onPress={() => setIcon(ic)}
                  style={[styles.iconChip, icon === ic && { backgroundColor: color.bg, borderColor: color.tint }]}
                >
                  <Ionicons name={ic as any} size={18} color={icon === ic ? color.tint : colors.text} />
                </Pressable>
              ))}
            </View>

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

            <Pressable onPress={save} style={styles.saveBtn}>
              <Text style={styles.saveText}>Save Category</Text>
            </Pressable>
          </View>
        )}

        {/* List */}
        <Text style={styles.sectionLabel}>YOUR CATEGORIES</Text>
        {categories.map((c) => (
          <View key={c.key} style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: c.color }]}>
              <Ionicons name={c.icon as any} size={18} color={c.tint} />
            </View>
            <Text style={styles.rowTitle}>{c.key}</Text>
            <Pressable onPress={() => remove(c.key)} hitSlop={10}>
              <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: colors.text },

  formCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: colors.bg,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
  },
  iconRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  iconChip: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  colorDot: { width: 30, height: 30, borderRadius: 15 },
  saveBtn: {
    marginTop: 20,
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontWeight: '800', fontSize: 14 },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowTitle: { flex: 1, fontWeight: '700', color: colors.text, fontSize: 15 },
});
