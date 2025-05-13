import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

interface StatsCardProps {
  title: string;
  value: number;
  unit?: string;
  description?: string;
  color?: string;
  animate?: boolean;
}

export default function StatsCard({
  title,
  value,
  unit = 'h',
  description,
  color = '#3366FF',
  animate = true,
}: StatsCardProps) {
  // Animation for the value
  const progress = useSharedValue(0);
  
  React.useEffect(() => {
    if (animate) {
      progress.value = 0;
      setTimeout(() => {
        progress.value = withTiming(1, { duration: 1000 });
      }, 300);
    } else {
      progress.value = 1;
    }
  }, [value, animate]);
  
  const animatedValueStyle = useAnimatedStyle(() => {
    return {
      opacity: progress.value,
      transform: [
        { translateY: (1 - progress.value) * 10 }
      ]
    };
  });

  return (
    <View style={[styles.container, { borderLeftColor: color }]}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.valueContainer}>
        <Animated.Text style={[styles.value, animatedValueStyle]}>
          {value.toFixed(1)}
        </Animated.Text>
        <Text style={styles.unit}>{unit}</Text>
      </View>
      {description && <Text style={styles.description}>{description}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
  },
  title: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#777777',
    marginBottom: 8,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: '#333333',
  },
  unit: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#555555',
    marginLeft: 4,
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#999999',
    marginTop: 8,
  },
});