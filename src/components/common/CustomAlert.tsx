import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { professionalTheme } from '../../theme/professional';

interface CustomAlertProps {
  visible: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  onHide: () => void;
  autoHideDuration?: number;
}

export const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  type,
  title,
  message,
  onHide,
  autoHideDuration = 3000,
}) => {
  useEffect(() => {
    if (visible && autoHideDuration > 0) {
      const timer = setTimeout(() => {
        onHide();
      }, autoHideDuration);
      return () => clearTimeout(timer);
    }
  }, [visible, autoHideDuration, onHide]);

  const getIconName = (): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'success': return 'checkmark-circle';
      case 'error': return 'close-circle';
      case 'warning': return 'warning';
      case 'info': return 'information-circle';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'success': return professionalTheme.colors.status.success;
      case 'error': return professionalTheme.colors.status.error;
      case 'warning': return professionalTheme.colors.status.warning;
      case 'info': return professionalTheme.colors.status.info;
    }
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onHide}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { borderLeftColor: getColor() }]}>
          <View style={styles.iconContainer}>
            <Ionicons name={getIconName()} size={32} color={getColor()} />
          </View>
          <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
          </View>
          <TouchableOpacity onPress={onHide} style={styles.closeButton}>
            <Ionicons name="close" size={20} color={professionalTheme.colors.text.muted} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: professionalTheme.spacing.lg,
  },
  container: {
    backgroundColor: professionalTheme.colors.background.card,
    borderRadius: professionalTheme.borderRadius.lg,
    padding: professionalTheme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  iconContainer: {
    marginRight: professionalTheme.spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: professionalTheme.fontSize.md,
    fontWeight: professionalTheme.fontWeight.semibold as '600',
    color: professionalTheme.colors.text.primary,
    marginBottom: professionalTheme.spacing.xs,
  },
  message: {
    fontSize: professionalTheme.fontSize.sm,
    color: professionalTheme.colors.text.secondary,
  },
  closeButton: {
    padding: professionalTheme.spacing.sm,
  },
});
