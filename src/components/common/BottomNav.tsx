import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { professionalTheme } from '../../theme/professional';

interface BottomNavProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabPress,
}) => {
  const navItems = [
    { id: 'home', icon: 'home-outline', label: 'Home' },
    { id: 'patients', icon: 'people-outline', label: 'Patients' },
    { id: 'reports', icon: 'bar-chart-outline', label: 'Reports' },
    { id: 'profile', icon: 'person-outline', label: 'Profile' },
  ];

  return (
    <View style={styles.container}>
      {navItems.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.navItem}
          onPress={() => onTabPress(item.id)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={item.icon as keyof typeof Ionicons.glyphMap}
            size={20}
            color={activeTab === item.id ? professionalTheme.colors.primary : professionalTheme.colors.text.muted}
          />
          <Text
            style={[
              styles.navLabel,
              { color: activeTab === item.id ? professionalTheme.colors.primary : professionalTheme.colors.text.muted }
            ]}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: professionalTheme.colors.background.main,
    borderTopWidth: 1,
    borderTopColor: professionalTheme.colors.border,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  navLabel: {
    fontSize: professionalTheme.fontSize.xs,
    fontWeight: professionalTheme.fontWeight.medium,
    marginTop: 4,
  },
} as any);