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

const HEADER_MAX_HEIGHT = 350;
const HEADER_MIN_HEIGHT = 90;
const AVATAR_SIZE = 80;

type Props = {
  title: string;
  subtitle?: string;
  avatar: any;
  backgroundImage?: any;
  actionLabel?: string;
  children: ReactElement;
  refetch: ()=>Promise<QueryObserverResult<IExpUser, Error>>
};

export default function AnimatedTopSection({
  title,
  subtitle,
  avatar,
  backgroundImage,
  refetch,
  children,
}: Props) {
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
    const scale = interpolate(scrollOffset.value, [0, 100, 200], [1, 0.9, 0.8], Extrapolate.CLAMP);
    const translateY = interpolate(
      scrollOffset.value,
      [0, 100],
      [0, -HEADER_MAX_HEIGHT + (HEADER_MIN_HEIGHT - 200) / 2],
      Extrapolate.CLAMP,
    );
    const opacity = interpolate(scrollOffset.value, [0, 60, 100], [1, 0.7, 0], Extrapolate.CLAMP);

    return {
      transform: [{ scale }, 
        { translateY }],
      opacity,
    };
  });

  const titleBarOpacity = useAnimatedStyle(() => {
    const opacity = interpolate(scrollOffset.value, [70, 80], [0, 1], Extrapolate.CLAMP);
    return { opacity };
  });

  const titleColor = '#FFF';
  const subtitleColor = '#CCC';

  return (
    <ThemedView style={styles.container}>
      <Animated.ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: HEADER_MAX_HEIGHT - 180 }}>
        <View style={styles.content}>{children}</View>
      </Animated.ScrollView>

      <Animated.View style={[styles.background, bgStyle]}>
        {backgroundImage && (
          <Image
            resizeMode='cover'
            source={backgroundImage}
            style={[
              styles.backgroundImage,
              {
                marginTop: -20,
              },
            ]}
          />
        )}
      </Animated.View>

      <Animated.View style={[styles.avatarContainer, avatarStyle]}>
        <Image source={avatar} style={styles.avatarFull} />
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={styles.headerTextOverlay}>
            <Text style={styles.titleTextInHeader}>{title}</Text>
            {subtitle && <Text style={styles.subtitleTextInHeader}>{subtitle}</Text>}
          </View>
          <UpdateProfile refetch={refetch}/>
        </View>
      </Animated.View>

      <Animated.View style={[styles.titleBar, titleBarOpacity, { backgroundColor: '#0F0E17' }]}>
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

        <UpdateProfile refetch={refetch}/>
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
    // height: '100%',
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
    borderBottomColor: '#ccc',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  titleTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
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
    borderColor: '#6900FF',
  },
  avatarContainer: {
    position: 'absolute',
    top: HEADER_MAX_HEIGHT - (AVATAR_SIZE + 460) / 2,
    left: 40,
    zIndex: 3,
    borderRadius: AVATAR_SIZE / 2,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    width: deviceWidth() * 0.8,
    height: AVATAR_SIZE,
    backgroundColor: '#0F0E17',
    borderWidth: 3,
    borderColor: '#463e75',
  },
  avatarFull: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  headerTextOverlay: {
    marginLeft: 15,
    justifyContent: 'center',
    flexShrink: 1,
  },

  titleTextInHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },

  subtitleTextInHeader: {
    fontSize: 14,
    color: '#CCC',
    marginTop: 4,
  },
});
