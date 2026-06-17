import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ProfessionalHeader } from '../components/common/ProfessionalHeader';
import { Input } from '../components/ui/Input';
import { professionalTheme } from '../theme/professional';
import { PatientCardSkeleton } from '../components/common/PatientCardSkeleton';
import { AnimatedPatientCard } from '../components/common/AnimatedPatientCard';
import { Assignment, AssignmentService } from '../services/assignmentService';
import { NotificationService } from '../services/notificationService';
import { useAuth } from '../hooks/AuthContext';

export default function PatientsScreen() {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<'pending' | 'completed'>('pending');
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadPatients();
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [selectedTab]);

  useFocusEffect(
    React.useCallback(() => {
      loadPatients();
      loadUnreadCount();
    }, [])
  );

  const loadPatients = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const status = selectedTab === 'pending' ? 'pending' : 'completed';
      const data = await AssignmentService.getAssignmentsByExpert(user?.uid || '', status);
      setAssignments(data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadPatients(true);
  };

  const loadUnreadCount = async () => {
    if (user?.uid) {
      const count = await NotificationService.getUnreadCount(user.uid);
      setUnreadCount(count);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return professionalTheme.colors.status.error;
      case 'Medium': return professionalTheme.colors.status.warning;
      case 'Low': return professionalTheme.colors.status.info;
      case 'Completed': return professionalTheme.colors.status.success;
      default: return professionalTheme.colors.text.muted;
    }
  };

  const filteredPatients = useMemo(() => {
    if (!searchQuery) return assignments;
    return assignments.filter(assignment =>
      assignment.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.visitReason.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [assignments, searchQuery]);

  const handlePatientPress = (item: Assignment) => {
    router.push({
      pathname: '/patient-detail',
      params: {
        id: item.patientId,
        assignmentId: item.id,
        name: item.patientName,
        visitReason: item.visitReason,
        priority: item.priority,
        assignedDate: item.assignedDate,
        isCompleted: (selectedTab === 'completed').toString(),
      },
    });
  };

  const renderPatientCard = ({ item, index }: { item: Assignment; index: number }) => {
    return (
      <AnimatedPatientCard
        patient={{ id: item.id, name: item.patientName, visitReason: item.visitReason, priority: item.priority } as any}
        index={index}
        onPress={() => handlePatientPress(item)}
        getPriorityColor={getPriorityColor}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tasks</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              onPress={() => setIsSearching(!isSearching)}
              style={styles.searchButton}
            >
              <Ionicons name="search" size={24} color={professionalTheme.colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => router.push('/notifications')}
              style={styles.notificationButton}
            >
              <Ionicons name="notifications-outline" size={24} color={professionalTheme.colors.text.primary} />
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {isSearching && (
          <View style={styles.searchContainer}>
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              leftIcon="search"
              style={styles.searchInput}
            />
          </View>
        )}

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
            <View style={styles.badge}>
              <Text style={styles.badgeText}>0{filteredPatients.length}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View>
            {Array.from({ length: 5 }).map((_, index) => (
              <PatientCardSkeleton key={index} />
            ))}
          </View>
        ) : (
          <FlatList
            data={filteredPatients}
            renderItem={renderPatientCard}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[professionalTheme.colors.primary]}
              />
            }
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No {selectedTab} tasks found</Text>
              </View>
            }
          />
        )}
      </View>
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
    marginTop: professionalTheme.spacing.md,
    marginBottom: professionalTheme.spacing.lg,
  },
  headerTitle: {
    fontSize: professionalTheme.fontSize.xxl,
    fontWeight: professionalTheme.fontWeight.bold,
    color: professionalTheme.colors.text.primary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchButton: {
    padding: 8,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
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
  notificationBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  searchContainer: {
    marginBottom: professionalTheme.spacing.lg,
  },
  searchInput: {
    marginBottom: 0,
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
  emptyText: {
    fontSize: professionalTheme.fontSize.md,
    color: professionalTheme.colors.text.muted,
  },
} as any);
