import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { professionalTheme } from '../theme/professional';
import { NotificationService, Notification } from '../services/notificationService';
import { useAuth } from '../hooks/AuthContext';

export default function NotificationsScreen() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    if (!user) return;
    try {
      const data = await NotificationService.getNotifications(user.uid);
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const handleNotificationPress = async (notification: Notification) => {
    if (processing) return;
    
    setProcessing(true);
    console.log('=== NOTIFICATION CLICKED ===');
    console.log('Notification pressed:', notification);
    console.log('Notification metadata:', notification.metadata);
    console.log('Notification type:', notification.type);
    
    await NotificationService.markAsRead(notification.id);
    
    if (notification.type === 'assignment') {
      if (notification.metadata?.assignmentId) {
        console.log('Loading assignment:', notification.metadata.assignmentId);
        const { AssignmentService } = await import('../services/assignmentService');
        const assignment = await AssignmentService.getAssignmentById(notification.metadata.assignmentId);
        
        console.log('Assignment loaded:', assignment);
        
        if (assignment) {
          console.log('Navigating to patient detail...');
          router.push({
            pathname: '/patient-detail',
            params: {
              id: assignment.patientId,
              name: assignment.patientName,
              age: '',
              visitReason: assignment.visitReason,
              priority: assignment.priority,
              assignedDate: assignment.assignedDate,
              isCompleted: 'false',
              assignmentId: assignment.id
            }
          });
        } else {
          console.log('No assignment found');
        }
      } else {
        console.log('OLD NOTIFICATION - No metadata. Please create a new assignment to test.');
      }
    } else {
      console.log('Not an assignment notification');
    }
    
    loadNotifications();
    setTimeout(() => setProcessing(false), 1000);
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    await NotificationService.markAllAsRead(user.uid);
    loadNotifications();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'assignment': return 'briefcase';
      case 'completion': return 'checkmark-circle';
      default: return 'information-circle';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'assignment': return professionalTheme.colors.primary;
      case 'completion': return professionalTheme.colors.status.success;
      default: return professionalTheme.colors.status.info;
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {notifications.some(n => !n.read) && (
          <TouchableOpacity onPress={handleMarkAllAsRead}>
            <Text style={styles.markAllRead}>Mark all as read</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        keyboardShouldPersistTaps="handled"
      >
        {loading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Loading notifications...</Text>
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={64} color={professionalTheme.colors.text.muted} />
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        ) : (
          notifications.map(notification => (
            <TouchableOpacity
              key={notification.id}
              style={[styles.notificationCard, !notification.read && styles.unreadCard]}
              onPress={() => {
                console.log('TouchableOpacity pressed!');
                handleNotificationPress(notification);
              }}
              activeOpacity={0.7}
              disabled={processing}
            >
              <View style={[styles.iconContainer, { backgroundColor: `${getIconColor(notification.type)}20` }]}>
                <Ionicons name={getIcon(notification.type)} size={24} color={getIconColor(notification.type)} />
              </View>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>{notification.title}</Text>
                <Text style={styles.notificationMessage}>{notification.message}</Text>
                <Text style={styles.notificationTime}>{formatDate(notification.createdAt)}</Text>
              </View>
              {!notification.read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          ))
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: professionalTheme.spacing.lg,
    paddingVertical: professionalTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: professionalTheme.colors.border,
  },
  headerTitle: {
    fontSize: professionalTheme.fontSize.xxl,
    fontWeight: professionalTheme.fontWeight.bold,
    color: professionalTheme.colors.text.primary,
  },
  markAllRead: {
    fontSize: professionalTheme.fontSize.sm,
    color: professionalTheme.colors.primary,
    fontWeight: professionalTheme.fontWeight.semibold,
  },
  content: {
    flex: 1,
    paddingHorizontal: professionalTheme.spacing.lg,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: professionalTheme.colors.background.card,
    borderRadius: professionalTheme.borderRadius.lg,
    padding: professionalTheme.spacing.lg,
    marginTop: professionalTheme.spacing.md,
    borderWidth: 1,
    borderColor: professionalTheme.colors.border,
  },
  unreadCard: {
    backgroundColor: `${professionalTheme.colors.primary}05`,
    borderColor: `${professionalTheme.colors.primary}30`,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: professionalTheme.spacing.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: professionalTheme.fontSize.md,
    fontWeight: professionalTheme.fontWeight.semibold,
    color: professionalTheme.colors.text.primary,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: professionalTheme.fontSize.sm,
    color: professionalTheme.colors.text.secondary,
    marginBottom: 4,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: professionalTheme.fontSize.xs,
    color: professionalTheme.colors.text.muted,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: professionalTheme.colors.primary,
    marginLeft: professionalTheme.spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: professionalTheme.spacing.xxl * 2,
  },
  emptyText: {
    fontSize: professionalTheme.fontSize.md,
    color: professionalTheme.colors.text.muted,
    marginTop: professionalTheme.spacing.md,
  },
} as any);
