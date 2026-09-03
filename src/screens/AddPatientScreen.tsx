import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PatientService } from '../services/patientService';
import { ActivityLogService } from '../services/activityLogService';
import { professionalTheme } from '../theme/professional';
import { useAuth } from '../hooks/AuthContext';

export default function AddPatientScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    gender: 'Female',
    phone: '',
    email: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    maritalStatus: 'Single',
  });

  const calculateAge = (dob: string) => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handlePhoneChange = (text: string) => {
    let cleaned = text.replace(/[^0-9+]/g, '');
    // If starts with +265 and has a 0 after it, remove the 0
    if (cleaned.startsWith('+2650')) {
      cleaned = '+265' + cleaned.substring(5);
    }
    // If starts with 0 and has 10 digits (local format), convert to +265 format
    else if (cleaned.startsWith('0') && cleaned.length === 10) {
      cleaned = '+265' + cleaned.substring(1);
    }
    // If starts with 0 but less than 10 digits, keep as is (still typing)
    else if (cleaned.startsWith('0') && cleaned.length < 10) {
      // Keep as is, user still typing
    }
    // If just 9 digits (without leading 0), add +265
    else if (!cleaned.startsWith('+') && !cleaned.startsWith('0') && cleaned.length === 9) {
      cleaned = '+265' + cleaned;
    }
    setFormData({ ...formData, phone: cleaned });
  };

  const handleEmergencyPhoneChange = (text: string) => {
    let cleaned = text.replace(/[^0-9+]/g, '');
    // If starts with +265 and has a 0 after it, remove the 0
    if (cleaned.startsWith('+2650')) {
      cleaned = '+265' + cleaned.substring(5);
    }
    // If starts with 0 and has 10 digits (local format), convert to +265 format
    else if (cleaned.startsWith('0') && cleaned.length === 10) {
      cleaned = '+265' + cleaned.substring(1);
    }
    // If starts with 0 but less than 10 digits, keep as is (still typing)
    else if (cleaned.startsWith('0') && cleaned.length < 10) {
      // Keep as is, user still typing
    }
    // If just 9 digits (without leading 0), add +265
    else if (!cleaned.startsWith('+') && !cleaned.startsWith('0') && cleaned.length === 9) {
      cleaned = '+265' + cleaned;
    }
    setFormData({ ...formData, emergencyContactPhone: cleaned });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      setFormData({ ...formData, dateOfBirth: `${year}-${month}-${day}` });
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.dateOfBirth) {
      Alert.alert('Error', 'Please fill in name and date of birth');
      return;
    }

    setLoading(true);
    try {
      // Check for duplicates by phone or email
      const allPatients = await PatientService.getAllPatients();
      
      if (formData.phone) {
        const duplicatePhone = allPatients.find(p => p.phone === formData.phone);
        if (duplicatePhone) {
          Alert.alert('Duplicate Found', `A patient with phone number ${formData.phone} already exists: ${duplicatePhone.name}`);
          setLoading(false);
          return;
        }
      }
      
      if (formData.email) {
        const duplicateEmail = allPatients.find(p => p.email === formData.email);
        if (duplicateEmail) {
          Alert.alert('Duplicate Found', `A patient with email ${formData.email} already exists: ${duplicateEmail.name}`);
          setLoading(false);
          return;
        }
      }

      const age = calculateAge(formData.dateOfBirth);
      await PatientService.addPatient({
        name: formData.name,
        age: age,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        emergencyContact: `${formData.emergencyContactName} - ${formData.emergencyContactPhone}`,
        maritalStatus: formData.maritalStatus,
      });
      
      if (user) {
        await ActivityLogService.logActivity(
          'Patient Added',
          user.uid,
          `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
          user.role,
          `Added new patient: ${formData.name}`
        );
      }
      
      Alert.alert('Success', 'Patient added successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error adding patient:', error);
      Alert.alert('Error', 'Failed to add patient');
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
        <Text style={styles.headerTitle}>Add New Patient</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formSection}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="Enter patient name"
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Date of Birth *</Text>
          <View style={styles.dateInputContainer}>
            <TextInput
              style={[styles.input, styles.dateInput]}
              value={formData.dateOfBirth}
              onChangeText={(text) => setFormData({ ...formData, dateOfBirth: text })}
              placeholder="YYYY-MM-DD"
            />
            <TouchableOpacity 
              style={styles.calendarButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={24} color={professionalTheme.colors.primary} />
            </TouchableOpacity>
          </View>
          {formData.dateOfBirth && (
            <Text style={styles.ageHint}>Age: {calculateAge(formData.dateOfBirth)} years</Text>
          )}
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={formData.dateOfBirth ? new Date(formData.dateOfBirth) : new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}

        <View style={styles.formSection}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.radioGroup}>
            {['Female', 'Male'].map((gender) => (
              <TouchableOpacity
                key={gender}
                style={styles.radioOption}
                onPress={() => setFormData({ ...formData, gender })}
              >
                <View style={styles.radioCircle}>
                  {formData.gender === gender && <View style={styles.radioSelected} />}
                </View>
                <Text style={styles.radioLabel}>{gender}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={formData.phone}
            onChangeText={handlePhoneChange}
            placeholder="+265 991 234 567"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            placeholder="patient@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
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
          <Text style={styles.label}>Emergency Contact Name</Text>
          <TextInput
            style={styles.input}
            value={formData.emergencyContactName}
            onChangeText={(text) => setFormData({ ...formData, emergencyContactName: text })}
            placeholder="Enter contact name"
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Emergency Contact Phone</Text>
          <TextInput
            style={styles.input}
            value={formData.emergencyContactPhone}
            onChangeText={handleEmergencyPhoneChange}
            placeholder="Enter contact phone"
            keyboardType="phone-pad"
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
          <Text style={styles.saveButtonText}>{loading ? 'Adding...' : 'Add Patient'}</Text>
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
    paddingTop: professionalTheme.spacing.lg,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
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
  ageHint: {
    fontSize: professionalTheme.fontSize.sm,
    color: professionalTheme.colors.primary,
    marginTop: professionalTheme.spacing.xs,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: professionalTheme.spacing.sm,
  },
  dateInput: {
    flex: 1,
  },
  calendarButton: {
    backgroundColor: professionalTheme.colors.background.card,
    borderRadius: professionalTheme.borderRadius.md,
    padding: professionalTheme.spacing.md,
    borderWidth: 1,
    borderColor: professionalTheme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
} as any);
