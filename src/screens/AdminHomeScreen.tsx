import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ProfessionalHeader } from '../components/common/ProfessionalHeader';
import { AnalyticsCard } from '../components/common/AnalyticsCard';
import { professionalTheme } from '../theme/professional';
import { PatientService } from '../services/patientService';

export default function AdminHomeScreen() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    pendingVisits: 0,
    completedToday: 0,
    activeExperts: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const patients = await PatientService.getAllPatients();
      const pending = patients.filter(p => p.isActive).length;
      const completed = patients.filter(p => !p.isActive).length;

      setStats({
        totalPatients: patients.length,
        pendingVisits: pending,
        completedToday: completed,
        activeExperts: 5, // TODO: Get from users collection
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <ProfessionalHeader
          title="Admin Dashboard"
          onNotificationPress={() => console.log('Notifications')}
        />

        <View style={styles.metricsGrid}>
          <AnalyticsCard
            title="Total Patients"
            value={stats.totalPatients.toString()}
            icon="people-outline"
            onPress={() => router.push('/(tabs)/patients')}
          />
          <AnalyticsCard
            title="Pending Visits"
            value={stats.pendingVisits.toString()}
            icon="time-outline"
            onPress={() => router.push('/(tabs)/patients')}
          />
        </View>

        <View style={styles.metricsGrid}>
          <AnalyticsCard
            title="Completed"
            value={stats.completedToday.toString()}
            icon="checkmark-circle-outline"
            onPress={() => router.push('/(tabs)/visits')}
          />
          <AnalyticsCard
            title="Active Experts"
            value={stats.activeExperts.toString()}
            icon="person-outline"
            onPress={() => console.log('User management')}
          />
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/add-patient')}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="person-add" size={24} color={professionalTheme.colors.primary} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Add New Patient</Text>
              <Text style={styles.actionSubtitle}>Register a patient for visit</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={professionalTheme.colors.text.muted} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/assign-patient')}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="git-branch" size={24} color={professionalTheme.colors.primary} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Assign Patient</Text>
              <Text style={styles.actionSubtitle}>Assign patient to expert client</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={professionalTheme.colors.text.muted} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/manage-users')}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="people" size={24} color={professionalTheme.colors.primary} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Manage Users</Text>
              <Text style={styles.actionSubtitle}>View and deactivate expert accounts</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={professionalTheme.colors.text.muted} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/edit-questionnaire')}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="list" size={24} color={professionalTheme.colors.primary} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Edit Questionnaire</Text>
              <Text style={styles.actionSubtitle}>Manage follow-up questions</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={professionalTheme.colors.text.muted} />
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingHorizontal: professionalTheme.spacing.lg,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: professionalTheme.spacing.md,
    marginBottom: professionalTheme.spacing.md,
  },
  sectionTitle: {
    fontSize: professionalTheme.fontSize.lg,
    fontWeight: professionalTheme.fontWeight.semibold as '600',
    color: professionalTheme.colors.text.primary,
    marginBottom: professionalTheme.spacing.md,
  },
  quickActions: {
    marginTop: professionalTheme.spacing.lg,
    marginBottom: professionalTheme.spacing.xl,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: professionalTheme.colors.background.card,
    borderRadius: professionalTheme.borderRadius.lg,
    padding: professionalTheme.spacing.lg,
    marginBottom: professionalTheme.spacing.md,
    borderWidth: 1,
    borderColor: professionalTheme.colors.border,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${professionalTheme.colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: professionalTheme.spacing.md,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: professionalTheme.fontSize.md,
    fontWeight: professionalTheme.fontWeight.semibold as '600',
    color: professionalTheme.colors.text.primary,
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: professionalTheme.fontSize.sm,
    color: professionalTheme.colors.text.secondary,
  },
} as any);
