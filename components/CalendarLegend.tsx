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
import { COLORS, FONTS } from '@/constants/theme';
import CalendarLegend from '@/components/CalendarLegend';
import Animated, { FadeIn } from 'react-native-reanimated';

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
  textDayFontSize: 13,
  textDayHeaderFontSize: 11,
});

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
      entering={FadeIn.duration(300)}
      style={styles.dateInfoContainer}
    >
      <Text style={styles.dateTitle}>
        {formatDateForDisplay(parseISODate(selectedDate))}
      </Text>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Heures</Text>
          <Text style={styles.statValue}>{entry.hours.toFixed(1)}h</Text>
        </View>
        
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Status</Text>
          <View
            style={[
              styles.statusBadge,
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
                styles.statusText,
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

return (
  <SafeAreaView style={styles.safeArea}>
    <View style={styles.container}>
      <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
        <Text style={styles.title}>Calendrier</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadEntries}
        >
          <RefreshCw size={14} color={COLORS.primary} />
          <Text style={styles.refreshText}>Actualiser</Text>
        </TouchableOpacity>
      </Animated.View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <View style={styles.contentContainer}>
          <View style={styles.calendarContainer}>
            <RNCalendar
              theme={getCalendarTheme()}
              markingType={'custom'}
              markedDates={markedDates}
              onDayPress={(day) => handleDateSelect(day.dateString)}
              enableSwipeMonths={true}
              hideExtraDays={true}
              style={styles.calendar}
            />
            
            <View style={styles.legendContainer}>
              <CalendarLegend />
            </View>
          </View>

          <View style={styles.selectedInfoContainer}>
            {renderSelectedDateInfo()}
          </View>
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
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  calendar: {
    height: 310, // Hauteur fixe pour contrôler la taille du calendrier
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: COLORS.text,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLightest,
  },
  refreshText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.primary,
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  calendarContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 8,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 10,
    height: '62%', // Hauteur fixe au lieu de flex
  },
  legendContainer: {
    marginTop: 2,
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  selectedInfoContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    height: '35%', // Hauteur fixe au lieu de flex
  },
  dateInfoContainer: {
    flex: 1,
  },
  dateTitle: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 10,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  statBox: {
    alignItems: 'center',
    padding: 8,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 10,
    width: '45%',
  },
  statLabel: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  statValue: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.text,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusText: {
    fontFamily: FONTS.medium,
    fontSize: 13,
  },
  noteContainer: {
    backgroundColor: COLORS.inputBackground,
    padding: 8,
    borderRadius: 10,
    marginTop: 4,
  },
  noteLabel: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  noteText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.text,
    lineHeight: 16,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
});