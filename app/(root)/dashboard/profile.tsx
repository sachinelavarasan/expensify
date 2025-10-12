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

import { useUser, useAuth } from '@clerk/clerk-expo';
import AnimatedTopSection from '@/components/ProfileTopSection';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useBankAccounts } from '@/hooks/useBankAccountOperation';
import AddAccount from '@/components/AddAccount';
import Spacer from '@/components/Spacer';
import { useGetUserData } from '@/hooks/useUserStore';
import BankCard from '@/components/AccountCard';
import { useThemeContext } from '@/contexts/ThemedContext';
import { formatToCurrency } from '@/utils/formatter';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useReminderSettings } from '@/hooks/useReminder';

const deviceWidthAsNumber = deviceWidth() - 67;

const CARD_WIDTH = deviceWidthAsNumber / 2;

const Profile = () => {
  const { colors, theme } = useThemeContext();
  const {  disableNotification } = useReminderSettings();
  const router = useRouter();
  const { accounts, loading } = useBankAccounts();
  const { refetch } = useGetUserData();
  const { signOut } = useAuth();
  const { user: currentUser } = useUser();

  const overAllAmount = accounts.reduce(
    (previous, current) => Number(previous) + Number(current.exp_ba_balance) || 0,
    0,
  );

  const onSubmit = async () => {
    signOut();
    await disableNotification();
    await AsyncStorage.clear();
    router.replace('/(root)/(auth)/login');
  };

  return (
    <AnimatedTopSection
      title={currentUser?.firstName || ''}
      subtitle={currentUser?.phoneNumbers?.[0]?.phoneNumber || ''}
      avatar={require('@/assets/images/user-default.png')}
      backgroundImage={require('@/assets/images/profile.png')}
      refetch={refetch}>
      <>
        <Pressable>
          <View
            style={[
              styles.card,
              // { backgroundColor: colors.bottomBarBackground},
            ]}>
            <View style={styles.left}>
              <View style={{ backgroundColor: colors.primary, padding: 8, borderRadius: 5 }}>
                <MaterialIcons name="account-balance" size={24} color="#FFF" />
              </View>
              <View>
                <View>
                  <Text style={[styles.option, { color: colors.title }]}>Accounts</Text>
                </View>
                <View style={styles.subTextContainer}>
                  <Text style={[styles.subText, { color: colors.title, fontFamily: 'Inter-600' }]}>
                    Over All :  {formatToCurrency(overAllAmount)}
                  </Text>
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
            gap: 10,
            padding: 5,
          }}
          horizontal
          bounces={false}
          showsHorizontalScrollIndicator={false}
          data={accounts}
          keyExtractor={(item) => item.exp_ba_name}
          ListEmptyComponent={() =>
            !loading && accounts.length ? (
              <Spacer height={60} />
            ) : (
              <View style={{ height: 60, justifyContent: 'center' }}>
                <Text style={[styles.subText, { color: colors.description }]}>
                  There is no account exist
                </Text>
              </View>
            )
          }
          renderItem={({ item }) => (
            <BankCard
              bankName={item.exp_ba_name}
              holderName={currentUser?.firstName || ''}
              icon={item.exp_ba_icon as React.ComponentProps<typeof MaterialIcons>['name']}
              // accountNumber="123456789012"
              balance={item.exp_ba_balance}
              variant={theme}
              accent="#6C63FF"
              onPress={() => {
                router.push(`/accounts/${item.exp_ba_id}`);
              }}
              otherStyle={{ width: deviceWidth() - 60 }}
            />
            // <Link
            //   href={{
            //     pathname: '/accounts/[id]',
            //     params: { id: item.exp_ba_id },
            //   }}
            //   asChild>
            //   {/* <TouchableOpacity style={styles.accountCard}>
            //     <View
            //       style={[
            //         styles.left,
            //         {
            //           flexDirection: 'row',
            //           justifyContent: 'space-between',
            //           alignItems: 'center',
            //         },
            //       ]}>
            //       <View>
            //         <Text style={styles.accountlabel}>{item.exp_ba_name}</Text>
            //       </View>
            //       <View style={{ backgroundColor: '#282343', padding: 2, borderRadius: 2 }}>
            //         <MaterialIcons name="account-balance-wallet" size={16} color="#FFF" />
            //       </View>
            //     </View>

            //     <View>
            //       <Text style={styles.amount}>{item.exp_ba_balance}</Text>
            //     </View>
            //   </TouchableOpacity> */}

            // </Link>
          )}
        />
        <Link href={'/(root)/categories'} asChild>
          <TouchableOpacity>
            <View
              style={[
                styles.card,
                // { backgroundColor: colors.bottomBarBackground},
              ]}>
              <View style={styles.left}>
                <View style={{ backgroundColor: colors.primary, padding: 8, borderRadius: 5 }}>
                  <MaterialIcons name="category" size={24} color="#FFF" />
                </View>
                <View>
                  <View>
                    <Text style={[styles.option, { color: colors.title }]}>Categories</Text>
                  </View>
                  <View style={styles.subTextContainer}>
                    <Text style={[styles.subText, { color: colors.description }]}>
                      Keep your spending neatly sorted
                    </Text>
                  </View>
                </View>
              </View>

              <View>{/* <Text style={styles.amount}>%</Text> */}</View>
            </View>
          </TouchableOpacity>
        </Link>

        <Link href={'/(root)/starred'} asChild>
          <TouchableOpacity>
            <View
              style={[
                styles.card,
                // { backgroundColor: colors.bottomBarBackground},
              ]}>
              <View style={styles.left}>
                <View style={{ backgroundColor: colors.primary, padding: 8, borderRadius: 5 }}>
                  <MaterialIcons name="star" size={24} color="#FFF" />
                </View>
                <View>
                  <View>
                    <Text style={[styles.option, { color: colors.title }]}>
                      Starred Transactions
                    </Text>
                  </View>
                  <View style={styles.subTextContainer}>
                    <Text style={[styles.subText, { color: colors.description }]}>
                      Access your favorite transactions quickly
                    </Text>
                  </View>
                </View>
              </View>

              <View>{/* <Text style={styles.amount}>%</Text> */}</View>
            </View>
          </TouchableOpacity>
        </Link>
        <Link href={'/(root)/export-transactions'} asChild>
          <TouchableOpacity>
            <View
              style={[
                styles.card,
                // { backgroundColor: colors.bottomBarBackground},
              ]}>
              <View style={styles.left}>
                <View style={{ backgroundColor: colors.primary, padding: 8, borderRadius: 5 }}>
                  <MaterialIcons name="import-export" size={24} color="#FFF" />
                </View>
                <View>
                  <View>
                    <Text style={[styles.option, { color: colors.title }]}>
                      Import / Export Transactions
                    </Text>
                  </View>
                  <View style={styles.subTextContainer}>
                    <Text style={[styles.subText, { color: colors.description }]}>
                      Download and share your transaction history
                    </Text>
                  </View>
                </View>
              </View>

              <View>{/* <Text style={styles.amount}>%</Text> */}</View>
            </View>
          </TouchableOpacity>
        </Link>
        <Link href={'/(root)/settings'} asChild>
          <TouchableOpacity>
            <View
              style={[
                styles.card,
                // { backgroundColor: colors.bottomBarBackground},
              ]}>
              <View style={styles.left}>
                <View style={{ backgroundColor: colors.primary, padding: 8, borderRadius: 5 }}>
                  <MaterialIcons name="settings" size={24} color="#FFF" />
                </View>
                <View>
                  <View>
                    <Text style={[styles.option, { color: colors.title }]}>Settings</Text>
                  </View>
                  <View style={styles.subTextContainer}>
                    <Text style={[styles.subText, { color: colors.description }]}>
                      Customize your app preferences and controls
                    </Text>
                  </View>
                </View>
              </View>

              <View>{/* <Text style={styles.amount}>%</Text> */}</View>
            </View>
          </TouchableOpacity>
        </Link>
        <View style={[styles.btnContainer, { paddingHorizontal: 5 }]}>
          <TouchableOpacity
            style={[styles.button, styles.logoutBg, { backgroundColor: '#cc1928' }]}
            onPress={onSubmit}>
            <Feather name="log-out" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={[styles.title, styles.logoutText, { color: '#fff' }]}>Logout</Text>
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
    paddingHorizontal: 10,
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
    fontSize: 14,
    fontFamily: 'Inter-600',
  },
  subText: {
    color: '#6F6D85',
    fontSize: 12,
    fontFamily: 'Inter-500',
    wordWrap: 'wrap',
    maxWidth: deviceWidth() - 80,
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
