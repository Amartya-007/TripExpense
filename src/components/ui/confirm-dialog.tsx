import { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Icon, type IconName } from '@/components/ui/icon';
import { useAppTheme } from '@/theme/theme-provider';

type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'primary';
  icon?: IconName;
  onConfirm: () => void;
  onCancel: () => void;
};

const DURATION = 220;

export function ConfirmDialog({
  visible,
  title,
  body,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  icon,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { colors, radius, spacing } = useAppTheme();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(visible ? 1 : 0, { duration: DURATION, easing: Easing.out(Easing.cubic) });
  }, [visible, progress]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.value * 0.55 }));
  const cardStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.92 + progress.value * 0.08 }, { translateY: (1 - progress.value) * 12 }],
  }));

  const toneColor = tone === 'danger' ? colors.danger : colors.primary;
  const toneSoft = tone === 'danger' ? colors.dangerSoft : colors.primarySoft;

  return (
    <Modal animationType="none" onRequestClose={onCancel} transparent visible={visible}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl }}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#000000' }, backdropStyle]} />
        <Pressable accessible={false} importantForAccessibility="no" onPress={onCancel} style={StyleSheet.absoluteFill} />

        <Animated.View
          accessibilityViewIsModal
          accessibilityRole="alert"
          accessibilityLabel={`${title}. ${body}`}
          style={[
            {
              width: '100%',
              maxWidth: 360,
              borderRadius: radius.xl,
              backgroundColor: colors.surface,
              padding: spacing.xl,
              gap: spacing.lg,
            },
            cardStyle,
          ]}>
          <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' }}>
            <View
              importantForAccessibility="no"
              style={{
                width: 44,
                height: 44,
                borderRadius: radius.md,
                backgroundColor: toneSoft,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Icon name={icon ?? (tone === 'danger' ? 'error' : 'info')} size={20} color={toneColor} />
            </View>
            <View style={{ flex: 1, gap: spacing.xs }}>
              <AppText variant="subtitle">{title}</AppText>
              <AppText tone="muted">{body}</AppText>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <Button label={cancelLabel} onPress={onCancel} style={{ flex: 1 }} variant="secondary" />
            <Button label={confirmLabel} onPress={onConfirm} style={{ flex: 1 }} variant={tone === 'danger' ? 'danger' : 'primary'} />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

