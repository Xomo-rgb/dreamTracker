import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { professionalTheme } from '../../theme/professional';

interface PasswordInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  showRequirements?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  showRequirements = false,
  onFocus,
  onBlur,
}) => {
  const requirements = [
    { text: 'At least 8 characters', test: (pwd: string) => pwd.length >= 8 },
    { text: 'One uppercase letter (A-Z)', test: (pwd: string) => /[A-Z]/.test(pwd) },
    { text: 'One lowercase letter (a-z)', test: (pwd: string) => /[a-z]/.test(pwd) },
    { text: 'One number (0-9)', test: (pwd: string) => /[0-9]/.test(pwd) },
    { text: 'One special character (!@#$%...)', test: (pwd: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry
        placeholderTextColor={professionalTheme.colors.text.muted}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      
      {showRequirements && value.length > 0 && (
        <View style={styles.requirementsBox}>
          {requirements.map((req, index) => {
            const isMet = req.test(value);
            return (
              <View key={index} style={styles.requirementRow}>
                <Ionicons
                  name={isMet ? 'checkmark-circle' : 'close-circle'}
                  size={16}
                  color={isMet ? professionalTheme.colors.status.success : professionalTheme.colors.text.muted}
                />
                <Text style={[styles.requirementText, isMet && styles.requirementMet]}>
                  {req.text}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  requirementsBox: {
    marginTop: professionalTheme.spacing.sm,
    padding: professionalTheme.spacing.sm,
    backgroundColor: professionalTheme.colors.background.light,
    borderRadius: professionalTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: professionalTheme.colors.border,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  requirementText: {
    fontSize: professionalTheme.fontSize.xs,
    color: professionalTheme.colors.text.muted,
    marginLeft: professionalTheme.spacing.xs,
  },
  requirementMet: {
    color: professionalTheme.colors.status.success,
    fontWeight: professionalTheme.fontWeight.medium,
  },
} as any);
