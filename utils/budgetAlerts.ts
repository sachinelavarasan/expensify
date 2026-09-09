import { IBudget } from '@/types';

export const BUDGET_ALERT_THRESHOLD = 90;
export const BUDGET_EXCEEDED_THRESHOLD = 100;

export interface BudgetAlertItem {
  category: string;
  categoryId: string;
  percentage: number;
  exceeded: boolean;
}

export function getBudgetAlerts(budgets: IBudget[]): BudgetAlertItem[] {
  return budgets
    .filter((item) => item.exp_bg_id && Number(item.budgetAmount) > 0)
    .map((item) => ({
      category: item.category,
      categoryId: item.categoryId,
      percentage: (item.totalAmount / Number(item.budgetAmount)) * 100,
      exceeded: false,
    }))
    .filter((item) => item.percentage >= BUDGET_ALERT_THRESHOLD)
    .map((item) => ({ ...item, exceeded: item.percentage >= BUDGET_EXCEEDED_THRESHOLD }))
    .sort((a, b) => b.percentage - a.percentage);
}

export function getCategoryBudgetStatus(budgets: IBudget[], categoryId: string) {
  return getBudgetAlerts(budgets).find((item) => item.categoryId === categoryId) ?? null;
}

export type BudgetTierLevel = 'ok' | 'near' | 'over';

/**
 * Maps a used-percentage to a single tier used across the Budget screen -
 * the ring arc colour, the proportion bar and the remaining-amount text all
 * read from this so "near limit" and "over" look identical everywhere.
 */
export function getBudgetTier(
  percentage: number,
  colors: { primary: string; accent: string; expense: string },
): { level: BudgetTierLevel; color: string } {
  if (percentage >= BUDGET_EXCEEDED_THRESHOLD) return { level: 'over', color: colors.expense };
  if (percentage >= BUDGET_ALERT_THRESHOLD) return { level: 'near', color: colors.accent };
  return { level: 'ok', color: colors.primary };
}
