export const currencies = [
  { code: 'MAD', name: 'Moroccan dirham', symbol: 'MAD' },
  { code: 'USD', name: 'US dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British pound', symbol: '£' },
  { code: 'CAD', name: 'Canadian dollar', symbol: 'CA$' },
  { code: 'AUD', name: 'Australian dollar', symbol: 'A$' },
  { code: 'CHF', name: 'Swiss franc', symbol: 'CHF' },
  { code: 'SAR', name: 'Saudi riyal', symbol: 'SAR' },
  { code: 'AED', name: 'UAE dirham', symbol: 'AED' },
] as const;

export type Currency = string;
export type CurrencyOption = { code: string; name: string; symbol: string };

export function isCurrency(value: unknown): value is Currency {
  return typeof value === 'string' && /^[A-Z]{3}$/.test(value);
}

export function currencySymbol(code: Currency) {
  return currencies.find(currency => currency.code === code)?.symbol ?? code;
}

export function createCurrency(code: string, name: string): CurrencyOption | null {
  const normalizedCode = code.trim().toUpperCase();
  const normalizedName = name.trim();
  if (!isCurrency(normalizedCode) || normalizedName.length === 0 || normalizedName.length > 50) return null;
  return { code: normalizedCode, name: normalizedName, symbol: normalizedCode };
}

export function restoreCustomCurrencies(value: unknown): CurrencyOption[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>(currencies.map(item => item.code));
  return value.flatMap(item => {
    if (!item || typeof item.code !== 'string' || typeof item.name !== 'string') return [];
    const option = createCurrency(item.code, item.name);
    if (!option || seen.has(option.code)) return [];
    seen.add(option.code);
    return [option];
  });
}
