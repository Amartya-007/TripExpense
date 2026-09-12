import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Icon } from '@/components/ui/icon';
import { useAppTheme } from '@/theme/theme-provider';
import { DASHBOARD_NAV_ITEMS } from '@/features/home/dashboard-config';

type BottomNavProps = {
  activeKey: (typeof DASHBOARD_NAV_ITEMS)[number]['key'];
  onNavigate: (key: (typeof DASHBOARD_NAV_ITEMS)[number]['key']) => void;
  onAdd?: () => void;
};

export function BottomNav({ activeKey, onNavigate, onAdd }: BottomNavProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();

  return (
    <View
      pointerEvents="box-none"
      style={[styles.shell, { paddingBottom: insets.bottom, backgroundColor: colors.surface, borderTopColor: colors.border }]}
    >
      <View style={styles.inner}>
        {DASHBOARD_NAV_ITEMS.map((item) =>
          item.key === 'add' ? (
            <Pressable
              key={item.key}
              accessibilityRole="button"
              accessibilityLabel="Add expense"
              onPress={onAdd}
              style={({ pressed }) => [styles.fab, { backgroundColor: colors.primary, borderColor: colors.surface }, pressed && styles.pressed]}
            >
              <Icon name="add" size={28} color="#FFFFFF" />
            </Pressable>
          ) : (
            <Pressable
              key={item.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeKey === item.key }}
              accessibilityLabel={item.label}
              onPress={() => onNavigate(item.key)}
              style={({ pressed }) => [styles.item, pressed && styles.pressed]}
            >
              <Icon name={item.icon} size={20} color={activeKey === item.key ? colors.primary : colors.textMuted} />
              <AppText style={[styles.label, { color: activeKey === item.key ? colors.primary : colors.textMuted }]}>
                {item.label.toUpperCase()}
              </AppText>
            </Pressable>
          ),
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    elevation: 12,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  inner: {
    width: '100%',
    maxWidth: 448,
    height: 64,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  item: {
    minWidth: 58,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  label: {
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  fab: {
    width: 56,
    height: 56,
    marginTop: -20,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  pressed: {
    opacity: 0.78,
  },
});
