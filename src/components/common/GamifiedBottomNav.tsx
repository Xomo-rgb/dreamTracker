import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { gamifiedTheme } from '../../theme/gamified';

interface GamifiedBottomNavProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
}

export const GamifiedBottomNav: React.FC<GamifiedBottomNavProps> = ({
  activeTab,
  onTabPress,
}) => {
  const navItems = [
    { id: 'home', icon: 'home', label: 'Home' },
    { id: 'ranking', icon: 'trophy', label: 'Ranking' },
    { id: 'contest', icon: 'medal', label: 'Contest' },
    { id: 'messages', icon: 'chatbubble', label: 'Messages' },
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
            size={18}
            color={activeTab === item.id ? gamifiedTheme.colors.primary : '#d0d0d0'}
          />
          <Text
            style={[
              styles.navLabel,
              { color: activeTab === item.id ? gamifiedTheme.colors.primary : '#d0d0d0' }
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
    height: 70,
    backgroundColor: gamifiedTheme.colors.background.main,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: gamifiedTheme.spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navLabel: {
    fontSize: gamifiedTheme.fontSize.xs,
    fontWeight: gamifiedTheme.fontWeight.bold,
    marginTop: 4,
  },
} as any);