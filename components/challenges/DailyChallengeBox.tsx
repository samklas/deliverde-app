import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withRepeat, withSequence,
  Easing,
} from 'react-native-reanimated';
import { observer } from 'mobx-react-lite';
import * as Haptics from 'expo-haptics';
import { theme } from '@/theme';
import userStore from '@/stores/userStore';

const AVATAR_SIZE = 110;

const getAvatar = (avatarId: string) => {
  if (avatarId === '1') {
    return require('../../assets/images/avatar2.jpg');
  }
  if (avatarId === '2') {
    return require('../../assets/images/avatar3.jpg');
  }
  if (avatarId === '3') {
    return require('../../assets/images/avatar4.jpg');
  }
  if (avatarId === '4') {
    return require('../../assets/images/avatar5.png');
  }
  return require('../../assets/images/avatar2.jpg');
};

const DailyChallengeBox = observer(() => {
  const { dailyTotal, dailyTarget, avatarId } = userStore;
  const wasComplete = useRef(false);

  const raw = dailyTarget > 0 ? Math.min(dailyTotal / dailyTarget, 1) : 0;
  const isComplete = raw >= 1;

  const bobAnim = useSharedValue(0);

  // Gentle avatar bob
  useEffect(() => {
    bobAnim.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
      ),
      -1, false,
    );
  }, []);

  // Haptic on completion
  useEffect(() => {
    if (isComplete && !wasComplete.current) {
      wasComplete.current = true;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } else if (!isComplete) {
      wasComplete.current = false;
    }
  }, [isComplete]);

  const avatarStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bobAnim.value }],
  }));

  return (
    <View style={styles.card}>
      <View style={styles.bubble}>
        <Text style={styles.bubbleText}>Päivän tavoite {dailyTarget}g kasviksia</Text>
        <View style={styles.tail} />
      </View>

      <Animated.View style={[styles.avatarWrap, avatarStyle]}>
        <Image source={getAvatar(avatarId)} style={styles.avatar} />
      </Animated.View>
    </View>
  );
});

export default DailyChallengeBox;

const BUBBLE_BG = '#F2FAF0';

const styles = StyleSheet.create({
  card: {
    marginBottom: 20,
  },
  bubble: {
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: BUBBLE_BG,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  bubbleText: {
    fontFamily: theme.fontFamily.semiBold,
    fontSize: 15,
    color: theme.colors.primary,
    textAlign: 'center',
  },
  tail: {
    position: 'absolute',
    bottom: -9,
    alignSelf: 'center',
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: BUBBLE_BG,
  },
  avatarWrap: {
    alignSelf: 'center',
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
});
