import { TextInput, View, type AccessibilityState, type TextInputProps } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Icon, type IconName } from '@/components/ui/icon';
import { useAppTheme } from '@/theme/theme-provider';

type InputProps = TextInputProps & {
  label?: string;
  variant?: 'default' | 'filled' | 'quiet';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: IconName;
  rightIcon?: IconName;
  error?: string;
  /** Marks the field as required for screen readers. */
  required?: boolean;
};

export function Input({
  label,
  variant = 'default',
  size = 'md',
  leftIcon,
  rightIcon,
  error,
  required,
  style,
  secureTextEntry,
  autoCapitalize,
  autoCorrect,
  spellCheck,
  accessibilityLabel,
  accessibilityHint,
  accessibilityState,
  ...props
}: InputProps) {
  const { colors, radius, spacing } = useAppTheme();
  const isQuiet = variant === 'quiet';
  const inputHeight = size === 'sm' ? 44 : size === 'lg' ? 60 : 52;

  // Merge accessibilityState: caller-supplied keys win; inject defaults only when not explicitly set.
  // `required` isn't part of RN's typed AccessibilityState, but some Android screen readers
  // still read it through when passed - widen the type locally rather than dropping it.
  const mergedState: AccessibilityState & { required?: boolean } = {
    ...accessibilityState,
    ...(props.editable !== undefined ? { disabled: accessibilityState?.disabled ?? !props.editable } : {}),
    ...(required !== undefined ? { required: (accessibilityState as { required?: boolean } | undefined)?.required ?? required } : {}),
  };

  const computedHint = accessibilityHint ?? (error ? `Error: ${error}` : undefined);
  const computedLabel = accessibilityLabel ?? label ?? props.placeholder;

  return (
    <View style={{ gap: spacing.sm }}>
      {label ? <AppText variant="caption">{label}</AppText> : null}
      <View
        style={[
          {
            minHeight: inputHeight,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            borderWidth: 1,
            borderColor: error ? colors.danger : isQuiet ? 'transparent' : colors.border,
            borderRadius: radius.lg,
            paddingHorizontal: spacing.lg,
            backgroundColor: variant === 'filled' ? colors.surfaceStrong : colors.surface,
          },
        ]}>
        {leftIcon ? <Icon name={leftIcon} size={18} color={colors.textMuted} /> : null}
        <TextInput
          autoCapitalize={autoCapitalize ?? (secureTextEntry ? 'none' : undefined)}
          autoCorrect={autoCorrect ?? (secureTextEntry ? false : undefined)}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={secureTextEntry}
          spellCheck={spellCheck ?? (secureTextEntry ? false : undefined)}
          accessibilityLabel={computedLabel}
          accessibilityHint={computedHint}
          accessibilityState={mergedState}
          style={[
            {
              flex: 1,
              minHeight: inputHeight - 2,
              color: colors.text,
              fontSize: size === 'sm' ? 14 : 15,
            },
            style,
          ]}
          {...props}
        />
        {rightIcon ? <Icon name={rightIcon} size={18} color={colors.textMuted} /> : null}
      </View>
      {error ? (
        <View accessibilityLiveRegion="polite" accessibilityRole="alert">
          <AppText variant="caption" tone="danger">
            {error}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

