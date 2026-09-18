import { RefreshControl, ScrollView, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/theme/theme-provider';

type ScreenProps = {
  children: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  hasHeader?: boolean;
  scroll?: boolean;
  onRefresh?: () => void | Promise<void>;
  refreshing?: boolean;
};

export function Screen({
  children,
  contentStyle,
  hasHeader = false,
  scroll = true,
  onRefresh,
  refreshing = false,
}: ScreenProps) {
  const { colors, spacing } = useAppTheme();
  const insets = useSafeAreaInsets();

  // Guarantee extra spacing above Android system navigation buttons
  const bottomInset = insets.bottom > 0 ? insets.bottom : spacing.xl;

  const baseContentStyle = [
    {
      flexGrow: 1,
      gap: spacing.lg,
      paddingHorizontal: Math.max(spacing.xl, insets.left, insets.right),
      paddingTop: hasHeader ? spacing.lg : Math.max(insets.top + spacing.md, spacing.xl),
      paddingBottom: bottomInset + spacing.xl, // Safely offsets system buttons
    },
    contentStyle,
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {scroll ? (
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={baseContentStyle}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            ) : undefined
          }>
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1 }, ...baseContentStyle]}>{children}</View>
      )}
    </View>
  );
}