import {Decimal} from 'decimal.js';

export const formattedAmountold = (amount: number) => {
  if (amount >= 1_00_00_000) {
    return `${(amount / 1_00_00_000).toFixed(0)} Cr`;
  } else if (amount >= 1_00_000) {
    return `${(amount / 1_00_000).toFixed(0)} L`;
  } else if (amount >= 1000) {
    return `${amount.toLocaleString('en-IN')}`;
  } else {
    return `${amount.toFixed(2)}`;
  }
};

type SupportedCurrency = 'INR' | 'USD' | 'EUR' | 'GBP' | 'JPY';

interface FormatOptions {
  compact?: boolean;
  currency?: SupportedCurrency;
  locale?: string;
  minimumFractionDigits?: number;
}

export function parseAmountToFloat(amount: string): number {
  const cleaned = amount.replace(/[^0-9.-]+/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

export function formatToCurrency2(
  amount: number,
  {
    currency = 'INR',
    compact = true,
    locale = 'en-IN',
    minimumFractionDigits = 2,
  }: FormatOptions = {},
): string {
  const number = Number(amount);

  if (amount > BigInt(Number.MAX_SAFE_INTEGER)) {
    const shortened = amount.toString().slice(0, -10) + ' Cr+';
    return `${currency} ${shortened}`;
  }
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    notation: compact ? 'compact' : 'standard',
    minimumFractionDigits,
    maximumFractionDigits: 2,
  }).format(number);
}

// export const formatToCurrency = (
//   amount: number | string | bigint,
//   currency: SupportedCurrency = 'INR'
// ): string => {
//   if (
//     amount === null ||
//     amount === undefined ||
//     (typeof amount === 'number' && isNaN(amount))
//   ) {
//     return '-';
//   }

//   const currencySymbols: Record<SupportedCurrency, string> = {
//     USD: '$',
//     EUR: '€',
//     GBP: '£',
//     JPY: '¥',
//     INR: '₹',
//   };

//   const symbol = currencySymbols[currency] || '';
//   const isBig = typeof amount === 'bigint' || `${amount}`.length > 15;

//   let value: number | bigint;
//   try {
//     value = isBig ? BigInt(amount) : parseFloat(amount.toString());
//   } catch {
//     value = Number(Number(amount).toFixed(2));
//   }

//   const isNegative = isBig ? value < 0n : value < 0;
//   const abs = isBig ? (value < 0n ? -value : value) : Math.abs(value);

//   const prefix = isNegative ? '-' : '';
//   const formatLabel = (val: number | bigint, label: string) =>
//     `${prefix}${symbol}${val}${label}`;

//   // INR format
//   if (currency === 'INR') {
//     if (isBig) {
//       if (abs >= 1_00_00_000n) return formatLabel(abs / 1_00_00_000n, ' Cr');
//       if (abs >= 1_00_000n) return formatLabel(abs / 1_00_000n, ' L');
//       return formatLabel(abs, '');
//     } else {
//       if (abs >= 1_00_00_000) return `${prefix}${symbol}${(abs / 1_00_00_000).toFixed(1)} Cr`;
//       if (abs >= 1_00_000) return `${prefix}${symbol}${(abs / 1_00_000).toFixed(1)} L`;
//       if (abs >= 1000) return `${prefix}${symbol}${abs.toLocaleString('en-IN')}`;
//       return `${prefix}${symbol}${abs.toFixed(2)}`;
//     }
//   }

//   // Other currencies
//   if (isBig) {
//     if (abs >= 1_000_000_000_000n) return formatLabel(abs / 1_000_000_000_000n, 'T');
//     if (abs >= 1_000_000_000n) return formatLabel(abs / 1_000_000_000n, 'B');
//     if (abs >= 1_000_000n) return formatLabel(abs / 1_000_000n, 'M');
//     if (abs >= 1000n) return formatLabel(abs / 1000n, 'K');
//     return formatLabel(abs, '');
//   } else {
//     const n = Number(abs);
//     if (n >= 1_000_000_000_000) return `${prefix}${symbol}${(n / 1_000_000_000_000).toFixed(1)}T`;
//     if (n >= 1_000_000_000) return `${prefix}${symbol}${(n / 1_000_000_000).toFixed(1)}B`;
//     if (n >= 1_000_000) return `${prefix}${symbol}${(n / 1_000_000).toFixed(1)}M`;
//     if (n >= 1000) return `${prefix}${symbol}${(n / 1000).toFixed(1)}K`;
//     return `${prefix}${symbol}${n.toFixed(2)}`;
//   }
// };


export const formatToCurrency = (
  amount: number | string | bigint,
  currency: SupportedCurrency = 'INR'
): string => {
  if (
    amount === null ||
    amount === undefined ||
    (typeof amount === 'number' && isNaN(amount))
  ) {
    return '-';
  }

  const currencySymbols: Record<SupportedCurrency, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    INR: '₹',
  };

  const symbol = currencySymbols[currency] || '';
  let value: Decimal;

  try {
    value = new Decimal(amount);
  } catch {
    return '-';
  }

  const isNegative = value.isNeg();
  const abs = value.abs();
  const prefix = isNegative ? '-' : '';
  const formatLabel = (val: Decimal.Value, label: string) =>
    `${prefix}${symbol}${new Decimal(val).toFixed(1)}${label}`;

  if (currency === 'INR') {
    if (abs.gte('10000000')) return formatLabel(abs.div('10000000'), ' Cr');
    if (abs.gte('100000')) return formatLabel(abs.div('100000'), ' L');
    if (abs.gte('1000')) return `${prefix}${symbol}${abs.toNumber().toLocaleString('en-IN')}`;
    return `${prefix}${symbol}${abs.toFixed(2)}`;
  }

  if (abs.gte('1000000000000')) return formatLabel(abs.div('1000000000000'), 'T');
  if (abs.gte('1000000000')) return formatLabel(abs.div('1000000000'), 'B');
  if (abs.gte('1000000')) return formatLabel(abs.div('1000000'), 'M');
  if (abs.gte('1000')) return formatLabel(abs.div('1000'), 'K');

  return `${prefix}${symbol}${abs.toFixed(2)}`;
};


