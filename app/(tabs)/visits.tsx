import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { professionalTheme } from '../../src/theme/professional';
import { AssignmentService, Assignment } from '../../src/services/assignmentService';
import { useAuth } from '../../src/hooks/AuthContext';

export default function HistoryTab() {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<'pending' | 'completed'>('pending');
  const [visits, setVisits] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHistory();
  }, [selectedTab]);

  const loadHistory = async (refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else setLoading(true);
      
      if (!user?.uid) return;
      
      // Only experts use mobile app - load their assignments
      const data = await AssignmentService.getAssignmentsByExpert(user.uid, selectedTab);
      
      setVisits(data);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadHistory(true)}
            colors={[professionalTheme.colors.primary]}
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Visits</Text>
            <Text style={styles.subtitle}>Manage visits and assignments</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{visits.length}</Text>
          </View>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'pending' && styles.activeTab]}
            onPress={() => setSelectedTab('pending')}
          >
            <Text style={[styles.tabText, selectedTab === 'pending' && styles.activeTabText]}>
              Pending
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'completed' && styles.activeTab]}
            onPress={() => setSelectedTab('completed')}
          >
            <Text style={[styles.tabText, selectedTab === 'completed' && styles.activeTabText]}>
              Completed
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingState}>
            <Text style={styles.loadingText}>Loading history...</Text>
          </View>
        ) : visits.length > 0 ? (
          <View style={styles.historyList}>
            {visits.map((visit) => (
              <TouchableOpacity
                key={visit.id}
                style={styles.historyCard}
                onPress={() => router.push({
                  pathname: '/patient-detail',
                  params: {
                    id: visit.patientId,
                    assignmentId: visit.id,
                    name: visit.patientName,
                    visitReason: visit.visitReason,
                    priority: visit.priority,
                    assignedDate: visit.assignedDate,
                    isCompleted: (selectedTab === 'completed').toString(),
                  },
                })}
              >
                <View style={styles.historyHeader}>
                  <View style={styles.patientAvatar}>
                    <Text style={styles.avatarText}>
                      {visit.patientName.split(' ').map((n: string) => n[0]).join('')}
                    </Text>
                  </View>
                  <View style={styles.historyInfo}>
                    <Text style={styles.patientName}>{visit.patientName}</Text>
                    <Text style={styles.visitReason}>{visit.visitReason}</Text>
                  </View>
                  <Ionicons 
                    name={selectedTab === 'completed' ? 'checkmark-circle' : 'time'} 
                    size={24} 
                    color={selectedTab === 'completed' ? professionalTheme.colors.status.success : professionalTheme.colors.status.warning} 
                  />
                </View>
                
                <View style={styles.historyDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={14} color={professionalTheme.colors.text.muted} />
                    <Text style={styles.detailText}>Assigned: {formatDate(visit.assignedDate)}</Text>
                  </View>
                  {selectedTab === 'completed' && visit.completedDate && (
                    <View style={styles.detailRow}>
                      <Ionicons name="checkmark-circle-outline" size={14} color={professionalTheme.colors.text.muted} />
                      <Text style={styles.detailText}>Completed: {formatDate(visit.completedDate)}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={64} color={professionalTheme.colors.text.muted} />
            <Text style={styles.emptyTitle}>No {selectedTab === 'pending' ? 'Pending' : 'Completed'} Visits</Text>
            <Text style={styles.emptyText}>{selectedTab === 'pending' ? 'Pending visits will appear here' : 'Completed visits will appear here with dates and details'}</Text>
          </View>
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
  content: {
    flex: 1,
    paddingHorizontal: professionalTheme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: professionalTheme.spacing.lg,
  },
  title: {
    fontSize: professionalTheme.fontSize.xxl,
    fontWeight: professionalTheme.fontWeight.bold,
    color: professionalTheme.colors.text.primary,
  },
  subtitle: {
    fontSize: professionalTheme.fontSize.sm,
    color: professionalTheme.colors.text.muted,
    marginTop: 4,
  },
  notificationButton: {
    padding: professionalTheme.spacing.sm,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: professionalTheme.spacing.lg,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: professionalTheme.spacing.xl,
    paddingVertical: professionalTheme.spacing.sm,
    borderRadius: professionalTheme.borderRadius.xl,
    backgroundColor: 'transparent',
    marginRight: professionalTheme.spacing.md,
  },
  activeTab: {
    backgroundColor: professionalTheme.colors.primary,
  },
  tabText: {
    fontSize: professionalTheme.fontSize.sm,
    fontWeight: professionalTheme.fontWeight.semibold,
    color: professionalTheme.colors.text.muted,
  },
  activeTabText: {
    color: professionalTheme.colors.text.white,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: professionalTheme.borderRadius.xl,
    paddingHorizontal: professionalTheme.spacing.xs,
    paddingVertical: 2,
    marginLeft: professionalTheme.spacing.sm,
  },
  badgeText: {
    fontSize: professionalTheme.fontSize.xs,
    fontWeight: professionalTheme.fontWeight.bold,
    color: professionalTheme.colors.text.white,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: professionalTheme.spacing.xxl,
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
  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: professionalTheme.spacing.xxl,
  },
  loadingText: {
    fontSize: professionalTheme.fontSize.md,
    color: professionalTheme.colors.text.muted,
  },
  countBadge: {
    backgroundColor: professionalTheme.colors.primary,
    borderRadius: professionalTheme.borderRadius.xl,
    paddingHorizontal: professionalTheme.spacing.md,
    paddingVertical: professionalTheme.spacing.xs,
  },
  countText: {
    fontSize: professionalTheme.fontSize.sm,
    fontWeight: professionalTheme.fontWeight.bold,
    color: professionalTheme.colors.text.white,
  },
  historyList: {
    gap: professionalTheme.spacing.md,
  },
  historyCard: {
    backgroundColor: professionalTheme.colors.background.card,
    borderRadius: professionalTheme.borderRadius.lg,
    padding: professionalTheme.spacing.lg,
    borderWidth: 1,
    borderColor: professionalTheme.colors.border,
    marginBottom: professionalTheme.spacing.sm,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: professionalTheme.spacing.md,
  },
  patientAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${professionalTheme.colors.status.success}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: professionalTheme.spacing.md,
  },
  avatarText: {
    fontSize: professionalTheme.fontSize.sm,
    fontWeight: professionalTheme.fontWeight.bold,
    color: professionalTheme.colors.status.success,
  },
  historyInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: professionalTheme.fontSize.md,
    fontWeight: professionalTheme.fontWeight.semibold,
    color: professionalTheme.colors.text.primary,
    marginBottom: 2,
  },
  visitReason: {
    fontSize: professionalTheme.fontSize.sm,
    color: professionalTheme.colors.text.secondary,
  },
  historyDetails: {
    gap: professionalTheme.spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: professionalTheme.spacing.xs,
  },
  detailText: {
    fontSize: professionalTheme.fontSize.xs,
    color: professionalTheme.colors.text.muted,
  },
} as any);