import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Keyboard } from 'react-native';
import { Save } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { storeWorkEntry, getWorkEntryByDate } from '@/utils/storage';
import { formatDateForDisplay, formatISODate } from '@/utils/dateUtils';

interface HoursInputProps {
  date: Date;
  onSave: () => void;
}

export default function HoursInput({ date, onSave }: HoursInputProps) {
  const [hours, setHours] = useState('');
  const [note, setNote] = useState('');
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
      } else {
        // Reset fields for a new date
        setHours('');
        setNote('');
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
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  dateText: {
    fontFamily: 'Inter-Medium',
    fontSize: 18,
    color: '#333333',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#555555',
    marginBottom: 8,
  },
  input: {
    fontFamily: 'Inter-Regular',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333333',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  noteInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  saveButton: {
    backgroundColor: '#3366FF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginLeft: 8,
  },
});