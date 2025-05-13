import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import StatsCard from '@/components/StatsCard';
import { getWorkEntries } from '@/utils/storage';
import { WorkEntries } from '@/types';
import {
  calculateDailyHours,
  calculateWeeklyHours,
  calculateMonthlyHours,
  calculateWeeklyAverage,
  calculateMonthlyAverage
} from '@/utils/statsCalculator';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

export default function StatsScreen() {
  const [entries, setEntries] = useState<WorkEntries>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    daily: 0,
    weekly: 0,
    monthly: 0,
    weeklyAvg: 0,
    monthlyAvg: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const workEntries = await getWorkEntries();
      setEntries(workEntries);
      calculateStats(workEntries);
    } catch (error) {
      console.error('Error loading stats data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateStats = (workEntries: WorkEntries) => {
    const today = new Date();
    
    const daily = calculateDailyHours(workEntries, today);
    const weekly = calculateWeeklyHours(workEntries, today);
    const monthly = calculateMonthlyHours(workEntries, today);
    const weeklyAvg = calculateWeeklyAverage(workEntries, today);
    const monthlyAvg = calculateMonthlyAverage(workEntries, today);
    
    setStats({
      daily,
      weekly,
      monthly,
      weeklyAvg,
      monthlyAvg,
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Animated.View 
          entering={FadeIn.duration(500)}
          style={styles.header}
        >
          <Text style={styles.title}>Statistiques</Text>
          <Text style={styles.subtitle}>
            Analysez votre temps de travail
          </Text>
        </Animated.View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3366FF" />
          </View>
        ) : (
          <View style={styles.statsContainer}>
            <Animated.View entering={FadeInDown.delay(100).duration(500)}>
              <StatsCard
                title="Aujourd'hui"
                value={stats.daily}
                color="#3366FF"
                description="Heures travaillées aujourd'hui"
              />
            </Animated.View>
            
            <Animated.View entering={FadeInDown.delay(200).duration(500)}>
              <StatsCard
                title="Cette semaine"
                value={stats.weekly}
                color="#5E9CFF"
                description="Total des heures cette semaine"
              />
            </Animated.View>
            
            <Animated.View entering={FadeInDown.delay(300).duration(500)}>
              <StatsCard
                title="Ce mois"
                value={stats.monthly}
                color="#92C1FF"
                description="Total des heures ce mois"
              />
            </Animated.View>
            
            <Text style={styles.sectionTitle}>Moyennes</Text>
            
            <Animated.View entering={FadeInDown.delay(400).duration(500)}>
              <StatsCard
                title="Moyenne journalière (semaine)"
                value={stats.weeklyAvg}
                color="#4CAF50"
                description="Moyenne des jours travaillés cette semaine"
              />
            </Animated.View>
            
            <Animated.View entering={FadeInDown.delay(500).duration(500)}>
              <StatsCard
                title="Moyenne journalière (mois)"
                value={stats.monthlyAvg}
                color="#4CAF50"
                description="Moyenne des jours travaillés ce mois"
              />
            </Animated.View>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Comment utiliser ces statistiques</Text>
              <Text style={styles.infoText}>
                • Les moyennes sont calculées uniquement sur les jours travaillés (avec des heures > 0)
              </Text>
              <Text style={styles.infoText}>
                • Tirez vers le bas pour actualiser les données
              </Text>
              <Text style={styles.infoText}>
                • Utilisez l'écran Calendrier pour une vue d'ensemble visuelle
              </Text>
            </View>
          </View>
        )}
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
    marginBottom: 8,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    paddingBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 18,
    color: '#555555',
    marginTop: 16,
    marginBottom: 12,
  },
  infoBox: {
    backgroundColor: '#F0F4FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
  },
  infoTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#333333',
    marginBottom: 8,
  },
  infoText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#555555',
    marginBottom: 6,
    lineHeight: 20,
  },
});