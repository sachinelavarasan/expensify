import React from 'react';
import { Tabs } from 'expo-router';

import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';

import BottomTab from '@/components/BottomTabBar';
import SafeAreaViewComponent from '@/components/SafeAreaView';

const ROUTES: {
  name: string;
  title: string;
  icon: any;
  activeIcon: any;
}[] = [
  {
    name: 'index',
    title: 'Transactions',
    icon: <Entypo name="home" size={24} color="#282343" />,
    activeIcon: <Entypo name="home" size={24} color="#FFFFFF" />,
  },
  // {
  //   name: 'budget',
  //   title: 'Budget',
  //   icon: <MaterialIcons name="savings" size={24} color="#282343" />,
  //   activeIcon: <MaterialIcons name="savings" size={24} color="#FFFFFF" />,
  // },
  {
    name: 'stats',
    title: 'Stats',
    icon: <Ionicons name="stats-chart" size={24} color="#282343" />,
    activeIcon: <Ionicons name="stats-chart" size={24} color="#FFFFFF" />,
  },
  {
    name: 'profile',
    title: 'Profile',
    icon: <Feather name="user" size={24} color="#282343" />,
    activeIcon: <Feather name="user" size={24} color="#FFFFFF" />,
    // icon: <Feather name="menu" size={24} color="#282343" />,
    // activeIcon: <Feather name="menu" size={24} color="#FFFFFF" />,
  },
  // {
  //   name: 'profile',
  //   title: 'Profile',
  //   icon: require('@/assets/icons/user.png'),
  //   activeIcon: require('@/assets/icons/user-active.png'),
  // },
];

export default function TabLayout() {
  return (
    <SafeAreaViewComponent>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
        }}
        tabBar={(props) => <BottomTab {...props} />}>
        {ROUTES.map((item) => (
          <Tabs.Screen
            key={item.name}
            name={item.name}
            options={{
              title: item.title,
              tabBarIcon: ({ focused }) => (focused ? item.activeIcon : item.icon),
            }}
          />
        ))}
      </Tabs>
    </SafeAreaViewComponent>
  );
}
