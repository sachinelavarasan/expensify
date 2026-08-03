import { z } from 'zod';
import { formatFullCurrency } from './formatter';

// Matches the (\d{1,13})(\.\d{1,2})? amount regex's actual ceiling - shown to
// the user as the real number instead of a "13 digits before, 2 after the
// decimal" description, which nobody can mentally convert into a number.
const MAX_AMOUNT = 9999999999999.99;

function amountLimitMessage() {
  return `Amount must be a positive number up to ${formatFullCurrency(MAX_AMOUNT)}`;
}

export const transactionSchema = z
  .object({
    exp_ts_title: z.string().trim().min(3, { message: 'Name should be minimum 3 characters' }),
    exp_ts_note: z.string().trim().nullable().optional(),
    // .default('') coerces an untouched `undefined` value to '' before the
    // string schema ever sees it - otherwise a genuinely required field left
    // blank fails with a fatal "invalid_type" issue, which causes zod to
    // abort the whole object parse and skip the superRefine below entirely
    // (silently swallowing cross-field errors like "Choose destination
    // account" whenever amount/account are ALSO left blank - the exact
    // combination that happens the moment a user switches to Transfer and
    // hits Add without filling anything in yet).
    exp_ts_amount: z
      .string()
      .default('')
      .superRefine((val, ctx) => {
        if (!val) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'This field is required' });
        } else if (!/^(\d{1,13})(\.\d{1,2})?$/.test(val) || parseFloat(val) <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: amountLimitMessage(),
          });
        }
      }),
    // Not required for a Transfer (exp_tt_id === 3) - the server assigns the
    // system "Transfer" category itself, see the superRefine below.
    exp_tc_id: z.string().optional(),
    exp_ts_date: z.string().min(1, { message: 'Choose date' }),
    exp_ts_time: z.string().min(1, { message: 'Choose time' }),
    exp_tt_id: z.number({ message: 'Select transaction type' }),
    exp_st_id: z.boolean().optional(),
    // Same .default('') reasoning as exp_ts_amount above - an untouched
    // account field is `undefined`, not '', which would otherwise abort the
    // parse and hide the superRefine's cross-field errors.
    exp_ts_bank_account_id: z.string().default('').pipe(z.string().min(1, { message: 'Choose Account' })),
    // Only used when exp_tt_id === 3 - the destination account for a transfer.
    exp_ts_to_bank_account_id: z.string().optional(),
    exp_ts_tags: z.array(z.string()).optional(),
    // Holds either an already-uploaded attachment (`remote`) or a picked-but-not-yet-uploaded
    // file (`local`) - the actual upload only happens at submit time, see transaction.tsx's
    // onSubmit, so nothing is sent to storage until the transaction save itself succeeds.
    exp_ts_attachment_url: z
      .union([
        z.object({ kind: z.literal('remote'), url: z.string() }),
        z.object({
          kind: z.literal('local'),
          previewUri: z.string(),
          base64: z.string(),
          mimeType: z.string(),
        }),
      ])
      .nullable()
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.exp_tt_id === 3) {
      if (!data.exp_ts_to_bank_account_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Choose destination account',
          path: ['exp_ts_to_bank_account_id'],
        });
      } else if (data.exp_ts_to_bank_account_id === data.exp_ts_bank_account_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'From and To accounts must be different',
          path: ['exp_ts_to_bank_account_id'],
        });
      }
    } else if (!data.exp_tc_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Select category',
        path: ['exp_tc_id'],
      });
    }
  });

export type transactionSchemaType = z.infer<typeof transactionSchema>;

export const recurringTransactionSchema = z.object({
  exp_rt_title: z.string().trim().min(3, { message: 'Name should be minimum 3 characters' }),
  exp_rt_note: z.string().trim().nullable().optional(),
  exp_rt_amount: z
    .string({ message: 'This field is required' })
    .superRefine((val, ctx) => {
      if (!/^(\d{1,13})(\.\d{1,2})?$/.test(val) || parseFloat(val) <= 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: amountLimitMessage() });
      }
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
