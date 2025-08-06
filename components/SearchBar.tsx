// SearchBar.js
import React, { useState } from 'react';
import { StyleSheet, TextInput, View, Keyboard, Platform } from 'react-native';
import { Feather, Entypo } from '@expo/vector-icons';

interface Props {
  searchPhrase: string;
  onChange: (e: any) => void;
  onClick?: (searchPhrase: string) => void;
  onClose?: () => void;
  actionsNeeded?: boolean
}

const SearchBar = ({ searchPhrase, onChange, onClick, onClose, actionsNeeded= false }: Props) => {
  const [clicked, setIsClicked] = useState(false);
  return (
    <View style={styles.container}>
      <View style={clicked ? styles.searchBar__clicked : styles.searchBar__unclicked}>
        <Feather name="search" size={18} color="#C7C7C7" style={{ marginLeft: 10 }} />
        <TextInput
          style={styles.input}
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
          placeholderTextColor={'#6E6E80'}
          selectionColor="#fdfdfd"
          cursorColor="#EDEDED"
        />

        {actionsNeeded && (
          <View style={styles.actions}>
          {clicked && (
            <>
              <View style={styles.check}>
                <Entypo
                  name="check"
                  size={20}
                  color="#b7b6c1"
                  style={{ padding: 2 }}
                  onPress={() => {
                    Keyboard.dismiss();
                    onClick?.(searchPhrase);
                    setIsClicked(false);
                  }}
                />
              </View>
              <View style={styles.close}>
                <Entypo
                  name="cross"
                  size={20}
                  color="#b7b6c1"
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
  },
  searchBar__unclicked: {
    // paddingVertical: 12,
    // paddingHorizontal: 10,
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#1C1C20',
    borderRadius: 4,
    alignItems: 'center',
  },
  searchBar__clicked: {
    // paddingVertical: 12,
    // paddingHorizontal: 10,
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#1C1C20',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  input: {
    flex: 1,
    borderWidth: 0,
    paddingVertical: Platform.OS === 'android' ? 8 : 16,
    fontSize: 16,
    fontFamily: 'Inter-400',
    color: '#FFFFFF',
    paddingHorizontal: 10,
    backgroundColor: '#1C1C20',
    borderRadius: 6,
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
    backgroundColor: '#323448',
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
    borderColor: '#323448',
    backgroundColor: '#323448',
    borderWidth: 1,
    marginRight: 5,
  },
});
