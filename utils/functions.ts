import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dimensions } from 'react-native';
import { format, startOfMonth, startOfWeek, startOfYear, subDays } from 'date-fns';

type SupportedCurrency = '₹' | '$' | '€' | '£' | '¥';

export type DateRangePresetId = 'today' | 'week' | 'month' | '30d' | 'year' | 'custom';

export const DATE_RANGE_PRESETS: { id: DateRangePresetId; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: '30d', label: 'Last 30 Days' },
  { id: 'year', label: 'This Year' },
  { id: 'custom', label: 'Custom' },
];

export const getPresetRange = (preset: DateRangePresetId): { start: string; end: string } | null => {
  const today = new Date();
  const end = format(today, 'yyyy-MM-dd');
  switch (preset) {
    case 'today':
      return { start: end, end };
    case 'week':
      return { start: format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'), end };
    case 'month':
      return { start: format(startOfMonth(today), 'yyyy-MM-dd'), end };
    case '30d':
      return { start: format(subDays(today, 29), 'yyyy-MM-dd'), end };
    case 'year':
      return { start: format(startOfYear(today), 'yyyy-MM-dd'), end };
    default:
      return null;
  }
};

export const deviceWidth = () => {
  return Dimensions.get('screen').width;
};
export const deviceHeight = () => {
  return Dimensions.get('screen').height;
};

export const calcNumColumns = (itemWidth: number, minCols: number, padding?: number) => {
    const screenWidth = deviceWidth() - (padding || 80);
    const cols = screenWidth / itemWidth;
    return Math.floor(cols) > minCols ? Math.floor(cols) : minCols;
  };

export const getAsyncValue = async (key: string)=>{
  try {
    let value = await AsyncStorage.getItem(key)
    if(value)
      return JSON.parse(value);
    
    return null;
  } catch (error) {
    return null;
  }
}
export const setAsyncValue = async (key: string, value: string)=>{
  try {
    await AsyncStorage.setItem(key, value)
  } catch (error) {
    console.log(error)
    return null;
  }
}


let appCurrency = '₹';
let showCurrency = false;

export const loadCurrencySettings = async () => {
  const storedCurrency = await AsyncStorage.getItem('currency');
  const storedShowCurrency = await AsyncStorage.getItem('show_currency');
  appCurrency = storedCurrency || '₹';
  if(storedShowCurrency) showCurrency = JSON.parse(storedShowCurrency) === "1";
};

export const getAppCurrency = () => appCurrency as SupportedCurrency;
export const shouldShowCurrency = () => showCurrency;