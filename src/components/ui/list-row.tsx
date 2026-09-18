import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Icon, type IconName } from '@/components/ui/icon';
import { useAppTheme } from '@/theme/theme-provider';

type ListRowProps = {
  title: string;
  body?: string;
  icon?: IconName;
  iconColor?: string;
  iconBg?: string;
  trailing?: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
};

export function ListRow({
  title,
  body,
  icon,
  iconColor,
  iconBg,
  trailing,
  onPress,
  style,
  disabled = false,
}: ListRowProps) {
  const { colors, motion, radius, spacing } = useAppTheme();

  const content = (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          paddingVertical: spacing.xs,
        },
        style,
      ]}>
      {icon ? (
        <View
          style={{
            width: 36,
            height: 36,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radius.md,
            backgroundColor: iconBg ?? colors.surfaceStrong,
          }}>
          <Icon name={icon} size={18} color={iconColor ?? colors.primary} />
        </View>
      ) : null}

      <View style={{ flex: 1, gap: spacing.xs }}>
        <AppText variant="subtitle" numberOfLines={1}>
          {title}
        </AppText>
        {body ? (
          <AppText tone="muted" variant="caption" numberOfLines={2}>
            {body}
          </AppText>
        ) : null}
      </View>

      {trailing}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={4}
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: disabled ? 0.5 : pressed ? motion.opacity.pressed : 1,
      })}>
      {content}
    </Pressable>
  );
}