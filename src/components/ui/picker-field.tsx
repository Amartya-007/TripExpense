import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Icon, type IconName } from '@/components/ui/icon';
import { useAppTheme } from '@/theme/theme-provider';

type PickerFieldProps = {
  label?: string;
  value?: string;
  placeholder?: string;
  leftIcon?: IconName;
  leftNode?: React.ReactNode;
  error?: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function PickerField({
  label,
  value,
  placeholder = 'Select...',
  leftIcon,
  leftNode,
  error,
  onPress,
  disabled,
  style,
}: PickerFieldProps) {
  const { colors, radius, spacing } = useAppTheme();
  const hasValue = Boolean(value && value.trim().length > 0);

  return (
    <View style={[{ gap: spacing.xs }, style]}>
      {label ? (
        <AppText variant="caption" tone="muted">
          {label}
        </AppText>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label ? `${label}, ${hasValue ? value : placeholder}` : (value || placeholder)}
        accessibilityState={{ disabled }}
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
            borderColor: error ? colors.danger : colors.border,
            borderRadius: radius.lg,
            paddingHorizontal: spacing.lg,
            backgroundColor: colors.surface,
            opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
          },
        ]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1, minWidth: 0 }}>
          {leftNode ? (
            leftNode
          ) : leftIcon ? (
            <Icon name={leftIcon} size={18} color={hasValue ? colors.primary : colors.textMuted} />
          ) : null}

          <AppText
            variant="body"
            numberOfLines={1}
            ellipsizeMode="tail"
            tone={hasValue ? 'default' : 'muted'}
            style={{ flex: 1 }}>
            {hasValue ? value : placeholder}
          </AppText>
        </View>

        <Icon name="chevronDown" size={18} color={colors.textMuted} />
      </Pressable>

      {error ? (
        <AppText variant="caption" style={{ color: colors.danger, fontSize: 11 }}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}