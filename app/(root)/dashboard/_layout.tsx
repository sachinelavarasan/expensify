import React from 'react';
import { Tabs } from 'expo-router';

import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';

import BottomTab from '@/components/BottomTabBar';
import SafeAreaViewComponent from '@/components/SafeAreaView';
import { FontAwesome } from '@expo/vector-icons';
import { useThemeContext } from '@/contexts/ThemedContext';

export default function TabLayout() {
  const { colors } = useThemeContext();

  // Inactive icons sit directly on the bottom bar background, so they use a theme
  // token; active icons render on a solid brand-colored pill (see BottomTabBar.tsx)
  // so a fixed white stays high-contrast in both themes.
  const ROUTES: {
    name: string;
    title: string;
    icon: any;
    activeIcon: any;
  }[] = [
    {
      name: 'index',
      title: 'Home',
      icon: <Entypo name="home" size={24} color={colors.lighterTitle} />,
      activeIcon: <Entypo name="home" size={24} color="#FFFFFF" />,
    },
    {
      name: 'budget',
      title: 'Budget',
      icon: <FontAwesome name="get-pocket" size={24} color={colors.lighterTitle} />,
      activeIcon: <FontAwesome name="get-pocket" size={24} color="#FFFFFF" />,
    },
    {
      name: 'stats',
      title: 'Stats',
      icon: <Ionicons name="stats-chart" size={24} color={colors.lighterTitle} />,
      activeIcon: <Ionicons name="stats-chart" size={24} color="#FFFFFF" />,
    },
    {
      name: 'profile',
      title: 'Profile',
      icon: <Feather name="user" size={24} color={colors.lighterTitle} />,
      activeIcon: <Feather name="user" size={24} color="#FFFFFF" />,
      // icon: <Feather name="menu" size={24} color={colors.lighterTitle} />,
      // activeIcon: <Feather name="menu" size={24} color="#FFFFFF" />,
    },
    // {
    //   name: 'profile',
    //   title: 'Profile',
    //   icon: require('@/assets/icons/user.png'),
    //   activeIcon: require('@/assets/icons/user-active.png'),
    // },
  ];

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
