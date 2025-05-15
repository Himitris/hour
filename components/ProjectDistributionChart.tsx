// components/ProjectDistributionChart.tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '@/constants/theme';
import { WorkEntries } from '@/types';
import {
  getStartOfWeek,
  getEndOfWeek,
  getStartOfMonth,
  getEndOfMonth,
  getDatesInRange,
} from '@/utils/dateUtils';

interface ProjectDistributionChartProps {
  entries: WorkEntries;
  selectedDate: Date;
  viewMode: string;
}

// Pour la démonstration, nous allons extraire des "projets" à partir des notes
// Dans une vraie application, les projets seraient plutôt stockés dans une structure dédiée
export default function ProjectDistributionChart({
  entries,
  selectedDate,
  viewMode,
}: ProjectDistributionChartProps) {
  // Déterminer la plage de dates en fonction du mode
  const startDate =
    viewMode === 'week'
      ? getStartOfWeek(selectedDate)
      : getStartOfMonth(selectedDate);
  const endDate =
    viewMode === 'week'
      ? getEndOfWeek(selectedDate)
      : getEndOfMonth(selectedDate);
  const datesInRange = getDatesInRange(startDate, endDate);

  // Récupérer les entrées pour cette période
  const periodEntries = useMemo(() => {
    return datesInRange.reduce((acc, dateStr) => {
      if (entries[dateStr]) {
        acc[dateStr] = entries[dateStr];
      }
      return acc;
    }, {} as WorkEntries);
  }, [entries, datesInRange]);

  // Extraire les "projets" à partir des notes
  // Pour la démonstration, on va extraire le premier mot de chaque note comme "projet"
  const projectData = useMemo(() => {
    const projectHours: Record<string, number> = {};
    let totalHoursWithProject = 0;

    Object.values(periodEntries).forEach((entry) => {
      if (entry.note) {
        // Extraire le premier mot comme nom du projet
        const projectName = entry.note
          .split(' ')[0]
          .replace(/[^a-zA-Z0-9]/g, '');

        if (projectName && projectName.length > 0) {
          // Accumuler les heures par "projet"
          projectHours[projectName] =
            (projectHours[projectName] || 0) + entry.hours;
          totalHoursWithProject += entry.hours;
        }
      }
    });

    // Si aucun projet n'a été trouvé, créer des données de démonstration
    if (Object.keys(projectHours).length === 0) {
      projectHours['Projet A'] = 12;
      projectHours['Projet B'] = 8;
      projectHours['Projet C'] = 4;
      totalHoursWithProject = 24;
    }

    // Trier et formater les données
    return Object.entries(projectHours)
      .sort((a, b) => b[1] - a[1]) // Tri par nombre d'heures (décroissant)
      .map(([name, hours]) => ({
        name,
        hours,
        percentage: (hours / totalHoursWithProject) * 100,
      }))
      .slice(0, 5); // Limiter aux 5 premiers projets
  }, [periodEntries]);

  // Calculer le total des heures attribuées aux projets
  const totalProjectHours = projectData.reduce(
    (sum, project) => sum + project.hours,
    0
  );

  // Pour la couleur des barres
  const getProjectColor = (index: number) => {
    const colors = [
      COLORS.primary,
      COLORS.secondary,
      '#FF9500', // Orange
      '#5856D6', // Indigo
      '#FF2D55', // Rose
    ];
    return colors[index % colors.length];
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Distribution par projet</Text>

      <View style={styles.chartContainer}>
        {projectData.map((project, index) => (
          <View key={index} style={styles.projectRow}>
            <View style={styles.projectInfo}>
              <View
                style={[
                  styles.projectColorDot,
                  { backgroundColor: getProjectColor(index) },
                ]}
              />
              <Text style={styles.projectName}>{project.name}</Text>
            </View>

            <View style={styles.barWrapper}>
              <View
                style={[
                  styles.projectBar,
                  {
                    width: `${project.percentage}%`,
                    backgroundColor: getProjectColor(index),
                  },
                ]}
              />
            </View>

            <View style={styles.projectStats}>
              <Text style={styles.projectHours}>
                {project.hours.toFixed(1)}h
              </Text>
              <Text style={styles.projectPercentage}>
                {Math.round(project.percentage)}%
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{totalProjectHours.toFixed(1)}h</Text>
      </View>

      <Text style={styles.note}>
        Note: Les projets sont extraits du premier mot des notes.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  title: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  chartContainer: {
    marginBottom: 10,
  },
  projectRow: {
    marginBottom: 14,
  },
  projectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  projectColorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  projectName: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.text,
  },
  barWrapper: {
    height: 12,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 6,
    overflow: 'hidden',
  },
  projectBar: {
    height: '100%',
    borderRadius: 6,
  },
  projectStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  projectHours: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textLight,
  },
  projectPercentage: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.text,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
    marginTop: 4,
  },
  totalLabel: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.text,
  },
  totalValue: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.text,
  },
  note: {
    fontFamily: FONTS.regular,
    fontSize: 10,
    color: COLORS.textLight,
    fontStyle: 'italic',
    marginTop: 10,
    textAlign: 'center',
  },
});
