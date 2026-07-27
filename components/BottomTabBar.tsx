import { useThemeContext } from '@/contexts/ThemedContext';
import { View, TouchableOpacity, Text } from 'react-native';
import Animated from 'react-native-reanimated';

export default function BottomTab({ state, descriptors, navigation }: any) {
  const { theme, colors } = useThemeContext();

  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.bottomBarBackground,
        paddingBottom: 0,
        paddingTop: 5,
        bottom: 0,
        borderTopColor: colors.borderColor,
        borderTopWidth: 1,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: theme === 'dark' ? 0.45 : 0.15,
        shadowRadius: 8,
        elevation: 10,
      }}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };
        const focusedColor = colors.primary;
        

        return (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            key={route.key}
            style={[
              {
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 5,
              },
            ]}>
            <Animated.View
              style={[
                {
                  paddingHorizontal: 20,
                  paddingVertical: 2,
                  alignItems: 'center',
                  backgroundColor: isFocused ? focusedColor : 'transparent',
                  borderRadius: isFocused ? 15: 0,
                },
              ]}>
              {/* {route.name === 'notification' ? (
                <Image
                  style={{ position: 'absolute', right: 18, top: 6 }}
                  source={require('@/assets/icons/notification-unread.png')}
                />
              ) : null} */}
              <options.tabBarIcon focused={isFocused} />
            </Animated.View>
            <Text
              style={{
                color: !isFocused ? colors.lighterTitle : colors.title,
                fontFamily: 'Inter-500',
                fontSize: 12,
              }}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
