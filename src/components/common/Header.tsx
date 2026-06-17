import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showNotification?: boolean;
  onNotificationPress?: () => void;
  showSearch?: boolean;
  onSearchPress?: () => void;
  showBack?: boolean;
  onBackPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showNotification = false,
  onNotificationPress,
  showSearch = false,
  onSearchPress,
  showBack = false,
  onBackPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {showBack ? (
          <TouchableOpacity onPress={onBackPress} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.avatar}>
            <Ionicons name="person" size={24} color={theme.colors.text.primary} />
          </View>
        )}
        <View style={styles.titleContainer}>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          <Text style={styles.title}>{title}</Text>
        </View>
      </View>
      
      <View style={styles.rightSection}>
        {showSearch && (
          <TouchableOpacity onPress={onSearchPress} style={styles.iconButton}>
            <Ionicons name="search" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        )}
        {showNotification && (
          <TouchableOpacity onPress={onNotificationPress} style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color={theme.colors.text.primary} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  titleContainer: {
    flex: 1,
  },
  subtitle: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text.muted,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background.main,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginLeft: theme.spacing.sm,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background.main,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginLeft: theme.spacing.sm,
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.status.error,
  },
} as any);