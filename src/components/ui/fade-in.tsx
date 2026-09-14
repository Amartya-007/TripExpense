import { useEffect } from 'react';
import { AccessibilityInfo, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

type FadeInProps = {
  children: React.ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
};

const DURATION = 320;
const RISE_DISTANCE = 16;

export function FadeIn({ children, delay = 0, style }: FadeInProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    AccessibilityInfo.isReduceMotionEnabled()
      .then((reduceMotion) => {
        if (cancelled) return;
        if (reduceMotion) {
          progress.value = 1;
          return;
        }
        timeoutId = setTimeout(() => {
          progress.value = withTiming(1, { duration: DURATION, easing: Easing.out(Easing.cubic) });
        }, delay);
      })
      .catch(() => {
        progress.value = withTiming(1, { duration: DURATION, easing: Easing.out(Easing.cubic) });
      });

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [delay, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * RISE_DISTANCE }],
  }));

  return <Animated.View style={[{ flex: 1 }, style, animatedStyle]}>{children}</Animated.View>;
}
