import { Redirect } from 'expo-router';
import { useExpenses } from '../store/ExpensesContext';

export default function Index() {
  const { loaded, startingBalance } = useExpenses();

  if (!loaded) return null;

  if (startingBalance === 0) {
    return <Redirect href="/setup" />;
  }
  return <Redirect href="/(tabs)" />;
}