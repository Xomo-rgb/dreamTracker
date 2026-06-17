import React from 'react';
import { StyleSheet, View } from 'react-native';
import { professionalTheme } from '../../theme/professional';

export const PatientCardSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <View style={styles.titleSkeleton} />
        <View style={styles.subtitleSkeleton} />
        <View style={styles.dateSkeleton} />
      </View>
      <View style={styles.badgeSkeleton} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: professionalTheme.colors.background.card,
    borderRadius: professionalTheme.borderRadius.lg,
    padding: professionalTheme.spacing.lg,
    marginBottom: professionalTheme.spacing.md,
    borderWidth: 1,
    borderColor: professionalTheme.colors.border,
  },
  leftSection: {
    flex: 1,
  },
  titleSkeleton: {
    width: '60%',
    height: 16,
    backgroundColor: professionalTheme.colors.border,
    borderRadius: professionalTheme.borderRadius.sm,
    marginBottom: 8,
  },
  subtitleSkeleton: {
    width: '80%',
    height: 14,
    backgroundColor: professionalTheme.colors.border,
    borderRadius: professionalTheme.borderRadius.sm,
    marginBottom: 6,
  },
  dateSkeleton: {
    width: '40%',
    height: 12,
    backgroundColor: professionalTheme.colors.border,
    borderRadius: professionalTheme.borderRadius.sm,
  },
  badgeSkeleton: {
    width: 60,
    height: 24,
    backgroundColor: professionalTheme.colors.border,
    borderRadius: professionalTheme.borderRadius.md,
  },
});
