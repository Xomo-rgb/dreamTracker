import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { gamifiedTheme } from '../../theme/gamified';

interface TournamentCardProps {
  title: string;
  subtitle: string;
  leftDetail: {
    label: string;
    value: string;
  };
  rightDetail: {
    label: string;
    value: string;
  };
  onPress?: () => void;
}

export const TournamentCard: React.FC<TournamentCardProps> = ({
  title,
  subtitle,
  leftDetail,
  rightDetail,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.decorativeBlob} />
      
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      
      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>{leftDetail.label}</Text>
          <Text style={styles.detailValue}>{leftDetail.value}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>{rightDetail.label}</Text>
          <Text style={styles.detailValue}>{rightDetail.value}</Text>
        </View>
      </View>
      
      <Ionicons
        name="medical"
        size={60}
        color="rgba(255,255,255,0.2)"
        style={styles.characterIcon}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: gamifiedTheme.colors.primary,
    borderRadius: gamifiedTheme.borderRadius.xl,
    padding: gamifiedTheme.spacing.xl,
    marginBottom: gamifiedTheme.spacing.lg,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 12,
  },
  decorativeBlob: {
    position: 'absolute',
    width: 100,
    height: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 50,
    top: -20,
    right: -20,
  },
  title: {
    fontSize: gamifiedTheme.fontSize.xs,
    color: gamifiedTheme.colors.text.white,
    opacity: 0.8,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: gamifiedTheme.fontSize.lg,
    fontWeight: gamifiedTheme.fontWeight.bold,
    color: gamifiedTheme.colors.text.white,
    marginBottom: gamifiedTheme.spacing.lg,
  },
  detailsContainer: {
    flexDirection: 'row',
    gap: 40,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: gamifiedTheme.fontSize.xs,
    color: gamifiedTheme.colors.text.white,
    opacity: 0.8,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: gamifiedTheme.fontSize.sm,
    fontWeight: gamifiedTheme.fontWeight.bold,
    color: gamifiedTheme.colors.text.white,
  },
  characterIcon: {
    position: 'absolute',
    right: 15,
    bottom: 10,
  },
} as any);