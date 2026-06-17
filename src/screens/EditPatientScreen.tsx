import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { professionalTheme } from '../theme/professional';
import { PatientService } from '../services/patientService';
import { ActivityLogService } from '../services/activityLogService';
import { useAuth } from '../hooks/AuthContext';

export default function EditPatientScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    address: '',
    emergencyContact: '',
    maritalStatus: 'Single',
  });

  useEffect(() => {
    loadPatientData();
  }, []);

  const loadPatientData = async () => {
    try {
      const patientId = params.id as string;
      const patient = await PatientService.getPatientById(patientId);
      if (patient) {
        setFormData({
          phone: patient.phone || '',
          email: patient.email || '',
          address: patient.address || '',
          emergencyContact: patient.emergencyContact || '',
          maritalStatus: patient.maritalStatus || 'Single',
        });
      }
    } catch (error) {
      console.error('Error loading patient:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const patientId = params.id as string;
      await PatientService.updatePatientInfo(patientId, formData);
      
      if (user) {
        await ActivityLogService.logActivity(
          'Patient Updated',
          user.uid,
          `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
          user.role,
          `Updated patient information: ${params.name}`
        );
      }
      
      Alert.alert('Success', 'Patient information updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error updating patient:', error);
      Alert.alert('Error', 'Failed to update patient information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={professionalTheme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Patient</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.patientName}>{params.name}</Text>

        <View style={styles.formSection}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            placeholder="+265 991 234 567"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Email Address (Cannot be changed)</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={formData.email}
            editable={false}
            placeholder="patient@email.com"
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.address}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
            placeholder="123 Main St, City, State 12345"
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Emergency Contact</Text>
          <TextInput
            style={styles.input}
            value={formData.emergencyContact}
            onChangeText={(text) => setFormData({ ...formData, emergencyContact: text })}
            placeholder="Name - Phone Number"
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Marital Status</Text>
          <View style={styles.radioGroup}>
            {['Single', 'Married', 'Divorced', 'Widowed'].map((status) => (
              <TouchableOpacity
                key={status}
                style={styles.radioOption}
                onPress={() => setFormData({ ...formData, maritalStatus: status })}
              >
                <View style={styles.radioCircle}>
                  {formData.maritalStatus === status && <View style={styles.radioSelected} />}
                </View>
                <Text style={styles.radioLabel}>{status}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.disabledButton]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>{loading ? 'Saving...' : 'Save Changes'}</Text>
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
    backgroundColor: professionalTheme.colors.background.main,
    borderBottomWidth: 1,
    borderBottomColor: professionalTheme.colors.border,
  },
  backButton: {
    padding: professionalTheme.spacing.sm,
  },
  headerTitle: {
    fontSize: professionalTheme.fontSize.lg,
    fontWeight: professionalTheme.fontWeight.semibold as '600',
    color: professionalTheme.colors.text.primary,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: professionalTheme.spacing.lg,
  },
  patientName: {
    fontSize: professionalTheme.fontSize.xxl,
    fontWeight: professionalTheme.fontWeight.bold as '700',
    color: professionalTheme.colors.text.primary,
    marginVertical: professionalTheme.spacing.lg,
  },
  formSection: {
    marginBottom: professionalTheme.spacing.lg,
  },
  label: {
    fontSize: professionalTheme.fontSize.sm,
    fontWeight: professionalTheme.fontWeight.medium as '500',
    color: professionalTheme.colors.text.primary,
    marginBottom: professionalTheme.spacing.sm,
  },
  input: {
    backgroundColor: professionalTheme.colors.background.card,
    borderRadius: professionalTheme.borderRadius.md,
    padding: professionalTheme.spacing.md,
    fontSize: professionalTheme.fontSize.md,
    color: professionalTheme.colors.text.primary,
    borderWidth: 1,
    borderColor: professionalTheme.colors.border,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  radioGroup: {
    gap: professionalTheme.spacing.sm,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: professionalTheme.spacing.sm,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: professionalTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: professionalTheme.spacing.sm,
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: professionalTheme.colors.primary,
  },
  radioLabel: {
    fontSize: professionalTheme.fontSize.md,
    color: professionalTheme.colors.text.primary,
  },
  saveButton: {
    backgroundColor: professionalTheme.colors.primary,
    borderRadius: professionalTheme.borderRadius.md,
    paddingVertical: professionalTheme.spacing.lg,
    alignItems: 'center',
    marginVertical: professionalTheme.spacing.xl,
  },
  saveButtonText: {
    fontSize: professionalTheme.fontSize.md,
    fontWeight: professionalTheme.fontWeight.semibold as '600',
    color: professionalTheme.colors.text.white,
  },
  disabledButton: {
    opacity: 0.6,
  },
  disabledInput: {
    backgroundColor: professionalTheme.colors.background.light,
    color: professionalTheme.colors.text.muted,
  },
} as any);
