import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Decimal } from 'decimal.js';

import ModalCard from '@/components/ModalCard';
import { useThemeContext } from '@/contexts/ThemedContext';
import { Spacing } from '@/utils/Spacing';
import { FontSize } from '@/utils/Typography';
import { formatFullCurrency } from '@/utils/formatter';

interface Props {
  visible: boolean;
  onClose: () => void;
  initialValue?: string | null;
  onApply: (value: string) => void;
}

const OPERATORS = ['+', '−', '×', '÷'] as const;
const KEY_ROWS: string[][] = [
  ['7', '8', '9', '÷'],
  ['4', '5', '6', '×'],
  ['1', '2', '3', '−'],
  ['.', '0', '⌫', '+'],
];

const isOperator = (ch: string): boolean => (OPERATORS as readonly string[]).includes(ch);

const getLastSegment = (expr: string): string => {
  const match = expr.match(/(\d*\.?\d*)$/);
  return match ? match[0] : '';
};

// Two-pass evaluation (× ÷ before + −) using Decimal to match the rest of
// the app's money math, which avoids float rounding errors (see formatter.ts).
function evaluateExpression(expr: string): Decimal | null {
  const tokens = expr.match(/\d+\.?\d*|[+−×÷]/g);
  if (!tokens || tokens.length === 0) return null;
  if (isOperator(tokens[0]) || isOperator(tokens[tokens.length - 1])) return null;

  const pass1: (Decimal | string)[] = [new Decimal(tokens[0])];
  let i = 1;
  while (i < tokens.length) {
    const op = tokens[i];
    const num = new Decimal(tokens[i + 1]);
    if (op === '×' || op === '÷') {
      const prev = pass1.pop() as Decimal;
      if (op === '÷') {
        if (num.isZero()) return null;
        pass1.push(prev.dividedBy(num));
      } else {
        pass1.push(prev.times(num));
      }
    } else {
      pass1.push(op, num);
    }
    i += 2;
  }

  let result = pass1[0] as Decimal;
  for (let j = 1; j < pass1.length; j += 2) {
    const op = pass1[j] as string;
    const num = pass1[j + 1] as Decimal;
    result = op === '+' ? result.plus(num) : result.minus(num);
  }
  return result;
}

export default function AmountCalculator({ visible, onClose, initialValue, onApply }: Props) {
  const { colors } = useThemeContext();
  const [expression, setExpression] = useState('');

  // Reset the expression whenever the modal opens, without an effect - a
  // render-phase state adjustment (React's recommended pattern for
  // "resetting state when a prop changes") rather than a post-commit effect.
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setExpression(initialValue ? String(initialValue) : '');
    }
  }

  const result = useMemo(() => evaluateExpression(expression), [expression]);

  const handleKeyPress = (key: string) => {
    if (key === '⌫') {
      setExpression((expr) => expr.slice(0, -1));
      return;
    }
    if (key === '.') {
      setExpression((expr) => {
        const last = getLastSegment(expr);
        if (last.includes('.')) return expr;
        return expr + (last === '' ? '0.' : '.');
      });
      return;
    }
    if (isOperator(key)) {
      setExpression((expr) => {
        if (expr === '') return expr;
        if (isOperator(expr[expr.length - 1])) return expr.slice(0, -1) + key;
        return expr + key;
      });
      return;
    }
    setExpression((expr) => expr + key);
  };

  const handleApply = () => {
    if (!result) return;
    onApply(result.toFixed(2));
  };

  const displayExpression = expression.replace(/([+−×÷])/g, ' $1 ').trim() || '0';

  return (
    <ModalCard visible={visible} onClose={onClose} title="Calculator">
      <View style={styles.displayRow}>
        <TouchableOpacity
          onPress={() => setExpression('')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          disabled={!expression}>
          <Text style={[styles.clearLabel, { color: colors.expense, opacity: expression ? 1 : 0.4 }]}>
            Clear
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.expression, { color: colors.primary }]} numberOfLines={2}>
        {displayExpression}
      </Text>
      <Text style={[styles.resultPreview, { color: colors.description }]}>
        {result ? `= ${formatFullCurrency(result.toNumber())}` : ' '}
      </Text>

      <View style={styles.grid}>
        {KEY_ROWS.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.gridRow}>
            {row.map((key) => {
              const operatorKey = isOperator(key);
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => handleKeyPress(key)}
                  style={[
                    styles.key,
                    {
                      backgroundColor: operatorKey ? colors.barBackground : colors.inputColor,
                      borderColor: colors.inputBorder,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.keyLabel,
                      { color: operatorKey ? colors.primary : colors.text },
                    ]}>
                    {key}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      <TouchableOpacity
        onPress={handleApply}
        disabled={!result}
        style={[
          styles.applyButton,
          { backgroundColor: colors.primary },
          !result && styles.applyButtonDisabled,
        ]}>
        <Text style={[styles.applyButtonText, { color: colors.onPrimary }]}>
          {result ? `Use ${formatFullCurrency(result.toNumber())}` : 'Enter an amount'}
        </Text>
      </TouchableOpacity>
    </ModalCard>
  );
}

const styles = StyleSheet.create({
  displayRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  clearLabel: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-600',
  },
  expression: {
    fontSize: FontSize.display,
    fontFamily: 'Inter-700',
    textAlign: 'right',
    marginTop: Spacing.xs,
  },
  resultPreview: {
    fontSize: FontSize.base,
    fontFamily: 'Inter-500',
    textAlign: 'right',
    marginTop: Spacing.xs,
    minHeight: FontSize.base + 4,
  },
  grid: {
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  gridRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  key: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Spacing.sm,
    borderWidth: 1,
  },
  keyLabel: {
    fontSize: FontSize.lg,
    fontFamily: 'Inter-600',
  },
  applyButton: {
    marginTop: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
    paddingVertical: Spacing.md,
  },
  applyButtonDisabled: {
    opacity: 0.5,
  },
  applyButtonText: {
    fontSize: FontSize.md,
    fontFamily: 'Inter-600',
  },
});
