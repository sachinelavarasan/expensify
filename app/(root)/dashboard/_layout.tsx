import React from 'react';
import { Tabs } from 'expo-router';

import Ionicons from '@expo/vector-icons/Ionicons';

import BottomTab from '@/components/BottomTabBar';
import SafeAreaViewComponent from '@/components/SafeAreaView';
import { useThemeContext } from '@/contexts/ThemedContext';

export default function TabLayout() {
  const { colors } = useThemeContext();

  // Inactive icons sit directly on the bottom bar background, so they use a theme
  // token; active icons render on a solid brand-colored pill (see BottomTabBar.tsx)
  // so they use colors.onPrimary to stay high-contrast in both themes.
  const ROUTES: {
    name: string;
    title: string;
    icon: any;
    activeIcon: any;
  }[] = [
    {
      name: 'index',
      title: 'Home',
      icon: <Ionicons name="home-outline" size={24} color={colors.lighterTitle} />,
      activeIcon: <Ionicons name="home" size={24} color={colors.onPrimary} />,
    },
    {
      name: 'budget',
      title: 'Budget',
      icon: <Ionicons name="wallet-outline" size={24} color={colors.lighterTitle} />,
      activeIcon: <Ionicons name="wallet" size={24} color={colors.onPrimary} />,
    },
    {
      name: 'stats',
      title: 'Stats',
      icon: <Ionicons name="bar-chart-outline" size={24} color={colors.lighterTitle} />,
      activeIcon: <Ionicons name="bar-chart" size={24} color={colors.onPrimary} />,
    },
    {
      name: 'profile',
      title: 'Profile',
      icon: <Ionicons name="person-outline" size={24} color={colors.lighterTitle} />,
      activeIcon: <Ionicons name="person" size={24} color={colors.onPrimary} />,
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
