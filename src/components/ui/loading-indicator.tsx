import { ActivityIndicator, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { useAppTheme } from '@/theme/theme-provider';

type LoadingIndicatorProps = {
  label?: string;
  accessibilityLabel?: string;
  accessibilityRole?: 'progressbar' | 'none';
  accessibilityLiveRegion?: 'none' | 'polite' | 'assertive';
};

export function LoadingIndicator({
  label,
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
      style={{ alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.lg }}>
      <ActivityIndicator color={colors.primary} importantForAccessibility="no" />
      {label ? <AppText variant="caption" tone="muted" importantForAccessibility="no">{label}</AppText> : null}
    </View>
  );
}

