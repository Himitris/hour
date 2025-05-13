// app/(tabs)/_layout.tsx 
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import {
  Clipboard as ClipboardEdit,
  Calendar,
  ChartBar as BarChart2,
} from 'lucide-react-native';
import { COLORS, FONTS, SHADOWS } from '@/constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: styles.header,
        headerTitleStyle: styles.headerTitle,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Saisie',
          tabBarIcon: ({ color, size }) => (
            <ClipboardEdit size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendrier',
          tabBarIcon: ({ color, size }) => (
            <Calendar size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Statistiques',
          tabBarIcon: ({ color, size }) => (
            <BarChart2 size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.card,
    ...SHADOWS.small,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontFamily: FONTS.medium,
    fontSize: 18,
    color: COLORS.text,
  },
  tabBar: {
    backgroundColor: COLORS.card,
    ...SHADOWS.medium,
    height: 64,
    paddingBottom: 10,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  tabBarLabel: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    marginTop: 2,
  },
});
