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
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  RefreshCw,
  AlertCircle,
  Calendar,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import DetailedStatsCard from '@/components/DetailedStatsCard';
import StatsCard from '@/components/StatsCard';
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
import {
  formatDateForDisplay,
  getStartOfWeek,
  getEndOfWeek,
  getStartOfMonth,
  getEndOfMonth,
  formatISODate,
} from '@/utils/dateUtils';
import { COLORS, FONTS, SHADOWS } from '@/constants/theme';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { useAppContext } from '@/contexts/AppContext';
import WeeklyHoursChart from '@/components/WeeklyHoursChart';

export default function StatsScreen() {
  const {
    workEntries,
    loading: contextLoading,
    refreshData,
    lastUpdated,
  } = useAppContext();
  const [refreshing, setRefreshing] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [showPeriodDetails, setShowPeriodDetails] = useState(false);
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

  // Dates pour les périodes
  const today = new Date();
  const startOfWeek = getStartOfWeek(today);
  const endOfWeek = getEndOfWeek(today);
  const startOfMonth = getStartOfMonth(today);
  const endOfMonth = getEndOfMonth(today);

  // Recalculer les statistiques lorsque les entrées changent ou lors d'un rafraîchissement
  useEffect(() => {
    calculateStats(workEntries);
  }, [workEntries, lastUpdated]);

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
    await refreshData();
    setRefreshing(false);
  };

  const toggleTips = () => {
    setShowTips(!showTips);
  };

  const togglePeriodDetails = () => {
    setShowPeriodDetails(!showPeriodDetails);
  };

  // Formatage simplifié pour l'affichage des périodes
  const formatShortDate = (date: Date): string => {
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  // Calculer le nombre de jours travaillés ce mois
  const daysWorkedThisMonth = Object.entries(workEntries).filter(
    ([date, entry]) => {
      const entryDate = new Date(date);
      return (
        entryDate >= startOfMonth && entryDate <= endOfMonth && entry.hours > 0
      );
    }
  ).length;

  // Calculer le ratio des heures notées/non notées
  const getBilledPercentage = () => {
    if (stats.monthlyBilled === 0 && stats.monthlyUnbilled === 0) return 0;
    return Math.round(
      (stats.monthlyBilled / (stats.monthlyBilled + stats.monthlyUnbilled)) *
        100
    );
  };

  const getUnbilledPercentage = () => {
    if (stats.monthlyBilled === 0 && stats.monthlyUnbilled === 0) return 0;
    return Math.round(
      (stats.monthlyUnbilled / (stats.monthlyBilled + stats.monthlyUnbilled)) *
        100
    );
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
            <View style={styles.headerButtons}>
              <TouchableOpacity
                style={[styles.iconButton, styles.calendarButton]}
                onPress={togglePeriodDetails}
              >
                <Calendar size={18} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.tipsButton} onPress={toggleTips}>
                <AlertCircle size={18} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.subtitle}>Analysez votre temps de travail</Text>

          {showPeriodDetails && (
            <Animated.View
              entering={FadeInUp.duration(300)}
              style={styles.periodDetailBox}
            >
              <View style={styles.periodDetailRow}>
                <Text style={styles.periodLabel}>Aujourd'hui:</Text>
                <Text style={styles.periodValue}>
                  {formatDateForDisplay(today)}
                </Text>
              </View>
              <View style={styles.periodDetailRow}>
                <Text style={styles.periodLabel}>Semaine:</Text>
                <Text style={styles.periodValue}>
                  {formatShortDate(startOfWeek)} - {formatShortDate(endOfWeek)}
                </Text>
              </View>
              <View style={styles.periodDetailRow}>
                <Text style={styles.periodLabel}>Mois:</Text>
                <Text style={styles.periodValue}>
                  {formatShortDate(startOfMonth)} -{' '}
                  {formatShortDate(endOfMonth)}
                </Text>
              </View>
            </Animated.View>
          )}
        </Animated.View>

        {contextLoading ? (
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
                description={`Total des heures (${formatShortDate(
                  startOfWeek
                )} - ${formatShortDate(endOfWeek)})`}
              />
            </Animated.View>

            {/* Composant graphique pour la semaine */}
            <Animated.View
              entering={FadeInDown.delay(250).duration(500)}
              style={styles.chartContainer}
            >
              <WeeklyHoursChart entries={workEntries} />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(300).duration(500)}>
              <DetailedStatsCard
                title="Ce mois"
                totalValue={stats.monthly}
                billedValue={stats.monthlyBilled}
                unbilledValue={stats.monthlyUnbilled}
                description={`Total des heures (${formatShortDate(
                  startOfMonth
                )} - ${formatShortDate(endOfMonth)})`}
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

            {/* Carte récapitulative */}
            <Animated.View entering={FadeInDown.delay(500).duration(500)}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>
                  Récapitulatif du travail
                </Text>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    Total jours travaillés ce mois:
                  </Text>
                  <Text style={styles.summaryValue}>
                    {daysWorkedThisMonth} jours
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    Ratio heures notées/non notées:
                  </Text>
                  <Text style={styles.summaryValue}>
                    {getBilledPercentage()}% / {getUnbilledPercentage()}%
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Moyenne hebdomadaire:</Text>
                  <Text style={styles.summaryValue}>
                    {(stats.monthly / 4).toFixed(1)}h
                  </Text>
                </View>
              </View>
            </Animated.View>

            {showTips && (
              <Animated.View
                entering={FadeInDown.delay(550).duration(300)}
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
                  • Le début de semaine est fixé au lundi
                </Text>
                <Text style={styles.tipsText}>
                  • Le début de mois est fixé au 1er jour du mois
                </Text>
                <Text style={styles.tipsText}>
                  • Les modifications de saisie sont automatiquement répercutées
                </Text>
                <Text style={styles.tipsText}>
                  • Tirez vers le bas pour actualiser manuellement
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 28,
    color: COLORS.text,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    marginLeft: 8,
  },
  calendarButton: {
    backgroundColor: COLORS.primaryLightest,
  },
  tipsButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLightest,
    marginLeft: 8,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  periodDetailBox: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    ...SHADOWS.small,
  },
  periodDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  periodLabel: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.textLight,
  },
  periodValue: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.text,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    paddingBottom: 16,
  },
  chartContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    ...SHADOWS.medium,
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
  summaryCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
    ...SHADOWS.medium,
  },
  summaryTitle: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingVertical: 4,
  },
  summaryLabel: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textLight,
    width: '60%',
  },
  summaryValue: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.text,
    textAlign: 'right',
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
