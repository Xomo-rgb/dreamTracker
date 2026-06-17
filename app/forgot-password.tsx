import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Input } from '../src/components/ui/Input';
import { Button } from '../src/components/ui/Button';
import { professionalTheme } from '../src/theme/professional';
import { AuthService } from '../src/services/authService';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const result = await AuthService.sendPasswordResetEmail(email.trim());
      
      if (result.success) {
        Alert.alert(
          'Success',
          'Password reset email sent! Check your inbox and follow the instructions.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to send reset email');
        console.log('Password reset error:', result.error);
      }
    } catch (error: any) {
      console.error('Password reset error:', error);
      Alert.alert('Error', error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>
          Enter your email address and we'll send you a link to reset your password
        </Text>

        <Input
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <Button
          title={loading ? 'Sending...' : 'Send Reset Link'}
          onPress={handleResetPassword}
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
});
