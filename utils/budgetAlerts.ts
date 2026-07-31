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
