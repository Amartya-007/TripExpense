import { ActivityIndicator, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { useAppTheme } from '@/theme/theme-provider';

type LoadingIndicatorProps = {
  label?: string;
  size?: 'small' | 'large' | number;
  color?: string;
  fullScreen?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityRole?: 'progressbar' | 'none';
  accessibilityLiveRegion?: 'none' | 'polite' | 'assertive';
};

export function LoadingIndicator({
  label,
  size = 'small',
  color,
  fullScreen = false,
  style,
  accessibilityLabel,
  accessibilityRole,
  accessibilityLiveRegion,
}: LoadingIndicatorProps) {
  const { colors, spacing } = useAppTheme();

  return (
    <View
      accessibilityRole={accessibilityRole ?? 'progressbar'}
      accessibilityLiveRegion={accessibilityLiveRegion ?? 'polite'}
      accessibilityLabel={accessibilityLabel ?? label ?? 'Loading'}
      style={[
        {
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.sm,
          padding: spacing.lg,
        },
        fullScreen && {
          flex: 1,
          backgroundColor: colors.background,
        },
        style,
      ]}>
      <ActivityIndicator
        size={size}
        color={color ?? colors.primary}
        importantForAccessibility="no"
      />
      {label ? (
        <AppText variant="caption" tone="muted" importantForAccessibility="no">
          {label}
        </AppText>
      ) : null}
    </View>
  );
}