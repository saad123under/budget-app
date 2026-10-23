import { useState } from 'react';
import { Tabs, router } from 'expo-router';
import { View, Pressable, StyleSheet, Text, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../constants/colors';

function CustomTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();
  const [showAdd, setShowAdd] = useState(false);
  const add = (path: '/add' | '/add-goal') => {
    setShowAdd(false);
    router.push(path);
  };

  const tabs = [
    { name: 'index', label: 'Home', icon: 'home-outline', activeIcon: 'home' },
    { name: 'expenses', label: 'Expenses', icon: 'list-outline', activeIcon: 'list' },
    { name: 'savings', label: 'Savings', icon: 'trending-up-outline', activeIcon: 'trending-up' },
    { name: 'total', label: 'Stats', icon: 'stats-chart-outline', activeIcon: 'stats-chart' },
  ];

  const left = tabs.slice(0, 2);
  const right = tabs.slice(2);

  const renderTab = (tab: any) => {
    const routeIndex = state.routes.findIndex((r: any) => r.name === tab.name);
    const focused = state.index === routeIndex;
    return (
      <Pressable
        key={tab.name}
        accessibilityRole="tab"
        accessibilityLabel={tab.label}
        accessibilityState={{ selected: focused }}
        onPress={() => navigation.navigate(tab.name)}
        style={styles.tabBtn}
      >
        <Ionicons
          name={(focused ? tab.activeIcon : tab.icon) as any}
          size={21}
          color={focused ? colors.teal : colors.textMuted}
        />
        <Text style={[styles.tabLabel, focused && { color: colors.teal, fontWeight: '700' }]}>
          {tab.label}
        </Text>
      </Pressable>
    );
  };

  return (
    <>
    <View style={[styles.wrap, { bottom: insets.bottom + 12 }]}>
      <View style={styles.bar}>
        {left.map(renderTab)}

        <Pressable accessibilityRole="button" accessibilityLabel="Add expense or savings goal" style={styles.fab} onPress={() => setShowAdd(true)}>
          <Ionicons name="add" size={26} color="#fff" />
        </Pressable>

        {right.map(renderTab)}
      </View>
    </View>
    <Modal visible={showAdd} transparent animationType="slide" onRequestClose={() => setShowAdd(false)}>
      <View style={styles.backdrop}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close add menu" style={StyleSheet.absoluteFill} onPress={() => setShowAdd(false)} />
        <View accessibilityViewIsModal style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <Text style={styles.sheetTitle}>What would you like to add?</Text>
          <Pressable accessibilityRole="button" style={styles.option} onPress={() => add('/add')}>
            <Ionicons name="receipt-outline" size={24} color={colors.primary} />
            <View style={{ flex: 1 }}><Text style={styles.optionTitle}>Expense</Text><Text style={styles.optionDetail}>Record money you spent</Text></View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
          <Pressable accessibilityRole="button" style={styles.option} onPress={() => add('/add-goal')}>
            <Ionicons name="trending-up-outline" size={24} color={colors.primary} />
            <View style={{ flex: 1 }}><Text style={styles.optionTitle}>Savings goal</Text><Text style={styles.optionDetail}>Start saving for something</Text></View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
          <Pressable accessibilityRole="button" style={styles.cancel} onPress={() => setShowAdd(false)}><Text style={styles.optionTitle}>Cancel</Text></Pressable>
        </View>
      </View>
    </Modal>
    </>
  );
}

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <CustomTabBar {...props} />}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="expenses" />
      <Tabs.Screen name="savings" />
      <Tabs.Screen name="total" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(15,35,28,0.4)', justifyContent: 'flex-end', alignItems: 'center' },
  sheet: { backgroundColor: colors.card, width: '100%', maxWidth: 760, borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 22, gap: 12 },
  sheetTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 8 },
  option: { minHeight: 80, flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16, backgroundColor: colors.bg, borderRadius: 16 },
  optionTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  optionDetail: { fontSize: 12, color: colors.textMuted, marginTop: 5 },
  cancel: { minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  bar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 34,
    width: '94%',
    maxWidth: 760,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 2,
  },
  tabLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  fab: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.teal,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: colors.teal,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
});
