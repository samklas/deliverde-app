import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, useAnimatedProps,
  withTiming, withRepeat, withSequence,
  interpolate, interpolateColor, Extrapolation, Easing,
  createAnimatedComponent, SharedValue,
} from 'react-native-reanimated';
import Svg, { Rect, Ellipse, Circle, G } from 'react-native-svg';
import { observer } from 'mobx-react-lite';
import * as Haptics from 'expo-haptics';
import { theme } from '@/theme';
import userStore from '@/stores/userStore';

const { width: SW } = Dimensions.get('window');
const VB_W = 320;
const VB_H = 120;
const GROUND_Y = 85;
const TRACK_W = SW - 64; // screen - (16px screen margin × 2) - (16px card padding × 2)

const AnimatedRect    = createAnimatedComponent(Rect);
const AnimatedEllipse = createAnimatedComponent(Ellipse);
const AnimatedCircle  = createAnimatedComponent(Circle);
const AnimatedG       = createAnimatedComponent(G);

type PlantDef = {
  x: number; stemH: number;
  leafW: number; leafH: number; vegR: number;
  vegColor: string; leafColor: string; stemColor: string;
  startAt: number; leafAt: number; vegAt: number;
  phase: number;
};

const PLANTS: PlantDef[] = [
  { x: 38,  stemH: 26, leafW: 13, leafH: 7,  vegR: 5, vegColor: '#EF5350', leafColor: '#4CAF50', stemColor: '#2E7D32', startAt: 0.04, leafAt: 0.13, vegAt: 0.55, phase: -0.75 },
  { x: 95,  stemH: 38, leafW: 18, leafH: 10, vegR: 7, vegColor: '#FB8C00', leafColor: '#66BB6A', stemColor: '#388E3C', startAt: 0.12, leafAt: 0.24, vegAt: 0.60, phase:  0.55 },
  { x: 158, stemH: 46, leafW: 21, leafH: 12, vegR: 9, vegColor: '#E91E63', leafColor: '#43A047', stemColor: '#2E7D32', startAt: 0.22, leafAt: 0.36, vegAt: 0.56, phase: -0.25 },
  { x: 220, stemH: 36, leafW: 17, leafH: 10, vegR: 7, vegColor: '#FF7043', leafColor: '#558B2F', stemColor: '#33691E', startAt: 0.33, leafAt: 0.47, vegAt: 0.65, phase:  0.85 },
  { x: 276, stemH: 28, leafW: 14, leafH: 8,  vegR: 5, vegColor: '#7E57C2', leafColor: '#4CAF50', stemColor: '#2E7D32', startAt: 0.42, leafAt: 0.57, vegAt: 0.71, phase: -0.55 },
];

// ── Plant ─────────────────────────────────────────────────────────────────────
type PlantProps = { def: PlantDef; progress: SharedValue<number>; sway: SharedValue<number>; glow: SharedValue<number> };

function Plant({ def, progress, sway, glow }: PlantProps) {
  const top = GROUND_Y - def.stemH;

  const stemProps = useAnimatedProps(() => {
    const t = interpolate(progress.value, [def.startAt, def.startAt + 0.18], [0, 1], Extrapolation.CLAMP);
    const h = t * def.stemH;
    return { y: GROUND_Y - h, height: h };
  });

  const lLeafProps = useAnimatedProps(() => ({
    opacity: interpolate(progress.value, [def.leafAt, def.leafAt + 0.14], [0, 1], Extrapolation.CLAMP),
  }));

  const rLeafProps = useAnimatedProps(() => ({
    opacity: interpolate(progress.value, [def.leafAt, def.leafAt + 0.14], [0, 1], Extrapolation.CLAMP),
  }));

  const vegProps = useAnimatedProps(() => {
    const t = interpolate(progress.value, [def.vegAt, def.vegAt + 0.12], [0, 1], Extrapolation.CLAMP);
    return { opacity: t, r: def.vegR * 0.3 + def.vegR * 0.7 * t };
  });

  const glowProps = useAnimatedProps(() => {
    const visible = interpolate(progress.value, [0.98, 1], [0, 1], Extrapolation.CLAMP);
    return {
      opacity: visible * interpolate(glow.value, [0, 1], [0.12, 0.45]),
      r: def.vegR + interpolate(glow.value, [0, 1], [2, 9]),
    };
  });

  const groupProps = useAnimatedProps(() => ({
    rotation: sway.value * def.phase * 2.5,
  }));

  return (
    <AnimatedG originX={def.x} originY={GROUND_Y} animatedProps={groupProps}>
      {/* Stem */}
      <AnimatedRect x={def.x - 2} width={4} rx={2} fill={def.stemColor} animatedProps={stemProps} />
      {/* Left leaf */}
      <AnimatedEllipse
        cx={def.x - def.leafW * 0.7} cy={top + 9}
        rx={def.leafW} ry={def.leafH * 0.65}
        fill={def.leafColor} rotation={-25}
        originX={def.x - def.leafW * 0.7} originY={top + 9}
        animatedProps={lLeafProps}
      />
      {/* Right leaf */}
      <AnimatedEllipse
        cx={def.x + def.leafW * 0.7} cy={top + 17}
        rx={def.leafW} ry={def.leafH * 0.65}
        fill={def.leafColor} rotation={25}
        originX={def.x + def.leafW * 0.7} originY={top + 17}
        animatedProps={rLeafProps}
      />
      {/* Vegetable */}
      <AnimatedCircle cx={def.x} cy={top - 1} fill={def.vegColor} animatedProps={vegProps} />
      {/* Harvest glow ring (visible only at 100%) */}
      <AnimatedCircle cx={def.x} cy={top - 1} fill="#FFD740" animatedProps={glowProps} />
    </AnimatedG>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
const DailyChallengeBox = observer(() => {
  const { dailyTotal, dailyTarget } = userStore;
  const wasComplete = useRef(false);

  const raw = dailyTarget > 0 ? Math.min(dailyTotal / dailyTarget, 1) : 0;
  const isComplete = raw >= 1;
  const pct = Math.round(raw * 100);

  const progressAnim = useSharedValue(0);
  const swayAnim     = useSharedValue(0);
  const glowAnim     = useSharedValue(0);

  // Smooth progress animation
  useEffect(() => {
    progressAnim.value = withTiming(raw, { duration: 900, easing: Easing.out(Easing.cubic) });
  }, [raw]);

  // Ambient sway — always running
  useEffect(() => {
    swayAnim.value = withRepeat(
      withSequence(
        withTiming( 1, { duration: 3500, easing: Easing.inOut(Easing.ease) }),
        withTiming(-1, { duration: 3500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1, false,
    );
  }, []);

  // Harvest glow + haptic on completion
  useEffect(() => {
    if (isComplete && !wasComplete.current) {
      wasComplete.current = true;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      glowAnim.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        ),
        -1, false,
      );
    } else if (!isComplete) {
      wasComplete.current = false;
      glowAnim.value = withTiming(0, { duration: 400 });
    }
  }, [isComplete]);

  const cardStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progressAnim.value, [0, 0.5, 1], ['#FFFFFF', '#EEF8E8', '#FEFDE8']),
  }));

  const barFillStyle = useAnimatedStyle(() => ({
    width: progressAnim.value * TRACK_W,
    backgroundColor: interpolateColor(
      progressAnim.value,
      [0, 0.75, 1],
      ['#66BB6A', '#37891C', '#FFC107'],
    ),
  }));

  const msg =
    isComplete    ? 'Upea sadonkorjuu! Tavoite saavutettu! 🌟'
    : raw >= 0.75 ? 'Melkein perillä — puutarha kukoistaa!'
    : raw >= 0.5  ? 'Puolivälissä! Kasvit varttuvat hienosti.'
    : raw >= 0.25 ? 'Hyvää vauhtia! Kasvit versovat.'
    : raw > 0     ? 'Hyvä alku! Puutarha herää eloon.'
    :               'Aloita päivä syömällä vihanneksia.';

  const sceneW = SW - 48;
  const sceneH = Math.round((sceneW / VB_W) * VB_H);

  const skyFill = isComplete ? '#FFFDE7' : raw >= 0.5 ? '#EAF7E0' : '#F6FAF4';
  const groundFill = '#33691E';

  return (
    <Animated.View
      style={[styles.card, cardStyle]}
      accessible
      accessibilityLabel={`Päivän tavoite: ${dailyTotal} grammaa ${dailyTarget}:stä. ${pct} prosenttia saavutettu.`}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: dailyTarget, now: dailyTotal }}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Päivän tavoite</Text>
        <View style={styles.gramsRow}>
          <Text style={styles.gramsNow}>{dailyTotal}</Text>
          <Text style={styles.gramsOf}> / {dailyTarget}g</Text>
        </View>
      </View>

      {/* Garden scene */}
      <View style={[styles.scene, { width: sceneW, height: sceneH }]}>
        <Svg width={sceneW} height={sceneH} viewBox={`0 0 ${VB_W} ${VB_H}`}>
          {/* Sky */}
          <Rect x={0} y={0} width={VB_W} height={GROUND_Y} fill={skyFill} />
          {/* Ground */}
          <Rect x={0} y={GROUND_Y} width={VB_W} height={VB_H - GROUND_Y} fill={groundFill} />
          {/* Ground surface highlight */}
          <Rect x={0} y={GROUND_Y} width={VB_W} height={2} fill="rgba(255,255,255,0.16)" />
          {/* Soil texture */}
          {[22, 68, 122, 182, 238, 294].map((tx) => (
            <Ellipse key={tx} cx={tx} cy={GROUND_Y + 7} rx={5} ry={2.5} fill="rgba(0,0,0,0.1)" />
          ))}
          {/* Plants */}
          {PLANTS.map((def, i) => (
            <Plant key={i} def={def} progress={progressAnim} sway={swayAnim} glow={glowAnim} />
          ))}
        </Svg>
      </View>

      {/* Progress bar */}
      <View style={styles.track}>
        <Animated.View style={[styles.fill, barFillStyle]} />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.pct}>{pct}%</Text>
        <Text style={styles.msg} numberOfLines={1}>{msg}</Text>
      </View>
    </Animated.View>
  );
});

export default DailyChallengeBox;

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.09,
    shadowRadius: 14,
    elevation: 4,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  title: {
    fontSize: 17,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.primary,
  },
  gramsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  gramsNow: {
    fontSize: 22,
    fontFamily: theme.fontFamily.bold,
    color: '#37891C',
  },
  gramsOf: {
    fontSize: 14,
    fontFamily: theme.fontFamily.regular,
    color: '#888',
  },
  scene: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  track: {
    height: 5,
    backgroundColor: '#E8E8E8',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pct: {
    fontSize: 13,
    fontFamily: theme.fontFamily.bold,
    color: '#37891C',
    minWidth: 34,
  },
  msg: {
    flex: 1,
    fontSize: 13,
    fontFamily: theme.fontFamily.regular,
    color: '#666',
  },
});
