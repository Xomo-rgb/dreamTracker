import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomAlert } from '../components/common/CustomAlert';
import { PatientService } from '../services/patientService';
import { AssignmentService } from '../services/assignmentService';
import { ActivityLogService } from '../services/activityLogService';
import { professionalTheme } from '../theme/professional';
import { useAuth } from '../hooks/AuthContext';

export default function PatientDetailScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const { name, age, visitReason, priority, assignedDate, isCompleted, assignmentId } = params;
  const [patient, setPatient] = useState<any>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [alert, setAlert] = useState({ visible: false, type: 'success' as 'success' | 'error', title: '', message: '' });

  const isCompletedVisit = isCompleted === 'true';

  const patientHasLocation = Boolean(patient?.location?.latitude && patient?.location?.longitude);

  useEffect(() => {
    loadPatientData();
  }, []);

  const loadPatientData = async () => {
    try {
      const patientId = params.id as string;
      if (patientId) {
        const patientData = await PatientService.getPatientById(patientId);
        setPatient(patientData);
      }
    } catch (error) {
      console.error('Error loading patient:', error);
    }
  };

  const handleDelete = () => {
    setShowMenu(false);
    Alert.alert(
      'Delete Patient',
      'Are you sure you want to delete this patient? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const patientName = patient?.name || name;
              await PatientService.deletePatient(params.id as string);
              
              if (user) {
                await ActivityLogService.logActivity(
                  'Patient Deleted',
                  user.uid,
                  `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
                  user.role,
                  `Deleted patient: ${patientName}`
                );
              }
              
              router.back();
              Alert.alert('Success', 'Patient deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete patient');
            }
          }
        }
      ]
    );
  };

  const handleEdit = () => {
    setShowMenu(false);
    router.push({
      pathname: '/edit-patient',
      params: {
        id: params.id,
        name: name,
      }
    });
  };

  const handleRecordLocation = async () => {
    const { LocationService } = await import('../services/locationService');
    
    if (isRecording) return;
    
    setIsRecording(true);
    console.log('Starting location recording...');
    console.log('Params:', params);
    
    const location = await LocationService.getCurrentLocation();
    console.log('Got location:', location);
    
    if (!location) {
      setAlert({
        visible: true,
        type: 'error',
        title: 'GPS Error',
        message: 'Unable to get current location. Please enable GPS.'
      });
      setIsRecording(false);
      return;
    }

    try {
      // Save location to Firebase
      const patientId = params.id as string; // Get patient ID from params
      console.log('Updating patient ID:', patientId);
      
      await PatientService.updatePatientInfo(patientId, {
        location: {
          latitude: location.latitude,
          longitude: location.longitude
        }
      });
      
      console.log('Firebase update successful');
      
      // Update local state
      setPatient((prev: any) => ({
        ...prev,
        location: {
          latitude: location.latitude,
          longitude: location.longitude
        }
      }));
      
      setAlert({
        visible: true,
        type: 'success',
        title: 'Location Saved',
        message: 'Patient location has been recorded successfully.'
      });
    } catch (error) {
      console.error('Error saving location:', error);
      setAlert({
        visible: true,
        type: 'error',
        title: 'Save Failed',
        message: 'Failed to save location. Please try again.'
      });
    } finally {
      setIsRecording(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return professionalTheme.colors.status.error;
      case 'Medium': return professionalTheme.colors.status.warning;
      case 'Low': return professionalTheme.colors.status.info;
      case 'Completed': return professionalTheme.colors.status.success;
      default: return professionalTheme.colors.text.muted;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomAlert
        visible={alert.visible}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onHide={() => setAlert(prev => ({ ...prev, visible: false }))}
      />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={professionalTheme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Patient Details</Text>
        <TouchableOpacity 
          style={styles.moreButton}
          onPress={() => setShowMenu(true)}
        >
          <Ionicons name="ellipsis-horizontal" size={24} color={professionalTheme.colors.text.primary} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={handleEdit}>
              <Ionicons name="create-outline" size={20} color={professionalTheme.colors.primary} />
              <Text style={styles.menuText}>Edit Patient</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={20} color={professionalTheme.colors.status.error} />
              <Text style={[styles.menuText, styles.deleteText]}>Delete Patient</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.patientCard}>
          <View style={styles.patientHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(name as string)?.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>{name}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patient Information</Text>
          <View style={styles.patientDataCard}>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Name:</Text>
              <Text style={styles.dataValue}>{patient?.name || name}</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Age:</Text>
              <Text style={styles.dataValue}>{patient?.age || age} years</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Gender:</Text>
              <Text style={styles.dataValue}>{patient?.gender || 'Not specified'}</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Marital Status:</Text>
              <Text style={styles.dataValue}>{patient?.maritalStatus || 'Not specified'}</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Phone:</Text>
              <Text style={styles.dataValue}>{patient?.phone || 'Not specified'}</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Email:</Text>
              <Text style={styles.dataValue}>{patient?.email || 'Not specified'}</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Address:</Text>
              <Text style={styles.dataValue}>{patient?.address || 'Not specified'}</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Emergency Contact:</Text>
              <Text style={styles.dataValue}>{patient?.emergencyContact || 'Not specified'}</Text>
            </View>
          </View>
        </View>

        {/* Only show action buttons if this is an assignment (expert view) */}
        {assignmentId && (isCompletedVisit ? (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => router.push({
                pathname: '/visit-report',
                params: {
                  patientId: params.id,
                  assignmentId: assignmentId,
                  patientName: name,
                }
              })}
            >
              <Ionicons name="document-text" size={20} color={professionalTheme.colors.text.white} style={styles.buttonIcon} />
              <Text style={styles.primaryButtonText}>View Visit Report</Text>
            </TouchableOpacity>
          </View>
        ) : user?.role === 'expert' ? (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => router.push({
                pathname: '/visit',
                params: {
                  patientId: params.id,
                  assignmentId: assignmentId,
                  patientName: name,
                }
              })}
            >
              <Ionicons name="play-circle" size={20} color={professionalTheme.colors.text.white} style={styles.buttonIcon} />
              <Text style={styles.primaryButtonText}>Start Visit</Text>
            </TouchableOpacity>
          </View>
        ) : null)}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: professionalTheme.colors.background.light,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: professionalTheme.spacing.lg,
    paddingVertical: professionalTheme.spacing.md,
    backgroundColor: professionalTheme.colors.background.main,
    borderBottomWidth: 1,
    borderBottomColor: professionalTheme.colors.border,
  },
  backButton: {
    padding: professionalTheme.spacing.sm,
  },
  headerTitle: {
    fontSize: professionalTheme.fontSize.lg,
    fontWeight: professionalTheme.fontWeight.semibold as '600',
    color: professionalTheme.colors.text.primary,
  },
  moreButton: {
    padding: professionalTheme.spacing.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: professionalTheme.spacing.lg,
  },
  patientCard: {
    backgroundColor: professionalTheme.colors.background.card,
    borderRadius: professionalTheme.borderRadius.lg,
    padding: professionalTheme.spacing.xl,
    marginVertical: professionalTheme.spacing.lg,
    borderWidth: 1,
    borderColor: professionalTheme.colors.border,
  },
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: `${professionalTheme.colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: professionalTheme.spacing.lg,
  },
  avatarText: {
    fontSize: professionalTheme.fontSize.lg,
    fontWeight: professionalTheme.fontWeight.bold as '700',
    color: professionalTheme.colors.primary,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: professionalTheme.fontSize.xl,
    fontWeight: professionalTheme.fontWeight.bold as '700',
    color: professionalTheme.colors.text.primary,
    marginBottom: 4,
  },
  patientAge: {
    fontSize: professionalTheme.fontSize.sm,
    color: professionalTheme.colors.text.secondary,
    marginBottom: professionalTheme.spacing.sm,
  },
  priorityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: professionalTheme.spacing.md,
    paddingVertical: professionalTheme.spacing.xs,
    borderRadius: professionalTheme.borderRadius.md,
  },
  priorityText: {
    fontSize: professionalTheme.fontSize.xs,
    fontWeight: professionalTheme.fontWeight.medium as '500',
    color: professionalTheme.colors.text.white,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: professionalTheme.spacing.md,
    marginBottom: professionalTheme.spacing.lg,
  },
  infoCard: {
    flex: 1,
    backgroundColor: professionalTheme.colors.background.card,
    borderRadius: professionalTheme.borderRadius.lg,
    padding: professionalTheme.spacing.lg,
    borderWidth: 1,
    borderColor: professionalTheme.colors.border,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: professionalTheme.fontSize.xs,
    color: professionalTheme.colors.text.muted,
    marginTop: professionalTheme.spacing.sm,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: professionalTheme.fontSize.sm,
    fontWeight: professionalTheme.fontWeight.semibold as '600',
    color: professionalTheme.colors.text.primary,
    textAlign: 'center',
  },
  section: {
    marginBottom: professionalTheme.spacing.xl,
  },
  sectionTitle: {
    fontSize: professionalTheme.fontSize.lg,
    fontWeight: professionalTheme.fontWeight.semibold as '600',
    color: professionalTheme.colors.text.primary,
    marginBottom: professionalTheme.spacing.md,
  },
  vitalsGrid: {
    flexDirection: 'row',
    gap: professionalTheme.spacing.sm,
  },
  vitalCard: {
    flex: 1,
    backgroundColor: professionalTheme.colors.background.card,
    borderRadius: professionalTheme.borderRadius.md,
    padding: professionalTheme.spacing.md,
    borderWidth: 1,
    borderColor: professionalTheme.colors.border,
    alignItems: 'center',
  },
  vitalValue: {
    fontSize: professionalTheme.fontSize.md,
    fontWeight: professionalTheme.fontWeight.bold as '700',
    color: professionalTheme.colors.text.primary,
    marginBottom: 4,
  },
  vitalLabel: {
    fontSize: professionalTheme.fontSize.xs,
    color: professionalTheme.colors.text.muted,
    textAlign: 'center',
  },
  noteCard: {
    backgroundColor: professionalTheme.colors.background.card,
    borderRadius: professionalTheme.borderRadius.lg,
    padding: professionalTheme.spacing.lg,
    borderWidth: 1,
    borderColor: professionalTheme.colors.border,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: professionalTheme.spacing.sm,
  },
  noteDate: {
    fontSize: professionalTheme.fontSize.xs,
    color: professionalTheme.colors.text.muted,
  },
  noteAuthor: {
    fontSize: professionalTheme.fontSize.xs,
    color: professionalTheme.colors.text.muted,
  },
  noteText: {
    fontSize: professionalTheme.fontSize.sm,
    color: professionalTheme.colors.text.secondary,
    lineHeight: 20,
  },
  actionButtons: {
    gap: professionalTheme.spacing.md,
    marginBottom: professionalTheme.spacing.xl,
  },
  primaryButton: {
    backgroundColor: professionalTheme.colors.primary,
    borderRadius: professionalTheme.borderRadius.md,
    paddingVertical: professionalTheme.spacing.lg,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: professionalTheme.fontSize.md,
    fontWeight: professionalTheme.fontWeight.semibold as '600',
    color: professionalTheme.colors.text.white,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: professionalTheme.colors.primary,
    borderRadius: professionalTheme.borderRadius.md,
    paddingVertical: professionalTheme.spacing.lg,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: professionalTheme.spacing.sm,
  },
  secondaryButtonText: {
    fontSize: professionalTheme.fontSize.md,
    fontWeight: professionalTheme.fontWeight.semibold as '600',
    color: professionalTheme.colors.primary,
  },
  statusCard: {
    backgroundColor: `${professionalTheme.colors.status.warning}10`,
    borderRadius: professionalTheme.borderRadius.lg,
    padding: professionalTheme.spacing.lg,
    borderWidth: 1,
    borderColor: `${professionalTheme.colors.status.warning}30`,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: professionalTheme.spacing.sm,
  },
  statusTitle: {
    fontSize: professionalTheme.fontSize.md,
    fontWeight: professionalTheme.fontWeight.semibold as '600',
    color: professionalTheme.colors.status.warning,
    marginLeft: professionalTheme.spacing.sm,
  },
  statusText: {
    fontSize: professionalTheme.fontSize.sm,
    color: professionalTheme.colors.text.secondary,
    marginBottom: 4,
  },
  statusReason: {
    fontSize: professionalTheme.fontSize.sm,
    color: professionalTheme.colors.text.primary,
    fontWeight: professionalTheme.fontWeight.medium as '500',
    marginTop: professionalTheme.spacing.xs,
  },
  patientDataCard: {
    backgroundColor: professionalTheme.colors.background.card,
    borderRadius: professionalTheme.borderRadius.lg,
    padding: professionalTheme.spacing.lg,
    borderWidth: 1,
    borderColor: professionalTheme.colors.border,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: professionalTheme.spacing.sm,
  },
  dataLabel: {
    fontSize: professionalTheme.fontSize.sm,
    color: professionalTheme.colors.text.muted,
    fontWeight: professionalTheme.fontWeight.medium as '500',
    flex: 1,
  },
  dataValue: {
    fontSize: professionalTheme.fontSize.sm,
    color: professionalTheme.colors.text.primary,
    flex: 2,
    textAlign: 'right',
  },
  buttonIcon: {
    marginRight: professionalTheme.spacing.sm,
  },
  locationCard: {
    borderRadius: professionalTheme.borderRadius.lg,
    padding: professionalTheme.spacing.lg,
    borderWidth: 1,
  },
  locationVerified: {
    backgroundColor: `${professionalTheme.colors.status.success}10`,
    borderColor: `${professionalTheme.colors.status.success}30`,
  },
  locationPending: {
    backgroundColor: `${professionalTheme.colors.status.warning}10`,
    borderColor: `${professionalTheme.colors.status.warning}30`,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: professionalTheme.spacing.sm,
  },
  locationTitle: {
    fontSize: professionalTheme.fontSize.md,
    fontWeight: professionalTheme.fontWeight.semibold as '600',
    marginLeft: professionalTheme.spacing.sm,
  },
  locationText: {
    fontSize: professionalTheme.fontSize.sm,
    color: professionalTheme.colors.text.secondary,
    marginBottom: professionalTheme.spacing.xs,
  },
  coordsText: {
    fontSize: professionalTheme.fontSize.xs,
    color: professionalTheme.colors.text.muted,
  },
  disabledButton: {
    backgroundColor: professionalTheme.colors.text.muted,
    opacity: 0.6,
  },
  completedCard: {
    backgroundColor: `${professionalTheme.colors.status.success}10`,
    borderRadius: professionalTheme.borderRadius.lg,
    padding: professionalTheme.spacing.lg,
    borderWidth: 1,
    borderColor: `${professionalTheme.colors.status.success}30`,
  },
  completedTitle: {
    fontSize: professionalTheme.fontSize.md,
    fontWeight: professionalTheme.fontWeight.semibold as '600',
    color: professionalTheme.colors.status.success,
    marginLeft: professionalTheme.spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: professionalTheme.spacing.lg,
  },
  menuContainer: {
    backgroundColor: professionalTheme.colors.background.card,
    borderRadius: professionalTheme.borderRadius.lg,
    padding: professionalTheme.spacing.sm,
    minWidth: 180,
    shadowColor: professionalTheme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: professionalTheme.spacing.sm,
    paddingVertical: professionalTheme.spacing.md,
    paddingHorizontal: professionalTheme.spacing.md,
  },
  menuText: {
    fontSize: professionalTheme.fontSize.md,
    color: professionalTheme.colors.text.primary,
  },
  deleteText: {
    color: professionalTheme.colors.status.error,
  },
  menuDivider: {
    height: 1,
    backgroundColor: professionalTheme.colors.border,
    marginVertical: professionalTheme.spacing.xs,
  },
} as any);