import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { gamifiedTheme } from '../../theme/gamified';
import { Patient } from '../../types';

interface GamifiedPatientCardProps {
  patient: Patient;
  rank?: number;
  isCurrentUser?: boolean;
  onPress: () => void;
  onFollowPress?: () => void;
}

export const GamifiedPatientCard: React.FC<GamifiedPatientCardProps> = ({
  patient,
  rank,
  isCurrentUser = false,
  onPress,
  onFollowPress,
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return gamifiedTheme.colors.accent.red;
      case 'Medium': return gamifiedTheme.colors.accent.orange;
      case 'Low': return gamifiedTheme.colors.accent.blue;
      case 'Completed': return gamifiedTheme.colors.accent.green;
      default: return gamifiedTheme.colors.text.muted;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  const cardStyle = isCurrentUser 
    ? [styles.card, styles.currentUserCard]
    : styles.card;

  const textColor = isCurrentUser 
    ? gamifiedTheme.colors.text.white 
    : gamifiedTheme.colors.text.main;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View style={cardStyle}>
        <View style={styles.content}>
          {rank && (
            <View style={styles.rankContainer}>
              {isCurrentUser ? (
                <View style={styles.rankBadge}>
                  <Text style={styles.rankBadgeText}>{rank}</Text>
                </View>
              ) : (
                <Text style={[styles.rankNumber, { color: gamifiedTheme.colors.primary }]}>
                  {rank}
                </Text>
              )}
            </View>
          )}

          <View style={styles.avatarContainer}>
            <View style={[
              styles.avatar, 
              { backgroundColor: isCurrentUser ? 'rgba(255,255,255,0.2)' : `${gamifiedTheme.colors.primary}20` }
            ]}>
              <Text style={[
                styles.avatarText, 
                { color: isCurrentUser ? gamifiedTheme.colors.text.white : gamifiedTheme.colors.primary }
              ]}>
                {getInitials(patient.name)}
              </Text>
            </View>
          </View>

          <View style={styles.patientInfo}>
            <View style={styles.nameRow}>
              <Text style={[styles.name, { color: textColor }]}>
                {isCurrentUser ? 'You' : patient.name}
              </Text>
              {(patient.priority === 'High' || patient.priority === 'Completed') && (
                <Ionicons
                  name="trophy" as any
                  size={10}
                  color={isCurrentUser ? gamifiedTheme.colors.currency : gamifiedTheme.colors.primary}
                />
              )}
            </View>
            <Text style={[styles.condition, { color: isCurrentUser ? 'rgba(255,255,255,0.8)' : gamifiedTheme.colors.text.muted }]}>
              {patient.visitReason || patient.condition || 'No reason specified'}
            </Text>
          </View>

          <View style={styles.rightSection}>
            {!isCurrentUser && onFollowPress ? (
              <TouchableOpacity style={styles.followButton} onPress={onFollowPress}>
                <Text style={styles.followButtonText}>Follow</Text>
              </TouchableOpacity>
            ) : isCurrentUser ? (
              <Ionicons name="trophy" size={24} color={gamifiedTheme.colors.currency} />
            ) : (
              <View style={[styles.priorityBadge, { backgroundColor: `${getPriorityColor(patient.priority)}20` }]}>
                <Text style={[styles.priorityText, { color: getPriorityColor(patient.priority) }]}>
                  {patient.priority}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.dateContainer}>
            <Ionicons
              name={patient.isActive ? 'time-outline' : 'checkmark-circle'}
              size={14}
              color={isCurrentUser ? 'rgba(255,255,255,0.7)' : gamifiedTheme.colors.text.muted}
            />
            <Text style={[
              styles.dateText, 
              { color: isCurrentUser ? 'rgba(255,255,255,0.7)' : gamifiedTheme.colors.text.muted }
            ]}>
              {patient.assignedDate}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: gamifiedTheme.colors.background.main,
    borderRadius: gamifiedTheme.borderRadius.lg,
    padding: gamifiedTheme.spacing.lg,
    marginBottom: gamifiedTheme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  currentUserCard: {
    backgroundColor: gamifiedTheme.colors.primary,
    marginHorizontal: -gamifiedTheme.spacing.lg,
    marginVertical: gamifiedTheme.spacing.md,
    borderRadius: gamifiedTheme.borderRadius.xl,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: gamifiedTheme.spacing.sm,
  },
  rankContainer: {
    width: 30,
    alignItems: 'center',
    marginRight: gamifiedTheme.spacing.md,
  },
  rankNumber: {
    fontSize: gamifiedTheme.fontSize.sm,
    fontWeight: gamifiedTheme.fontWeight.bold,
  },
  rankBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: gamifiedTheme.spacing.sm,
    paddingVertical: 4,
    borderRadius: gamifiedTheme.borderRadius.lg,
  },
  rankBadgeText: {
    fontSize: gamifiedTheme.fontSize.xs,
    fontWeight: gamifiedTheme.fontWeight.bold,
    color: gamifiedTheme.colors.text.white,
  },
  avatarContainer: {
    marginRight: gamifiedTheme.spacing.md,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: gamifiedTheme.fontSize.sm,
    fontWeight: gamifiedTheme.fontWeight.bold,
  },
  patientInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: gamifiedTheme.fontSize.sm,
    fontWeight: gamifiedTheme.fontWeight.bold,
  },
  condition: {
    fontSize: gamifiedTheme.fontSize.xs,
    marginTop: 2,
  },
  rightSection: {
    alignItems: 'center',
  },
  followButton: {
    backgroundColor: gamifiedTheme.colors.primary,
    paddingHorizontal: gamifiedTheme.spacing.lg,
    paddingVertical: gamifiedTheme.spacing.sm,
    borderRadius: gamifiedTheme.borderRadius.md,
  },
  followButtonText: {
    color: gamifiedTheme.colors.text.white,
    fontSize: gamifiedTheme.fontSize.xs,
    fontWeight: gamifiedTheme.fontWeight.bold,
  },
  priorityBadge: {
    paddingHorizontal: gamifiedTheme.spacing.md,
    paddingVertical: gamifiedTheme.spacing.xs,
    borderRadius: gamifiedTheme.borderRadius.full,
  },
  priorityText: {
    fontSize: gamifiedTheme.fontSize.xs,
    fontWeight: gamifiedTheme.fontWeight.medium,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: gamifiedTheme.fontSize.xs,
  },
} as any);