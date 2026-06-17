import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { professionalTheme } from '../theme/professional';
import { Patient, PatientService } from '../services/patientService';
import { AssignmentService } from '../services/assignmentService';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/authService';

interface Expert {
  id: string;
  name: string;
  email: string;
}

export default function AssignPatientScreen() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [visitReason, setVisitReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [patientsData, expertsData] = await Promise.all([
        PatientService.getAllPatients(),
        loadExperts()
      ]);
      setPatients(patientsData);
      setExperts(expertsData);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadExperts = async (): Promise<Expert[]> => {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      return snapshot.docs
        .filter(doc => doc.data().role === 'expert')
        .map(doc => {
          const data = doc.data();
          const fullName = data.firstName && data.lastName 
            ? `${data.firstName} ${data.lastName}`
            : data.name || data.email;
          return {
            id: doc.id,
            name: fullName,
            email: data.email
          };
        });
    } catch (error) {
      console.error('Error loading experts:', error);
      return [];
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(patientSearch.toLowerCase())
  );

  const handleAssign = async () => {
    if (!selectedPatient || !selectedExpert || !visitReason.trim()) {
      Alert.alert('Missing Information', 'Please select patient, expert, and enter visit reason');
      return;
    }

    setSubmitting(true);
    try {
      await AssignmentService.createAssignment({
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        expertId: selectedExpert.id,
        expertName: selectedExpert.name,
        visitReason: visitReason.trim(),
        priority: selectedPriority,
        assignedDate: new Date().toISOString(),
        status: 'pending'
      });

      Alert.alert('Success', 'Patient assigned successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error assigning patient:', error);
      Alert.alert('Error', 'Failed to assign patient');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={professionalTheme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assign Patient</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Select Patient */}
        <Text style={styles.sectionTitle}>Select Patient</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search patients..."
          value={patientSearch}
          onChangeText={setPatientSearch}
          placeholderTextColor={professionalTheme.colors.text.muted}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {filteredPatients.map(patient => (
            <TouchableOpacity
              key={patient.id}
              style={[styles.card, selectedPatient?.id === patient.id && styles.selectedCard]}
              onPress={() => setSelectedPatient(patient)}
            >
              <Text style={styles.cardTitle}>{patient.name}</Text>
              <Text style={styles.cardSubtitle}>{patient.age} years old</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Select Expert */}
        <Text style={styles.sectionTitle}>Select Expert</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {experts.map(expert => (
            <TouchableOpacity
              key={expert.id}
              style={[styles.card, selectedExpert?.id === expert.id && styles.selectedCard]}
              onPress={() => setSelectedExpert(expert)}
            >
              <Text style={styles.cardTitle}>{expert.name}</Text>
              <Text style={styles.cardSubtitle}>{expert.email}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Priority */}
        <Text style={styles.sectionTitle}>Priority</Text>
        <View style={styles.priorityContainer}>
          {(['Low', 'Medium', 'High'] as const).map(priority => (
            <TouchableOpacity
              key={priority}
              style={[styles.priorityButton, selectedPriority === priority && styles.selectedPriority]}
              onPress={() => setSelectedPriority(priority)}
            >
              <Text style={[styles.priorityText, selectedPriority === priority && styles.selectedPriorityText]}>
                {priority}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Visit Reason */}
        <Text style={styles.sectionTitle}>Visit Reason</Text>
        <View style={styles.reasonContainer}>
          {['Routine Checkup', 'Follow-up', 'Emergency', 'Consultation', 'Missed Appointment'].map(reason => (
            <TouchableOpacity
              key={reason}
              style={[styles.reasonChip, visitReason === reason && styles.selectedChip]}
              onPress={() => setVisitReason(reason)}
            >
              <Text style={[styles.reasonText, visitReason === reason && styles.selectedReasonText]}>
                {reason}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Assign Button */}
        <TouchableOpacity
          style={[styles.assignButton, submitting && styles.disabledButton]}
          onPress={handleAssign}
          disabled={submitting}
        >
          <Text style={styles.assignButtonText}>
            {submitting ? 'Assigning...' : 'Assign Patient'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: professionalTheme.colors.border,
  },
  backButton: {
    padding: professionalTheme.spacing.xs,
  },
  headerTitle: {
    fontSize: professionalTheme.fontSize.xl,
    fontWeight: professionalTheme.fontWeight.bold,
    color: professionalTheme.colors.text.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: professionalTheme.spacing.lg,
    paddingTop: professionalTheme.spacing.lg,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: professionalTheme.spacing.xxl,
    fontSize: professionalTheme.fontSize.md,
    color: professionalTheme.colors.text.secondary,
  },
  searchInput: {
    backgroundColor: professionalTheme.colors.background.card,
    borderRadius: professionalTheme.borderRadius.lg,
    paddingHorizontal: professionalTheme.spacing.lg,
    paddingVertical: professionalTheme.spacing.md,
    fontSize: professionalTheme.fontSize.md,
    color: professionalTheme.colors.text.primary,
    borderWidth: 1,
    borderColor: professionalTheme.colors.border,
    marginBottom: professionalTheme.spacing.md,
  },
  sectionTitle: {
    fontSize: professionalTheme.fontSize.lg,
    fontWeight: professionalTheme.fontWeight.semibold,
    color: professionalTheme.colors.text.primary,
    marginTop: professionalTheme.spacing.lg,
    marginBottom: professionalTheme.spacing.md,
  },
  horizontalScroll: {
    marginBottom: professionalTheme.spacing.md,
  },
  card: {
    backgroundColor: professionalTheme.colors.background.card,
    borderRadius: professionalTheme.borderRadius.lg,
    padding: professionalTheme.spacing.lg,
    marginRight: professionalTheme.spacing.md,
    borderWidth: 2,
    borderColor: professionalTheme.colors.border,
    minWidth: 150,
  },
  selectedCard: {
    borderColor: professionalTheme.colors.primary,
    backgroundColor: `${professionalTheme.colors.primary}10`,
  },
  cardTitle: {
    fontSize: professionalTheme.fontSize.md,
    fontWeight: professionalTheme.fontWeight.semibold,
    color: professionalTheme.colors.text.primary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: professionalTheme.fontSize.sm,
    color: professionalTheme.colors.text.secondary,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: professionalTheme.spacing.md,
    marginBottom: professionalTheme.spacing.md,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: professionalTheme.spacing.md,
    borderRadius: professionalTheme.borderRadius.lg,
    borderWidth: 2,
    borderColor: professionalTheme.colors.border,
    alignItems: 'center',
  },
  selectedPriority: {
    borderColor: professionalTheme.colors.primary,
    backgroundColor: professionalTheme.colors.primary,
  },
  priorityText: {
    fontSize: professionalTheme.fontSize.md,
    fontWeight: professionalTheme.fontWeight.semibold,
    color: professionalTheme.colors.text.secondary,
  },
  selectedPriorityText: {
    color: professionalTheme.colors.text.white,
  },
  reasonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: professionalTheme.spacing.sm,
    marginBottom: professionalTheme.spacing.md,
  },
  reasonChip: {
    paddingHorizontal: professionalTheme.spacing.lg,
    paddingVertical: professionalTheme.spacing.sm,
    borderRadius: professionalTheme.borderRadius.xl,
    borderWidth: 1,
    borderColor: professionalTheme.colors.border,
    backgroundColor: professionalTheme.colors.background.card,
  },
  selectedChip: {
    backgroundColor: professionalTheme.colors.primary,
    borderColor: professionalTheme.colors.primary,
  },
  reasonText: {
    fontSize: professionalTheme.fontSize.sm,
    color: professionalTheme.colors.text.secondary,
  },
  selectedReasonText: {
    color: professionalTheme.colors.text.white,
    fontWeight: professionalTheme.fontWeight.semibold,
  },
  assignButton: {
    backgroundColor: professionalTheme.colors.primary,
    borderRadius: professionalTheme.borderRadius.lg,
    paddingVertical: professionalTheme.spacing.lg,
    alignItems: 'center',
    marginTop: professionalTheme.spacing.xl,
    marginBottom: professionalTheme.spacing.xxl,
  },
  disabledButton: {
    opacity: 0.5,
  },
  assignButtonText: {
    fontSize: professionalTheme.fontSize.md,
    fontWeight: professionalTheme.fontWeight.bold,
    color: professionalTheme.colors.text.white,
  },
} as any);
