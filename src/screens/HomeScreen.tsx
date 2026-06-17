import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProfessionalHeader } from '../components/common/ProfessionalHeader';
import { AnalyticsCard } from '../components/common/AnalyticsCard';
import { ChartCard } from '../components/common/ChartCard';
import { professionalTheme } from '../theme/professional';

export default function HomeScreen() {
  const weeklyData = [45, 52, 38, 61, 48, 55, 67];
  const weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const monthlyData = [120, 135, 98, 156, 142, 178];
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <ProfessionalHeader
          title="Dashboard"
          onNotificationPress={() => console.log('Notifications')}
        />

        <View style={styles.metricsGrid}>
          <AnalyticsCard
            title="Visited Patients"
            value="156"
            change={{ value: "+8.2%", type: "increase" }}
            icon="checkmark-circle-outline"
            onPress={() => console.log('Visited patients pressed')}
          />
          <AnalyticsCard
            title="Today's Visits"
            value="12"
            change={{ value: "+3.1%", type: "increase" }}
            icon="calendar-outline"
            onPress={() => console.log('Today visits pressed')}
          />
        </View>

        <View style={styles.chartsSection}>
          <ChartCard
            title="Weekly Patient Flow"
            subtitle="Patients seen per day"
            data={weeklyData}
            labels={weekLabels}
            height={140}
          />
        </View>

        <View style={styles.expectedPatients}>
          <Text style={styles.sectionTitle}>Expected Patients</Text>
          <View style={styles.patientList}>
            <TouchableOpacity style={styles.patientItem} onPress={() => console.log('Sarah Johnson pressed')}>
              <View style={styles.patientInfo}>
                <Text style={styles.patientName}>Sarah Johnson</Text>
                <Text style={styles.patientTime}>10:30 AM - Follow-up Visit</Text>
              </View>
              <View style={styles.patientStatus}>
                <Text style={styles.statusText}>Scheduled</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.patientItem} onPress={() => console.log('Michael Chen pressed')}>
              <View style={styles.patientInfo}>
                <Text style={styles.patientName}>Michael Chen</Text>
                <Text style={styles.patientTime}>2:15 PM - Routine Check</Text>
              </View>
              <View style={styles.patientStatus}>
                <Text style={styles.statusText}>Scheduled</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.patientItem} onPress={() => console.log('Emma Davis pressed')}>
              <View style={styles.patientInfo}>
                <Text style={styles.patientName}>Emma Davis</Text>
                <Text style={styles.patientTime}>4:00 PM - Follow-up Visit</Text>
              </View>
              <View style={styles.patientStatus}>
                <Text style={styles.statusText}>Scheduled</Text>
              </View>
            </TouchableOpacity>
          </View>
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
    marginBottom: professionalTheme.spacing.xl,
  },
  chartsSection: {
    marginBottom: professionalTheme.spacing.xl,
  },
  sectionTitle: {
    fontSize: professionalTheme.fontSize.lg,
    fontWeight: professionalTheme.fontWeight.semibold,
    color: professionalTheme.colors.text.primary,
    marginBottom: professionalTheme.spacing.md,
  },
  expectedPatients: {
    marginBottom: professionalTheme.spacing.xl,
  },
  patientList: {
    gap: professionalTheme.spacing.sm,
  },
  patientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: professionalTheme.colors.background.card,
    borderRadius: professionalTheme.borderRadius.lg,
    padding: professionalTheme.spacing.lg,
    borderWidth: 1,
    borderColor: professionalTheme.colors.border,
    shadowColor: professionalTheme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 1,
  },
  patientInfo: {
    flex: 1,
  },
  patientStatus: {
    backgroundColor: `${professionalTheme.colors.status.info}15`,
    paddingHorizontal: professionalTheme.spacing.md,
    paddingVertical: professionalTheme.spacing.xs,
    borderRadius: professionalTheme.borderRadius.md,
  },
  statusText: {
    fontSize: professionalTheme.fontSize.xs,
    fontWeight: professionalTheme.fontWeight.medium,
    color: professionalTheme.colors.status.info,
  },
  patientName: {
    fontSize: professionalTheme.fontSize.md,
    fontWeight: professionalTheme.fontWeight.semibold,
    color: professionalTheme.colors.text.primary,
    marginBottom: 4,
  },
  patientTime: {
    fontSize: professionalTheme.fontSize.sm,
    color: professionalTheme.colors.text.secondary,
  },
} as any);