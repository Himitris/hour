// app/(tabs)/stats.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RefreshCw, AlertCircle } from 'lucide-react-native';
import DetailedStatsCard from '@/components/DetailedStatsCard';
import StatsCard from '@/components/StatsCard';
import { getWorkEntries } from '@/utils/storage';
import { WorkEntries } from '@/types';
import {
  calculateDailyHours,
  calculateDailyBilledHours,
  calculateDailyUnbilledHours,
  calculateWeeklyHours,
  calculateWeeklyBilledHours,
  calculateWeeklyUnbilledHours,
  calculateMonthlyHours,
  calculateMonthlyBilledHours,
  calculateMonthlyUnbilledHours,
  calculateWeeklyAverage,
  calculateMonthlyAverage,
} from '@/utils/statsCalculator';
import { COLORS, FONTS, SHADOWS } from '@/constants/theme';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

export default function StatsScreen() {
  const [entries, setEntries] = useState<WorkEntries>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [stats, setStats] = useState({
    daily: 0,
    dailyBilled: 0,
    dailyUnbilled: 0,
    weekly: 0,
    weeklyBilled: 0,
    weeklyUnbilled: 0,
    monthly: 0,
    monthlyBilled: 0,
    monthlyUnbilled: 0,
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
    const dailyBilled = calculateDailyBilledHours(workEntries, today);
    const dailyUnbilled = calculateDailyUnbilledHours(workEntries, today);

    const weekly = calculateWeeklyHours(workEntries, today);
    const weeklyBilled = calculateWeeklyBilledHours(workEntries, today);
    const weeklyUnbilled = calculateWeeklyUnbilledHours(workEntries, today);

    const monthly = calculateMonthlyHours(workEntries, today);
    const monthlyBilled = calculateMonthlyBilledHours(workEntries, today);
    const monthlyUnbilled = calculateMonthlyUnbilledHours(workEntries, today);

    const weeklyAvg = calculateWeeklyAverage(workEntries, today);
    const monthlyAvg = calculateMonthlyAverage(workEntries, today);

    setStats({
      daily,
      dailyBilled,
      dailyUnbilled,
      weekly,
      weeklyBilled,
      weeklyUnbilled,
      monthly,
      monthlyBilled,
      monthlyUnbilled,
      weeklyAvg,
      monthlyAvg,
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  const toggleTips = () => {
    setShowTips(!showTips);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
      >
        <Animated.View entering={FadeIn.duration(500)} style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Statistiques</Text>
            <TouchableOpacity style={styles.tipsButton} onPress={toggleTips}>
              <AlertCircle size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>Analysez votre temps de travail</Text>
        </Animated.View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <View style={styles.statsContainer}>
            <Animated.View entering={FadeInDown.delay(100).duration(500)}>
              <DetailedStatsCard
                title="Aujourd'hui"
                totalValue={stats.daily}
                billedValue={stats.dailyBilled}
                unbilledValue={stats.dailyUnbilled}
                description="Heures travaillées aujourd'hui"
              />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(200).duration(500)}>
              <DetailedStatsCard
                title="Cette semaine"
                totalValue={stats.weekly}
                billedValue={stats.weeklyBilled}
                unbilledValue={stats.weeklyUnbilled}
                description="Total des heures cette semaine"
              />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(300).duration(500)}>
              <DetailedStatsCard
                title="Ce mois"
                totalValue={stats.monthly}
                billedValue={stats.monthlyBilled}
                unbilledValue={stats.monthlyUnbilled}
                description="Total des heures ce mois"
              />
            </Animated.View>

            <Text style={styles.sectionTitle}>Moyennes journalières</Text>

            <View style={styles.averagesRow}>
              <Animated.View
                entering={FadeInDown.delay(400).duration(500)}
                style={styles.averageCard}
              >
                <StatsCard
                  title="Semaine"
                  value={stats.weeklyAvg}
                  color={COLORS.primary}
                  description="Moyenne jours travaillés"
                  animate={true}
                />
              </Animated.View>

              <Animated.View
                entering={FadeInDown.delay(450).duration(500)}
                style={styles.averageCard}
              >
                <StatsCard
                  title="Mois"
                  value={stats.monthlyAvg}
                  color={COLORS.primary}
                  description="Moyenne jours travaillés"
                  animate={true}
                />
              </Animated.View>
            </View>

            {showTips && (
              <Animated.View
                entering={FadeInDown.delay(500).duration(300)}
                style={styles.tipsBox}
              >
                <Text style={styles.tipsTitle}>
                  Comprendre vos statistiques
                </Text>
                <Text style={styles.tipsText}>
                  • Les heures notées correspondent au temps facturable à vos
                  clients
                </Text>
                <Text style={styles.tipsText}>
                  • Les heures non notées sont du temps de travail non
                  facturable
                </Text>
                <Text style={styles.tipsText}>
                  • Les moyennes sont calculées uniquement sur les jours
                  travaillés
                </Text>
                <Text style={styles.tipsText}>
                  • Tirez vers le bas pour actualiser vos données
                </Text>
                <TouchableOpacity
                  style={styles.refreshStatsButton}
                  onPress={onRefresh}
                >
                  <RefreshCw size={16} color={COLORS.card} />
                  <Text style={styles.refreshStatsText}>
                    Actualiser les statistiques
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>
        )}
      </ScrollView>
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
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 28,
    color: COLORS.text,
  },
  tipsButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLightest,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    paddingBottom: 16,
  },
  sectionTitle: {
    fontFamily: FONTS.medium,
    fontSize: 18,
    color: COLORS.text,
    marginTop: 24,
    marginBottom: 16,
  },
  averagesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  averageCard: {
    width: '48%',
  },
  tipsBox: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    ...SHADOWS.medium,
  },
  tipsTitle: {
    fontFamily: FONTS.medium,
    fontSize: 18,
    color: COLORS.card,
    marginBottom: 12,
  },
  tipsText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.card,
    marginBottom: 8,
    lineHeight: 20,
    opacity: 0.9,
  },
  refreshStatsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  refreshStatsText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.card,
    marginLeft: 8,
  },
});
