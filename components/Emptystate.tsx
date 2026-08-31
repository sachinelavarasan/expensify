import { useThemeContext } from '@/contexts/ThemedContext';
import React from 'react';
import { StyleSheet, Text, View, ViewProps } from 'react-native';
import EmptystateIllustration from './EmptystateIllustration';

interface ExtraButtonProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

const Emptystate = ({ title, description, children, ...props }: ExtraButtonProps & ViewProps) => {
  const { colors } = useThemeContext();
  return (
    <View style={styles.container}>
      <EmptystateIllustration />
      <View style={styles.contenContainer}>
        <Text style={[styles.title, { color: colors.title }]}>{title}</Text>
        <Text style={[styles.description, { color: colors.description }]}>{description}</Text>
      </View>
      {children}
    </View>
  );
};

export default Emptystate;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    rowGap: 10,
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-600',
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter-400',
    textAlign: 'center',
  },
  contenContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    rowGap: 5,
    paddingHorizontal: 40,
  },
});
