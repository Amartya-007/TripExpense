import { View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

import { AppText } from '@/components/ui/app-text';
import { EXPENSE_CATEGORIES, type Expense, type ExpenseCategory } from '@/features/expenses/expenses-config';
import { useAppTheme } from '@/theme/theme-provider';

const SIZE = 120;
const STROKE_WIDTH = 18;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type Segment = {
  category: ExpenseCategory;
  amount: number;
  percent: number;
};

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

/** "Spending by category" donut + legend, used on the Trip Dashboard. */
export function CategoryBreakdown({ expenses }: { expenses: Expense[] }) {
  const { colors, spacing } = useAppTheme();
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const totalsByCategory = expenses.reduce<Record<string, number>>((acc, expense) => {
    acc[expense.category] = (acc[expense.category] ?? 0) + expense.amount;
    return acc;
  }, {});

  const segments: Segment[] = (Object.entries(totalsByCategory) as [ExpenseCategory, number][])
    .map(([category, amount]) => ({ category, amount, percent: total > 0 ? (amount / total) * 100 : 0 }))
    .sort((a, b) => b.amount - a.amount);

  if (total === 0 || segments.length === 0) {
    return null;
  }

  const ringSegments = segments.map((segment, index) => {
    const cumulativePercent = segments.slice(0, index).reduce((sum, prior) => sum + prior.percent, 0);
    const dashLength = (segment.percent / 100) * CIRCUMFERENCE;
    const dashOffset = -((cumulativePercent / 100) * CIRCUMFERENCE);
    return { ...segment, dashLength, dashOffset };
  });

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xl }}>
      <Svg width={SIZE} height={SIZE}>
        <G rotation={-90} origin={`${SIZE / 2}, ${SIZE / 2}`}>
          <Circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} stroke={colors.surfaceStrong} strokeWidth={STROKE_WIDTH} fill="none" />
          {ringSegments.map((segment) => (
            <Circle
              key={segment.category}
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke={EXPENSE_CATEGORIES[segment.category].gradientFrom}
              strokeWidth={STROKE_WIDTH}
              strokeDasharray={`${segment.dashLength} ${CIRCUMFERENCE - segment.dashLength}`}
              strokeDashoffset={segment.dashOffset}
              strokeLinecap="butt"
              fill="none"
            />
          ))}
        </G>
      </Svg>

      <View style={{ flex: 1, gap: spacing.sm }}>
        {segments.map((segment) => (
          <View key={segment.category} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: EXPENSE_CATEGORIES[segment.category].gradientFrom }} />
              <AppText variant="caption">{EXPENSE_CATEGORIES[segment.category].label}</AppText>
            </View>
            <AppText variant="caption" tone="muted">
              {Math.round(segment.percent)}% · {formatCurrency(segment.amount)}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
}
