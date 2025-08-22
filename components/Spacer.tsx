import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';

const Spacer = ({ height, otherStyle }: { height: number; otherStyle?: StyleProp<ViewStyle> }) => {
  return <View style={[{ height: height }, otherStyle && otherStyle]} />;
};

export default Spacer;
