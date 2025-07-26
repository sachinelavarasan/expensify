import { View, Text, Pressable } from 'react-native';
import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ProfileHeader({ title }: { title: string }) {
  const router = useRouter();
  return (
    <View
      style={{
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        marginTop: 5,
      }}>
      <Pressable onPress={router.back} style={{ marginRight: 10 }}>
        <MaterialIcons name="arrow-back" size={24} color="#FFF" />
      </Pressable>
      <Text
        style={{
          fontSize: 18,
          color: '#FFF',
          fontFamily: 'Inter-600',
        }}>
        {title}
      </Text>
    </View>
  );
}
