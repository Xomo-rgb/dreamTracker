import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { gamifiedTheme } from '../../theme/gamified';

interface GamifiedHeaderProps {
  userName: string;
  userLevel: string;
  userPoints: number;
  userRating: number;
  onNotificationPress?: () => void;
  showSearch?: boolean;
  onSearchPress?: () => void;
}

export const GamifiedHeader: React.FC<GamifiedHeaderProps> = ({
  userName,
  userLevel,
  userPoints,
  userRating,
  onNotificationPress,
  showSearch,
  onSearchPress,
}) => {
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(userRating);
    
    for (let i = 0; i < 4; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i < fullStars ? 'star' : 'star-outline'}
          size={10}
          color={gamifiedTheme.colors.currency}
        />
      );
    }
    return stars;
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <Ionicons
            name="trophy" as any
            size={14}
            color={gamifiedTheme.colors.currency}
            style={styles.crown}
          />
          <View style={styles.avatar}>
            <Ionicons name="person" size={24} color={gamifiedTheme.colors.primary} />
          </View>
        </View>
        
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userLevel}>{userLevel}</Text>
          <View style={styles.starsContainer}>
            {renderStars()}
          </View>
        </View>
      </View>

      <View style={styles.rightSection}>
        {showSearch && (
          <TouchableOpacity onPress={onSearchPress} style={styles.iconButton}>
            <Ionicons name="search" size={18} color={gamifiedTheme.colors.primary} />
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={styles.currencyBadge} onPress={onNotificationPress}>
          <Text style={styles.currencyText}>{userPoints}</Text>
          <Ionicons name="diamond" size={14} color={gamifiedTheme.colors.text.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: gamifiedTheme.spacing.xl,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: gamifiedTheme.spacing.md,
  },
  avatarContainer: {
    position: 'relative',
    width: 60,
    height: 60,
  },
  crown: {
    position: 'absolute',
    top: -8,
    right: -4,
    zIndex: 1,
    transform: [{ rotate: '15deg' }],
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: `${gamifiedTheme.colors.primary}20`,
    borderWidth: 3,
    borderColor: gamifiedTheme.colors.currency,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    gap: 2,
  },
  userName: {
    fontSize: gamifiedTheme.fontSize.md,
    fontWeight: gamifiedTheme.fontWeight.bold,
    color: gamifiedTheme.colors.text.main,
  },
  userLevel: {
    fontSize: gamifiedTheme.fontSize.xs,
    color: gamifiedTheme.colors.text.muted,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: gamifiedTheme.spacing.md,
  },
  iconButton: {
    padding: gamifiedTheme.spacing.sm,
  },
  currencyBadge: {
    backgroundColor: gamifiedTheme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: gamifiedTheme.spacing.md,
    paddingVertical: gamifiedTheme.spacing.sm,
    borderRadius: gamifiedTheme.borderRadius.xl,
    gap: 5,
  },
  currencyText: {
    color: gamifiedTheme.colors.text.white,
    fontSize: gamifiedTheme.fontSize.sm,
    fontWeight: gamifiedTheme.fontWeight.bold,
  },
} as any);