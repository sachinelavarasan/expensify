import { View, Text, Pressable, TouchableOpacity } from 'react-native';
import React from 'react';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ProfileHeader({
  title,
  deleteAction,
  subtitle
}: {
  title: string;
  deleteAction?: () => void;
  subtitle?: string
}) {
  const router = useRouter();
  return (
    <View
      style={{
        height: 50,
        paddingHorizontal: 10,
        marginTop: 5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', }}>
        <Pressable onPress={router.back} style={{ marginRight: 10 }}>
          <MaterialIcons name="arrow-back" size={24} color="#FFF" />
        </Pressable>
        <View>
          <Text
            style={{
              fontSize: 18,
              color: '#FFF',
              fontFamily: 'Inter-600',
            }}>
            {title}
          </Text>
          {!!subtitle && <Text
            style={{
              fontSize: 14,
              color: '#CCC',
              fontFamily: 'Inter-400',
              textTransform:'uppercase'
            }}>
            {subtitle}
          </Text>}
        </View>
      </View>
      <View>
        {deleteAction && (
          <TouchableOpacity onPress={deleteAction}>
            <FontAwesome5 name="trash" size={20} color="#D9363E" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
