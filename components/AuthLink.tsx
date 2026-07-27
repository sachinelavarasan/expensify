import React from 'react';
import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { useThemeContext } from '@/contexts/ThemedContext';

interface ExtraButtonProps {
  linkText: string;
  description?: string;
}
//Touchable opacity default props and custom props for this button
const AuthLink: React.FC<ExtraButtonProps & TouchableOpacityProps> = ({
  linkText,
  description,
  ...props
}) => {
  const { colors } = useThemeContext();
  return (
    <View style={styles.container}>
      <Text style={[styles.description, { color: colors.description }]}>{description}</Text>
      <TouchableOpacity {...props}>
        <Text style={[styles.linkText, { color: colors.primary }]}>{linkText}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AuthLink;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  linkText: {
    fontSize: 16,
    textDecorationLine: 'underline',
    fontFamily: 'Inter-500',
  },
  description: {
    fontSize: 16,
    marginRight: 15,
    fontFamily: 'Inter-400',
  },
});
