import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ProfessionalHeader } from '../components/common/ProfessionalHeader';
import { professionalTheme } from '../theme/professional';
import { VisitService, Visit } from '../services/visitService';
import { PatientService, Patient } from '../services/patientService';
import { useAuth } from '../hooks/AuthContext';

export default function VisitsScreen() {
  const { user } = useAuth();
  const [assignedVisits, setAssignedVisits] = useState<Visit[]>([]);
  const [completedVisits, setCompletedVisits] = useState<Visit[]>([]);
  const [patients, setPatients] = useState<Record<string, Patient>>({});
  const [activeTab, setActiveTab] = useState<'assigned' | 'completed'>('assigned');

  useEffect(() => {
    if (user) {
      loadVisits(user.uid);
    }
  }, [user]);

  const loadVisits = async (expertId: string) => {
    try {
      const [assigned, completed] = await Promise.all([
        VisitService.getAssignedVisits(expertId),
        VisitService.getCompletedVisits(expertId)
      ]);

      setAssignedVisits(assigned);
      setCompletedVisits(completed);

      // Load patient data for all visits
      const allPatientIds = [...assigned, ...completed].map(v => v.patientId);
      const uniquePatientIds = [...new Set(allPatientIds)];
      
      const patientData: Record<string, Patient> = {};
      for (const patientId of uniquePatientIds) {
        const patient = await PatientService.getPatientById(patientId);
        if (patient) {
          patientData[patientId] = patient;
        }
      }
      setPatients(patientData);
    } catch (error) {
      console.error('Error loading visits:', error);
    }
  };

  const handleVisitPress = (visit: Visit) => {
    const patient = patients[visit.patientId];
    if (!patient) return;

    router.push({
      pathname: '/visit',
      params: {
        patientId: visit.patientId,
        visitId: visit.id,
        patientName: patient.name
      }
    });
  };

  const renderVisitCard = (visit: Visit) => {
    const patient = patients[visit.patientId];
    if (!patient) return null;

    const isCompleted = visit.status === 'completed';
    const statusColor = isCompleted 
      ? professionalTheme.colors.status.success 
      : professionalTheme.colors.status.warning;

    return (
      <TouchableOpacity
        key={visit.id}
        style={styles.visitCard}
        onPress={() => handleVisitPress(visit)}
      >
        <View style={styles.visitHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {patient.name.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>{patient.name}</Text>
              <Text style={styles.patientCondition}>{patient.visitReason || patient.condition || 'No reason specified'}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>
              {visit.status === 'assigned' ? 'Assigned' : 
               visit.status === 'checked_in' ? 'Checked In' : 'Completed'}
            </Text>
          </View>
        </View>

        <View style={styles.visitDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar" size={16} color={professionalTheme.colors.text.muted} />
            <Text style={styles.detailText}>Scheduled: {visit.scheduledDate}</Text>
          </View>
          
          {visit.checkInTime && (
            <View style={styles.detailRow}>
              <Ionicons name="time" size={16} color={professionalTheme.colors.text.muted} />
              <Text style={styles.detailText}>
                Check-in: {new Date(visit.checkInTime).toLocaleTimeString()}
              </Text>
            </View>
          )}

          {visit.visitDurationMinutes && (
            <View style={styles.detailRow}>
              <Ionicons name="stopwatch" size={16} color={professionalTheme.colors.text.muted} />
              <Text style={styles.detailText}>Duration: {visit.visitDurationMinutes} min</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Ionicons name="location" size={16} color={professionalTheme.colors.text.muted} />
            <Text style={styles.detailText}>{patient.address}</Text>
          </View>
        </View>

        <View style={styles.visitFooter}>
          <View style={styles.priorityContainer}>
            <View style={[styles.priorityDot, { 
              backgroundColor: patient.priority === 'High' 
                ? professionalTheme.colors.status.error 
                : patient.priority === 'Medium'
                ? professionalTheme.colors.status.warning
                : professionalTheme.colors.status.info
            }]} />
            <Text style={styles.priorityText}>{patient.priority} Priority</Text>
          </View>
          
          <Ionicons name="chevron-forward" size={20} color={professionalTheme.colors.text.muted} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ProfessionalHeader 
        title="My Visits" 
        subtitle="Assigned patient visits"
      />

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'assigned' && styles.activeTab]}
          onPress={() => setActiveTab('assigned')}
        >
          <Text style={[styles.tabText, activeTab === 'assigned' && styles.activeTabText]}>
            Assigned ({assignedVisits.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
            Completed ({completedVisits.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'assigned' ? (
          assignedVisits.length > 0 ? (
            assignedVisits.map(renderVisitCard)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={64} color={professionalTheme.colors.text.muted} />
              <Text style={styles.emptyTitle}>No Assigned Visits</Text>
              <Text style={styles.emptyText}>You don't have any visits assigned yet.</Text>
            </View>
          )
        ) : (
          completedVisits.length > 0 ? (
            completedVisits.map(renderVisitCard)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle-outline" size={64} color={professionalTheme.colors.text.muted} />
              <Text style={styles.emptyTitle}>No Completed Visits</Text>
              <Text style={styles.emptyText}>Complete your first visit to see it here.</Text>
            </View>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: professionalTheme.colors.background.light,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: professionalTheme.colors.background.main,
    borderBottomWidth: 1,
    borderBottomColor: professionalTheme.colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: professionalTheme.spacing.md,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: professionalTheme.colors.primary,
  },
  tabText: {
    fontSize: professionalTheme.fontSize.md,
    color: professionalTheme.colors.text.muted,
    fontWeight: professionalTheme.fontWeight.medium,
  },
  activeTabText: {
    color: professionalTheme.colors.primary,
    fontWeight: professionalTheme.fontWeight.semibold,
  },
  content: {
    flex: 1,
    paddingHorizontal: professionalTheme.spacing.lg,
    paddingTop: professionalTheme.spacing.md,
  },
  visitCard: {
    backgroundColor: professionalTheme.colors.background.card,
    borderRadius: professionalTheme.borderRadius.lg,
    padding: professionalTheme.spacing.lg,
    marginVertical: professionalTheme.spacing.sm,
    borderWidth: 1,
    borderColor: professionalTheme.colors.border,
    shadowColor: professionalTheme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  visitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: professionalTheme.spacing.lg,
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
    backgroundColor: `${professionalTheme.colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: professionalTheme.spacing.md,
  },
  avatarText: {
    fontSize: professionalTheme.fontSize.md,
    fontWeight: professionalTheme.fontWeight.bold,
    color: professionalTheme.colors.primary,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: professionalTheme.fontSize.lg,
    fontWeight: professionalTheme.fontWeight.semibold,
    color: professionalTheme.colors.text.primary,
    marginBottom: 4,
  },
  patientCondition: {
    fontSize: professionalTheme.fontSize.sm,
    color: professionalTheme.colors.text.secondary,
  },
  statusBadge: {
    paddingHorizontal: professionalTheme.spacing.md,
    paddingVertical: professionalTheme.spacing.xs,
    borderRadius: professionalTheme.borderRadius.md,
  },
  statusText: {
    fontSize: professionalTheme.fontSize.xs,
    fontWeight: professionalTheme.fontWeight.medium,
    color: professionalTheme.colors.text.white,
  },
  visitDetails: {
    backgroundColor: `${professionalTheme.colors.primary}08`,
    borderRadius: professionalTheme.borderRadius.md,
    padding: professionalTheme.spacing.md,
    gap: professionalTheme.spacing.sm,
    marginBottom: professionalTheme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: professionalTheme.spacing.sm,
  },
  detailText: {
    fontSize: professionalTheme.fontSize.sm,
    color: professionalTheme.colors.text.secondary,
  },
  visitFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: professionalTheme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: `${professionalTheme.colors.border}50`,
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: professionalTheme.spacing.sm,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: professionalTheme.fontSize.sm,
    color: professionalTheme.colors.text.muted,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: professionalTheme.spacing.xl * 3,
    paddingHorizontal: professionalTheme.spacing.xl,
  },
  emptyTitle: {
    fontSize: professionalTheme.fontSize.lg,
    fontWeight: professionalTheme.fontWeight.semibold,
    color: professionalTheme.colors.text.primary,
    marginTop: professionalTheme.spacing.lg,
    marginBottom: professionalTheme.spacing.sm,
  },
  emptyText: {
    fontSize: professionalTheme.fontSize.md,
    color: professionalTheme.colors.text.muted,
    textAlign: 'center',
  },
} as any);