// components/HoursInput.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Keyboard, Switch } from 'react-native';
import { Save } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { storeWorkEntry, getWorkEntryByDate } from '@/utils/storage';
import { formatDateForDisplay, formatISODate } from '@/utils/dateUtils';
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
      transform: [{ scale: buttonScale.value }]
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
      Alert.alert('Erreur', 'Veuillez entrer un nombre d\'heures');
      return;
    }

    const numHours = parseFloat(hours);
    if (isNaN(numHours) || numHours < 0 || numHours > 24) {
      Alert.alert('Erreur', 'Veuillez entrer un nombre d\'heures valide (entre 0 et 24)');
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
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.dateText}>{formatDateForDisplay(date)}</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Heures travaillées</Text>
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
        <Text style={styles.label}>Statut des heures</Text>
        <Animated.View style={styles.switchWrapper}>
          <Animated.Text
            style={[
              styles.switchLabel,
              !isBilled && styles.activeLabel,
              { opacity: isBilled ? 0.6 : 1 },
            ]}
          >
            Non notées
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
        </Animated.View>
        <Text style={styles.switchHelp}>
          {isBilled
            ? 'Les heures notées sont comptabilisées comme temps facturable'
            : 'Les heures non notées correspondent au travail interne, formation, etc.'}
        </Text>
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
          <Save size={20} color="#FFFFFF" />
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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 20,
  },
  dateText: {
    fontFamily: 'Inter-Medium',
    fontSize: 20,
    color: '#333333',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#444444',
    marginBottom: 8,
  },
  input: {
    fontFamily: 'Inter-Regular',
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  noteInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  switchContainer: {
    marginBottom: 20,
  },
  switchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  switch: {
    marginHorizontal: 12,
  },
  switchLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#777777',
  },
  activeLabel: {
    fontFamily: 'Inter-Medium',
    color: '#3366FF',
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: '#3366FF',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 220,
    shadowColor: '#3366FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginLeft: 10,
  },
  switchHelp: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textLight,
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
});