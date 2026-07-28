// SearchBar.js
import React, { useState } from 'react';
import { StyleSheet, TextInput, View, Keyboard, Platform } from 'react-native';
import { Feather, Entypo } from '@expo/vector-icons';
import { useThemeContext } from '@/contexts/ThemedContext';

interface Props {
  searchPhrase: string;
  onChange: (e: any) => void;
  onClick?: (searchPhrase: string) => void;
  onClose?: () => void;
  actionsNeeded?: boolean;
}

const SearchBar = ({ searchPhrase, onChange, onClick, onClose, actionsNeeded = false }: Props) => {
  const { theme, colors } = useThemeContext();
  const [clicked, setIsClicked] = useState(false);
  return (
    <View style={styles.container}>
      <View
        style={
          clicked
            ? [
                styles.searchBar__clicked,
                {
                  borderColor: colors.borderSelected,
                  backgroundColor: colors.inputColor,
                  shadowColor: colors.inputColor,
                },
              ]
            : [
                styles.searchBar__unclicked,
                {
                  borderColor: colors.borderColor,
                  backgroundColor: colors.inputColor,
                  shadowColor: colors.inputColor,
                },
              ]
        }>
        <Feather name="search" size={18} color={colors.inputPlaceholder} style={{ marginLeft: 10 }} />
        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
            },
          ]}
          placeholder="Search"
          value={searchPhrase}
          onChangeText={onChange}
          autoCorrect={false}
          autoComplete={'off'}
          spellCheck={false}
          autoCapitalize="none"
          onFocus={() => {
            setIsClicked(true);
          }}
          onSubmitEditing={() => {
            Keyboard.dismiss();
            onClick?.(searchPhrase);
            setIsClicked(false);
          }}
          onBlur={() => {
            setIsClicked(false);
          }}
          placeholderTextColor={colors.inputPlaceholder}
          selectionColor={colors.inputPlaceholder}
          cursorColor={colors.inputPlaceholder}
        />

        {actionsNeeded && (
          <View style={styles.actions}>
            {clicked && (
              <>
                <View style={[styles.check, { backgroundColor: colors.categoryFallbackBg }]}>
                  <Entypo
                    name="check"
                    size={20}
                    color={colors.categoryFallbackIcon}
                    style={{ padding: 2 }}
                    onPress={() => {
                      Keyboard.dismiss();
                      onClick?.(searchPhrase);
                      setIsClicked(false);
                    }}
                  />
                </View>
                <View
                  style={[
                    styles.close,
                    { backgroundColor: colors.categoryFallbackBg, borderColor: colors.categoryFallbackBg },
                  ]}>
                  <Entypo
                    name="cross"
                    size={20}
                    color={colors.categoryFallbackIcon}
                    style={{ padding: 1.5 }}
                    onPress={() => {
                      Keyboard.dismiss();
                      onClose?.();
                      setIsClicked(false);
                    }}
                  />
                </View>
              </>
            )}
          </View>
        )}
      </View>
      {/* cancel button, depending on whether the search bar is clicked or not */}
      {/* {clicked && (
        <View>
          <Button
            title="Cancel"
            onPress={() => {
              Keyboard.dismiss();
              setIsClicked(false);
            }}
          ></Button>
        </View>
      )} */}
    </View>
  );
};
export default SearchBar;

// styles
const styles = StyleSheet.create({
  container: {
    // margin: 15,
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 2,
  },
  searchBar__unclicked: {
    // paddingVertical: 12,
    // paddingHorizontal: 10,
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2.84,
    elevation: 1,
  },
  searchBar__clicked: {
    // paddingVertical: 12,
    // paddingHorizontal: 10,
    flexDirection: 'row',
    width: '100%',
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    overflow: 'hidden',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2.84,
    elevation: 1,
  },
  input: {
    flex: 1,
    borderWidth: 0,
    paddingVertical: Platform.OS === 'android' ? 8 : 16,
    fontSize: 16,
    fontFamily: 'Inter-400',
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: 2,
  },
  check: {
    height: 25,
    width: 25,
    borderRadius: 25,
    alignContent: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  close: {
    height: 25,
    width: 25,
    borderRadius: 25,
    alignContent: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginRight: 5,
  },
});
