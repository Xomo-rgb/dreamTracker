import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../src/components/ui/Button';
import { Input } from '../src/components/ui/Input';
import { PasswordInput } from '../src/components/ui/PasswordInput';
import { useAuth } from '../src/hooks/AuthContext';
import { AuthService } from '../src/services/authService';
import { professionalTheme } from '../src/theme/professional';

export default function RegisterScreen() {
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const isAdminCreating = params.admin === 'true';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'expert'>('expert');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      let result;
      
      if (isAdminCreating) {
        result = await AuthService.createUserByAdmin(email, password, selectedRole);
      } else {
        result = await AuthService.createUserWithEmailAndPassword(email, password);
      }
      
      if (result.success) {
        if (isAdminCreating) {
          Alert.alert('Success', 'User account created successfully. They can now log in and set up their profile.', [
            { text: 'OK', onPress: () => router.back() }
          ]);
        } else {
          Alert.alert('Success', 'Account created! Please complete your profile.', [
            { text: 'OK', onPress: () => router.replace({ pathname: '/user-profile-setup', params: { role: 'expert' } }) }
          ]);
        }
      } else {
        Alert.alert('Registration Failed', result.error || 'Unknown error');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create Account</Text>
        
        <Input
          label="Email"
          placeholder="Enter email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <PasswordInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter password"
          showRequirements={true}
        />

        <PasswordInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Re-enter password"
          showRequirements={false}
        />

        {isAdminCreating && (
          <View style={styles.roleSection}>
            <Text style={styles.roleLabel}>Select Role</Text>
            <View style={styles.roleButtons}>
              <TouchableOpacity
                style={[styles.roleButton, selectedRole === 'expert' && styles.selectedRole]}
                onPress={() => setSelectedRole('expert')}
              >
                <Text style={[styles.roleButtonText, selectedRole === 'expert' && styles.selectedRoleText]}>
                  Expert
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleButton, selectedRole === 'admin' && styles.selectedRole]}
                onPress={() => setSelectedRole('admin')}
              >
                <Text style={[styles.roleButtonText, selectedRole === 'admin' && styles.selectedRoleText]}>
                  Admin
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <Button
          title={loading ? 'Creating Account...' : 'Create Account'}
          onPress={handleRegister}
          disabled={loading}
          style={styles.button}
        />

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>Back to Login</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: professionalTheme.spacing.xl,
    paddingTop: professionalTheme.spacing.xxl,
  },
  title: {
    fontSize: professionalTheme.fontSize.xxl,
    fontWeight: professionalTheme.fontWeight.bold as '700',
    color: professionalTheme.colors.text.primary,
    marginBottom: professionalTheme.spacing.sm,
  },
  subtitle: {
    fontSize: professionalTheme.fontSize.md,
    color: professionalTheme.colors.text.secondary,
    marginBottom: professionalTheme.spacing.xl,
  },
  button: {
    marginTop: professionalTheme.spacing.lg,
  },
  backText: {
    fontSize: professionalTheme.fontSize.md,
    color: professionalTheme.colors.primary,
    textAlign: 'center',
    marginTop: professionalTheme.spacing.lg,
  },
  roleSection: {
    marginBottom: professionalTheme.spacing.lg,
  },
  roleLabel: {
    fontSize: professionalTheme.fontSize.sm,
    fontWeight: professionalTheme.fontWeight.medium,
    color: professionalTheme.colors.text.primary,
    marginBottom: professionalTheme.spacing.sm,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: professionalTheme.spacing.md,
  } as any,
  roleButton: {
    flex: 1,
    paddingVertical: professionalTheme.spacing.md,
    borderRadius: professionalTheme.borderRadius.lg,
    borderWidth: 2,
    borderColor: professionalTheme.colors.border,
    alignItems: 'center',
    backgroundColor: professionalTheme.colors.background.card,
  },
  selectedRole: {
    borderColor: professionalTheme.colors.primary,
    backgroundColor: professionalTheme.colors.primary,
  },
  roleButtonText: {
    fontSize: professionalTheme.fontSize.md,
    fontWeight: professionalTheme.fontWeight.semibold,
    color: professionalTheme.colors.text.secondary,
  },
  selectedRoleText: {
    color: professionalTheme.colors.text.white,
  },
} as any);
