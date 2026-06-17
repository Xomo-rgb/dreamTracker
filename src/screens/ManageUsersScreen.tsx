import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { professionalTheme } from '../theme/professional';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/authService';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: string;
  isActive?: boolean;
}

export default function ManageUsersScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async (refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else setLoading(true);

      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      const usersData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as User))
        .filter(user => user.isActive !== false); // Only show active users

      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDeleteUser = (user: User) => {
    Alert.alert(
      'Deactivate User',
      `Are you sure you want to deactivate ${user.firstName || user.email}? They will no longer be able to log in.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateDoc(doc(db, 'users', user.id), { isActive: false });
              Alert.alert('Success', 'User deactivated successfully');
              loadUsers();
            } catch (error) {
              console.error('Error deactivating user:', error);
              Alert.alert('Error', 'Failed to deactivate user');
            }
          }
        }
      ]
    );
  };

  const getUserName = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.email;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={professionalTheme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Users</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadUsers(true)}
            colors={[professionalTheme.colors.primary]}
          />
        }
      >
        {loading ? (
          <View style={styles.loadingState}>
            <Text style={styles.loadingText}>Loading users...</Text>
          </View>
        ) : users.length > 0 ? (
          <View style={styles.usersList}>
            {users.map((user) => (
              <View key={user.id} style={styles.userCard}>
                <View style={styles.userAvatar}>
                  <Text style={styles.avatarText}>
                    {getUserName(user).split(' ').map(n => n[0]).join('').toUpperCase()}
                  </Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{getUserName(user)}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                  {user.phone && <Text style={styles.userPhone}>{user.phone}</Text>}
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>{user.role}</Text>
                  </View>
                </View>
                {user.role !== 'admin' && (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteUser(user)}
                  >
                    <Ionicons name="trash-outline" size={20} color={professionalTheme.colors.status.error} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color={professionalTheme.colors.text.muted} />
            <Text style={styles.emptyTitle}>No Users</Text>
            <Text style={styles.emptyText}>Add users to get started</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: professionalTheme.spacing.lg,
    paddingVertical: professionalTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: professionalTheme.colors.border,
  },
  backButton: {
    padding: professionalTheme.spacing.xs,
  },
  headerTitle: {
    fontSize: professionalTheme.fontSize.xl,
    fontWeight: professionalTheme.fontWeight.bold,
    color: professionalTheme.colors.text.primary,
  },
  addButton: {
    padding: professionalTheme.spacing.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: professionalTheme.spacing.lg,
    paddingTop: professionalTheme.spacing.lg,
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
  usersList: {
    gap: professionalTheme.spacing.md,
    paddingBottom: 80,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: professionalTheme.colors.background.card,
    borderRadius: professionalTheme.borderRadius.lg,
    padding: professionalTheme.spacing.lg,
    borderWidth: 1,
    borderColor: professionalTheme.colors.border,
  },
  userAvatar: {
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
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: professionalTheme.fontSize.md,
    fontWeight: professionalTheme.fontWeight.semibold,
    color: professionalTheme.colors.text.primary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: professionalTheme.fontSize.sm,
    color: professionalTheme.colors.text.secondary,
    marginBottom: 2,
  },
  userPhone: {
    fontSize: professionalTheme.fontSize.sm,
    color: professionalTheme.colors.text.muted,
    marginBottom: 4,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: `${professionalTheme.colors.primary}15`,
    paddingHorizontal: professionalTheme.spacing.sm,
    paddingVertical: 2,
    borderRadius: professionalTheme.borderRadius.sm,
    marginTop: 4,
  },
  roleText: {
    fontSize: professionalTheme.fontSize.xs,
    fontWeight: professionalTheme.fontWeight.semibold,
    color: professionalTheme.colors.primary,
    textTransform: 'capitalize',
  },
  deleteButton: {
    padding: professionalTheme.spacing.sm,
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
  },
  fab: {
    position: 'absolute',
    bottom: professionalTheme.spacing.xl,
    right: professionalTheme.spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: professionalTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: professionalTheme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
} as any);
