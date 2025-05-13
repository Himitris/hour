import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HoursInput from '@/components/HoursInput';
import DateSelector from '@/components/DateSelector';
import { getWorkEntryByDate } from '@/utils/storage';
import { formatISODate } from '@/utils/dateUtils';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function InputScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  
  useEffect(() => {
    checkForEntry();
  }, [selectedDate]);
  
  const checkForEntry = async () => {
    setLoading(true);
    try {
      const dateStr = formatISODate(selectedDate);
      await getWorkEntryByDate(dateStr);
    } catch (error) {
      console.error('Error checking for entry:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDateChange = (newDate: Date) => {
    setSelectedDate(newDate);
  };
  
  const handleSave = () => {
    // Trigger a refresh
    setRefreshKey(prevKey => prevKey + 1);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View 
          entering={FadeIn.duration(500)}
          style={styles.header}
        >
          <Text style={styles.title}>Saisie du temps</Text>
          <Text style={styles.subtitle}>
            Enregistrez vos heures de travail
          </Text>
        </Animated.View>
        
        <DateSelector date={selectedDate} onDateChange={handleDateChange} />
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3366FF" />
          </View>
        ) : (
          <Animated.View 
            key={refreshKey}
            entering={FadeIn.duration(300)}
            style={styles.inputWrapper}
          >
            <HoursInput 
              date={selectedDate} 
              onSave={handleSave} 
            />
          </Animated.View>
        )}
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Utilisez cette page pour saisir vos heures de travail quotidiennes.
            Vous pouvez naviguer entre les jours à l'aide des flèches ou revenir
            à aujourd'hui avec le bouton central.
          </Text>
        </View>
      </ScrollView>
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
  },
  contentContainer: {
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
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrapper: {
    marginBottom: 16,
  },
  infoContainer: {
    backgroundColor: '#F0F4FF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
  },
  infoText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#555555',
    lineHeight: 20,
  },
});