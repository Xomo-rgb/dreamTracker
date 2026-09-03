import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { professionalTheme } from '../theme/professional';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/authService';

export default function VisitReportScreen() {
  const params = useLocalSearchParams();
  const { patientId, patientName } = params;
  const [visitData, setVisitData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVisitData();
  }, []);

  const loadVisitData = async () => {
    try {
      const visitsRef = collection(db, 'visits');
      const q = query(
        visitsRef,
        where('patientId', '==', patientId)
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        // Sort in memory to avoid needing Firebase index
        const visits = querySnapshot.docs.map(doc => doc.data());
        const sorted = visits.sort((a: any, b: any) => {
          const timeA = a.completedAt?.toMillis() || 0;
          const timeB = b.completedAt?.toMillis() || 0;
          return timeB - timeA;
        });
        setVisitData(sorted[0]);
      }
    } catch (error) {
      console.error('Error loading visit data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading visit report...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!visitData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>No visit data found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={professionalTheme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Visit Report</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Patient Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person" size={20} color={professionalTheme.colors.primary} />
            <Text style={styles.sectionTitle}>Patient Information</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.patientName}>{patientName || 'Unknown Patient'}</Text>
            <View style={styles.statusBadge}>
              <Ionicons name="checkmark-circle" size={16} color={professionalTheme.colors.status.success} />
              <Text style={styles.statusText}>Visit Completed</Text>
            </View>
          </View>
        </View>

        {/* Check-in Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={20} color={professionalTheme.colors.primary} />
            <Text style={styles.sectionTitle}>Check-in Details</Text>
          </View>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Location:</Text>
              <Text style={styles.infoValue}>{visitData.checkInLocation || 'Location recorded'}</Text>
            </View>
            {visitData.checkInCoordinates && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Coordinates:</Text>
                <Text style={styles.infoValue}>
                  {visitData.checkInCoordinates.latitude.toFixed(4)}, {visitData.checkInCoordinates.longitude.toFixed(4)}
                </Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Completed:</Text>
              <Text style={styles.infoValue}>{formatDate(visitData.completedAt)}</Text>
            </View>
          </View>
        </View>

        {/* Follow-up Answers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="clipboard" size={20} color={professionalTheme.colors.primary} />
            <Text style={styles.sectionTitle}>Follow-up Questions</Text>
          </View>
          
          {visitData.questions && visitData.questions.map((question: string, index: number) => (
            <View key={index} style={styles.answerCard}>
              <View style={styles.questionHeader}>
                <View style={styles.questionNumber}>
                  <Text style={styles.questionNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.questionText}>{question}</Text>
              </View>
              <View style={styles.answerBox}>
                <Text style={styles.answerText}>{visitData.answers[`q${index + 1}`] || 'No answer provided'}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Read-only Notice */}
        <View style={styles.noticeCard}>
          <Ionicons name="lock-closed" size={20} color={professionalTheme.colors.text.muted} />
          <Text style={styles.noticeText}>This report is read-only and cannot be edited</Text>
        </View>
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: professionalTheme.spacing.lg,
  },
  section: {
    marginTop: professionalTheme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: professionalTheme.spacing.sm,
    marginBottom: professionalTheme.spacing.md,
  },
  sectionTitle: {
    fontSize: professionalTheme.fontSize.md,
    fontWeight: professionalTheme.fontWeight.semibold as '600',
    color: professionalTheme.colors.text.primary,
  },
  infoCard: {
    backgroundColor: professionalTheme.colors.background.card,
    borderRadius: professionalTheme.borderRadius.lg,
    padding: professionalTheme.spacing.lg,
    borderWidth: 1,
    borderColor: professionalTheme.colors.border,
  },
  patientName: {
    fontSize: professionalTheme.fontSize.xl,
    fontWeight: professionalTheme.fontWeight.bold as '700',
    color: professionalTheme.colors.text.primary,
    marginBottom: professionalTheme.spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: professionalTheme.spacing.xs,
    alignSelf: 'flex-start',
    backgroundColor: `${professionalTheme.colors.status.success}15`,
    paddingHorizontal: professionalTheme.spacing.md,
    paddingVertical: professionalTheme.spacing.xs,
    borderRadius: professionalTheme.borderRadius.md,
  },
  statusText: {
    fontSize: professionalTheme.fontSize.sm,
    fontWeight: professionalTheme.fontWeight.medium as '500',
    color: professionalTheme.colors.status.success,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: professionalTheme.spacing.sm,
  },
  infoLabel: {
    fontSize: professionalTheme.fontSize.sm,
    color: professionalTheme.colors.text.muted,
    fontWeight: professionalTheme.fontWeight.medium as '500',
  },
  infoValue: {
    fontSize: professionalTheme.fontSize.sm,
    color: professionalTheme.colors.text.primary,
    fontWeight: professionalTheme.fontWeight.semibold as '600',
    flex: 1,
    textAlign: 'right',
  },
  answerCard: {
    backgroundColor: professionalTheme.colors.background.card,
    borderRadius: professionalTheme.borderRadius.lg,
    padding: professionalTheme.spacing.lg,
    marginBottom: professionalTheme.spacing.md,
    borderWidth: 1,
    borderColor: professionalTheme.colors.border,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: professionalTheme.spacing.md,
    gap: professionalTheme.spacing.sm,
  },
  questionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: professionalTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionNumberText: {
    fontSize: professionalTheme.fontSize.sm,
    fontWeight: professionalTheme.fontWeight.bold as '700',
    color: professionalTheme.colors.text.white,
  },
  questionText: {
    flex: 1,
    fontSize: professionalTheme.fontSize.md,
    fontWeight: professionalTheme.fontWeight.medium as '500',
    color: professionalTheme.colors.text.primary,
    lineHeight: 22,
  },
  answerBox: {
    backgroundColor: professionalTheme.colors.background.light,
    borderRadius: professionalTheme.borderRadius.md,
    padding: professionalTheme.spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: professionalTheme.colors.primary,
  },
  answerText: {
    fontSize: professionalTheme.fontSize.sm,
    color: professionalTheme.colors.text.secondary,
    lineHeight: 20,
  },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: professionalTheme.spacing.sm,
    backgroundColor: `${professionalTheme.colors.text.muted}10`,
    borderRadius: professionalTheme.borderRadius.md,
    padding: professionalTheme.spacing.md,
    marginVertical: professionalTheme.spacing.xl,
  },
  noticeText: {
    fontSize: professionalTheme.fontSize.sm,
    color: professionalTheme.colors.text.muted,
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: professionalTheme.fontSize.md,
    color: professionalTheme.colors.text.muted,
  },
} as any);
