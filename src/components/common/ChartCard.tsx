import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { professionalTheme } from '../../theme/professional';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  data: number[];
  labels: string[];
  height?: number;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  data,
  labels,
  height = 200,
}) => {
  const maxValue = Math.max(...data);
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      
      <View style={[styles.chartContainer, { height }]}>
        {data.map((value, index) => {
          const barHeight = (value / maxValue) * (height - 40);
          return (
            <View key={index} style={styles.barContainer}>
              <View style={styles.barWrapper}>
                <View 
                  style={[
                    styles.bar, 
                    { height: barHeight }
                  ]} 
                />
              </View>
              <Text style={styles.label}>{labels[index]}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: professionalTheme.colors.background.card,
    borderRadius: professionalTheme.borderRadius.lg,
    padding: professionalTheme.spacing.lg,
    borderWidth: 1,
    borderColor: professionalTheme.colors.border,
  },
  header: {
    marginBottom: professionalTheme.spacing.lg,
  },
  title: {
    fontSize: professionalTheme.fontSize.lg,
    fontWeight: professionalTheme.fontWeight.semibold as '600',
    color: professionalTheme.colors.text.primary,
    marginBottom: professionalTheme.spacing.xs,
  },
  subtitle: {
    fontSize: professionalTheme.fontSize.sm,
    color: professionalTheme.colors.text.secondary,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
  },
  barWrapper: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  bar: {
    width: '100%',
    backgroundColor: professionalTheme.colors.primary,
    borderRadius: professionalTheme.borderRadius.sm,
    minHeight: 4,
  },
  label: {
    fontSize: professionalTheme.fontSize.xs,
    color: professionalTheme.colors.text.muted,
    marginTop: professionalTheme.spacing.sm,
  },
});
