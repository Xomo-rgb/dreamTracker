import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { gamifiedTheme } from '../../theme/gamified';

interface GamifiedWidgetProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: 'blue' | 'red' | 'purple' | 'orange' | 'green';
  onPress?: () => void;
}

export const GamifiedWidget: React.FC<GamifiedWidgetProps> = ({
  title,
  value,
  subtitle,
  icon,
  color,
  onPress,
}) => {
  const getBackgroundColor = () => {
    return gamifiedTheme.colors.accent[color];
  };

  return (
    <TouchableOpacity
      style={[styles.widget, { backgroundColor: getBackgroundColor() }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons
        name={icon}
        size={20}
        color="rgba(255,255,255,0.5)"
        style={styles.icon}
      />
      
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  widget: {
    padding: gamifiedTheme.spacing.lg,
    borderRadius: gamifiedTheme.borderRadius.xl,
    minHeight: 100,
    position: 'relative',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: {
    position: 'absolute',
    top: gamifiedTheme.spacing.lg,
    right: gamifiedTheme.spacing.lg,
  },
  title: {
    fontSize: gamifiedTheme.fontSize.xs,
    fontWeight: gamifiedTheme.fontWeight.medium,
    color: gamifiedTheme.colors.text.white,
    opacity: 0.9,
  },
  value: {
    fontSize: gamifiedTheme.fontSize.xxl,
    fontWeight: gamifiedTheme.fontWeight.bold,
    color: gamifiedTheme.colors.text.white,
    marginVertical: 5,
  },
  subtitle: {
    fontSize: gamifiedTheme.fontSize.xs,
    color: gamifiedTheme.colors.text.white,
    opacity: 0.8,
  },
} as any);