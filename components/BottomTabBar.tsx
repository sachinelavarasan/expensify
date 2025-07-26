import { View, Platform, TouchableOpacity, Text } from 'react-native';
import Animated, { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';

export default function BottomTab({ state, descriptors, navigation }: any) {
  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 10,
        // backgroundColor: '#1A1A24',
        paddingBottom: Platform.OS === 'ios' ? 10 : 0,
        paddingTop: 5,
        position: 'static',
        bottom: 0,
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
        const background = useSharedValue('transparent');

        if (isFocused) {
          background.value = withSpring('#463e75', {
            duration: 0,
          }); // animate when focused
        } else {
          background.value = withSpring('transparent'); // animate when focused
        }

        const animatedStyle = useAnimatedStyle(() => {
          return {
            backgroundColor: background.value,
            borderRadius: 15,
          };
        });

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
                },
                animatedStyle,
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
                color: !isFocused ? '#B3B1C4' : '#FFF',
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
