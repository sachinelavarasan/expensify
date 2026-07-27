import { ActivityIndicator, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import Spacer from './Spacer';
import ModalCard from './ModalCard';
import { FontAwesome5 } from '@expo/vector-icons';
import { Controller, useForm } from 'react-hook-form';
import Input from './Input';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUser } from '@clerk/clerk-expo';
import { QueryObserverResult } from '@tanstack/react-query';
import { IExpUser } from '@/types';
import { showToast } from './ToastMessage';
import { useThemeContext } from '@/contexts/ThemedContext';

const schema = z.object({
  name: z.string().min(3, { message: 'Minimum 3 characters' }),
});

type EditProfileForm = z.infer<typeof schema>;

const UpdateProfile = ({
  refetch,
}: {
  refetch: () => Promise<QueryObserverResult<IExpUser, Error>>;
}) => {
  const { colors, theme } = useThemeContext();
  const { user } = useUser();
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const toggleModal = () => {
    setShow(!show);
  };
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: {
      name: '',
    },
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (user?.firstName) {
      reset(
        {
          name: user?.firstName,
        },
        {
          keepDirty: false,
          keepIsValidating: true,
        },
      );
    }
  }, [user]);

  const onSubmit = (data: EditProfileForm) => {
    setIsLoading(true);
    try {
      user
        ?.update({ firstName: data.name })
        .then(() => {
          showToast({
            text1: 'Profile updated successfully!',
            type: 'success',
            position: 'bottom',
          });
        })
        .catch(() => {
          showToast({
            text1: 'Server Error',
            type: 'error',
            position: 'bottom',
          });
        })
        .finally(() => {
          setTimeout(() => {
            setIsLoading(false);
            refetch();
            setShow(false);
          }, 1000);
        });
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    }
  };
  return (
    <>
      <Pressable style={{ marginLeft: 35 }} onPress={toggleModal}>
        <FontAwesome5
          name="user-edit"
          size={20}
          color={theme === 'dark' ? colors.text : colors.secondary}
        />
      </Pressable>

      <ModalCard visible={show} onClose={toggleModal} title="Edit Details" closeDisabled={isLoading}>
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
            style={[
              styles.button,
              { backgroundColor: colors.primary },
              !isValid || isLoading ? styles.disable : {},
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={!isValid || isLoading}>
            {isLoading ? (
              <ActivityIndicator animating color={colors.onPrimary} style={styles.loader} />
            ) : null}
            <Text
              style={[
                styles.btntitle,
                { color: colors.onPrimary },
                isLoading ? styles.textDisable : {},
              ]}>
              Update
            </Text>
          </TouchableOpacity>
        </View>
      </ModalCard>
    </>
  );
};

export default UpdateProfile;

const styles = StyleSheet.create({
  btnContainer: {
    alignItems: 'center',
  },
  button: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderRadius: 50,
    paddingHorizontal: 20,
    paddingVertical: 9,
    width: '100%',
  },
  loader: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btntitle: {
    fontSize: 16,
    fontFamily: 'Inter-600',
  },
  disable: {
    opacity: 0.6,
  },
  textDisable: { opacity: 0 },
});
