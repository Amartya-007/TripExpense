import { useMemo, useRef, useState } from 'react';
import { Modal, Pressable, View, type GestureResponderEvent } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Icon } from '@/components/ui/icon';
import { formatFriendlyDate, isSameDay, parseISODate, startOfDay, toISODate } from '@/lib/date/friendly-date';
import { useAppTheme } from '@/theme/theme-provider';

type DatePickerProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  minDate?: string;
  maxDate?: string;
  disabled?: boolean;
};

const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const SWIPE_THRESHOLD = 50;

function buildMonthGrid(viewMonth: Date): Date[] {
  const firstOfMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
  const gridStart = new Date(firstOfMonth);
  gridStart.setDate(gridStart.getDate() - firstOfMonth.getDay());
  const totalCells = Math.ceil((firstOfMonth.getDay() + daysInMonth) / 7) * 7;

  return Array.from({ length: totalCells }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return date;
  });
}

export function DatePicker({ label, value, onChange, minDate, maxDate, disabled }: DatePickerProps) {
  const { colors, radius, spacing } = useAppTheme();
  const selected = useMemo(() => parseISODate(value), [value]);
  const minDateValue = minDate ? startOfDay(parseISODate(minDate)) : null;
  const maxDateValue = maxDate ? startOfDay(parseISODate(maxDate)) : null;

  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => new Date(selected.getFullYear(), selected.getMonth(), 1));
  const touchStartX = useRef<number | null>(null);

  const days = useMemo(() => buildMonthGrid(viewMonth), [viewMonth]);

  function openPicker() {
    setViewMonth(new Date(selected.getFullYear(), selected.getMonth(), 1));
    setOpen(true);
  }

  function goToMonth(offset: number) {
    setViewMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  }

  function isOutOfRange(date: Date) {
    const normalized = startOfDay(date);
    return Boolean((minDateValue && normalized < minDateValue) || (maxDateValue && normalized > maxDateValue));
  }

  function handleSelect(date: Date) {
    if (isOutOfRange(date)) return;
    onChange(toISODate(date));
    setOpen(false);
  }

  function handleTouchStart(event: GestureResponderEvent) {
    touchStartX.current = event.nativeEvent.pageX;
  }

  function handleTouchEnd(event: GestureResponderEvent) {
    if (touchStartX.current === null) return;
    const delta = event.nativeEvent.pageX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < SWIPE_THRESHOLD) return;
    goToMonth(delta < 0 ? 1 : -1);
  }

  const todayDisabled = isOutOfRange(new Date());

  return (
    <View style={{ gap: spacing.sm }}>
      {label ? <AppText variant="caption">{label}</AppText> : null}

      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={openPicker}
        style={({ pressed }) => [
          {
            minHeight: 52,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: spacing.lg,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surface,
            opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
          },
        ]}>
        <AppText variant="body">{formatFriendlyDate(value)}</AppText>
        <Icon name="calendar" size={18} color={colors.textMuted} />
      </Pressable>

      <Modal animationType="slide" onRequestClose={() => setOpen(false)} transparent visible={open}>
        <Pressable
          accessibilityLabel="Close date picker"
          onPress={() => setOpen(false)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}>
          <Pressable
            onPress={(event) => event.stopPropagation()}
            onTouchEnd={handleTouchEnd}
            onTouchStart={handleTouchStart}
            style={{
              backgroundColor: colors.surface,
              borderTopLeftRadius: radius.xl,
              borderTopRightRadius: radius.xl,
              paddingBottom: spacing.xl,
            }}>
            <View style={{ alignItems: 'center', paddingTop: spacing.sm, paddingBottom: spacing.xs }}>
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border }} />
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.sm,
              }}>
              <Pressable accessibilityLabel="Previous month" hitSlop={8} onPress={() => goToMonth(-1)}>
                <Icon name="chevronLeft" size={20} color={colors.textMuted} />
              </Pressable>
              <AppText variant="subtitle">
                {MONTH_LABELS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
              </AppText>
              <Pressable accessibilityLabel="Next month" hitSlop={8} onPress={() => goToMonth(1)}>
                <Icon name="chevronRight" size={20} color={colors.textMuted} />
              </Pressable>
            </View>

            <View style={{ flexDirection: 'row', paddingHorizontal: spacing.md }}>
              {WEEKDAY_LABELS.map((weekday, index) => (
                <View key={`${weekday}-${index}`} style={{ width: `${100 / 7}%`, alignItems: 'center', paddingVertical: spacing.xs }}>
                  <AppText variant="caption" tone="muted">
                    {weekday}
                  </AppText>
                </View>
              ))}
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.md }}>
              {days.map((day) => {
                const isSelected = isSameDay(day, selected);
                const isCurrentMonth = day.getMonth() === viewMonth.getMonth();
                const isTodayDate = isSameDay(day, new Date());
                const disabledDay = isOutOfRange(day);

                return (
                  <Pressable
                    key={day.toISOString()}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected, disabled: disabledDay }}
                    disabled={disabledDay}
                    onPress={() => handleSelect(day)}
                    style={{ width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isSelected ? colors.primary : 'transparent',
                      }}>
                      <AppText
                        variant="body"
                        style={{
                          color: disabledDay
                            ? colors.textMuted
                            : isSelected
                              ? colors.primaryForeground
                              : isCurrentMonth
                                ? colors.text
                                : colors.textMuted,
                          opacity: disabledDay ? 0.4 : isCurrentMonth ? 1 : 0.4,
                          fontWeight: isTodayDate && !isSelected ? '900' : '400',
                        }}>
                        {day.getDate()}
                      </AppText>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <View style={{ flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingTop: spacing.lg }}>
              <Pressable
                onPress={() => setOpen(false)}
                style={{
                  flex: 1,
                  paddingVertical: spacing.md,
                  borderRadius: radius.lg,
                  alignItems: 'center',
                  backgroundColor: colors.surfaceStrong,
                }}>
                <AppText variant="body">Cancel</AppText>
              </Pressable>
              <Pressable
                disabled={todayDisabled}
                onPress={() => handleSelect(new Date())}
                style={{
                  flex: 1,
                  paddingVertical: spacing.md,
                  borderRadius: radius.lg,
                  alignItems: 'center',
                  backgroundColor: colors.primary,
                  opacity: todayDisabled ? 0.5 : 1,
                }}>
                <AppText variant="body" style={{ color: colors.primaryForeground }}>
                  Today
                </AppText>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
