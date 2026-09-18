import { useEffect } from 'react';
import { BackHandler, Platform, Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useAppTheme } from '@/theme/theme-provider';

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  /** Hide the drag-handle bar - most sheets want it, a couple prefer a plain top edge. */
  showHandle?: boolean;
  /** Describes the sheet content to screen readers (e.g. "Date picker", "People selector"). */
  accessibilityLabel?: string;
};

const OPEN_DURATION = 220;
const SHEET_TRAVEL = 520;

/**
 * Shared bottom-sheet shell: dimmed backdrop (tap to close) + a rounded
 * sheet that slides up from the bottom.
 *
 * Deliberately NOT built on React Native's <Modal> - a real Modal nested
 * inside a screen that's itself presented as a navigator modal (Add
 * Expense, Create Trip) is a known source of the sheet flashing open and
 * immediately disappearing on Android. This renders as a plain
 * absolutely-positioned overlay within the screen instead.
 *
 * Kept deliberately simple: mounts/unmounts directly off `visible`, no
 * separate "still closing" state to keep in sync. That costs the close
 * animation (it disappears immediately rather than sliding out) but
 * removes an entire class of open/close timing bugs.
 */
export function BottomSheet({ visible, onClose, children, contentStyle, showHandle = true, accessibilityLabel }: BottomSheetProps) {
  const { colors, radius, spacing } = useAppTheme();
  const progress = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    if (visible) progress.value = withTiming(1, { duration: OPEN_DURATION });
  }, [visible, progress]);

  useEffect(() => {
    if (!visible || Platform.OS !== 'android') return;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });

    return () => subscription.remove();
  }, [visible, onClose]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.value * 0.45 }));
  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: (1 - progress.value) * SHEET_TRAVEL }] }));

  if (!visible) return null;

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end', zIndex: 1000, elevation: 24 }}>
      <Animated.View style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000000' }, backdropStyle]} />
      <Pressable
        accessible={false}
        importantForAccessibility="no"
        onPress={onClose}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />

      <Animated.View
        accessibilityViewIsModal
        accessibilityLabel={accessibilityLabel}
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
  );
}

