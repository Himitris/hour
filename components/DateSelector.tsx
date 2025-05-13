import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

interface DateSelectorProps {
  date: Date;
  onDateChange: (date: Date) => void;
}

export default function DateSelector({ date, onDateChange }: DateSelectorProps) {
  const leftButtonScale = useSharedValue(1);
  const rightButtonScale = useSharedValue(1);

  const leftButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: leftButtonScale.value }]
    };
  });

  const rightButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: rightButtonScale.value }]
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
    onDateChange(new Date());
  };

  return (
    <View style={styles.container}>
      <Animated.View style={leftButtonStyle}>
        <TouchableOpacity style={styles.arrowButton} onPress={handlePrevDay}>
          <ChevronLeft size={24} color="#555555" />
        </TouchableOpacity>
      </Animated.View>
      
      <TouchableOpacity style={styles.todayButton} onPress={handleToday}>
        <Text style={styles.todayText}>Aujourd'hui</Text>
      </TouchableOpacity>
      
      <Animated.View style={rightButtonStyle}>
        <TouchableOpacity style={styles.arrowButton} onPress={handleNextDay}>
          <ChevronRight size={24} color="#555555" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  arrowButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  todayButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F0F4FF',
  },
  todayText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#3366FF',
  },
});