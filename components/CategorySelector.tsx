import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ICategory } from '@/types';
import { UseFormSetValue } from 'react-hook-form';
import { transactionSchemaType } from '@/utils/schema';

interface Props {
  categories: ICategory[] | [];
  selected: number | string;
  setValue: UseFormSetValue<transactionSchemaType>;
}

const MAX_VISIBLE = 6;

export default function CategorySelector({ categories, selected, setValue }: Props) {
  const [showAll, setShowAll] = useState(false);

  const visibleItems = showAll ? categories : categories.slice(0, MAX_VISIBLE);

  return (
    <View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {visibleItems.map((item) => (
          <View style={{ padding: 5 }} key={item.exp_tc_id}>
            <Pressable
              style={[
                {
                  alignItems: 'center',
                  flexDirection: 'row',
                  borderWidth: 1,
                  borderColor: '#E2E2EA',
                  borderRadius: 50,
                  width: 'auto',
                },
                {
                  backgroundColor:
                    selected === item.exp_tc_id ? item.exp_tc_icon_bg_color : undefined,
                },
              ]}
              onPress={() => {
                setValue('exp_tc_id', item.exp_tc_id, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}>
              <View
                style={{
                  backgroundColor: item.exp_tc_icon_bg_color,
                  padding: 5,
                  borderRadius: 50,
                }}>
                <MaterialIcons
                  name={item.exp_tc_icon as React.ComponentProps<typeof MaterialIcons>['name']}
                  size={16}
                  color="#fff"
                />
              </View>
              <Text
                style={{
                  fontFamily: 'Inter-500',
                  fontSize: 12,
                  padding: 5,
                  color: selected === item.exp_tc_id ? '#FFFFFF' : '#1E1E1E',
                }}>
                {item.exp_tc_label}
              </Text>
            </Pressable>
          </View>
        ))}
      </View>

      {categories.length > MAX_VISIBLE && (
        <Pressable
          onPress={() => setShowAll((prev) => !prev)}
          style={{
            marginTop: 10,
            alignSelf: 'flex-start',
            paddingHorizontal: 10,
            borderWidth: 1,
            borderColor: '#E2E2EA',
            paddingVertical: 5,
            borderRadius: 50,
            marginBottom: 5,
            backgroundColor: '#F3F2F8',
          }}>
          <Text style={{ color: '#282343', fontSize: 12 }}>
            {showAll ? 'View Less' : 'View More'}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
