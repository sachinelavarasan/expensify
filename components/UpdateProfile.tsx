import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import Spacer from './Spacer';
import ModalCard from './ModalCard';
import { Controller, useForm } from 'react-hook-form';
import Input from './Input';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { QueryObserverResult } from '@tanstack/react-query';
import { IExpUser } from '@/types';
import { showToast } from './ToastMessage';
import { useThemeContext } from '@/contexts/ThemedContext';
import { useGetUserData, useUpdateProfile } from '@/hooks/useUserStore';

const schema = z.object({
  name: z.string().min(3, { message: 'Minimum 3 characters' }),
  phone: z.string().optional(),
});

type EditProfileForm = z.infer<typeof schema>;

export type UpdateProfileHandle = {
  open: () => void;
};

type Props = {
  refetch: () => Promise<QueryObserverResult<IExpUser, Error>>;
};

const UpdateProfile = forwardRef<UpdateProfileHandle, Props>(({ refetch }, ref) => {
  const { colors } = useThemeContext();
  const { user } = useGetUserData();
  const { mutateAsync: updateProfile, isPending: isLoading } = useUpdateProfile();
  const [show, setShow] = useState(false);
  const toggleModal = () => {
    setShow(!show);
  };

  useImperativeHandle(ref, () => ({
    open: () => setShow(true),
  }));
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: {
      name: '',
      phone: '',
    },
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (user?.exp_us_name) {
      reset(
        {
          name: user.exp_us_name,
          phone: user.exp_us_phone_no || '',
        },
        {
          keepDirty: false,
          keepIsValidating: true,
        },
      );
    }
  }, [user]);

  const onSubmit = async (data: EditProfileForm) => {
    try {
      await updateProfile({ name: data.name, phone: data.phone });
      showToast({
        text1: 'Profile updated successfully!',
        type: 'success',
        position: 'bottom',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast({
        text1: 'Server Error',
        type: 'error',
        position: 'bottom',
      });
    } finally {
      await refetch();
      setShow(false);
    }
  };
  return (
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
      <Spacer height={16} />
      <Controller
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            placeholder="Phone number"
            label="Phone"
            keyboardType="number-pad"
            autoComplete="off"
            maxLength={10}
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            error={errors.phone?.message}
            borderLess
          />
        )}
        name="phone"
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
  );
});

UpdateProfile.displayName = 'UpdateProfile';

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
