import { getAsyncValue } from '@/utils/functions';
import { useIsFocused } from 'expo-router';
import { useEffect, useState } from 'react';

export const useGetSettingsFromStore = (key: string) => {
  const isFocused = useIsFocused();
  const [value, setValue] = useState<boolean>(false);

  useEffect(() => {
    const fetchTime = async () => {
      const storedTime = await getAsyncValue(key);
      setValue(Boolean(storedTime));
    };
    fetchTime();
  }, [isFocused, key]);

  return {
    value,
  };
};
