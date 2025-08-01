import { Link, useRouter } from 'expo-router';
import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Pressable,
  FlatList,
} from 'react-native';
import { deviceWidth } from '@/utils/functions';

import * as FileSystem from 'expo-file-system';
import { useUser, useAuth } from '@clerk/clerk-expo';
import AnimatedTopSection from '@/components/ProfileTopSection';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useBankAccounts } from '@/hooks/useBankAccountOperation';
import AddAccount from '@/components/AddAccount';

const deviceWidthAsNumber = deviceWidth() - 67;

const CARD_WIDTH = deviceWidthAsNumber / 2;

const Profile = () => {
  const router = useRouter();
  const { accounts, loading } = useBankAccounts();
  const { user } = useUser();
  const { signOut } = useAuth();

  const overAllAmount = accounts.reduce(
    (previous, current) => Number(previous) + Number(current.exp_ba_balance) || 0,
    0,
  );

  const onSubmit = () => {
    // signOut();
    // router.replace('/(root)/(auth)/login');
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
      avatar={require('@/assets/images/user-default.png')}
      backgroundImage={require('@/assets/images/profile.png')}>
      <>
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
        </View> */}

        <Pressable>
          <View style={styles.card}>
            <View style={styles.left}>
              <View style={{ backgroundColor: '#282343', padding: 8, borderRadius: 5 }}>
                <MaterialIcons name="account-balance" size={24} color="#FFF" />
              </View>
              <View>
                <View>
                  <Text style={styles.option}>Accounts</Text>
                </View>
                <View style={styles.subTextContainer}>
                  <Text style={[styles.subText]}>Overall: {overAllAmount}</Text>
                </View>
              </View>
            </View>

            <View style={{ marginRight: 10 }}>{<AddAccount />}</View>
          </View>
        </Pressable>
        <FlatList
          contentContainerStyle={{
            marginTop: 5,
            marginBottom: 15,
            gap: 5,
            padding: 5,
          }}
          style={{
            display: loading ? 'none' : 'flex',
          }}
          horizontal
          bounces={false}
          showsHorizontalScrollIndicator={false}
          data={accounts}
          keyExtractor={(item) => item.exp_ba_name}
          renderItem={({ item }) => (
            <Link
              href={{
                pathname: '/accounts/[id]',
                params: { id: item.exp_ba_id },
              }}
              asChild>
              <TouchableOpacity style={styles.accountCard}>
                <View
                  style={[
                    styles.left,
                    {
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    },
                  ]}>
                  <View>
                    <Text style={styles.accountlabel}>{item.exp_ba_name}</Text>
                  </View>
                  <View style={{ backgroundColor: '#282343', padding: 2, borderRadius: 2 }}>
                    <MaterialIcons name="account-balance-wallet" size={16} color="#FFF" />
                  </View>
                </View>

                <View>
                  <Text style={styles.amount}>{item.exp_ba_balance}</Text>
                </View>
              </TouchableOpacity>
            </Link>
          )}
        />
        <Link href={'/(root)/categories'} asChild>
          <Pressable>
            <View style={styles.card}>
              <View style={styles.left}>
                <View style={{ backgroundColor: '#282343', padding: 8, borderRadius: 5 }}>
                  <MaterialIcons name="category" size={24} color="#FFF" />
                </View>
                <View>
                  <View>
                    <Text style={styles.option}>Categories</Text>
                  </View>
                  <View style={styles.subTextContainer}>
                    <Text style={[styles.subText]}>You can manage transaction categories</Text>
                  </View>
                </View>
              </View>

              <View>{/* <Text style={styles.amount}>%</Text> */}</View>
            </View>
          </Pressable>
        </Link>

        <Link href={'/(root)/starred'} asChild>
          <Pressable>
            <View style={styles.card}>
              <View style={styles.left}>
                <View style={{ backgroundColor: '#282343', padding: 8, borderRadius: 5 }}>
                  <MaterialIcons name="star" size={24} color="#FFF" />
                </View>
                <View>
                  <View>
                    <Text style={styles.option}>Starred Transactions</Text>
                  </View>
                  <View style={styles.subTextContainer}>
                    <Text style={[styles.subText]}>Quick access to your starred transactions</Text>
                  </View>
                </View>
              </View>

              <View>{/* <Text style={styles.amount}>%</Text> */}</View>
            </View>
          </Pressable>
        </Link>
        <Link href={'/(root)/export-data'} asChild>
          <Pressable>
            <View style={styles.card}>
              <View style={styles.left}>
                <View style={{ backgroundColor: '#282343', padding: 8, borderRadius: 5 }}>
                  <MaterialCommunityIcons name="file-export" size={24} color="#FFF" />
                </View>
                <View>
                  <View>
                    <Text style={styles.option}>Export Transactions</Text>
                  </View>
                  <View style={styles.subTextContainer}>
                    <Text style={[styles.subText]}>You can export trasanctions</Text>
                  </View>
                </View>
              </View>

              <View>{/* <Text style={styles.amount}>%</Text> */}</View>
            </View>
          </Pressable>
        </Link>
        <Link href={'/(root)/settings'} asChild>
          <Pressable>
            <View style={styles.card}>
              <View style={styles.left}>
                <View style={{ backgroundColor: '#282343', padding: 8, borderRadius: 5 }}>
                  <MaterialIcons name="settings" size={24} color="#FFF" />
                </View>
                <View>
                  <View>
                    <Text style={styles.option}>Settings</Text>
                  </View>
                  <View style={styles.subTextContainer}>
                    <Text style={[styles.subText]}>You can manage preference</Text>
                  </View>
                </View>
              </View>

              <View>{/* <Text style={styles.amount}>%</Text> */}</View>
            </View>
          </Pressable>
        </Link>
        <View style={[styles.btnContainer, { paddingHorizontal: 5 }]}>
          <TouchableOpacity style={[styles.button, styles.logoutBg]} onPress={onSubmit}>
            <Text style={[styles.title, styles.logoutText]}>Logout</Text>
          </TouchableOpacity>
        </View>
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
    paddingVertical: Platform.OS === 'android' ? 10 : 16,
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
  card: {
    paddingVertical: 8,
    marginBottom: 12,
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amount: {
    color: '#A0A0A0',
    fontSize: 14,
    fontFamily: 'Inter-500',
  },
  left: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  option: {
    color: '#F1F1F6',
    fontSize: 16,
    fontFamily: 'Inter-600',
  },
  subText: {
    color: '#B3B1C4',
    fontSize: 14,
    fontFamily: 'Inter-500',
  },
  subTextContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  logoutText: {
    color: '#f1f1f6',
  },
  logoutBg: {
    backgroundColor: '#282343',
  },
  accountCard: {
    borderWidth: 1,
    borderColor: '#463e75',
    padding: 5,
    borderRadius: 4,
    width: CARD_WIDTH,
  },
  accountlabel: {
    color: '#B3B1C4',
    fontSize: 13,
    fontFamily: 'Inter-600',
    width: CARD_WIDTH * 0.5,
  },
});

export default Profile;
