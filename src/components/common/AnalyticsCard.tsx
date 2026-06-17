import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { professionalTheme } from '../../theme/professional';

interface AnalyticsCardProps {
  title: string;
  value: string;
  change?: {
    value: string;
    type: 'increase' | 'decrease';
  };
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}

export const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  title,
  value,
  change,
  icon,
  onPress,
}) => {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={24} color={professionalTheme.colors.primary} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
      {change && (
        <View style={styles.changeContainer}>
          <Ionicons 
            name={change.type === 'increase' ? 'arrow-up' : 'arrow-down'} 
            size={12} 
            color={change.type === 'increase' ? professionalTheme.colors.status.success : professionalTheme.colors.status.error}
          />
          <Text style={[
            styles.changeText,
            { color: change.type === 'increase' ? professionalTheme.colors.status.success : professionalTheme.colors.status.error }
          ]}>
            {change.value}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: professionalTheme.colors.background.card,
    borderRadius: professionalTheme.borderRadius.lg,
    padding: professionalTheme.spacing.lg,
    borderWidth: 1,
    borderColor: professionalTheme.colors.border,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${professionalTheme.colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: professionalTheme.spacing.md,
  },
  value: {
    fontSize: professionalTheme.fontSize.xxl,
    fontWeight: professionalTheme.fontWeight.bold as '700',
    color: professionalTheme.colors.text.primary,
    marginBottom: professionalTheme.spacing.xs,
  },
  title: {
    fontSize: professionalTheme.fontSize.sm,
    color: professionalTheme.colors.text.secondary,
    marginBottom: professionalTheme.spacing.xs,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: professionalTheme.spacing.xs,
  },
  changeText: {
    fontSize: professionalTheme.fontSize.xs,
    fontWeight: professionalTheme.fontWeight.medium as '500',
    marginLeft: 4,
  },
});
