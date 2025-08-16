import { FlatList, StyleSheet, Text, Pressable, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { materialIconList } from '@/utils/common-data';
import { calcNumColumns } from '@/utils/functions';

const IconPicker = ({
  onSelect,
  currentValue,
}: {
  onSelect: (name: string) => void;
  currentValue: string;
}) => {
  const [selected, setSelected] = useState<string>(currentValue);
  const groupedDataArray = Object.keys(materialIconList).map((key: string) => ({
    data: materialIconList[key],
    name: key,
  }));
  const itemWidth = 40;
  const minCols = 5;
  const numofColumns = calcNumColumns(itemWidth, minCols);

  useEffect(() => {
    setSelected(currentValue);
  }, [currentValue]);

  return (
    <FlatList
      data={groupedDataArray}
      keyExtractor={(item, index) => index.toString()}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={() => (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <Text style={styles.header}>Icon</Text>
        </View>
      )}
      renderItem={({ item }: any) => {
        return (
          <FlatList
            showsVerticalScrollIndicator={false}
            numColumns={numofColumns}
            data={item.data}
            contentContainerStyle={{
              gap: 5,
              paddingBottom: 20,
              paddingHorizontal: 5,
            }}
            keyExtractor={(item, index) => item}
            ListHeaderComponent={() => (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: 5,
                }}>
                <Text style={styles.label}>{item.name}</Text>
              </View>
            )}
            renderItem={({ item }) => {
              return (
                <View style={{ padding: 5 }}>
                  <Pressable
                    key={item}
                    style={[styles.iconBox]}
                    onPress={() => {
                      setSelected(item);
                      onSelect(item);
                    }}>
                    <View
                      style={{
                        backgroundColor: selected === item ? '#6900FF' : '#EBE9FC',
                        padding: 5,
                        borderRadius: 5,
                      }}>
                      <MaterialIcons
                        name={item}
                        size={24}
                        color={selected === item ? '#FFFFFF' : '#7A7A8C'}
                      />
                    </View>
                  </Pressable>
                </View>
              );
            }}
          />
        );
      }}
    />
  );
};

export default IconPicker;

const styles = StyleSheet.create({
  header: {
    fontSize: 14,
    fontFamily: 'Inter-600',
    color: '#1E1E1E',
    marginBottom: 10,
  },
  label: {
    color: '#282343',
    fontSize: 12,
    fontFamily: 'Inter-500',
  },
  iconBox: {
    alignItems: 'center',
    borderRadius: 8,
  },
});
