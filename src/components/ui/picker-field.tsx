import { Pressable, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Icon } from '@/components/ui/icon';
import { useAppTheme } from '@/theme/theme-provider';

type PickerFieldProps = {
  label?: string;
  value: string;
  onPress: () => void;
  disabled?: boolean;
};

/**
 * Looks like Input, but opens a sheet instead of a keyboard - used for
 * "paid by" / "split between" and anything else backed by a picker sheet.
 */
export function PickerField({ label, value, onPress, disabled }: PickerFieldProps) {
  const { colors, radius, spacing } = useAppTheme();

  return (
    <View style={{ gap: spacing.sm }}>
      {label ? <AppText variant="caption">{label}</AppText> : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label ?? value}
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
          {
            minHeight: 52,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: spacing.sm,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.lg,
            paddingHorizontal: spacing.lg,
            backgroundColor: colors.surface,
            opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
          },
        ]}>
        <AppText variant="body">{value}</AppText>
        <Icon name="chevronDown" size={18} color={colors.textMuted} />
      </Pressable>
    </View>
  );
}
