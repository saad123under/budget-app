import type { Expense } from '../store/ExpensesContext';
import type { Currency } from '../constants/currencies';

export const money = (value: number, currency: Currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

export function parseAmount(value: string): number | null {
  if (!/^(?:\d+(?:\.\d{0,2})?|\.\d{1,2})$/.test(value.trim())) return null;
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 && amount <= Number.MAX_SAFE_INTEGER / 100
    ? Math.round(amount * 100) / 100 : null;
}

export function inMonth(expenses: Expense[], month: Date) {
  return expenses.filter(expense => {
    const date = new Date(expense.date);
    return date.getMonth() === month.getMonth() && date.getFullYear() === month.getFullYear();
  });
}

export function categoryTotals(expenses: Expense[]) {
  const totals = new Map<string, number>();
  expenses.forEach(expense => totals.set(expense.category, (totals.get(expense.category) ?? 0) + expense.amount));
  return [...totals].map(([name, amount]) => ({ name, amount })).sort((a, b) => b.amount - a.amount);
}
