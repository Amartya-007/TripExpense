import { Text, type TextProps } from 'react-native';

import { useAppTheme } from '@/theme/theme-provider';

type AppTextProps = TextProps & {
  variant?: 'hero' | 'title' | 'subtitle' | 'body' | 'caption' | 'eyebrow';
  tone?: 'default' | 'muted' | 'primary' | 'danger';
};

export function AppText({ variant = 'body', tone = 'default', style, selectable = true, ...props }: AppTextProps) {
  const { colors, typography } = useAppTheme();
  const variantStyles = {
    hero: { fontSize: typography.hero, lineHeight: 42, fontWeight: '900', fontFamily: 'Inter-Bold' },
    title: { fontSize: typography.title, lineHeight: 34, fontWeight: '900', fontFamily: 'Inter-Bold' },
    subtitle: { fontSize: typography.subtitle, lineHeight: 24, fontWeight: '800', fontFamily: 'Inter-Bold' },
    body: { fontSize: typography.body, lineHeight: 22, fontWeight: '400', fontFamily: 'Inter-Regular' },
    caption: { fontSize: typography.caption, lineHeight: 18, fontWeight: '600', fontFamily: 'Inter-SemiBold' },
    eyebrow: { fontSize: 12, lineHeight: 16, fontWeight: '900', textTransform: 'uppercase', fontFamily: 'Inter-Bold' },
  } as const;
  const toneColors = {
    default: colors.text,
    muted: colors.textMuted,
    primary: colors.primary,
    danger: colors.danger,
  } as const;

  return (
    <Text
      selectable={selectable}
      style={[
        variantStyles[variant],
        { color: toneColors[tone], letterSpacing: 0 },
        variant === 'eyebrow' ? { color: colors.primary } : null,
        style,
      ]}
      {...props}
    />
  );
}
