import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { theme } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof theme.spacing;
  borderRadius?: keyof typeof theme.borderRadius;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = 'lg',
  borderRadius = 'lg',
}) => {
  return (
    <View
      style={[
        styles.card,
        {
          padding: theme.spacing[padding],
          borderRadius: theme.borderRadius[borderRadius],
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background.main,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
});