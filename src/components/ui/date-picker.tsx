import { useMemo, useRef, useState } from 'react';
import { Pressable, View, type GestureResponderEvent } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { BottomSheet } from '@/components/ui/bottom-sheet';
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

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const presets = [
    { label: 'Yesterday', date: yesterday },
    { label: 'Today', date: today },
    { label: 'Tomorrow', date: tomorrow },
  ];

  return (
    <View style={{ gap: spacing.xs }}>
      {label ? <AppText variant="caption" tone="muted">{label}</AppText> : null}

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
        <AppText variant="body" style={{ fontWeight: '600' }}>{formatFriendlyDate(value)}</AppText>
        <Icon name="calendar" size={18} color={colors.primary} />
      </Pressable>

      <BottomSheet visible={open} onClose={() => setOpen(false)}>
        <View onTouchEnd={handleTouchEnd} onTouchStart={handleTouchStart} style={{ paddingBottom: spacing.xs }}>
          {/* Header Bar */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.xs,
            }}>
            <Pressable
              accessibilityLabel="Previous month"
              hitSlop={12}
              onPress={() => goToMonth(-1)}
              style={({ pressed }) => ({
                padding: spacing.xs,
                borderRadius: radius.pill,
                backgroundColor: colors.surfaceStrong,
                opacity: pressed ? 0.7 : 1,
              })}>
              <Icon name="chevronLeft" size={18} color={colors.text} />
            </Pressable>

            <AppText variant="subtitle" style={{ fontWeight: '800', fontSize: 16 }}>
              {MONTH_LABELS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
            </AppText>

            <Pressable
              accessibilityLabel="Next month"
              hitSlop={12}
              onPress={() => goToMonth(1)}
              style={({ pressed }) => ({
                padding: spacing.xs,
                borderRadius: radius.pill,
                backgroundColor: colors.surfaceStrong,
                opacity: pressed ? 0.7 : 1,
              })}>
              <Icon name="chevronRight" size={18} color={colors.text} />
            </Pressable>
          </View>

          {/* Quick Date Shortcuts Bar */}
          <View
            style={{
              flexDirection: 'row',
              gap: spacing.xs,
              paddingHorizontal: spacing.lg,
              marginVertical: spacing.xs,
            }}>
            {presets.map((preset) => {
              const isDisabled = isOutOfRange(preset.date);
              const isSelectedPreset = isSameDay(preset.date, selected);

              return (
                <Pressable
                  key={preset.label}
                  disabled={isDisabled}
                  onPress={() => handleSelect(preset.date)}
                  style={({ pressed }) => ({
                    flex: 1,
                    paddingVertical: spacing.xs,
                    borderRadius: radius.pill,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: isSelectedPreset ? colors.primary : colors.border,
                    backgroundColor: isSelectedPreset ? colors.primarySoft : colors.surfaceStrong,
                    opacity: isDisabled ? 0.4 : pressed ? 0.8 : 1,
                  })}>
                  <AppText
                    variant="caption"
                    style={{
                      fontSize: 11,
                      fontWeight: '800',
                      color: isSelectedPreset ? colors.primary : colors.text,
                    }}>
                    {preset.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          {/* Weekday Labels Header */}
          <View style={{ flexDirection: 'row', paddingHorizontal: spacing.md, marginTop: spacing.xs }}>
            {WEEKDAY_LABELS.map((weekday, index) => (
              <View key={`${weekday}-${index}`} style={{ width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 2 }}>
                <AppText variant="caption" tone="muted" style={{ fontWeight: '800', fontSize: 11 }}>
                  {weekday}
                </AppText>
              </View>
            ))}
          </View>

          {/* Month Days Grid */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.md }}>
            {days.map((day) => {
              const isSelected = isSameDay(day, selected);
              const isCurrentMonth = day.getMonth() === viewMonth.getMonth();
              const isTodayDate = isSameDay(day, today);
              const disabledDay = isOutOfRange(day);

              return (
                <Pressable
                  key={day.toISOString()}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected, disabled: disabledDay }}
                  disabled={disabledDay}
                  onPress={() => handleSelect(day)}
                  style={{ width: `${100 / 7}%`, height: 38, alignItems: 'center', justifyContent: 'center' }}>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isSelected ? colors.primary : 'transparent',
                    }}>
                    <AppText
                      variant="body"
                      style={{
                        fontSize: 13,
                        color: disabledDay
                          ? colors.textMuted
                          : isSelected
                            ? colors.primaryForeground
                            : isCurrentMonth
                              ? colors.text
                              : colors.textMuted,
                        opacity: disabledDay ? 0.3 : isCurrentMonth ? 1 : 0.35,
                        fontWeight: isSelected || isTodayDate ? '800' : '500',
                      }}>
                      {day.getDate()}
                    </AppText>

                    {isTodayDate && !isSelected ? (
                      <View
                        style={{
                          position: 'absolute',
                          bottom: 2,
                          width: 4,
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: colors.primary,
                        }}
                      />
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* Action Buttons Footer */}
          <View style={{ flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingTop: spacing.xs }}>
            <Pressable
              onPress={() => setOpen(false)}
              style={({ pressed }) => ({
                flex: 1,
                paddingVertical: spacing.sm,
                borderRadius: radius.pill,
                alignItems: 'center',
                backgroundColor: colors.danger,
                opacity: pressed ? 0.8 : 1,
              })}>
              <AppText variant="body" style={{ fontWeight: '700', color: '#FFFFFF' }}>
                Cancel
              </AppText>
            </Pressable>
          </View>
        </View>
      </BottomSheet>
    </View>
  );
}