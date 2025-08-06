import { z } from 'zod';

export const transactionSchema = z.object({
  exp_ts_title: z.string().trim().min(3, { message: 'Name should be minimum 3 characters' }),
  exp_ts_note: z.string().trim().nullable().optional(),
  exp_ts_amount: z
    .string()
    .refine((val) => /^(\d{1,13})(\.\d{1,2})?$/.test(val) && parseFloat(val) > 0, {
      message: 'Amount must be up to 15 digits total (13 before, 2 after decimal)',
    }),
  exp_tc_id: z.number({ message: 'Select category' }),
  exp_ts_date: z.string().min(1, { message: 'Choose date' }),
  exp_ts_time: z.string().min(1, { message: 'Choose time' }),
  exp_tt_id: z.number({ message: 'Select transaction type' }),
  exp_st_id: z.boolean().optional(),
});

export type transactionSchemaType = z.infer<typeof transactionSchema>;

export interface Itransaction {
  ts_title: string;
  ts_date: string;
  ts_note: string;
  ts_time: string;
  ts_amount: number;
  ts_id: string;
  ts_category: string;
}
