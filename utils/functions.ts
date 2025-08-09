import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dimensions } from 'react-native';

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
    
    console.log(value);
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
