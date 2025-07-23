import { z } from 'zod';

export const transactionSchema = z.object({
  exp_ts_title: z.string().trim().min(3, { message: 'Name should be minimum 3 characters' }),
  exp_ts_note: z.string().trim().nullable().optional(),
  // lends details
  exp_ts_amount: z.string().refine((val) => /^\d+$/.test(val) && Number(val) > 0, {
    message: 'Please enter the valid amount',
  }),
  exp_tc_id: z.number().min(1, { message: 'Please choose category' }),
  exp_ts_date: z.string().min(1, { message: 'Please choose date' }),
  exp_ts_time: z.string().min(1, { message: 'Please choose time' }),
  exp_tt_id: z.number().min(1, { message: 'Please choose transaction type' }),
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
