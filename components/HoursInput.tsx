// components/HoursInput.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Keyboard,
  Switch,
} from 'react-native';
import { Save, ChevronUp, ChevronDown, Clock } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import { storeWorkEntry, getWorkEntryByDate } from '@/utils/storage';
import { formatISODate } from '@/utils/dateUtils';
import { COLORS, FONTS, SHADOWS } from '@/constants/theme';
import { useAppContext } from '@/contexts/AppContext';

interface HoursInputProps {
  date: Date;
  onSave: () => void;
}

export default function HoursInput({ date, onSave }: HoursInputProps) {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0); // 0 ou 30
  const [note, setNote] = useState('');
  const [isBilled, setIsBilled] = useState(true); // Par défaut, les heures sont notées
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { refreshData } = useAppContext(); // Utilisation du contexte

  const buttonScale = useSharedValue(1);

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  useEffect(() => {
    loadExistingEntry();
  }, [date]);

  const loadExistingEntry = async () => {
    setLoading(true);
    try {
      const dateStr = formatISODate(date);
      const entry = await getWorkEntryByDate(dateStr);

      if (entry) {
        // Convertir les heures décimales en heures et minutes
        const fullHours = Math.floor(entry.hours);
        const mins = Math.round((entry.hours - fullHours) * 60);

        // Quantiser à 0 ou 30 minutes
        const quantizedMinutes = mins >= 15 ? 30 : 0;

        setHours(fullHours);
        setMinutes(quantizedMinutes);
        setNote(entry.note || '');
        setIsBilled(entry.isBilled !== undefined ? entry.isBilled : true);
      } else {
        // Reset fields for a new date
        setHours(0);
        setMinutes(0);
        setNote('');
        setIsBilled(true);
      }
    } catch (error) {
      console.error('Error loading work entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    Keyboard.dismiss();

    if (hours === 0 && minutes === 0) {
      Alert.alert('Erreur', "Veuillez entrer un nombre d'heures valide");
      return;
    }

    // Convertir les heures et minutes en nombre décimal
    const numHours = hours + minutes / 60;

    if (numHours < 0 || numHours > 24) {
      Alert.alert(
        'Erreur',
        "Veuillez entrer un nombre d'heures valide (entre 0 et 24)"
      );
      return;
    }

    // Button press animation
    buttonScale.value = withTiming(0.9, { duration: 100 });
    setTimeout(() => {
      buttonScale.value = withTiming(1, { duration: 100 });
    }, 100);

    setSaving(true);
    try {
      const dateStr = formatISODate(date);
      await storeWorkEntry({
        date: dateStr,
        hours: numHours,
        note: note.trim() || undefined,
        isBilled: isBilled,
      });

      // Rafraîchir les données dans le contexte
      await refreshData();

      // Success animation and notification
      onSave();
      Alert.alert('Succès', 'Heures de travail enregistrées !');
    } catch (error) {
      console.error('Error saving work entry:', error);
      Alert.alert('Erreur', "Une erreur est survenue lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const incrementHours = () => {
    if (hours < 24) {
      setHours((prev) => prev + 1);
    }
  };

  const decrementHours = () => {
    if (hours > 0) {
      setHours((prev) => prev - 1);
    } else if (hours === 0 && minutes === 30) {
      setMinutes(0);
    }
  };

  const toggleMinutes = () => {
    setMinutes((prev) => (prev === 0 ? 30 : 0));
  };

  const formatTimeDisplay = () => {
    return `${hours}h${minutes === 30 ? '30' : '00'}`;
  };

  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
      <View style={styles.topSection}>
        <View style={styles.timeSection}>
          <Text style={styles.sectionTitle}>Durée</Text>
          <View style={styles.timeInputRow}>
            <View style={styles.timeControlContainer}>
              <TouchableOpacity
                style={styles.timeControl}
                onPress={incrementHours}
                disabled={loading || hours >= 24}
              >
                <ChevronUp size={20} color={COLORS.text} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.timeDisplay}
                onPress={toggleMinutes}
                disabled={loading}
              >
                <Clock
                  size={14}
                  color={COLORS.primary}
                  style={styles.timeIcon}
                />
                <Text style={styles.timeText}>{formatTimeDisplay()}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.timeControl}
                onPress={decrementHours}
                disabled={loading || (hours === 0 && minutes === 0)}
              >
                <ChevronDown size={20} color={COLORS.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.statusSection}>
          <Text style={styles.sectionTitle}>Status</Text>
          <View style={styles.switchWrapper}>
            <Text
              style={[styles.statusLabel, !isBilled && styles.statusActive]}
            >
              Non notées
            </Text>
            <Switch
              value={isBilled}
              onValueChange={setIsBilled}
              trackColor={{
                false: COLORS.secondaryLightest,
                true: COLORS.primaryLightest,
              }}
              thumbColor={isBilled ? COLORS.primary : COLORS.secondary}
              ios_backgroundColor={COLORS.secondaryLightest}
              disabled={loading}
              style={styles.switch}
            />
            <Text style={[styles.statusLabel, isBilled && styles.statusActive]}>
              Notées
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.noteSection}>
        <Text style={styles.sectionTitle}>Note (optionnel)</Text>
        <TextInput
          style={styles.noteInput}
          value={note}
          onChangeText={setNote}
          placeholder="Ajoutez une note..."
          multiline
          maxLength={100}
          editable={!loading}
        />
      </View>

      <Animated.View style={[styles.buttonSection, animatedButtonStyle]}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={loading || saving}
        >
          <Save size={16} color={COLORS.card} />
          <Text style={styles.buttonText}>
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    ...SHADOWS.medium,
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  timeSection: {
    width: '48%',
  },
  statusSection: {
    width: '48%',
  },
  sectionTitle: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 8,
  },
  timeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeControlContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  timeControl: {
    width: '100%',
    alignItems: 'center',
    padding: 4,
  },
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    width: '100%',
  },
  timeIcon: {
    marginRight: 4,
  },
  timeText: {
    fontFamily: FONTS.medium,
    fontSize: 18,
    color: COLORS.text,
  },
  switchWrapper: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    padding: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  switch: {
    margin: 4,
  },
  statusLabel: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  statusActive: {
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
  noteSection: {
    marginBottom: 16,
  },
  noteInput: {
    fontFamily: FONTS.regular,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  buttonSection: {
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    ...SHADOWS.button,
  },
  buttonText: {
    color: COLORS.card,
    fontFamily: FONTS.medium,
    fontSize: 16,
    marginLeft: 8,
  },
});
