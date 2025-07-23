import { useRouter } from 'expo-router';
import React from 'react';

import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { deviceWidth } from '@/utils/functions';

import * as FileSystem from 'expo-file-system';
import { useUser, useAuth } from '@clerk/clerk-expo';
import AnimatedTopSection from '@/components/ProfileTopSection';

const Profile = () => {
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useAuth();

  const onSubmit = () => {
    signOut();
    router.replace('/(root)/(auth)/login');
    // auth()
    //   .signOut()
    //   .then(() => router.replace('/(root)/(auth)/login'));
  };
  async function download() {
    const filename = 'dummy.pdf';
    const result = await FileSystem.downloadAsync(
      'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      FileSystem.documentDirectory + filename,
    );

    // Log the download result
    // console.log(result);

    // Save the downloaded file
    saveFile(result.uri, filename, result.headers['Content-Type']);
  }

  async function saveFile(uri: string, filename: string, mimetype: string) {
    if (Platform.OS === 'android') {
      const permissions =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

      if (permissions.granted) {
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        console.log(permissions.directoryUri, filename, 'application/pdf');
        await FileSystem.StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          filename,
          'application/pdf',
        )
          .then(async (url) => {
            await FileSystem.writeAsStringAsync(url, base64, {
              encoding: FileSystem.EncodingType.Base64,
            });
            alert('Success');
          })
          .catch((e) => console.log(e, 'sss'));
      } else {
        console.log('first');
        //  FileSystem.shareAsync(uri);
      }
    } else {
      // FileSystem.shareAsync(uri);
    }
  }
  return (
    <AnimatedTopSection
      title={user?.firstName || ''}
      subtitle={user?.primaryPhoneNumber?.phoneNumber || ''}
      // onActionPress={() => alert('Edit Profile pressed!')}
      // actionLabel="Edit Profile"
      avatar={require('@/assets/images/user-default.png')}
      backgroundImage={require('@/assets/images/profile.png')}>
      <>
        <View style={styles.infoCard}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.infoText}>{user?.firstName}</Text>

          <Text style={styles.label}>Email</Text>

          <Text style={styles.infoText}>{user?.primaryEmailAddress?.emailAddress || '-'}</Text>

          <Text style={styles.label}>Phone</Text>
          <Text style={styles.infoText}>{user?.primaryPhoneNumber?.phoneNumber || '-'}</Text>
          <View style={styles.btnContainer}>
            <TouchableOpacity style={[styles.button]} onPress={onSubmit}>
              <Text style={[styles.title]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* <View style={styles.infoCard}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.infoText}>{user?.firstName}</Text>

          <Text style={styles.label}>Email</Text>

          <Text style={styles.infoText}>{user?.primaryEmailAddress?.emailAddress || '-'}</Text>

          <Text style={styles.label}>Phone</Text>
          <Text style={styles.infoText}>{user?.primaryPhoneNumber?.phoneNumber || '-'}</Text>
          <View style={styles.btnContainer}>
            <TouchableOpacity style={[styles.button]} onPress={onSubmit}>
              <Text style={[styles.title]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.infoText}>{user?.firstName}</Text>

          <Text style={styles.label}>Email</Text>

          <Text style={styles.infoText}>{user?.primaryEmailAddress?.emailAddress || '-'}</Text>

          <Text style={styles.label}>Phone</Text>
          <Text style={styles.infoText}>{user?.primaryPhoneNumber?.phoneNumber || '-'}</Text>
          <View style={styles.btnContainer}>
            <TouchableOpacity style={[styles.button]} onPress={onSubmit}>
              <Text style={[styles.title]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View> */}
      </>
    </AnimatedTopSection>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileBg: {
    width: deviceWidth() + 10,
    height: 350,
    marginTop: -100,
  },
  profileImage: {
    width: 150,
    height: 150,
    marginTop: -140,
    marginLeft: (deviceWidth() - 150) / 2,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  email: {
    fontSize: 16,
    color: 'gray',
  },
  btnContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  button: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#6900FF',
    borderRadius: 8,
    paddingVertical: Platform.OS === 'android' ? 12 : 16,
    width: '100%',
  },
  loader: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Inter-600',
  },
  topSection: {
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  infoCard: {
    backgroundColor: '#1A1A24', // slightly elevated from main bg
    marginVertical: 20,
    padding: 20,
    borderRadius: 12,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    color: '#8880A0',
    fontSize: 14,
    marginTop: 10,
    marginBottom: 2,
    fontFamily: 'Inter-500',
  },
  infoText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-600',
  },
});

export default Profile;
