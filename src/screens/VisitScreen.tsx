import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { professionalTheme } from '../theme/professional';
import { LocationService, LocationData } from '../services/locationService';
import { VisitService } from '../services/visitService';
import { PatientService } from '../services/patientService';
import { useDebounce } from '../hooks/useDebounce';

export default function VisitScreen() {
  const params = useLocalSearchParams();
  const { patientId, assignmentId, patientName } = params;
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [patient, setPatient] = useState<any>(null);
  const [visitStatus, setVisitStatus] = useState<'check_in' | 'checked_in'>('check_in');
  const [checkInAddress, setCheckInAddress] = useState<string>('');
  const { isProcessing, debounce } = useDebounce();

  useEffect(() => {
    loadPatient();
  }, []);

  const loadPatient = async () => {
    try {
      const patientData = await PatientService.getPatientById(patientId as string);
      setPatient(patientData);
    } catch (error) {
      console.error('Error loading patient:', error);
    }
  };

  const handleCheckIn = () => {
    debounce(async () => {
      try {
        const location = await LocationService.getCurrentLocation();
        if (!location) {
          Alert.alert('Error', 'Unable to get current location. Please enable GPS.');
          return;
        }

        setCurrentLocation(location);

        const address = await LocationService.getAddressFromCoordinates(
          location.latitude,
          location.longitude
        ).catch(() => 'Location recorded');
        setCheckInAddress(address);
        setVisitStatus('checked_in');

        Alert.alert(
          'Checked In Successfully',
          `You're checked in at ${address}.\n\nYou can now proceed with the visit.`,
          [{ text: 'OK' }]
        );
      } catch (error) {
        console.error('Error checking in:', error);
        Alert.alert('Error', 'Failed to check in. Please try again.');
      }
    });
  };

  const handleStartQuestions = () => {
    router.push({
      pathname: '/follow-up-questions',
      params: { 
        patientName,
        patientId,
        assignmentId,
        checkInLocation: checkInAddress,
        checkInLat: currentLocation?.latitude.toString(),
        checkInLon: currentLocation?.longitude.toString(),
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={professionalTheme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Visit</Text>
        <Text style={styles.patientName}>{patientName}</Text>
      </View>

      <View style={styles.content}>
        {visitStatus === 'check_in' && (
          <View style={styles.actionCard}>
            <View style={styles.iconContainer}>
              <Ionicons name="checkmark-circle" size={48} color={professionalTheme.colors.status.success} />
            </View>
            <Text style={styles.actionTitle}>Check In for Visit</Text>
            <Text style={styles.actionDescription}>
              Check in to record your location and start the patient visit. Your location will be saved for verification purposes.
            </Text>
            <TouchableOpacity 
              style={[styles.primaryButton, isProcessing && styles.disabledButton]} 
              onPress={handleCheckIn}
              disabled={isProcessing}
            >
              <Ionicons name="checkmark-circle" size={20} color={professionalTheme.colors.text.white} />
              <Text style={styles.primaryButtonText}>
                {isProcessing ? 'Getting Location...' : 'Check In'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {visitStatus === 'checked_in' && (
          <View style={styles.actionCard}>
            <View style={styles.iconContainer}>
              <Ionicons name="clipboard" size={48} color={professionalTheme.colors.primary} />
            </View>
            <Text style={styles.actionTitle}>Ready for Visit</Text>
            <Text style={styles.actionDescription}>
              You are checked in and ready to start the follow-up questions with the patient.
            </Text>
            {checkInAddress && (
              <View style={styles.locationInfo}>
                <Ionicons name="location" size={16} color={professionalTheme.colors.primary} />
                <Text style={styles.locationText}>{checkInAddress}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.primaryButton} onPress={handleStartQuestions}>
              <Ionicons name="clipboard" size={20} color={professionalTheme.colors.text.white} />
              <Text style={styles.primaryButtonText}>Start Follow-up Questions</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: professionalTheme.colors.background.light,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: professionalTheme.spacing.lg,
    paddingVertical: professionalTheme.spacing.md,
    backgroundColor: professionalTheme.colors.background.main,
    borderBottomWidth: 1,
    borderBottomColor: professionalTheme.colors.border,
  },
  backButton: {
    padding: professionalTheme.spacing.sm,
  },
  headerTitle: {
    fontSize: professionalTheme.fontSize.lg,
    fontWeight: professionalTheme.fontWeight.semibold,
    color: professionalTheme.colors.text.primary,
  },
  patientName: {
    fontSize: professionalTheme.fontSize.sm,
    color: professionalTheme.colors.text.secondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: professionalTheme.spacing.lg,
    paddingTop: professionalTheme.spacing.xl,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: professionalTheme.spacing.xl,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  step: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: professionalTheme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCompleted: {
    backgroundColor: professionalTheme.colors.status.success,
  },
  stepNumber: {
    fontSize: professionalTheme.fontSize.md,
    fontWeight: professionalTheme.fontWeight.bold,
    color: professionalTheme.colors.text.white,
  },
  stepLine: {
    width: 60,
    height: 2,
    backgroundColor: professionalTheme.colors.border,
    marginHorizontal: professionalTheme.spacing.sm,
  },
  actionCard: {
    backgroundColor: professionalTheme.colors.background.card,
    borderRadius: professionalTheme.borderRadius.lg,
    padding: professionalTheme.spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: professionalTheme.colors.border,
    shadowColor: professionalTheme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${professionalTheme.colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: professionalTheme.spacing.lg,
  },
  actionTitle: {
    fontSize: professionalTheme.fontSize.xl,
    fontWeight: professionalTheme.fontWeight.bold,
    color: professionalTheme.colors.text.primary,
    marginTop: professionalTheme.spacing.lg,
    marginBottom: professionalTheme.spacing.md,
    textAlign: 'center',
  },
  actionDescription: {
    fontSize: professionalTheme.fontSize.md,
    color: professionalTheme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: professionalTheme.spacing.xl,
  },
  primaryButton: {
    backgroundColor: professionalTheme.colors.primary,
    borderRadius: professionalTheme.borderRadius.md,
    paddingVertical: professionalTheme.spacing.lg,
    paddingHorizontal: professionalTheme.spacing.xl * 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: professionalTheme.spacing.sm,
    shadowColor: professionalTheme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: professionalTheme.fontSize.md,
    fontWeight: professionalTheme.fontWeight.semibold,
    color: professionalTheme.colors.text.white,
  },
  disabledButton: {
    opacity: 0.6,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: professionalTheme.spacing.xs,
    backgroundColor: `${professionalTheme.colors.primary}10`,
    padding: professionalTheme.spacing.md,
    borderRadius: professionalTheme.borderRadius.md,
    marginBottom: professionalTheme.spacing.lg,
  },
  locationText: {
    fontSize: professionalTheme.fontSize.sm,
    color: professionalTheme.colors.text.primary,
    fontWeight: professionalTheme.fontWeight.medium,
  },
} as any);