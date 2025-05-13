// app/(tabs)/calendar.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar as RNCalendar } from 'react-native-calendars';
import { RefreshCw } from 'lucide-react-native';
import { getWorkEntries } from '@/utils/storage';
import {
  formatISODate,
  parseISODate,
  formatDateForDisplay,
} from '@/utils/dateUtils';
import {
  getHoursIntensityColor,
  getBillingStatusColor,
} from '@/utils/statsCalculator';
import { WorkEntries, CalendarMarking } from '@/types';
import { COLORS, FONTS, SHADOWS } from '@/constants/theme';
import CalendarLegend from '@/components/CalendarLegend';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';

export default function CalendarScreen() {
  const [entries, setEntries] = useState<WorkEntries>({});
  const [selectedDate, setSelectedDate] = useState<string>(
    formatISODate(new Date())
  );
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
        // Utilisation d'une couleur différente selon que les heures sont notées ou non
        const color =
          entry.isBilled !== false
            ? getHoursIntensityColor(entry.hours)
            : getBillingStatusColor(entry.hours);

        marked[date] = {
          customStyles: {
            container: {
              backgroundColor: color,
            },
            text: {
              color:
                (entry.hours >= 8 && entry.isBilled !== false) ||
                (entry.hours >= 8 && entry.isBilled === false)
                  ? '#FFFFFF'
                  : '#333333',
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
        selectedColor: COLORS.primary,
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
          <Text style={styles.noDataText}>Aucune donnée pour cette date</Text>
        </View>
      );
    }

    const entry = entries[selectedDate];
    return (
      <Animated.View
        entering={SlideInRight.duration(300)}
        style={styles.dateInfoContainer}
      >
        <Text style={styles.dateTitle}>
          {formatDateForDisplay(parseISODate(selectedDate))}
        </Text>

        <View style={styles.hoursContainer}>
          <Text style={styles.hoursLabel}>Heures travaillées:</Text>
          <Text style={styles.hoursValue}>{entry.hours.toFixed(1)}h</Text>
          <View
            style={[
              styles.billingStatus,
              {
                backgroundColor:
                  entry.isBilled !== false
                    ? COLORS.primaryLightest
                    : COLORS.secondaryLightest,
              },
            ]}
          >
            <Text
              style={[
                styles.billingStatusText,
                {
                  color:
                    entry.isBilled !== false
                      ? COLORS.primary
                      : COLORS.secondary,
                },
              ]}
            >
              {entry.isBilled !== false ? 'Notées' : 'Non notées'}
            </Text>
          </View>
        </View>

        {entry.note && (
          <View style={styles.noteContainer}>
            <Text style={styles.noteLabel}>Note:</Text>
            <Text style={styles.noteText}>{entry.note}</Text>
          </View>
        )}
      </Animated.View>
    );
  };

  const getCalendarTheme = () => ({
    backgroundColor: COLORS.card,
    calendarBackground: COLORS.card,
    textSectionTitleColor: COLORS.textLight,
    selectedDayBackgroundColor: COLORS.primary,
    selectedDayTextColor: COLORS.card,
    todayTextColor: COLORS.primary,
    dayTextColor: COLORS.text,
    textDisabledColor: '#C0C0C0',
    dotColor: COLORS.primary,
    selectedDotColor: COLORS.card,
    arrowColor: COLORS.primary,
    monthTextColor: COLORS.text,
    textMonthFontFamily: FONTS.medium,
    textDayFontFamily: FONTS.regular,
    textDayHeaderFontFamily: FONTS.medium,
    textMonthFontSize: 16,
    textDayFontSize: 14,
    textDayHeaderFontSize: 12,
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Animated.View entering={FadeIn.duration(500)} style={styles.header}>
          <Text style={styles.title}>Calendrier</Text>
          <Text style={styles.subtitle}>Visualisez vos heures de travail</Text>
        </Animated.View>

        <CalendarLegend />

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
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
              <RefreshCw size={16} color={COLORS.primary} />
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
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 28,
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 12,
    ...SHADOWS.medium,
  },
  refreshButton: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLightest,
    marginVertical: 16,
  },
  refreshText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.primary,
    marginLeft: 8,
  },
  dateInfoContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 16,
    marginTop: 8,
    paddingHorizontal: 8,
  },
  dateTitle: {
    fontFamily: FONTS.medium,
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  hoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    justifyContent: 'center',
  },
  hoursLabel: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textLight,
    marginRight: 8,
  },
  hoursValue: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.text,
    marginRight: 8,
  },
  billingStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  billingStatusText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
  },
  noteContainer: {
    backgroundColor: COLORS.inputBackground,
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  noteLabel: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  noteText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.text,
  },
  noDataContainer: {
    padding: 16,
    alignItems: 'center',
  },
  noDataText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
});
