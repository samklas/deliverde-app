import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withRepeat, withSequence, withSpring,
  interpolateColor, Easing,
} from 'react-native-reanimated';
import { observer } from 'mobx-react-lite';
import * as Haptics from 'expo-haptics';
import { theme } from '@/theme';
import userStore from '@/stores/userStore';

const { width: SW } = Dimensions.get('window');
// card has 16px padding, scrollview has 16px horizontal padding each side
const TRACK_W = SW - 64;

const getMsg = (raw: number, remaining: number): string => {
  if (raw >= 1)    return 'Tavoite saavutettu! Olen tosi ylpeä sinusta! 🎉';
  if (raw >= 0.75) return `Vain ${remaining}g jäljellä — sinä pystyt tähän!`;
  if (raw >= 0.5)  return 'Puolivälissä! Olet tekemässä hienoa työtä!';
  if (raw >= 0.25) return 'Hyvää menoa! Jatka samaan malliin!';
  if (raw > 0)     return 'Hyvä alku! Jokainen gramma lasketaan.';
  return 'Hei! Aloitetaan tänään yhdessä! 🌱';
};

const DailyChallengeBox = observer(() => {
  const { dailyTotal, dailyTarget } = userStore;
  const wasComplete = useRef(false);

  const raw = dailyTarget > 0 ? Math.min(dailyTotal / dailyTarget, 1) : 0;
  const isComplete = raw >= 1;
  const pct = Math.round(raw * 100);
  const remaining = Math.max(0, dailyTarget - dailyTotal);
  const msg = getMsg(raw, remaining);
  const prevMsg = useRef(msg);

  const progressAnim = useSharedValue(0);
  const bobAnim      = useSharedValue(0);
  const bubbleScale  = useSharedValue(1);
  const bubbleOpacity = useSharedValue(1);

  // Smooth progress fill
  useEffect(() => {
    progressAnim.value = withTiming(raw, { duration: 800, easing: Easing.out(Easing.cubic) });
  }, [raw]);

  // Gentle mascot bob
  useEffect(() => {
    bobAnim.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
        withTiming( 0, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
      ),
      -1, false,
    );
  }, []);

  // Bubble pop when message changes
  useEffect(() => {
    if (msg !== prevMsg.current) {
      prevMsg.current = msg;
      bubbleOpacity.value = 0;
      bubbleScale.value = 0.88;
      bubbleOpacity.value = withTiming(1, { duration: 220 });
      bubbleScale.value = withSpring(1, { damping: 12, stiffness: 220 });
    }
  }, [msg]);

  // Haptic on completion
  useEffect(() => {
    if (isComplete && !wasComplete.current) {
      wasComplete.current = true;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } else if (!isComplete) {
      wasComplete.current = false;
    }
  }, [isComplete]);

  const mascotStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bobAnim.value }],
  }));

  const bubbleStyle = useAnimatedStyle(() => ({
    opacity: bubbleOpacity.value,
    transform: [{ scale: bubbleScale.value }],
  }));

  const barFillStyle = useAnimatedStyle(() => ({
    width: progressAnim.value * TRACK_W,
    backgroundColor: interpolateColor(
      progressAnim.value,
      [0, 0.75, 1],
      ['#4CAF50', '#37891C', '#FFC107'],
    ),
  }));

  return (
    <View style={styles.card}>
      {/* Mascot + speech bubble */}
      <View style={styles.topSection}>
        {/* Bubble floats top-right, above the mascot */}
        <Animated.View style={[styles.bubble, bubbleStyle]}>
          <Text style={styles.bubbleText}>{msg}</Text>
          {/* Tail points down-left toward mascot */}
          <View style={styles.tail} />
        </Animated.View>

        {/* Mascot centered below */}
        <Animated.Image
          source={require('../../assets/images/avatar2.jpg')}
          style={[styles.mascot, mascotStyle]}
        />
      </View>

      {/* Progress section */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.goalLabel}>Päivän tavoite</Text>
          <View style={styles.gramsRow}>
            <Text style={styles.gramsNow}>{dailyTotal}</Text>
            <Text style={styles.gramsOf}> / {dailyTarget}g</Text>
          </View>
        </View>

        <View style={styles.track}>
          <Animated.View style={[styles.fill, barFillStyle]} />
        </View>

        <Text style={styles.pctLabel}>{pct}%</Text>
      </View>
    </View>
  );
});

export default DailyChallengeBox;

const BUBBLE_BG = '#F2FAF0';

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.09,
    shadowRadius: 14,
    elevation: 4,
  },
  topSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  mascot: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F2FAF0',
  },
  bubble: {
    alignSelf: 'flex-end',
    maxWidth: '72%',
    backgroundColor: BUBBLE_BG,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 13,
    marginBottom: 6,
  },
  tail: {
    position: 'absolute',
    bottom: -9,
    left: 16,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: BUBBLE_BG,
  },
  bubbleText: {
    fontFamily: theme.fontFamily.medium,
    fontSize: 14,
    color: theme.colors.primary,
    lineHeight: 20,
  },
  progressSection: {
    gap: 6,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  goalLabel: {
    fontFamily: theme.fontFamily.semiBold,
    fontSize: 15,
    color: theme.colors.primary,
  },
  gramsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  gramsNow: {
    fontFamily: theme.fontFamily.bold,
    fontSize: 20,
    color: '#37891C',
  },
  gramsOf: {
    fontFamily: theme.fontFamily.regular,
    fontSize: 13,
    color: '#888',
  },
  track: {
    height: 10,
    backgroundColor: '#E8F5E0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 5,
  },
  pctLabel: {
    fontFamily: theme.fontFamily.semiBold,
    fontSize: 12,
    color: '#37891C',
    textAlign: 'right',
  },
});
