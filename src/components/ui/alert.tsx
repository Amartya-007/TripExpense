import { View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Icon, type IconName } from '@/components/ui/icon';
import { useAppTheme } from '@/theme/theme-provider';

type AlertProps = {
  title: string;
  body: string;
  tone?: 'info' | 'success' | 'warning' | 'danger';
  icon?: IconName;
  /** Override the default combined screen reader label (title + body). */
  accessibilityLabel?: string;
  accessibilityRole?: 'alert' | 'none' | 'text';
  accessibilityLiveRegion?: 'none' | 'polite' | 'assertive';
};

const TONE_ICONS = {
  info: 'info',
  success: 'checkCircle',
  warning: 'alert',
  danger: 'error',
} as const;

export function Alert({
  title,
  body,
  tone = 'info',
  icon,
  accessibilityLabel,
  accessibilityRole,
  accessibilityLiveRegion,
}: AlertProps) {
  const { colors, radius, spacing } = useAppTheme();

  const toneStyles = {
    info: {
      backgroundColor: colors.infoSoft,
      borderColor: colors.info,
    },
    success: {
      backgroundColor: colors.successSoft,
      borderColor: colors.success,
    },
    warning: {
      backgroundColor: colors.warningSoft,
      borderColor: colors.warning,
    },
    danger: {
      backgroundColor: colors.dangerSoft,
      borderColor: colors.danger,
    },
  } as const;

  const current = toneStyles[tone];
  const iconName = icon ?? TONE_ICONS[tone];

  return (
    <View
      accessibilityRole={accessibilityRole ?? 'alert'}
      accessibilityLiveRegion={accessibilityLiveRegion ?? 'polite'}
      accessibilityLabel={accessibilityLabel ?? `${title}. ${body}`}
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.md,
        borderWidth: 1,
        borderColor: current.borderColor,
        borderRadius: radius.lg,
        padding: spacing.md,
        backgroundColor: current.backgroundColor,
      }}
    >
      <Icon
        name={iconName}
        size={20}
        color={current.borderColor}
        importantForAccessibility="no"
      />

      <View
        style={{
          flex: 1,
          gap: spacing.xs,
          minWidth: 0,
        }}
        importantForAccessibility="no-hide-descendants"
      >
        <AppText variant="subtitle">{title}</AppText>

        <AppText tone="muted">
          {body}
        </AppText>
      </View>
    </View>
  );
}