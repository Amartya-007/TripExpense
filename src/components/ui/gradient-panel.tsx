import { useId } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { Icon, type IconName } from '@/components/ui/icon';

type GradientPanelProps = {
  from: string;
  to: string;
  icon?: IconName;
  iconSize?: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

/**
 * Diagonal gradient block used as a stand-in "cover photo" for trips and
 * expense categories, since the app doesn't have real photos to show yet.
 * A soft glass circle behind the icon keeps it readable on any gradient.
 */
export function GradientPanel({ from, to, icon, iconSize = 36, height = 120, style, children }: GradientPanelProps) {
  const gradientId = `gradient-panel-${useId()}`;

  return (
    <View style={[{ height, overflow: 'hidden' }, style]}>
      <Svg width="100%" height="100%" style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }}>
        <Defs>
          <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={from} stopOpacity={1} />
            <Stop offset="100%" stopColor={to} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width="100%" height="100%" fill={`url(#${gradientId})`} />
      </Svg>

      {icon ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View
            style={{
              width: iconSize * 2,
              height: iconSize * 2,
              borderRadius: iconSize,
              backgroundColor: 'rgba(255,255,255,0.22)',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Icon name={icon} size={iconSize} color="#FFFFFF" />
          </View>
        </View>
      ) : null}
      {children}
    </View>
  );
}
