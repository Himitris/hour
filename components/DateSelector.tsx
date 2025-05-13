// components/DateSelector.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from 'lucide-react-native';
import { formatDateForDisplay } from '@/utils/dateUtils';
import { COLORS, FONTS } from '@/constants/theme';
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
    <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
      <View style={styles.navigation}>
        <Animated.View style={leftButtonStyle}>
          <TouchableOpacity style={styles.arrowButton} onPress={handlePrevDay}>
            <ChevronLeft size={20} color={COLORS.text} />
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.dateDisplay}>{formatDateForDisplay(date)}</Text>

        <Animated.View style={rightButtonStyle}>
          <TouchableOpacity style={styles.arrowButton} onPress={handleNextDay}>
            <ChevronRight size={20} color={COLORS.text} />
          </TouchableOpacity>
        </Animated.View>
      </View>

      <Animated.View style={centerButtonStyle}>
        <TouchableOpacity
          style={[styles.todayButton, isToday() && styles.todayButtonActive]}
          onPress={handleToday}
        >
          <CalendarIcon
            size={14}
            color={isToday() ? COLORS.card : COLORS.primary}
          />
          <Text style={[styles.todayText, isToday() && styles.todayTextActive]}>
            Aujourd'hui
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  arrowButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: COLORS.card,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  dateDisplay: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    backgroundColor: COLORS.primaryLightest,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  todayButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLightest,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  todayButtonActive: {
    backgroundColor: COLORS.primary,
  },
  todayText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.primary,
    marginLeft: 4,
  },
  todayTextActive: {
    color: COLORS.card,
  },
});
