import React from 'react';
import { Image, StyleSheet, Text, View, ViewProps } from 'react-native';

interface ExtraButtonProps {
  title: string;
  description?: string;
}

const Emptystate = ({ title, description, ...props }: ExtraButtonProps & ViewProps) => {
  return (
    <View style={styles.container}>
      <Image source={require('@/assets/images/empty-state.png')} />
      <View style={styles.contenContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
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
    color: '#D1CCFF',
    fontSize: 20,
    fontFamily: 'Inter-600',
    textAlign: 'center',
  },
  description: {
    color: '#7A7A8C',
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
