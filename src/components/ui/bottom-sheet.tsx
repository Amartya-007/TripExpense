import { useEffect, useState } from 'react';
import { Modal, Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useAppTheme } from '@/theme/theme-provider';

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  /** Hide the drag-handle bar - most sheets want it, a couple prefer a plain top edge. */
  showHandle?: boolean;
};

const OPEN_DURATION = 260;
const CLOSE_DURATION = 200;
const SHEET_TRAVEL = 520;

/**
 * Shared bottom-sheet shell: dimmed backdrop (tap to close) + a rounded
 * sheet that slides up from the bottom. Same animation approach as
 * DatePicker's calendar sheet - kept as one primitive so new sheets (trip
 * switcher, pickers, etc.) don't reimplement the Reanimated wiring.
 */
export function BottomSheet({ visible, onClose, children, contentStyle, showHandle = true }: BottomSheetProps) {
  const { colors, radius, spacing } = useAppTheme();
  const progress = useSharedValue(0);
  const [mounted, setMounted] = useState(visible);
  const [prevVisible, setPrevVisible] = useState(visible);

  // Render-time state adjustment (not an effect): mount immediately when
  // opening so the modal is present before the open animation starts.
  if (visible !== prevVisible) {
    setPrevVisible(visible);
    if (visible) setMounted(true);
  }

  useEffect(() => {
    progress.value = withTiming(
      visible ? 1 : 0,
      { duration: visible ? OPEN_DURATION : CLOSE_DURATION, easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic) },
      (finished) => {
        'worklet';
        if (finished && !visible) {
          runOnJS(setMounted)(false);
        }
      },
    );
  }, [visible, progress]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.value * 0.45 }));
  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: (1 - progress.value) * SHEET_TRAVEL }] }));

  if (!mounted) return null;

  return (
    <Modal animationType="none" onRequestClose={onClose} transparent visible={mounted}>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Animated.View style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000000' }, backdropStyle]} />
        <Pressable accessibilityLabel="Close" onPress={onClose} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />

        <Animated.View
          style={[
            {
              backgroundColor: colors.surface,
              borderTopLeftRadius: radius.xl,
              borderTopRightRadius: radius.xl,
              paddingBottom: spacing.xl,
              maxHeight: '85%',
            },
            sheetStyle,
            contentStyle,
          ]}>
          {showHandle ? (
            <View style={{ alignItems: 'center', paddingTop: spacing.sm, paddingBottom: spacing.xs }}>
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border }} />
            </View>
          ) : null}
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}
