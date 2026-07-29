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

export interface IAccountGroupedTransactions extends IBankAccount {
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
>;
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
>;

export type UpdateRecurringTransactionDto = Partial<CreateRecurringTransactionDto> & {
  exp_rt_id: string;
  exp_rt_is_active?: boolean;
};
