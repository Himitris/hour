// app/(tabs)/stats.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  RefreshCw,
  AlertCircle,
  Calendar,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Sliders,
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
  parseISODate,
  getDatesInRange,
} from '@/utils/dateUtils';
import { COLORS, FONTS, SHADOWS } from '@/constants/theme';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
} from 'react-native-reanimated';
import { useAppContext } from '@/contexts/AppContext';
import WeeklyHoursChart from '@/components/WeeklyHoursChart';
import MonthlyHoursChart from '@/components/MonthlyHoursChart';
import ProjectDistributionChart from '@/components/ProjectDistributionChart';

export default function StatsScreen() {
  const {
    workEntries,
    loading: contextLoading,
    refreshData,
    lastUpdated,
  } = useAppContext();

  // État de navigation dans le temps
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [showPeriodDetails, setShowPeriodDetails] = useState(false);

  // Nouvel état pour le mode d'affichage
  const [viewMode, setViewMode] = useState('week'); // 'week' ou 'month'

  // États pour les filtres
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState('all'); // 'all', 'billed', 'unbilled'

  // États pour les statistiques calculées
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
    // Nouvelles statistiques ajoutées
    longestDay: 0,
    mostFrequentDay: '',
    averagePerDay: {
      monday: 0,
      tuesday: 0,
      wednesday: 0,
      thursday: 0,
      friday: 0,
      saturday: 0,
      sunday: 0,
    },
  });

  // Dates pour les périodes basées sur la date sélectionnée
  const startOfWeek = getStartOfWeek(selectedDate);
  const endOfWeek = getEndOfWeek(selectedDate);
  const startOfMonth = getStartOfMonth(selectedDate);
  const endOfMonth = getEndOfMonth(selectedDate);

  // Recalculer les statistiques lorsque les entrées changent ou lors d'un changement de période
  useEffect(() => {
    calculateStats(workEntries);
  }, [workEntries, lastUpdated, selectedDate, filterType]);

  // Fonction pour avancer ou reculer dans le temps
  const navigatePeriod = (direction: string) => {
    const newDate = new Date(selectedDate);

    if (viewMode === 'week') {
      // Avancer ou reculer d'une semaine
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      // Avancer ou reculer d'un mois
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }

    setSelectedDate(newDate);
  };

  // Aller à la période actuelle
  const goToCurrentPeriod = () => {
    setSelectedDate(new Date());
  };

  // Filtrer les entrées en fonction des critères sélectionnés
  const filterEntries = (entries: WorkEntries): WorkEntries => {
    if (filterType === 'all') return entries;

    return Object.entries(entries).reduce((filtered: WorkEntries, [date, entry]) => {
      // Type guard: check entry is an object and has isBilled property
      if (
        typeof entry === 'object' &&
        entry !== null &&
        'isBilled' in entry
      ) {
        const e = entry as { isBilled?: boolean };
        if (
          (filterType === 'billed' && e.isBilled !== false) ||
          (filterType === 'unbilled' && e.isBilled === false)
        ) {
          filtered[date] = entry;
        }
      }
      return filtered;
    }, {} as WorkEntries);
  };

  const calculateStats = (workEntries: WorkEntries) => {
    const filteredEntries = filterEntries(workEntries);

    // Stats quotidiennes
    const daily = calculateDailyHours(filteredEntries, selectedDate);
    const dailyBilled = calculateDailyBilledHours(
      filteredEntries,
      selectedDate
    );
    const dailyUnbilled = calculateDailyUnbilledHours(
      filteredEntries,
      selectedDate
    );

    // Stats hebdomadaires
    const weekly = calculateWeeklyHours(filteredEntries, selectedDate);
    const weeklyBilled = calculateWeeklyBilledHours(
      filteredEntries,
      selectedDate
    );
    const weeklyUnbilled = calculateWeeklyUnbilledHours(
      filteredEntries,
      selectedDate
    );

    // Stats mensuelles
    const monthly = calculateMonthlyHours(filteredEntries, selectedDate);
    const monthlyBilled = calculateMonthlyBilledHours(
      filteredEntries,
      selectedDate
    );
    const monthlyUnbilled = calculateMonthlyUnbilledHours(
      filteredEntries,
      selectedDate
    );

    // Moyennes
    const weeklyAvg = calculateWeeklyAverage(filteredEntries, selectedDate);
    const monthlyAvg = calculateMonthlyAverage(filteredEntries, selectedDate);

    // Calcul du jour avec le plus d'heures
    let longestDay = 0;
    let mostFrequentDay = '';
    const daysOfWeekCount = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    const daysOfWeekHours = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    const daysOfWeekEntries = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

    // Calculer les statistiques avancées
    Object.entries(filteredEntries).forEach(([date, entry]) => {
      const entryDate = new Date(date);
      const dayOfWeek = entryDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

      // Jour avec le plus d'heures
      if (entry.hours > longestDay) {
        longestDay = entry.hours;
      }

      // Compter les jours travaillés par jour de la semaine
      if (entry.hours > 0) {
        daysOfWeekCount[dayOfWeek as keyof typeof daysOfWeekCount]++;
        daysOfWeekHours[dayOfWeek as keyof typeof daysOfWeekHours] += entry.hours;
        daysOfWeekEntries[dayOfWeek as keyof typeof daysOfWeekEntries]++;
      }
    });

    // Calculer le jour de la semaine le plus fréquent
    let maxCount = 0;
    for (let i = 0; i < 7; i++) {
      if (daysOfWeekCount[i as keyof typeof daysOfWeekCount] > maxCount) {
        maxCount = daysOfWeekCount[i as keyof typeof daysOfWeekCount];
        mostFrequentDay = [
          'Dimanche',
          'Lundi',
          'Mardi',
          'Mercredi',
          'Jeudi',
          'Vendredi',
          'Samedi',
        ][i];
      }
    }

    // Calculer la moyenne d'heures par jour de la semaine
    const averagePerDay = {
      sunday:
        daysOfWeekEntries[0] > 0
          ? daysOfWeekHours[0] / daysOfWeekEntries[0]
          : 0,
      monday:
        daysOfWeekEntries[1] > 0
          ? daysOfWeekHours[1] / daysOfWeekEntries[1]
          : 0,
      tuesday:
        daysOfWeekEntries[2] > 0
          ? daysOfWeekHours[2] / daysOfWeekEntries[2]
          : 0,
      wednesday:
        daysOfWeekEntries[3] > 0
          ? daysOfWeekHours[3] / daysOfWeekEntries[3]
          : 0,
      thursday:
        daysOfWeekEntries[4] > 0
          ? daysOfWeekHours[4] / daysOfWeekEntries[4]
          : 0,
      friday:
        daysOfWeekEntries[5] > 0
          ? daysOfWeekHours[5] / daysOfWeekEntries[5]
          : 0,
      saturday:
        daysOfWeekEntries[6] > 0
          ? daysOfWeekHours[6] / daysOfWeekEntries[6]
          : 0,
    };

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
      longestDay,
      mostFrequentDay,
      averagePerDay,
    });
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  const toggleTips = () => {
    setShowTips(!showTips);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const togglePeriodDetails = () => {
    setShowPeriodDetails(!showPeriodDetails);
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'week' ? 'month' : 'week');
  };

  // Formatage simplifié pour l'affichage des périodes
  const formatShortDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  // Calculer le nombre de jours travaillés sur la période sélectionnée
  const countWorkedDays = () => {
    const startDate = viewMode === 'week' ? startOfWeek : startOfMonth;
    const endDate = viewMode === 'week' ? endOfWeek : endOfMonth;
    const datesInPeriod = getDatesInRange(startDate, endDate);

    return datesInPeriod.filter((date) => {
      const entry = workEntries[date];
      return entry && entry.hours > 0;
    }).length;
  };

  // Calculer le ratio des heures notées/non notées
  const getBilledPercentage = () => {
    const billed =
      viewMode === 'week' ? stats.weeklyBilled : stats.monthlyBilled;
    const unbilled =
      viewMode === 'week' ? stats.weeklyUnbilled : stats.monthlyUnbilled;
    const total = billed + unbilled;

    if (total === 0) return 0;
    return Math.round((billed / total) * 100);
  };

  // Titre dynamique en fonction de la période sélectionnée
  const getPeriodTitle = () => {
    if (viewMode === 'week') {
      return `Semaine du ${formatShortDate(startOfWeek)} au ${formatShortDate(
        endOfWeek
      )}`;
    } else {
      return new Intl.DateTimeFormat('fr-FR', {
        month: 'long',
        year: 'numeric',
      }).format(startOfMonth);
    }
  };

  // Vérifier si la période sélectionnée est la période courante
  const isCurrentPeriod = () => {
    const today = new Date();
    if (viewMode === 'week') {
      const currentStartOfWeek = getStartOfWeek(today);
      return (
        startOfWeek.getFullYear() === currentStartOfWeek.getFullYear() &&
        startOfWeek.getMonth() === currentStartOfWeek.getMonth() &&
        startOfWeek.getDate() === currentStartOfWeek.getDate()
      );
    } else {
      return (
        startOfMonth.getFullYear() === today.getFullYear() &&
        startOfMonth.getMonth() === today.getMonth()
      );
    }
  };

  // Rendu du composant de filtre
  const renderFilterModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showFilters}
      onRequestClose={toggleFilters}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          entering={FadeInUp.duration(300)}
          exiting={FadeOut.duration(200)}
          style={styles.filterModal}
        >
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Filtres</Text>
            <TouchableOpacity onPress={toggleFilters}>
              <X size={20} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.filterOptions}>
            <TouchableOpacity
              style={[
                styles.filterOption,
                filterType === 'all' && styles.filterOptionActive,
              ]}
              onPress={() => setFilterType('all')}
            >
              <Text
                style={[
                  styles.filterOptionText,
                  filterType === 'all' && styles.filterOptionTextActive,
                ]}
              >
                Toutes les heures
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterOption,
                filterType === 'billed' && styles.filterOptionActive,
              ]}
              onPress={() => setFilterType('billed')}
            >
              <Text
                style={[
                  styles.filterOptionText,
                  filterType === 'billed' && styles.filterOptionTextActive,
                ]}
              >
                Heures notées
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterOption,
                filterType === 'unbilled' && styles.filterOptionActive,
              ]}
              onPress={() => setFilterType('unbilled')}
            >
              <Text
                style={[
                  styles.filterOptionText,
                  filterType === 'unbilled' && styles.filterOptionTextActive,
                ]}
              >
                Heures non notées
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.applyFilterButton}
            onPress={toggleFilters}
          >
            <Text style={styles.applyFilterText}>Appliquer</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );

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
                style={[styles.iconButton, styles.filterButton]}
                onPress={toggleFilters}
              >
                <Filter size={18} color={COLORS.primary} />
              </TouchableOpacity>
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

          {/* Sélecteur de période et navigation */}
          <View style={styles.periodNavigator}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigatePeriod('prev')}
            >
              <ChevronLeft size={22} color={COLORS.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.periodSelector}
              onPress={toggleViewMode}
            >
              <Text style={styles.periodTitle}>{getPeriodTitle()}</Text>
              <View style={styles.viewModeToggle}>
                <Text
                  style={[
                    styles.viewModeText,
                    viewMode === 'week' ? styles.viewModeActive : {},
                  ]}
                >
                  Semaine
                </Text>
                <Text style={styles.viewModeSeparator}>|</Text>
                <Text
                  style={[
                    styles.viewModeText,
                    viewMode === 'month' ? styles.viewModeActive : {},
                  ]}
                >
                  Mois
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigatePeriod('next')}
            >
              <ChevronRight size={22} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {!isCurrentPeriod() && (
            <TouchableOpacity
              style={styles.currentPeriodButton}
              onPress={goToCurrentPeriod}
            >
              <Calendar size={16} color={COLORS.card} />
              <Text style={styles.currentPeriodText}>
                {viewMode === 'week' ? 'Semaine actuelle' : 'Mois actuel'}
              </Text>
            </TouchableOpacity>
          )}

          {showPeriodDetails && (
            <Animated.View
              entering={FadeInUp.duration(300)}
              style={styles.periodDetailBox}
            >
              <View style={styles.periodDetailRow}>
                <Text style={styles.periodLabel}>Période sélectionnée:</Text>
                <Text style={styles.periodValue}>
                  {viewMode === 'week'
                    ? `${formatShortDate(startOfWeek)} - ${formatShortDate(
                        endOfWeek
                      )}`
                    : new Intl.DateTimeFormat('fr-FR', {
                        month: 'long',
                        year: 'numeric',
                      }).format(startOfMonth)}
                </Text>
              </View>
              <View style={styles.periodDetailRow}>
                <Text style={styles.periodLabel}>Jours travaillés:</Text>
                <Text style={styles.periodValue}>
                  {countWorkedDays()} /{' '}
                  {viewMode === 'week' ? '7' : endOfMonth.getDate()}
                </Text>
              </View>
              <View style={styles.periodDetailRow}>
                <Text style={styles.periodLabel}>Filtre actif:</Text>
                <Text style={styles.periodValue}>
                  {filterType === 'all'
                    ? 'Toutes les heures'
                    : filterType === 'billed'
                    ? 'Heures notées'
                    : 'Heures non notées'}
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
            {/* Stats détaillées pour la période sélectionnée */}
            <Animated.View entering={FadeInDown.delay(100).duration(500)}>
              <DetailedStatsCard
                title={viewMode === 'week' ? 'Cette semaine' : 'Ce mois'}
                totalValue={viewMode === 'week' ? stats.weekly : stats.monthly}
                billedValue={
                  viewMode === 'week' ? stats.weeklyBilled : stats.monthlyBilled
                }
                unbilledValue={
                  viewMode === 'week'
                    ? stats.weeklyUnbilled
                    : stats.monthlyUnbilled
                }
                description={`Total des heures (${
                  viewMode === 'week'
                    ? `${formatShortDate(startOfWeek)} - ${formatShortDate(
                        endOfWeek
                      )}`
                    : new Intl.DateTimeFormat('fr-FR', {
                        month: 'long',
                      }).format(startOfMonth)
                })`}
              />
            </Animated.View>

            {/* Graphique adaptatif selon le mode de vue */}
            <Animated.View
              entering={FadeInDown.delay(150).duration(500)}
              style={styles.chartContainer}
            >
              {viewMode === 'week' ? (
                <WeeklyHoursChart
                  entries={workEntries}
                  selectedDate={selectedDate}
                />
              ) : (
                <MonthlyHoursChart
                  entries={workEntries}
                  selectedDate={selectedDate}
                />
              )}
            </Animated.View>

            {/* Moyennes et statistiques supplémentaires */}
            <Text style={styles.sectionTitle}>Moyennes journalières</Text>

            <View style={styles.averagesRow}>
              <Animated.View
                entering={FadeInDown.delay(200).duration(500)}
                style={styles.averageCard}
              >
                <StatsCard
                  title={
                    viewMode === 'week' ? 'Moyenne semaine' : 'Moyenne mois'
                  }
                  value={
                    viewMode === 'week' ? stats.weeklyAvg : stats.monthlyAvg
                  }
                  color={COLORS.primary}
                  description="Par jour travaillé"
                  animate={true}
                />
              </Animated.View>

              <Animated.View
                entering={FadeInDown.delay(250).duration(500)}
                style={styles.averageCard}
              >
                <StatsCard
                  title="Journée max"
                  value={stats.longestDay}
                  color={COLORS.primary}
                  description="Plus longue journée"
                  animate={true}
                />
              </Animated.View>
            </View>

            {/* Distribution par projet (simulée pour l'exemple) */}
            <Animated.View
              entering={FadeInDown.delay(300).duration(500)}
              style={styles.chartContainer}
            >
              <ProjectDistributionChart
                entries={workEntries}
                selectedDate={selectedDate}
                viewMode={viewMode}
              />
            </Animated.View>

            {/* Carte récapitulative */}
            <Animated.View entering={FadeInDown.delay(350).duration(500)}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Récapitulatif détaillé</Text>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Jours travaillés:</Text>
                  <Text style={styles.summaryValue}>
                    {countWorkedDays()} jours
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    Ratio heures notées/non notées:
                  </Text>
                  <Text style={styles.summaryValue}>
                    {getBilledPercentage()}% / {100 - getBilledPercentage()}%
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    Jour le plus fréquent:
                  </Text>
                  <Text style={styles.summaryValue}>
                    {stats.mostFrequentDay || 'N/A'}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Moyenne hebdomadaire:</Text>
                  <Text style={styles.summaryValue}>
                    {viewMode === 'month'
                      ? (stats.monthly / 4).toFixed(1)
                      : stats.weekly.toFixed(1)}
                    h
                  </Text>
                </View>
              </View>
            </Animated.View>

            {/* Section pour les moyennes par jour de semaine */}
            <Animated.View entering={FadeInDown.delay(400).duration(500)}>
              <View style={styles.weekdayStatsCard}>
                <Text style={styles.weekdayStatsTitle}>
                  Moyennes par jour de semaine
                </Text>
                <View style={styles.weekdayStatsGrid}>
                  {Object.entries({
                    Lun: stats.averagePerDay.monday,
                    Mar: stats.averagePerDay.tuesday,
                    Mer: stats.averagePerDay.wednesday,
                    Jeu: stats.averagePerDay.thursday,
                    Ven: stats.averagePerDay.friday,
                    Sam: stats.averagePerDay.saturday,
                    Dim: stats.averagePerDay.sunday,
                  }).map(([day, value], index) => (
                    <View key={index} style={styles.weekdayStatItem}>
                      <Text style={styles.weekdayLabel}>{day}</Text>
                      <Text style={styles.weekdayValue}>
                        {value.toFixed(1)}h
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </Animated.View>

            {/* Conseils et informations */}
            {showTips && (
              <Animated.View
                entering={FadeInDown.delay(450).duration(300)}
                style={styles.tipsBox}
              >
                <Text style={styles.tipsTitle}>
                  Fonctionnalités des statistiques
                </Text>
                <Text style={styles.tipsText}>
                  • Utilisez les flèches pour naviguer entre les semaines ou les
                  mois
                </Text>
                <Text style={styles.tipsText}>
                  • Changez de mode d'affichage (semaine/mois) en appuyant sur
                  le titre
                </Text>
                <Text style={styles.tipsText}>
                  • Activez des filtres pour n'afficher que certains types
                  d'heures
                </Text>
                <Text style={styles.tipsText}>
                  • Consultez les détails de la période en appuyant sur l'icône
                  calendrier
                </Text>
                <Text style={styles.tipsText}>
                  • Tirez vers le bas pour actualiser les données
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

      {/* Modal de filtres */}
      {renderFilterModal()}
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
  filterButton: {
    backgroundColor: COLORS.primaryLightest,
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
  periodNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 8,
  },
  navButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    ...SHADOWS.small,
  },
  periodSelector: {
    flex: 1,
    marginHorizontal: 10,
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 10,
    ...SHADOWS.small,
  },
  periodTitle: {
    fontFamily: FONTS.medium,
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 4,
  },
  viewModeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewModeText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textLight,
    paddingHorizontal: 6,
  },
  viewModeActive: {
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
  viewModeSeparator: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.textLight,
  },
  currentPeriodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 8,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 8,
    ...SHADOWS.button,
  },
  currentPeriodText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.card,
    marginLeft: 6,
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
  weekdayStatsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    ...SHADOWS.medium,
  },
  weekdayStatsTitle: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 8,
  },
  weekdayStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  weekdayStatItem: {
    width: '32%',
    backgroundColor: COLORS.inputBackground,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    marginBottom: 8,
  },
  weekdayLabel: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  weekdayValue: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.text,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  filterModal: {
    backgroundColor: COLORS.card,
    width: '90%',
    borderRadius: 16,
    padding: 20,
    ...SHADOWS.large,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 10,
  },
  filterTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.text,
  },
  filterOptions: {
    marginBottom: 20,
  },
  filterOption: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: COLORS.inputBackground,
    marginBottom: 10,
  },
  filterOptionActive: {
    backgroundColor: COLORS.primaryLightest,
  },
  filterOptionText: {
    fontFamily: FONTS.medium,
    fontSize: 15,
    color: COLORS.text,
    textAlign: 'center',
  },
  filterOptionTextActive: {
    color: COLORS.primary,
  },
  applyFilterButton: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    ...SHADOWS.button,
  },
  applyFilterText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.card,
  },
});
