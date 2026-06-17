import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { theme } from '../../theme';
import { Patient } from '../../types';

interface PatientCardProps {
  patient: Patient;
  onPress: () => void;
}

export const PatientCard: React.FC<PatientCardProps> = ({ patient, onPress }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return theme.colors.status.error;
      case 'Medium': return theme.colors.status.warning;
      case 'Low': return theme.colors.primary;
      case 'Completed': return theme.colors.status.success;
      default: return theme.colors.text.muted;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: `${theme.colors.primary}20` }]}>
              <Text style={styles.avatarText}>{getInitials(patient.name)}</Text>
            </View>
            <View style={styles.patientInfo}>
              <Text style={styles.name}>{patient.name}</Text>
              <Text style={styles.age}>Age: {patient.age}</Text>
            </View>
          </View>
          <View style={[styles.priorityBadge, { backgroundColor: `${getPriorityColor(patient.priority)}20` }]}>
            <Text style={[styles.priorityText, { color: getPriorityColor(patient.priority) }]}>
              {patient.priority}
            </Text>
          </View>
        </View>
        
        <Text style={styles.condition}>{patient.visitReason || patient.condition || 'No reason specified'}</Text>
        
        <View style={styles.footer}>
          <View style={styles.dateContainer}>
            <Ionicons
              name={patient.isActive ? 'time-outline' : 'checkmark-circle'}
              size={16}
              color={theme.colors.text.muted}
            />
            <Text style={styles.dateText}>{patient.assignedDate}</Text>
          </View>
          {patient.isActive && (
            <Ionicons
              name="chevron-forward"
              size={16}
              color={theme.colors.text.muted}
            />
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  avatarText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  patientInfo: {
    flex: 1,
  },
  name: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  age: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text.muted,
  },
  priorityBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: 999,
  },
  priorityText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
  },
  condition: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text.muted,
    marginLeft: theme.spacing.xs,
  },
} as any);