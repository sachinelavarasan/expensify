import { customColors } from '@/utils/common-data';
import { calcNumColumns } from '@/utils/functions';
import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, FlatList, View, Pressable } from 'react-native';

const ColorSwatch = ({
  color,
  onSelect,
  isSelected,
}: {
  color: (typeof customColors)[0];
  onSelect: (data: string) => void;
  isSelected: boolean;
}) => (
  <View
    style={[
      { width: 40, height: 40, padding: 5, justifyContent: 'center', alignItems: 'center' },
      isSelected ? { borderColor: '#F0f0f0', borderWidth: 2, borderRadius: 7 } : undefined,
    ]}>
    <Pressable
      style={[styles.swatch, { backgroundColor: color.hex, margin: isSelected ? 2 : 0 }]}
      onPress={() => onSelect(color.hex)}></Pressable>
  </View>
);

export const CustomColorSwatches = ({
  currentValue,
  onSelect,
}: {
  onSelect: (data: string) => void;
  currentValue: string;
}) => {
  const [selected, setSelected] = useState<string>(currentValue);
  const handleColorSelect = (selectedColor: string) => {
    setSelected(selectedColor);
    onSelect(selectedColor);
  };
  useEffect(() => {
    setSelected(currentValue);
  }, [currentValue]);

  function chunkArray<T>(array: T[], size: number): T[][] {
    return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
      array.slice(i * size, i * size + size),
    );
  }


  const colorColumns = chunkArray(customColors, 4);

  return (
    <View
      style={{
        marginTop: 10,
        padding: 5,
        marginBottom: 30,
      }}>
      <View>
        <Text style={styles.dateHeader}>Color  <Text style={styles.subText}><Text>{'\u2022'}</Text> Swipe right for more colors</Text></Text>
        
      </View>
      {/* <FlatList
        data={customColors}
        contentContainerStyle={{
          gap: 10,
          paddingHorizontal: 5,
        }}
        horizontal
        
        // numColumns={numofColumns}
        keyExtractor={(item) => item.name}
        renderItem={({ item, index }) => (
          <ColorSwatch
            color={item}
            onSelect={handleColorSelect}
            isSelected={selected === item.hex}
          />
        )}
        showsHorizontalScrollIndicator={false}
      /> */}
      <FlatList
        data={colorColumns}
        horizontal
        keyExtractor={(_, index) => `col-${index}`}
        contentContainerStyle={{
          paddingHorizontal: 5,
        }}
        ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item: column }) => (
          <View style={{ flexDirection: 'column', justifyContent: 'space-between', gap: 10 }}>
            {column.map((color) => (
              <ColorSwatch
                key={color.hex}
                color={color}
                onSelect={handleColorSelect}
                isSelected={selected === color.hex}
              />
            ))}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  swatch: {
    width: 30,
    height: 30,
    borderRadius: 6,
  },
  dateHeader: {
    fontSize: 14,
    fontFamily: 'Inter-600',
    color: '#FFF',
    marginBottom: 5,
  },
  subText: {
    color: '#B3B1C4',
    fontSize: 12,
    fontFamily: 'Inter-400',
  },
});

export default CustomColorSwatches;
