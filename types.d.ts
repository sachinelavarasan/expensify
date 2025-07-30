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

export interface Itransaction {
  exp_ts_id: number;
  exp_ts_user_id: number;
  exp_ts_title: string;
  exp_ts_amount: string;
  exp_ts_date: string;
  exp_ts_time: string;
  exp_ts_note?: string;
  exp_ts_transaction_type: string;
  exp_ts_category: string;
  exp_tc_id: number;
  exp_tt_id: number;
}

export interface ICategory {
  exp_tc_id: number;
  exp_tc_label: string;
  exp_tc_icon: string;
  exp_tc_user_id: number | null;
  exp_tc_icon_bg_color: string;
  exp_tc_transaction_type: number;
  exp_tc_sort_order: number;
}

export interface ICategoryWithCount extends ICategory{
  transaction_count: string;
}
