import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ProfessionalHeader } from '../components/common/ProfessionalHeader';
import { AnalyticsCard } from '../components/common/AnalyticsCard';
import { professionalTheme } from '../theme/professional';
import { PatientService } from '../services/patientService';
import { AssignmentService } from '../services/assignmentService';
import { NotificationService } from '../services/notificationService';
import { useAuth } from '../hooks/AuthContext';

const { width } = Dimensions.get('window');

export default function ExpertHomeScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    pendingVisits: 0,
    completedToday: 0,
  });
  const [todayPatients, setTodayPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadStats();
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadUnreadCount();
    }, [])
  );

  const loadStats = async () => {
    try {
      if (!user?.uid) return;

      const pending = await AssignmentService.getAssignmentsByExpert(user.uid, 'pending');
      const completed = await AssignmentService.getAssignmentsByExpert(user.uid, 'completed');

      console.log('Pending assignments:', pending.length);
      console.log('Completed assignments:', completed.length);

      setStats({
        pendingVisits: pending.length,
        completedToday: completed.length,
      });

      // Show first 2 pending assignments as "today's patients"
      setTodayPatients(pending.slice(0, 2));
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    if (user?.uid) {
      const count = await NotificationService.getUnreadCount(user.uid);
      console.log('Unread count:', count, 'for user:', user.uid);
      setUnreadCount(count);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return professionalTheme.colors.status.error;
      case 'Medium': return professionalTheme.colors.status.warning;
      case 'Low': return professionalTheme.colors.status.info;
      default: return professionalTheme.colors.text.muted;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0ea5e9', '#06b6d4', '#22d3ee']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeHeader}>
            <View>
              <Text style={styles.greeting}>{user?.isFirstLogin ? 'Welcome' : 'Welcome back'},</Text>
              <Text style={styles.userName}>{user?.firstName || 'Expert'}!</Text>
            </View>
            <TouchableOpacity 
              onPress={() => router.push('/notifications')}
              style={styles.notificationButton}
            >
              <Ionicons name="notifications-outline" size={28} color="#ffffff" />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>Here are your assigned tasks</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <View style={[styles.metricIconContainer, { backgroundColor: '#0ea5e920' }]}>
              <Ionicons name="time" size={24} color="#0ea5e9" />
            </View>
            <Text style={styles.metricValue}>{stats.pendingVisits}</Text>
            <Text style={styles.metricLabel}>Pending Visits</Text>
            <TouchableOpacity 
              style={styles.metricButton}
              onPress={() => router.push('/(tabs)/patients')}
            >
              <Text style={styles.metricButtonText}>View</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIconContainer, { backgroundColor: '#10b98120' }]}>
              <Ionicons name="checkmark-circle" size={24} color="#10b981" />
            </View>
            <Text style={styles.metricValue}>{stats.completedToday}</Text>
            <Text style={styles.metricLabel}>Completed</Text>
            <TouchableOpacity 
              style={styles.metricButton}
              onPress={() => router.push('/(tabs)/visits')}
            >
              <Text style={styles.metricButtonText}>History</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.todaySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Assigned Tasks</Text>
            {todayPatients.length > 0 && (
              <TouchableOpacity onPress={() => router.push('/(tabs)/patients')}>
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {todayPatients.length > 0 ? (
            <View style={styles.patientList}>
              {todayPatients.map((assignment) => (
                <TouchableOpacity
                  key={assignment.id}
                  style={styles.patientItem}
                  onPress={() => router.push({
                    pathname: '/patient-detail',
                    params: {
                      id: assignment.patientId,
                      assignmentId: assignment.id,
                      name: assignment.patientName,
                      visitReason: assignment.visitReason,
                      priority: assignment.priority,
                      assignedDate: assignment.assignedDate,
                    },
                  })}
                >
                  <View style={styles.patientAvatar}>
                    <Text style={styles.avatarText}>
                      {assignment.patientName.split(' ').map((n: string) => n[0]).join('')}
                    </Text>
                  </View>
                  <View style={styles.patientInfo}>
                    <Text style={styles.patientName}>{assignment.patientName}</Text>
                    <Text style={styles.patientReason}>{assignment.visitReason}</Text>
                  </View>
                  <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(assignment.priority) }]}>
                    <Text style={styles.priorityText}>{assignment.priority}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle" size={64} color={professionalTheme.colors.status.success} />
              <Text style={styles.emptyText}>All caught up!</Text>
              <Text style={styles.emptySubtext}>No pending tasks at the moment</Text>
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={() => router.push('/(tabs)/patients')}
        >
          <Ionicons name="people" size={20} color="#ffffff" />
          <Text style={styles.viewAllText}>View All My Assignments</Text>
          <Ionicons name="arrow-forward" size={20} color="#ffffff" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerGradient: {
    paddingHorizontal: professionalTheme.spacing.lg,
    paddingBottom: professionalTheme.spacing.xl,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  content: {
    flex: 1,
    marginTop: -20,
  },
  scrollContent: {
    paddingHorizontal: professionalTheme.spacing.lg,
    paddingTop: 30,
  },
  welcomeSection: {
    paddingTop: professionalTheme.spacing.md,
    paddingBottom: professionalTheme.spacing.lg,
  },
  welcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  greeting: {
    fontSize: professionalTheme.fontSize.md,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  userName: {
    fontSize: professionalTheme.fontSize.xxl * 1.3,
    fontWeight: professionalTheme.fontWeight.bold as '700',
    color: '#ffffff',
    marginTop: 4,
  },
  subtitle: {
    fontSize: professionalTheme.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: professionalTheme.spacing.xs,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: professionalTheme.spacing.md,
    marginBottom: professionalTheme.spacing.xl,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: professionalTheme.spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  metricIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: professionalTheme.spacing.sm,
  },
  metricValue: {
    fontSize: 32,
    fontWeight: professionalTheme.fontWeight.bold as '700',
    color: professionalTheme.colors.text.primary,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: professionalTheme.fontSize.xs,
    color: professionalTheme.colors.text.muted,
    textAlign: 'center',
    marginBottom: professionalTheme.spacing.sm,
  },
  metricButton: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: professionalTheme.spacing.md,
    paddingVertical: professionalTheme.spacing.xs,
    borderRadius: professionalTheme.borderRadius.md,
    marginTop: 4,
  },
  metricButtonText: {
    fontSize: professionalTheme.fontSize.xs,
    fontWeight: professionalTheme.fontWeight.semibold as '600',
    color: professionalTheme.colors.text.secondary,
  },
  todaySection: {
    marginBottom: professionalTheme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: professionalTheme.spacing.md,
  },
  sectionTitle: {
    fontSize: professionalTheme.fontSize.lg,
    fontWeight: professionalTheme.fontWeight.semibold as '600',
    color: professionalTheme.colors.text.primary,
  },
  seeAllText: {
    fontSize: professionalTheme.fontSize.sm,
    color: professionalTheme.colors.primary,
    fontWeight: professionalTheme.fontWeight.semibold as '600',
  },
  patientList: {
    gap: professionalTheme.spacing.sm,
  },
  patientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: professionalTheme.spacing.lg,
    marginBottom: professionalTheme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  patientAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#0ea5e9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: professionalTheme.spacing.md,
  },
  avatarText: {
    fontSize: professionalTheme.fontSize.md,
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
  patientReason: {
    fontSize: professionalTheme.fontSize.sm,
    color: professionalTheme.colors.text.secondary,
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: professionalTheme.spacing.xxl * 1.5,
    backgroundColor: professionalTheme.colors.background.card,
    borderRadius: professionalTheme.borderRadius.lg,
    borderWidth: 1,
    borderColor: professionalTheme.colors.border,
  },
  emptyText: {
    fontSize: professionalTheme.fontSize.lg,
    fontWeight: professionalTheme.fontWeight.semibold as '600',
    color: professionalTheme.colors.text.primary,
    marginTop: professionalTheme.spacing.md,
  },
  emptySubtext: {
    fontSize: professionalTheme.fontSize.sm,
    color: professionalTheme.colors.text.muted,
    marginTop: professionalTheme.spacing.xs,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0ea5e9',
    borderRadius: 16,
    padding: professionalTheme.spacing.lg,
    marginBottom: professionalTheme.spacing.xl,
    gap: professionalTheme.spacing.sm,
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  viewAllText: {
    fontSize: professionalTheme.fontSize.md,
    fontWeight: professionalTheme.fontWeight.semibold as '600',
    color: '#ffffff',
  },
} as any);
