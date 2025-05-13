import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar as RNCalendar } from 'react-native-calendars';
import { getWorkEntries } from '@/utils/storage';
import { formatISODate, parseISODate, formatDateForDisplay } from '@/utils/dateUtils';
import { getHoursIntensityColor } from '@/utils/statsCalculator';
import { WorkEntries, CalendarMarking } from '@/types';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function CalendarScreen() {
  const [entries, setEntries] = useState<WorkEntries>({});
  const [selectedDate, setSelectedDate] = useState<string>(formatISODate(new Date()));
  const [markedDates, setMarkedDates] = useState<CalendarMarking>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const workEntries = await getWorkEntries();
      setEntries(workEntries);
      updateMarkedDates(workEntries);
    } catch (error) {
      console.error('Error loading work entries for calendar:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateMarkedDates = (workEntries: WorkEntries) => {
    const marked: CalendarMarking = {};
    
    Object.entries(workEntries).forEach(([date, entry]) => {
      if (entry.hours > 0) {
        const color = getHoursIntensityColor(entry.hours);
        marked[date] = {
          customStyles: {
            container: {
              backgroundColor: color,
            },
            text: {
              color: entry.hours >= 8 ? '#FFFFFF' : '#333333',
            },
          },
        };
      }
    });
    
    // Add selection styling for the selected date
    if (selectedDate) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: '#3366FF',
      };
    }
    
    setMarkedDates(marked);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    updateMarkedDates(entries);
  };

  const renderSelectedDateInfo = () => {
    if (!selectedDate || !entries[selectedDate]) {
      return (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>
            Aucune donnée pour cette date
          </Text>
        </View>
      );
    }

    const entry = entries[selectedDate];
    return (
      <View style={styles.dateInfoContainer}>
        <Text style={styles.dateTitle}>
          {formatDateForDisplay(parseISODate(selectedDate))}
        </Text>
        <View style={styles.hoursContainer}>
          <Text style={styles.hoursLabel}>Heures travaillées:</Text>
          <Text style={styles.hoursValue}>{entry.hours.toFixed(1)}h</Text>
        </View>
        {entry.note && (
          <View style={styles.noteContainer}>
            <Text style={styles.noteLabel}>Note:</Text>
            <Text style={styles.noteText}>{entry.note}</Text>
          </View>
        )}
      </View>
    );
  };

  const getCalendarTheme = () => ({
    backgroundColor: '#FFFFFF',
    calendarBackground: '#FFFFFF',
    textSectionTitleColor: '#555555',
    selectedDayBackgroundColor: '#3366FF',
    selectedDayTextColor: '#FFFFFF',
    todayTextColor: '#3366FF',
    dayTextColor: '#333333',
    textDisabledColor: '#C0C0C0',
    dotColor: '#3366FF',
    selectedDotColor: '#FFFFFF',
    arrowColor: '#3366FF',
    monthTextColor: '#333333',
    textMonthFontFamily: 'Inter-Medium',
    textDayFontFamily: 'Inter-Regular',
    textDayHeaderFontFamily: 'Inter-Medium',
    textMonthFontSize: 16,
    textDayFontSize: 14,
    textDayHeaderFontSize: 12,
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Animated.View 
          entering={FadeIn.duration(500)}
          style={styles.header}
        >
          <Text style={styles.title}>Calendrier</Text>
          <Text style={styles.subtitle}>
            Visualisez vos heures de travail
          </Text>
        </Animated.View>

        <View style={styles.legendContainer}>
          <Text style={styles.legendTitle}>Légende :</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#D1E8FF' }]} />
              <Text style={styles.legendText}>{'< 4h'}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#92C1FF' }]} />
              <Text style={styles.legendText}>{'< 6h'}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#5E9CFF' }]} />
              <Text style={styles.legendText}>{'< 8h'}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#3366FF' }]} />
              <Text style={styles.legendText}>{'>= 8h'}</Text>
            </View>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3366FF" />
          </View>
        ) : (
          <View style={styles.calendarContainer}>
            <RNCalendar
              theme={getCalendarTheme()}
              markingType={'custom'}
              markedDates={markedDates}
              onDayPress={(day) => handleDateSelect(day.dateString)}
              enableSwipeMonths={true}
            />
            
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={loadEntries}
            >
              <Text style={styles.refreshText}>Actualiser</Text>
            </TouchableOpacity>
            
            {renderSelectedDateInfo()}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FC',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#333333',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#777777',
    marginBottom: 8,
  },
  legendContainer: {
    marginBottom: 16,
  },
  legendTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#555555',
    marginBottom: 8,
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#555555',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  refreshButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F0F4FF',
    marginVertical: 12,
  },
  refreshText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#3366FF',
  },
  dateInfoContainer: {
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 16,
    marginTop: 8,
    paddingHorizontal: 8,
  },
  dateTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#333333',
    marginBottom: 8,
  },
  hoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  hoursLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#555555',
    marginRight: 8,
  },
  hoursValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#333333',
  },
  noteContainer: {
    marginTop: 8,
  },
  noteLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#555555',
    marginBottom: 4,
  },
  noteText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#333333',
  },
  noDataContainer: {
    padding: 16,
    alignItems: 'center',
  },
  noDataText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#999999',
    fontStyle: 'italic',
  },
});