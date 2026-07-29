import { useEffect, useState } from 'react';
import { getAsyncValue, setAsyncValue } from '@/utils/functions';

export interface ITransactionTemplate {
  id: string;
  name: string;
  exp_ts_title: string;
  exp_ts_note?: string;
  exp_ts_amount: string;
  exp_tc_id: string;
  exp_tt_id: number;
  exp_st_id?: boolean;
  exp_ts_bank_account_id: string;
}

const STORAGE_KEY = 'quick-templates';

export function useTransactionTemplates() {
  const [templates, setTemplates] = useState<ITransactionTemplate[]>([]);

  useEffect(() => {
    (async () => {
      const stored = await getAsyncValue(STORAGE_KEY);
      if (stored) setTemplates(stored);
    })();
  }, []);

  const persist = async (next: ITransactionTemplate[]) => {
    setTemplates(next);
    await setAsyncValue(STORAGE_KEY, JSON.stringify(next));
  };

  const saveTemplate = (name: string, fields: Omit<ITransactionTemplate, 'id' | 'name'>) =>
    persist([...templates, { id: Date.now().toString(), name, ...fields }]);

  const deleteTemplate = (id: string) => persist(templates.filter((t) => t.id !== id));

  return { templates, saveTemplate, deleteTemplate };
}
