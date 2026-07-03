import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, useAnimatedProps,
  withTiming, withRepeat, withSequence, withSpring,
  interpolateColor, Easing,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { observer } from 'mobx-react-lite';
import * as Haptics from 'expo-haptics';
import { theme } from '@/theme';
import userStore from '@/stores/userStore';

const { width: SW } = Dimensions.get('window');
// card has 16px padding, scrollview has 16px horizontal padding each side
const CARD_INNER_W = SW - 64;

// Arc geometry: 180° half circle arching over the bubble + mascot
const SIZE = Math.min(CARD_INNER_W, 240);
const STROKE = 10;
const R = (SIZE - STROKE) / 2;
const C = SIZE / 2;
const SVG_H = C + STROKE / 2;
const ARC_PATH = `M ${C - R} ${C} A ${R} ${R} 0 0 1 ${C + R} ${C}`;
const ARC_LEN = Math.PI * R;

const AnimatedPath = Animated.createAnimatedComponent(Path);

const DailyChallengeBox = observer(() => {
  const { dailyTotal, dailyTarget } = userStore;
  const wasComplete = useRef(false);

  const raw = dailyTarget > 0 ? Math.min(dailyTotal / dailyTarget, 1) : 0;
  const isComplete = raw >= 1;
  const pct = Math.round(raw * 100);
  const prevTotal = useRef(dailyTotal);

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

  // Bubble pop when the numbers change
  useEffect(() => {
    if (dailyTotal !== prevTotal.current) {
      prevTotal.current = dailyTotal;
      bubbleOpacity.value = 0;
      bubbleScale.value = 0.88;
      bubbleOpacity.value = withTiming(1, { duration: 220 });
      bubbleScale.value = withSpring(1, { damping: 12, stiffness: 220 });
    }
  }, [dailyTotal]);

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

  const arcProps = useAnimatedProps(() => ({
    strokeDashoffset: ARC_LEN * (1 - progressAnim.value),
    stroke: interpolateColor(
      progressAnim.value,
      [0, 0.75],
      ['#4CAF50', '#37891C'],
    ),
    // round linecap draws a dot even at zero length — hide it until there is progress
    opacity: progressAnim.value > 0.002 ? 1 : 0,
  }));

  return (
    <View style={styles.card}>
      <Text style={styles.goalLabel}>Päivän tavoite {dailyTarget}g kasviksia</Text>

      <View style={styles.arcWrap}>
        <Svg width={SIZE} height={SVG_H} style={styles.arcSvg}>
          <Path
            d={ARC_PATH}
            stroke="#E8F5E0"
            strokeWidth={STROKE}
            strokeLinecap="round"
            fill="none"
          />
          <AnimatedPath
            d={ARC_PATH}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={`${ARC_LEN} ${ARC_LEN}`}
            fill="none"
            animatedProps={arcProps}
          />
        </Svg>

        {/* Bubble + mascot inside the arc */}
        <View style={styles.arcContent}>
          <Animated.View style={[styles.bubble, bubbleStyle]}>
            <Text style={styles.bubbleGrams}>
              {dailyTotal} g <Text style={styles.bubbleGramsUnit}>kasviksia</Text>
            </Text>
            <Text style={styles.bubblePct}>{pct}% tavoitteesta</Text>
            {/* Tail points down toward mascot */}
            <View style={styles.tail} />
          </Animated.View>

          <Animated.Image
            source={require('../../assets/images/avatar2.jpg')}
            style={[styles.mascot, mascotStyle]}
          />
        </View>
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
  goalLabel: {
    fontFamily: theme.fontFamily.semiBold,
    fontSize: 15,
    color: theme.colors.primary,
    textAlign: 'center',
  },
  arcWrap: {
    alignSelf: 'center',
    width: SIZE,
    marginTop: 8,
  },
  arcSvg: {
    position: 'absolute',
    top: 0,
  },
  arcContent: {
    alignItems: 'center',
    // keeps the bubble's top corners inside the curve of the half circle
    paddingTop: SIZE * 0.18,
  },
  mascot: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F2FAF0',
  },
  bubble: {
    alignItems: 'center',
    backgroundColor: BUBBLE_BG,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 14,
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
  bubbleGrams: {
    fontFamily: theme.fontFamily.bold,
    fontSize: 20,
    color: '#37891C',
  },
  bubbleGramsUnit: {
    fontFamily: theme.fontFamily.medium,
    fontSize: 14,
    color: theme.colors.primary,
  },
  bubblePct: {
    fontFamily: theme.fontFamily.medium,
    fontSize: 13,
    color: theme.colors.primary,
    marginTop: 1,
  },
});
