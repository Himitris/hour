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
import { Save } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { storeWorkEntry, getWorkEntryByDate } from '@/utils/storage';
import { formatISODate } from '@/utils/dateUtils';
import { COLORS, FONTS } from '@/constants/theme';

interface HoursInputProps {
  date: Date;
  onSave: () => void;
}

export default function HoursInput({ date, onSave }: HoursInputProps) {
  const [hours, setHours] = useState('');
  const [note, setNote] = useState('');
  const [isBilled, setIsBilled] = useState(true); // Par défaut, les heures sont notées
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

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
        setHours(entry.hours.toString());
        setNote(entry.note || '');
        setIsBilled(entry.isBilled !== undefined ? entry.isBilled : true); // Utiliser la valeur existante ou true par défaut
      } else {
        // Reset fields for a new date
        setHours('');
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

    if (!hours.trim()) {
      Alert.alert('Erreur', "Veuillez entrer un nombre d'heures");
      return;
    }

    const numHours = parseFloat(hours);
    if (isNaN(numHours) || numHours < 0 || numHours > 24) {
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

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <View style={styles.hoursInputContainer}>
          <Text style={styles.label}>Heures</Text>
          <TextInput
            style={styles.input}
            value={hours}
            onChangeText={setHours}
            placeholder="Ex: 8"
            keyboardType="numeric"
            maxLength={5}
            editable={!loading}
          />
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.label}>Status</Text>
          <View style={styles.switchWrapper}>
            <Animated.Text
              style={[
                styles.switchLabel,
                !isBilled && styles.activeLabel,
                { opacity: isBilled ? 0.6 : 1 },
              ]}
            >
              Non
            </Animated.Text>
            <Switch
              value={isBilled}
              onValueChange={setIsBilled}
              trackColor={{ false: '#DDDDDD', true: COLORS.primaryLightest }}
              thumbColor={isBilled ? COLORS.primary : '#999999'}
              ios_backgroundColor="#DDDDDD"
              disabled={loading}
              style={styles.switch}
            />
            <Animated.Text
              style={[
                styles.switchLabel,
                isBilled && styles.activeLabel,
                { opacity: isBilled ? 1 : 0.6 },
              ]}
            >
              Notées
            </Animated.Text>
          </View>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Note (optionnel)</Text>
        <TextInput
          style={[styles.input, styles.noteInput]}
          value={note}
          onChangeText={setNote}
          placeholder="Ajoutez une note..."
          multiline
          maxLength={100}
          editable={!loading}
        />
      </View>

      <Animated.View style={[styles.buttonContainer, animatedButtonStyle]}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={loading || saving}
        >
          <Save size={18} color="#FFFFFF" />
          <Text style={styles.buttonText}>
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  hoursInputContainer: {
    width: '40%',
  },
  switchContainer: {
    width: '56%',
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 6,
  },
  input: {
    fontFamily: FONTS.regular,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputContainer: {
    marginBottom: 14,
  },
  noteInput: {
    minHeight: 80,
    maxHeight: 120,
    textAlignVertical: 'top',
  },
  switchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.inputBackground,
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  switch: {
    marginHorizontal: 8,
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  switchLabel: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textLight,
  },
  activeLabel: {
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 160,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: {
    color: COLORS.card,
    fontFamily: FONTS.medium,
    fontSize: 14,
    marginLeft: 8,
  },
});
