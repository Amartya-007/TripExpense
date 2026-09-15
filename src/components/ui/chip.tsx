import { Pressable } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { useAppTheme } from '@/theme/theme-provider';

type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  color?: string;
};

export function Chip({ label, selected, onPress, color }: ChipProps) {
  const { colors, radius, spacing } = useAppTheme();
  const activeColor = color ?? colors.primary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xs,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderRadius: radius.pill,
          borderWidth: 1,
          borderColor: selected ? activeColor : colors.border,
          backgroundColor: selected ? `${activeColor}1A` : colors.surface,
          opacity: pressed ? 0.78 : 1,
        },
      ]}>
      <AppText variant="caption" style={{ color: selected ? activeColor : colors.textMuted }}>
        {label}
      </AppText>
    </Pressable>
  );
}
