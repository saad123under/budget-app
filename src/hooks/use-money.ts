import { useMemo } from 'react';
import { useExpenses } from '../store/ExpensesContext';

export function useMoney() {
  const { currency } = useExpenses();
  const formatter = useMemo(() => new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }), [currency]);
  return (value: number) => formatter.format(value);
}
