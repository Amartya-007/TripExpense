import { View } from 'react-native';

import { AppText } from '@/components/ui/app-text';

type AvatarProps = {
  name: string;
  color: string;
  size?: number;
  accessible?: boolean;
  /**
   * Provide a label only when the surrounding UI does NOT already identify
   * the person. If omitted the avatar is hidden from accessibility to avoid
   * announcing the same name twice.
   */
  accessibilityLabel?: string;
  accessibilityRole?: 'image' | 'none';
};

/** Circular initials avatar, used anywhere a person or trip owner needs a lightweight visual identity. */
export function Avatar({ name, color, size = 36, accessible, accessibilityLabel, accessibilityRole }: AvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  const isAccessible = accessible ?? Boolean(accessibilityLabel);

  return (
    <View
      accessible={isAccessible}
      accessibilityRole={isAccessible ? (accessibilityRole ?? 'image') : undefined}
      accessibilityLabel={accessibilityLabel}
      importantForAccessibility={isAccessible ? 'yes' : 'no'}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <AppText importantForAccessibility="no" style={{ color: '#FFFFFF', fontWeight: '800', fontSize: Math.round(size * 0.42), lineHeight: Math.round(size * 0.5) }}>{initial}</AppText>
    </View>
  );
}

