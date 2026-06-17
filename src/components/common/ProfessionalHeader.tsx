import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { professionalTheme } from '../../theme/professional';

interface ProfessionalHeaderProps {
  title: string;
  subtitle?: string;
  onNotificationPress?: () => void;
}

export const ProfessionalHeader: React.FC<ProfessionalHeaderProps> = ({
  title,
  onNotificationPress,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.actions}>
        {onNotificationPress && (
          <TouchableOpacity onPress={onNotificationPress} style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={24} color={professionalTheme.colors.text.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: professionalTheme.spacing.lg,
  },
  title: {
    fontSize: professionalTheme.fontSize.xxl,
    fontWeight: professionalTheme.fontWeight.bold as '700',
    color: professionalTheme.colors.text.primary,
  },
  actions: {
    flexDirection: 'row',
    gap: professionalTheme.spacing.sm,
  },
  iconButton: {
    padding: professionalTheme.spacing.sm,
  },
});
