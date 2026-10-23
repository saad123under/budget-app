import React, { createContext, useContext, useEffect, useReducer } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { type Currency, type CurrencyOption, currencies, createCurrency, restoreCustomCurrencies } from '../constants/currencies';

export type ExpenseType = 'single' | 'subscription';

export type Expense = {
  type: ExpenseType;
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  icon: string;
  color: string;
};

export type Category = {
  key: string;
  icon: string;
  color: string;
  tint: string;
};

export type SavingGoal = {
  id: string;
  name: string;
  target: number;
  saved: number;
  icon: string;
  color: string;
  tint: string;
  deposits: { id: string; amount: number; date: string }[];
};

type State = {
  currency: Currency;
  customCurrencies: CurrencyOption[];
  expenses: Expense[];
  categories: Category[];
  savings: SavingGoal[];
  startingBalance: number;
  loaded: boolean;
};

const defaultCategories: Category[] = [
  { key: 'Food', icon: 'fast-food-outline', color: '#EDE9FE', tint: '#6C4EF6' },
  { key: 'Transport', icon: 'car-outline', color: '#DDE7FF', tint: '#2F6BFF' },
  { key: 'Shopping', icon: 'bag-outline', color: '#FFE1EC', tint: '#EC4899' },
  { key: 'Bills', icon: 'receipt-outline', color: '#FFEDE3', tint: '#FF7A45' },
  { key: 'Other', icon: 'ellipsis-horizontal', color: '#E8F5EC', tint: '#22C55E' },
];

type Action =
  | { type: 'ADD_CURRENCY'; payload: CurrencyOption }
  | { type: 'SET_CURRENCY'; payload: Currency }
  | { type: 'LOAD'; payload: Partial<State> }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'SET_BALANCE'; payload: number }
  | { type: 'ADD_GOAL'; payload: SavingGoal }
  | { type: 'DELETE_GOAL'; payload: string }
  | { type: 'DEPOSIT'; payload: { goalId: string; amount: number } }
  | { type: 'WITHDRAW'; payload: { goalId: string; amount: number } };

const initial: State = {
  currency: 'USD',
  customCurrencies: [],
  expenses: [],
  categories: defaultCategories,
  savings: [],
  startingBalance: 0,
  loaded: false,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_CURRENCY':
      if ([...currencies, ...state.customCurrencies].some(item => item.code === action.payload.code)) return state;
      return { ...state, customCurrencies: [...state.customCurrencies, action.payload], currency: action.payload.code };
    case 'SET_CURRENCY':
      return { ...state, currency: action.payload };
    case 'LOAD':
      return { ...state, ...action.payload, loaded: true };
    case 'ADD_EXPENSE':
      return { ...state, expenses: [action.payload, ...state.expenses] };
    case 'DELETE_EXPENSE':
      return { ...state, expenses: state.expenses.filter((e) => e.id !== action.payload) };
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] };
    case 'DELETE_CATEGORY':
      return { ...state, categories: state.categories.filter((c) => c.key !== action.payload) };
    case 'SET_BALANCE':
      return { ...state, startingBalance: action.payload };
    case 'ADD_GOAL':
      return { ...state, savings: [...state.savings, action.payload] };
    case 'DELETE_GOAL':
      return { ...state, savings: state.savings.filter((g) => g.id !== action.payload) };
    case 'DEPOSIT':
      return {
        ...state,
        savings: state.savings.map((g) =>
          g.id === action.payload.goalId
            ? {
                ...g,
                saved: g.saved + action.payload.amount,
                deposits: [
                  {
                    id: Date.now().toString(),
                    amount: action.payload.amount,
                    date: new Date().toISOString(),
                  },
                  ...g.deposits,
                ],
              }
            : g
        ),
      };
    case 'WITHDRAW':
      return {
        ...state,
        savings: state.savings.map((g) =>
          g.id === action.payload.goalId
            ? { ...g, saved: Math.max(0, g.saved - action.payload.amount) }
            : g
        ),
      };
    default:
      return state;
  }
}

const Ctx = createContext<{
  currency: Currency;
  availableCurrencies: readonly CurrencyOption[];
  addCurrency: (code: string, name: string) => boolean;
  setCurrency: (currency: Currency) => void;
  expenses: Expense[];
  categories: Category[];
  savings: SavingGoal[];
  startingBalance: number;
  loaded: boolean;
  balance: number;
  totalSpent: number;
  totalSaved: number;
  addExpense: (e: Omit<Expense, 'id'>) => void;
  removeExpense: (id: string) => void;
  addCategory: (c: Category) => void;
  removeCategory: (key: string) => void;
  setBalance: (n: number) => void;
  addGoal: (g: Omit<SavingGoal, 'id' | 'saved' | 'deposits'>) => void;
  removeGoal: (id: string) => void;
  deposit: (goalId: string, amount: number) => void;
  withdraw: (goalId: string, amount: number) => void;
  reset: () => Promise<void>;
}>({
  currency: 'USD',
  availableCurrencies: currencies,
  addCurrency: () => false,
  setCurrency: () => {},
  expenses: [],
  categories: [],
  savings: [],
  startingBalance: 0,
  loaded: false,
  balance: 0,
  totalSpent: 0,
  totalSaved: 0,
  addExpense: () => {},
  removeExpense: () => {},
  addCategory: () => {},
  removeCategory: () => {},
  setBalance: () => {},
  addGoal: () => {},
  removeGoal: () => {},
  deposit: () => {},
  withdraw: () => {},
  reset: async () => {},
});

const KEY = 'budget_v4';

export function ExpensesProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        const data = raw ? JSON.parse(raw) : {};
        const customCurrencies = restoreCustomCurrencies(data.customCurrencies);
        dispatch({
          type: 'LOAD',
          payload: {
            expenses: (data.expenses ?? []).map((expense: Expense) => ({
              ...expense,
              type: expense.type === 'subscription' ? 'subscription' : 'single',
            })),
            categories: data.categories ?? defaultCategories,
            savings: data.savings ?? [],
            startingBalance: data.startingBalance ?? 0,
            customCurrencies,
            currency: [...currencies, ...customCurrencies].some(item => item.code === data.currency) ? data.currency : 'USD',
          },
        });
      } catch {
        dispatch({ type: 'LOAD', payload: {} });
      }
    })();
  }, []);

  useEffect(() => {
    if (!state.loaded) return;
    AsyncStorage.setItem(
      KEY,
      JSON.stringify({
        expenses: state.expenses,
        categories: state.categories,
        savings: state.savings,
        startingBalance: state.startingBalance,
        currency: state.currency,
        customCurrencies: state.customCurrencies,
      })
    );
  }, [state.expenses, state.categories, state.savings, state.startingBalance, state.currency, state.customCurrencies, state.loaded]);

  const availableCurrencies = [...currencies, ...state.customCurrencies];
  const addCurrency = (code: string, name: string) => {
    const option = createCurrency(code, name);
    if (!option || availableCurrencies.some(item => item.code === option.code)) return false;
    dispatch({ type: 'ADD_CURRENCY', payload: option });
    return true;
  };

  const addExpense = (e: Omit<Expense, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2, 7);
    dispatch({ type: 'ADD_EXPENSE', payload: { ...e, id } });
  };
  const removeExpense = (id: string) => dispatch({ type: 'DELETE_EXPENSE', payload: id });
  const addCategory = (c: Category) => dispatch({ type: 'ADD_CATEGORY', payload: c });
  const removeCategory = (key: string) => dispatch({ type: 'DELETE_CATEGORY', payload: key });
  const setBalance = (n: number) => dispatch({ type: 'SET_BALANCE', payload: n });

  const addGoal = (g: Omit<SavingGoal, 'id' | 'saved' | 'deposits'>) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2, 7);
    dispatch({ type: 'ADD_GOAL', payload: { ...g, id, saved: 0, deposits: [] } });
  };
  const removeGoal = (id: string) => dispatch({ type: 'DELETE_GOAL', payload: id });
  const deposit = (goalId: string, amount: number) =>
    dispatch({ type: 'DEPOSIT', payload: { goalId, amount } });
  const withdraw = (goalId: string, amount: number) =>
    dispatch({ type: 'WITHDRAW', payload: { goalId, amount } });

  const reset = async () => {
    await AsyncStorage.removeItem(KEY);
    dispatch({
      type: 'LOAD',
      payload: {
        expenses: [],
        categories: defaultCategories,
        savings: [],
        startingBalance: 0,
      },
    });
  };

  const totalSpent = state.expenses.reduce((s, e) => s + e.amount, 0);
  const totalSaved = state.savings.reduce((s, g) => s + g.saved, 0);
  const balance = state.startingBalance - totalSpent - totalSaved;

  return (
    <Ctx.Provider
      value={{
        currency: state.currency,
        availableCurrencies,
        addCurrency,
        setCurrency: (currency: Currency) => dispatch({ type: 'SET_CURRENCY', payload: currency }),
        expenses: state.expenses,
        categories: state.categories,
        savings: state.savings,
        startingBalance: state.startingBalance,
        loaded: state.loaded,
        balance,
        totalSpent,
        totalSaved,
        addExpense,
        removeExpense,
        addCategory,
        removeCategory,
        setBalance,
        addGoal,
        removeGoal,
        deposit,
        withdraw,
        reset,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useExpenses = () => useContext(Ctx);
