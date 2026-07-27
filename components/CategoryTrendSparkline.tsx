import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Polygon, Polyline } from 'react-native-svg';

import { useCategoryTrend } from '@/hooks/useTransaction';
import { useThemeContext } from '@/contexts/ThemedContext';
import { formatToCurrency } from '@/utils/formatter';
import { FontSize } from '@/utils/Typography';

const SPARKLINE_WIDTH = 200;
const SPARKLINE_HEIGHT = 44;
const SPARKLINE_PADDING = 4;

export default function CategoryTrendSparkline({
  categoryId,
  enabled,
  months = 6,
}: {
  categoryId: number;
  enabled: boolean;
  months?: number;
}) {
  const { colors } = useThemeContext();
  const { trend, loading } = useCategoryTrend(categoryId, months, enabled);

  const points = useMemo(() => {
    const values = trend.map((point) => point.expense);
    if (values.length < 2) {
      return null;
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const innerWidth = SPARKLINE_WIDTH - SPARKLINE_PADDING * 2;
    const innerHeight = SPARKLINE_HEIGHT - SPARKLINE_PADDING * 2;
    const stepX = innerWidth / (values.length - 1);

    return values.map((value, index) => ({
      x: SPARKLINE_PADDING + index * stepX,
      y: SPARKLINE_PADDING + innerHeight - ((value - min) / range) * innerHeight,
    }));
  }, [trend]);

  if (!enabled) {
    return null;
  }

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator animating color={colors.primary} size="small" />
      </View>
    );
  }

  if (!points) {
    return null;
  }

  const lastPoint = trend[trend.length - 1];

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.description }]}>Last {months} months</Text>
      <View style={styles.row}>
        <Svg width={SPARKLINE_WIDTH} height={SPARKLINE_HEIGHT}>
          <Polygon
            points={[
              ...points.map((point) => `${point.x},${point.y}`),
              `${SPARKLINE_WIDTH - SPARKLINE_PADDING},${SPARKLINE_HEIGHT}`,
              `${SPARKLINE_PADDING},${SPARKLINE_HEIGHT}`,
            ].join(' ')}
            fill={`${colors.primary}22`}
          />
          <Polyline
            points={points.map((point) => `${point.x},${point.y}`).join(' ')}
            fill="none"
            stroke={colors.primary}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r={3} fill={colors.primary} />
        </Svg>
        {!!lastPoint && (
          <Text style={[styles.lastValue, { color: colors.title }]}>
            {formatToCurrency(lastPoint.expense)}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  title: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-500',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastValue: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter-600',
  },
  loaderContainer: {
    height: SPARKLINE_HEIGHT,
    justifyContent: 'center',
    marginTop: 10,
  },
});
