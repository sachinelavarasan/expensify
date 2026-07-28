import { z } from 'zod';

export const transactionSchema = z.object({
  exp_ts_title: z.string().trim().min(3, { message: 'Name should be minimum 3 characters' }),
  exp_ts_note: z.string().trim().nullable().optional(),
  exp_ts_amount: z
    .string({message: 'This field is required'})
    .refine((val) => /^(\d{1,13})(\.\d{1,2})?$/.test(val) && parseFloat(val) > 0, {
      message: 'Amount must be up to 15 digits total (13 before, 2 after decimal)',
    }),
  exp_tc_id: z.string({ message: 'Select category' }).min(1, { message: 'Select category' }),
  exp_ts_date: z.string().min(1, { message: 'Choose date' }),
  exp_ts_time: z.string().min(1, { message: 'Choose time' }),
  exp_tt_id: z.number({ message: 'Select transaction type' }),
  exp_st_id: z.boolean().optional(),
  exp_ts_bank_account_id: z
    .string({ message: 'Choose Account' })
    .min(1, { message: 'Choose Account' }),
});

export type transactionSchemaType = z.infer<typeof transactionSchema>;

export const recurringTransactionSchema = z.object({
  exp_rt_title: z.string().trim().min(3, { message: 'Name should be minimum 3 characters' }),
  exp_rt_note: z.string().trim().nullable().optional(),
  exp_rt_amount: z
    .string({ message: 'This field is required' })
    .refine((val) => /^(\d{1,13})(\.\d{1,2})?$/.test(val) && parseFloat(val) > 0, {
      message: 'Amount must be up to 15 digits total (13 before, 2 after decimal)',
    }),
  exp_rt_category_id: z
    .string({ message: 'Select category' })
    .min(1, { message: 'Select category' }),
  exp_rt_transaction_type_id: z.number({ message: 'Select transaction type' }),
  exp_rt_bank_account_id: z
    .string({ message: 'Choose Account' })
    .min(1, { message: 'Choose Account' }),
  exp_rt_frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly'], {
    message: 'Select frequency',
  }),
  exp_rt_start_date: z.string().min(1, { message: 'Choose start date' }),
  exp_rt_end_date: z.string().trim().nullable().optional(),
});

export type recurringTransactionSchemaType = z.infer<typeof recurringTransactionSchema>;

export interface Itransaction {
  ts_title: string;
  ts_date: string;
  ts_note: string;
  ts_time: string;
  ts_amount: number;
  ts_id: string;
  ts_category: string;
}
