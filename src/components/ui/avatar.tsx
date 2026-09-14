import { View } from 'react-native';

import { AppText } from '@/components/ui/app-text';

type AvatarProps = {
  name: string;
  color: string;
  size?: number;
};

/** Circular initials avatar, used anywhere a person or trip owner needs a lightweight visual identity. */
export function Avatar({ name, color, size = 36 }: AvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <AppText style={{ color: '#FFFFFF', fontWeight: '800', fontSize: Math.round(size * 0.42), lineHeight: Math.round(size * 0.5) }}>{initial}</AppText>
    </View>
  );
}
