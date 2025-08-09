import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState } from 'react';
import Spacer from './Spacer';
import Modal from 'react-native-modal';
import { deviceHeight, deviceWidth } from '@/utils/functions';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { Controller, useForm } from 'react-hook-form';
import Input from './Input';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const width = deviceWidth();
const height = deviceHeight();

const schema = z.object({
  name: z.string().min(3, { message: 'Minimum 3 characters' }),
});

type SignUpForm = z.infer<typeof schema>;

const UpdateProfile = () => {
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const toggleModal = () => {
    setShow(!show);
  };
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: {
      name: '',
    },
    resolver: zodResolver(schema),
  });
  return (
    <>
      <Pressable style={{ marginLeft: 35 }} onPress={toggleModal}>
        <AntDesign name="edit" size={24} color="#7A7A8C" />
      </Pressable>

      <Modal
        backdropColor="rgba(0, 0, 0, 0.5)"
        isVisible={show}
        hasBackdrop={true}
        deviceHeight={height}
        deviceWidth={width}
        coverScreen={true}>
        <View
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View style={styles.modal}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <Text style={styles.title}>Edit Details</Text>
              <TouchableOpacity onPress={() => setShow(!show)} style={{ alignItems: 'flex-end' }}>
                <Ionicons name="close" color="#5A5A6E" size={20} />
              </TouchableOpacity>
            </View>
            <Spacer height={15} />
            <Controller
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Name"
                  label="Name"
                  keyboardType="default"
                  autoCapitalize="none"
                  autoComplete="off"
                  onBlur={field.onBlur}
                  onChangeText={field.onChange}
                  error={errors.name?.message}
                  borderLess
                />
              )}
              name="name"
            />
            <Spacer height={20} />
            <View style={styles.btnContainer}>
              <TouchableOpacity
                style={[styles.button, !isValid || isLoading ? styles.disable : {}]}
                // onPress={handleSubmit(register)}
                disabled={!isValid || isLoading}>
                {isLoading ? (
                  <ActivityIndicator animating color={'#FFFFFF'} style={styles.loader} />
                ) : null}
                <Text style={[styles.btntitle, isLoading ? styles.textDisable : {}]}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default UpdateProfile;

const styles = StyleSheet.create({
  modal: {
    backgroundColor: '#FFFFFF',
    width: deviceWidth() - 60,
    borderRadius: 10,
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  title: {
    textAlign: 'center',
    fontSize: 20,
    color: '#1E1E1E',
    marginBottom: 2,
    fontFamily: 'Inter-800',
  },
  btnContainer: {
    alignItems: 'center',
  },
  button: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#6B5DE6',
    borderRadius: 8,
    paddingVertical: Platform.OS === 'android' ? 10 : 16,
    width: '100%',
    paddingHorizontal: 30,
  },
  loader: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btntitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-600',
  },
  disable: {
    opacity: 0.6,
  },
  textDisable: { opacity: 0 },
});
