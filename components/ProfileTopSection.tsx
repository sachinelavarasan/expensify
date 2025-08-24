import React, { ReactElement } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from 'react-native-reanimated';
import { ThemedView } from './ThemedView';
import { deviceWidth } from '@/utils/functions';
import UpdateProfile from './UpdateProfile';
import { QueryObserverResult } from '@tanstack/react-query';
import { IExpUser } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeContext } from '@/contexts/ThemedContext';

const HEADER_MAX_HEIGHT = 350;
const HEADER_MIN_HEIGHT = 90;
const AVATAR_SIZE = 70;

type Props = {
  title: string;
  subtitle?: string;
  avatar: any;
  backgroundImage?: any;
  actionLabel?: string;
  children: ReactElement;
  refetch: () => Promise<QueryObserverResult<IExpUser, Error>>;
};

export default function AnimatedTopSection({
  title,
  subtitle,
  avatar,
  backgroundImage,
  refetch,
  children,
}: Props) {
  const { colors } = useThemeContext();
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);

  const bgStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollOffset.value,
      [-100, 0, 70],
      [HEADER_MAX_HEIGHT + 180, HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
      Extrapolate.CLAMP,
    );

    const scale = interpolate(scrollOffset.value, [-100, 0], [1.2, 1], Extrapolate.CLAMP);

    return {
      height,
      transform: [{ scale }],
    };
  });

  const avatarStyle = useAnimatedStyle(() => {
    const scale = interpolate(scrollOffset.value, [0, 80, 100], [1, 0.9, 0.8], Extrapolate.CLAMP);
    const translateY = interpolate(
      scrollOffset.value,
      [0, 10],
      [0, -HEADER_MAX_HEIGHT + (HEADER_MIN_HEIGHT - 100) / 2],
      Extrapolate.CLAMP,
    );
    const opacity = interpolate(scrollOffset.value, [0, 0, 100], [1, 0, 0], Extrapolate.CLAMP);

    return {
      transform: [{ scale }, { translateY }],
      opacity,
    };
  });

  const titleBarOpacity = useAnimatedStyle(() => {
    const opacity = interpolate(scrollOffset.value, [0, 10], [0, 1], Extrapolate.CLAMP);
    return { opacity };
  });

  const titleColor = colors.title;
  const subtitleColor = colors.secondary;

  return (
    <ThemedView style={styles.container}>
      <Animated.ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: HEADER_MAX_HEIGHT - 200 }}>
        <View style={styles.content}>{children}</View>
      </Animated.ScrollView>

      <Animated.View style={[styles.background, bgStyle]}>
        {/* {backgroundImage && (
          <Image
            resizeMode="cover"
            source={backgroundImage}
            style={[
              styles.backgroundImage,
              {
                marginTop: -20,
              },
            ]}
          />
        )} */}
        <LinearGradient
          colors={['#2E026D', '#15162C', '#0F0E17']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          locations={[0.1, 0.5, 1]}
          style={[styles.backgroundImage]}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.avatarContainer,
          avatarStyle,
          { backgroundColor: colors.background, borderColor: colors.background },
        ]}>
        <Image source={avatar} style={styles.avatarFull} />

        <View style={styles.headerContent}>
          <View style={styles.headerTextOverlay}>
            <Text style={[styles.titleTextInHeader, { color: colors.title }]} numberOfLines={1}>
              {title}
            </Text>
            {subtitle && (
              <Text style={[styles.subtitleTextInHeader, { color: colors.lighterTitle }]}>
                {subtitle}
              </Text>
            )}
          </View>

          <UpdateProfile refetch={refetch} />
        </View>
      </Animated.View>

      {/* <Animated.View style={[styles.avatarContainer, avatarStyle]}>
        <Image source={avatar} style={styles.avatarFull} />
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={styles.headerTextOverlay}>
            <Text style={styles.titleTextInHeader} numberOfLines={1}>
              {title}
            </Text>
            {subtitle && <Text style={styles.subtitleTextInHeader}>{subtitle}</Text>}
          </View>
          <UpdateProfile refetch={refetch} />
        </View>
      </Animated.View> */}

      <Animated.View
        style={[
          styles.titleBar,
          titleBarOpacity,
          { backgroundColor: colors.background, borderBottomColor: colors.borderColor },
        ]}>
        <Animated.View style={[styles.headerAvatarSmall]}>
          <Image source={avatar} style={styles.avatar} resizeMode="contain" />
        </Animated.View>

        <View style={styles.titleTextContainer}>
          <Text style={[styles.title, { color: titleColor }]} numberOfLines={1}>
            {title}
          </Text>
          {!!subtitle && (
            <Text style={[styles.subtitle, { color: subtitleColor }]} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        <UpdateProfile refetch={refetch} />
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: {
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: -2,
    overflow: 'hidden',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  titleBar: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: HEADER_MIN_HEIGHT,
    zIndex: 3,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  titleTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    maxWidth: 150,
  },
  subtitle: {
    fontSize: 14,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  actionText: {
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 60,
  },
  headerAvatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E2E2EA',
  },
  // avatarContainer: {
  //   position: 'absolute',
  //   top: HEADER_MAX_HEIGHT - (AVATAR_SIZE + 460) / 2,
  //   left: 40,
  //   zIndex: 3,
  //   borderRadius: AVATAR_SIZE / 2,
  //   overflow: 'hidden',
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   width: deviceWidth() * 0.8,
  //   height: AVATAR_SIZE,
  //   backgroundColor: '#0F0E17',
  //   borderWidth: 3,
  //   borderColor: '#463e75',
  // },
  // avatarFull: {
  //   width: AVATAR_SIZE,
  //   height: AVATAR_SIZE,
  //   borderRadius: AVATAR_SIZE / 2,
  // },
  // headerTextOverlay: {
  //   marginLeft: 15,
  //   justifyContent: 'center',
  //   flexShrink: 1,
  // },

  titleTextInHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    maxWidth: 100,
  },

  subtitleTextInHeader: {
    fontSize: 14,
    marginTop: 4,
  },
  avatarContainer: {
    position: 'absolute',
    top: HEADER_MAX_HEIGHT - (AVATAR_SIZE + 540) / 2,
    left: 20,
    right: 20, // make it flexible width
    zIndex: 3,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12, // spacing inside
    borderRadius: 20, // smoother card look
    backgroundColor: '#1A1825', // darker than app bg
    borderWidth: 1,
    borderColor: '#2E026D', // subtle accent border
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },

  avatarFull: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#6900FF', // nice accent around avatar
  },

  headerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerTextOverlay: {
    flexShrink: 1,
  },
});
