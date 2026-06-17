import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { professionalTheme } from '../theme/professional';
import { ActivityLogService } from '../services/activityLogService';
import { useAuth } from '../hooks/AuthContext';

export default function EditProfileScreen() {
  const { user, updateUserProfile } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.startsWith('0')) {
      const localNumber = cleaned.substring(1);
      if (localNumber.startsWith('8') || localNumber.startsWith('9') || 
          localNumber.startsWith('1') || localNumber.startsWith('2')) {
        return `+265${localNumber}`;
      }
    }
    
    if (cleaned.startsWith('265')) {
      return `+${cleaned}`;
    }
    
    if (cleaned.startsWith('+265')) {
      return cleaned;
    }
    
    return phone;
  };

  const handleSave = async () => {
    if (!formData.firstName || !formData.lastName || !formData.phone) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = formatPhoneNumber(formData.phone);
      
      await updateUserProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formattedPhone,
      });

      if (user) {
        await ActivityLogService.logActivity(
          'Profile Updated',
          user.uid,
          `${formData.firstName} ${formData.lastName}`,
          user.role,
          'User updated their profile information'
        );
      }

      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
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
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
        <View style={styles.section}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.emailDisplay}>{user?.email}</Text>
            <Text style={styles.helperText}>Email cannot be changed</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>First Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.firstName}
              onChangeText={(value) => handleInputChange('firstName', value)}
              placeholder="Enter your first name"
              placeholderTextColor={professionalTheme.colors.text.muted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Last Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.lastName}
              onChangeText={(value) => handleInputChange('lastName', value)}
              placeholder="Enter your last name"
              placeholderTextColor={professionalTheme.colors.text.muted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              placeholderTextColor={professionalTheme.colors.text.muted}
            />
            <Text style={styles.helperText}>Format: 0999123456 or +265999123456</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.disabledButton]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  },
  scrollContent: {
    paddingHorizontal: professionalTheme.spacing.lg,
    paddingBottom: professionalTheme.spacing.xl,
  },
  section: {
    marginVertical: professionalTheme.spacing.lg,
  },
  inputGroup: {
    marginBottom: professionalTheme.spacing.lg,
  },
  label: {
    fontSize: professionalTheme.fontSize.sm,
    fontWeight: professionalTheme.fontWeight.medium,
    color: professionalTheme.colors.text.primary,
    marginBottom: professionalTheme.spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: professionalTheme.colors.border,
    borderRadius: professionalTheme.borderRadius.md,
    padding: professionalTheme.spacing.lg,
    fontSize: professionalTheme.fontSize.md,
    color: professionalTheme.colors.text.primary,
    backgroundColor: professionalTheme.colors.background.card,
  },
  emailDisplay: {
    fontSize: professionalTheme.fontSize.md,
    color: professionalTheme.colors.text.secondary,
    padding: professionalTheme.spacing.lg,
    backgroundColor: professionalTheme.colors.background.light,
    borderRadius: professionalTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: professionalTheme.colors.border,
  },
  helperText: {
    fontSize: professionalTheme.fontSize.xs,
    color: professionalTheme.colors.text.muted,
    marginTop: professionalTheme.spacing.xs,
  },
  saveButton: {
    backgroundColor: professionalTheme.colors.primary,
    borderRadius: professionalTheme.borderRadius.md,
    paddingVertical: professionalTheme.spacing.lg,
    alignItems: 'center',
    marginVertical: professionalTheme.spacing.xl,
  },
  saveButtonText: {
    color: professionalTheme.colors.text.white,
    fontSize: professionalTheme.fontSize.md,
    fontWeight: professionalTheme.fontWeight.semibold,
  },
  disabledButton: {
    opacity: 0.5,
  },
} as any);
