import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { professionalTheme } from '../theme/professional';
import { PasswordInput } from '../components/ui/PasswordInput';
import { ActivityLogService } from '../services/activityLogService';
import { useAuth } from '../hooks/AuthContext';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { AuthService } from '../services/authService';

export default function ChangePasswordScreen() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [showRequirements, setShowRequirements] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const { currentPassword, newPassword, confirmPassword } = formData;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return false;
    }

    // Password strength validation
    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return false;
    }

    if (!/[A-Z]/.test(newPassword)) {
      Alert.alert('Error', 'Password must contain at least one uppercase letter');
      return false;
    }

    if (!/[a-z]/.test(newPassword)) {
      Alert.alert('Error', 'Password must contain at least one lowercase letter');
      return false;
    }

    if (!/[0-9]/.test(newPassword)) {
      Alert.alert('Error', 'Password must contain at least one number');
      return false;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      Alert.alert('Error', 'Password must contain at least one special character (!@#$%^&*...)');
      return false;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const user = AuthService.getCurrentUser();
      if (!user || !user.email) {
        throw new Error('No user logged in');
      }

      // Re-authenticate user with current password
      const credential = EmailAuthProvider.credential(user.email, formData.currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update to new password
      await updatePassword(user, formData.newPassword);
      
      if (user) {
        await ActivityLogService.logActivity(
          'Password Changed',
          user.uid,
          user.email,
          'expert',
          'User changed their password'
        );
      }
      
      Alert.alert(
        'Password Changed',
        'Your password has been updated successfully!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      console.error('Password change error:', error);
      let errorMessage = 'Failed to change password. Please try again.';
      
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = 'Current password is incorrect';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'New password is too weak';
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Please log out and log in again before changing password';
      }
      
      Alert.alert('Error', errorMessage);
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
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>Update your password to keep your account secure</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Current Password *</Text>
          <TextInput
            style={styles.input}
            value={formData.currentPassword}
            onChangeText={(value) => handleInputChange('currentPassword', value)}
            placeholder="Enter your current password"
            secureTextEntry
            placeholderTextColor={professionalTheme.colors.text.muted}
          />
        </View>

        <PasswordInput
          label="New Password *"
          value={formData.newPassword}
          onChangeText={(value) => handleInputChange('newPassword', value)}
          placeholder="Enter new password"
          showRequirements={showRequirements}
          onFocus={() => setShowRequirements(true)}
          onBlur={() => setShowRequirements(false)}
        />

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirm New Password *</Text>
          <TextInput
            style={styles.input}
            value={formData.confirmPassword}
            onChangeText={(value) => handleInputChange('confirmPassword', value)}
            placeholder="Confirm your new password"
            secureTextEntry
            placeholderTextColor={professionalTheme.colors.text.muted}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Changing Password...' : 'Change Password'}
          </Text>
        </TouchableOpacity>
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: professionalTheme.spacing.lg,
    paddingTop: professionalTheme.spacing.xl,
  },
  subtitle: {
    fontSize: professionalTheme.fontSize.sm,
    color: professionalTheme.colors.text.secondary,
    marginBottom: professionalTheme.spacing.xl,
    textAlign: 'center',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  submitButton: {
    backgroundColor: professionalTheme.colors.primary,
    borderRadius: professionalTheme.borderRadius.md,
    paddingVertical: professionalTheme.spacing.lg,
    alignItems: 'center',
    marginTop: professionalTheme.spacing.xl,
  },
  submitButtonText: {
    color: professionalTheme.colors.text.white,
    fontSize: professionalTheme.fontSize.md,
    fontWeight: professionalTheme.fontWeight.semibold,
  },
  disabledButton: {
    opacity: 0.5,
  },
} as any);