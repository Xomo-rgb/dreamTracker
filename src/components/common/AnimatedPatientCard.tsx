import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Patient } from '../../services/patientService';
import { professionalTheme } from '../../theme/professional';

interface AnimatedPatientCardProps {
  patient: Patient;
  index: number;
  onPress: (patient: Patient) => void;
  getPriorityColor: (priority: string) => string;
}

export const AnimatedPatientCard: React.FC<AnimatedPatientCardProps> = ({
  patient,
  index,
  onPress,
  getPriorityColor,
}) => {
  const priority = (patient as any).priority as string | undefined;
  const initials = patient.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(patient)}
      activeOpacity={0.7}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <View style={styles.patientInfo}>
        <Text style={styles.patientName}>{patient.name}</Text>
        <Text style={styles.patientCondition}>{patient.visitReason}</Text>
      </View>
      {priority && (
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(priority) }]}>
          <Text style={styles.priorityText}>{priority}</Text>
        </View>
      )}
    </TouchableOpacity>
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
    shadowColor: professionalTheme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: professionalTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: professionalTheme.spacing.md,
  },
  avatarText: {
    fontSize: professionalTheme.fontSize.sm,
    fontWeight: professionalTheme.fontWeight.bold as '700',
    color: '#ffffff',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: professionalTheme.fontSize.md,
    fontWeight: professionalTheme.fontWeight.semibold as '600',
    color: professionalTheme.colors.text.primary,
    marginBottom: 4,
  },
  patientCondition: {
    fontSize: professionalTheme.fontSize.sm,
    color: professionalTheme.colors.text.secondary,
    marginBottom: 2,
  },
  patientDate: {
    fontSize: professionalTheme.fontSize.xs,
    color: professionalTheme.colors.text.muted,
  },
  priorityBadge: {
    paddingHorizontal: professionalTheme.spacing.md,
    paddingVertical: professionalTheme.spacing.xs,
    borderRadius: professionalTheme.borderRadius.md,
  },
  priorityText: {
    fontSize: professionalTheme.fontSize.xs,
    fontWeight: professionalTheme.fontWeight.medium as '500',
    color: professionalTheme.colors.text.white,
  },
});
