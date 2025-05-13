// components/DateSelector.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from 'lucide-react-native';
import { formatDateForDisplay } from '@/utils/dateUtils';
import { COLORS, FONTS, SHADOWS } from '@/constants/theme';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';

interface DateSelectorProps {
  date: Date;
  onDateChange: (date: Date) => void;
}

export default function DateSelector({
  date,
  onDateChange,
}: DateSelectorProps) {
  const leftButtonScale = useSharedValue(1);
  const rightButtonScale = useSharedValue(1);
  const centerButtonScale = useSharedValue(1);

  const leftButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: leftButtonScale.value }],
    };
  });

  const rightButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: rightButtonScale.value }],
    };
  });

  const centerButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: centerButtonScale.value }],
    };
  });

  const handlePrevDay = () => {
    // Button animation
    leftButtonScale.value = withTiming(0.9, { duration: 100 });
    setTimeout(() => {
      leftButtonScale.value = withTiming(1, { duration: 100 });
    }, 100);

    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };

  const handleNextDay = () => {
    // Button animation
    rightButtonScale.value = withTiming(0.9, { duration: 100 });
    setTimeout(() => {
      rightButtonScale.value = withTiming(1, { duration: 100 });
    }, 100);

    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
  };

  const handleToday = () => {
    // Button animation
    centerButtonScale.value = withTiming(0.9, { duration: 100 });
    setTimeout(() => {
      centerButtonScale.value = withTiming(1, { duration: 100 });
    }, 100);

    onDateChange(new Date());
  };

  // Vérifier si la date sélectionnée est aujourd'hui
  const isToday = () => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <Animated.View entering={FadeIn.duration(500)} style={styles.container}>
      <View style={styles.navigation}>
        <Animated.View style={leftButtonStyle}>
          <TouchableOpacity style={styles.arrowButton} onPress={handlePrevDay}>
            <ChevronLeft size={24} color={COLORS.text} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={centerButtonStyle}>
          <TouchableOpacity
            style={[styles.todayButton, isToday() && styles.todayButtonActive]}
            onPress={handleToday}
          >
            <CalendarIcon
              size={16}
              color={isToday() ? COLORS.card : COLORS.primary}
            />
            <Text
              style={[styles.todayText, isToday() && styles.todayTextActive]}
            >
              Aujourd'hui
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={rightButtonStyle}>
          <TouchableOpacity style={styles.arrowButton} onPress={handleNextDay}>
            <ChevronRight size={24} color={COLORS.text} />
          </TouchableOpacity>
        </Animated.View>
      </View>

      <View style={styles.dateDisplayContainer}>
        <Text style={styles.dateDisplay}>{formatDateForDisplay(date)}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  arrowButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    ...SHADOWS.small,
  },
  todayButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLightest,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayButtonActive: {
    backgroundColor: COLORS.primary,
  },
  todayText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.primary,
    marginLeft: 6,
  },
  todayTextActive: {
    color: COLORS.card,
  },
  dateDisplayContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  dateDisplay: {
    fontFamily: FONTS.medium,
    fontSize: 18,
    color: COLORS.text,
    textAlign: 'center',
    backgroundColor: COLORS.primaryLightest,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
});
