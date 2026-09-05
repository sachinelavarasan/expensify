import { View, Text, Pressable, TouchableOpacity } from 'react-native';
import React from 'react';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeContext } from '@/contexts/ThemedContext';

export default function ProfileHeader({
  title,
  deleteAction,
  subtitle,
  children,
  paddingHorizontal = true,
}: {
  title: string;
  deleteAction?: () => void;
  subtitle?: string;
  children?: React.ReactNode;
  paddingHorizontal?: boolean;
}) {
  const { colors } = useThemeContext();
  const router = useRouter();
  return (
    <View
      style={{
        height: 50,
        paddingHorizontal: paddingHorizontal ? 10 : 0,
        marginTop: 5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 }}>
        <Pressable onPress={router.back} style={{ marginRight: 10 }} hitSlop={8}>
          <MaterialIcons name="arrow-back" size={24} color={colors.arrowColor} />
        </Pressable>
        <View style={{ flexShrink: 1 }}>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{
              fontSize: 18,
              color: colors.title,
              fontFamily: 'Inter-600',
            }}>
            {title}
          </Text>
          {!!subtitle && (
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                fontSize: 14,
                color: colors.description,
                fontFamily: 'Inter-400',
                textTransform: 'uppercase',
              }}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 0 }}>
        {deleteAction && (
          // <TouchableOpacity onPress={deleteAction}>
          //   <FontAwesome5 name="trash" size={20} color={colors.expense} />
          // </TouchableOpacity>
          <TouchableOpacity
            style={[
              {
                width: 40,
                height: 40,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
              },
              ,
              { backgroundColor: `${colors.expense}1A` },
            ]}
            onPress={deleteAction}>
            <MaterialIcons name="delete-forever" size={20} color={colors.expense} />
          </TouchableOpacity>
        )}
        {children}
      </View>
    </View>
  );
}
