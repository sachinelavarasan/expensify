export interface User {
  displayName: string | null;

  email: string | null;

  emailVerified: boolean;

  isAnonymous: boolean;

  phoneNumber: string | null;

  photoURL: string | null;

  providerData: UserInfo[];

  providerId: string;

  uid: string;

  toJSON(): object;
}

export interface IExpUser {
  exp_us_id: string;
  exp_us_clerk_id?: string;
  exp_us_name: string;
  exp_us_email: string;
  exp_us_phone_no: string;
  exp_us_is_deleted: boolean;
  exp_us_currency: string;
  exp_us_default_transaction: number;
  exp_us_default_grouping: string;
  exp_us_profile_url: string;
  exp_us_email_verified: boolean;
  exp_us_created_at: string;
  exp_us_updated_at: string;
  reminder_status?: number;
  reminder_time?: string;
}

export interface Itransaction {
  exp_ts_id: string;
  exp_ts_user_id: string;
  exp_ts_title: string;
  exp_ts_amount: string;
  exp_ts_date: string;
  exp_ts_time: string;
  exp_ts_note?: string;
  exp_ts_transaction_type: string;
  exp_ts_category: string;
  exp_tc_id: string;
  exp_tt_id: number;
  exp_st_id?: string;
  exp_tc_icon: string;
  exp_tc_icon_bg_color: string;
  exp_ba_name: string;
  exp_ts_deleted_at?: string | null;
  exp_ts_tags?: string[];
  exp_ts_transfer_group_id?: string | null;
  exp_ts_transfer_direction?: 'in' | 'out' | null;
  // The *other* leg's account name for a transfer (each transfer is stored as
  // two rows, one per account) - undefined for non-transfer transactions.
  exp_ts_transfer_counterpart_account_name?: string | null;
}

export interface ICategory {
  exp_tc_id: string;
  exp_tc_label: string;
  exp_tc_icon: string;
  exp_tc_user_id: string | null;
  exp_tc_icon_bg_color: string;
  exp_tc_transaction_type: number;
  exp_tc_sort_order: number;
}
export interface IBudget {
  category: string;
  categoryId: string;
  icon: string;
  iconBg: string;
  totalAmount: number;
  transactionCount: number;
  transactions: Itransaction[];
  exp_bg_id: string | null,
  budgetAmount: string | null,
  remainingBudget: number,
}

export interface ICategoryWithCount extends ICategory {
  transaction_count: string;
  total_spend: string;
}

export interface IBankAccount {
  exp_ba_id: string;
  exp_ba_user_id: string;
  exp_ba_name: string;
  exp_ba_balance: string;
  exp_ba_currency: string;
  exp_ba_type: string;
  exp_ba_icon: string;
  exp_ba_color: string;
  exp_ba_is_primary: boolean;
  exp_ba_is_active: number;
  exp_ba_is_deleted: boolean;
  exp_ba_created_at: string;
  exp_ba_updated_at: string;
}

export interface ITransactionGroup {
  month: string;
  year: number;
  income: number;
  expense: number;
  title: string;
  data: Itransaction[];
}

export interface IAccountSummary extends IBankAccount {
  totalTransactionCount: number;
  totalIncome: number;
  totalExpense: number;
}

export interface IAccountTransactionsPage {
  data: ITransactionGroup[];
  hasMore: boolean;
}

export interface BankAccount {
  exp_ba_id: string;
  exp_ba_user_id: string;
  exp_ba_name: string;
  exp_ba_balance: string;
  exp_ba_currency: string;
  exp_ba_type: string;
  exp_ba_icon: string;
  exp_ba_color: string;
  exp_ba_is_primary: boolean;
  exp_ba_is_active: number;
  exp_ba_is_deleted: boolean;
  exp_ba_created_at: string;
  exp_ba_updated_at: string;
}

export type CreateBankAccountDto = Pick<
  BankAccount,
  'exp_ba_name' | 'exp_ba_balance' | 'exp_ba_icon'
> & { exp_ba_is_primary?: boolean };
export type UpdateBankAccountDto = Partial<CreateBankAccountDto> & { exp_ba_id: string };
export interface Budget {
  exp_bg_id: string;
  exp_bg_user_id: string | null;
  exp_bg_amount: string;
  exp_bg_user_id: string | null;
  exp_bg_category_id: string | null;
  exp_bg_date: string;
  exp_bg_created_at: string;
  exp_bg_updated_at: string;
}

export type CreateBudgetDto = Pick<
  Budget,
  'exp_bg_amount' | 'exp_bg_category_id' | 'exp_bg_date'
>;
export type UpdateBudgetDto = Pick<
  Budget,
  'exp_bg_amount' | 'exp_bg_id'
>;

export type DebtDirection = 'owed_to_me' | 'owed_by_me';

export interface IDebtRepayment {
  exp_dr_id: string;
  exp_dr_debt_id: string;
  exp_dr_amount: string;
  exp_dr_date: string;
  exp_dr_note?: string | null;
  exp_dr_created_at: string;
}

export interface IDebt {
  exp_dt_id: string;
  exp_dt_user_id: string;
  exp_dt_person_name: string;
  exp_dt_direction: DebtDirection;
  exp_dt_amount: string;
  exp_dt_due_date?: string | null;
  exp_dt_note?: string | null;
  exp_dt_created_at: string;
  exp_dt_updated_at?: string | null;
  exp_dt_deleted_at?: string | null;
  repaid_amount: string;
}

export interface IDebtDetail extends IDebt {
  repayments: IDebtRepayment[];
  repaidAmount: number;
}

export type CreateDebtDto = Pick<
  IDebt,
  'exp_dt_person_name' | 'exp_dt_direction' | 'exp_dt_amount' | 'exp_dt_due_date' | 'exp_dt_note'
>;
export type UpdateDebtDto = Partial<CreateDebtDto>;
export type CreateRepaymentDto = Pick<IDebtRepayment, 'exp_dr_amount' | 'exp_dr_date' | 'exp_dr_note'>;

export interface IRecurringTransaction {
  exp_rt_id: string;
  exp_rt_title: string;
  exp_rt_amount: string;
  exp_rt_note?: string | null;
  exp_rt_category_id: string;
  exp_rt_transaction_type_id: number;
  exp_rt_bank_account_id: string | null;
  exp_rt_frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  exp_rt_start_date: string;
  exp_rt_end_date: string | null;
  exp_rt_next_due_date: string;
  exp_rt_is_active: boolean;
  exp_rt_reminder_enabled: boolean;
  exp_rt_reminder_days_before: number;
  exp_rt_reminder_time: string | null;
  exp_rt_kind: 'recurring' | 'reminder';
  exp_tc_label: string;
  exp_tc_icon: string;
  exp_tc_icon_bg_color: string;
  exp_tt_label: string;
  exp_ba_name: string | null;
}

export type CreateRecurringTransactionDto = Pick<
  IRecurringTransaction,
  | 'exp_rt_title'
  | 'exp_rt_amount'
  | 'exp_rt_note'
  | 'exp_rt_category_id'
  | 'exp_rt_transaction_type_id'
  | 'exp_rt_bank_account_id'
  | 'exp_rt_frequency'
  | 'exp_rt_start_date'
  | 'exp_rt_end_date'
  | 'exp_rt_reminder_enabled'
  | 'exp_rt_reminder_days_before'
  | 'exp_rt_reminder_time'
  | 'exp_rt_kind'
>;

export type UpdateRecurringTransactionDto = Partial<CreateRecurringTransactionDto> & {
  exp_rt_id: string;
  exp_rt_is_active?: boolean;
};
