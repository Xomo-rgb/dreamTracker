import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { professionalTheme } from '../theme/professional';
import { useDebounce } from '../hooks/useDebounce';
import { useAuth } from '../hooks/AuthContext';
import { collection, getDocs, getDocsFromServer, addDoc, Timestamp, query, where } from 'firebase/firestore';
import { db } from '../services/authService';
import { AssignmentService } from '../services/assignmentService';
import { PatientService } from '../services/patientService';
import { ActivityLogService } from '../services/activityLogService';
import { NotificationService } from '../services/notificationService';
import { withTimeout } from '../utils/withTimeout';

interface Answer {
  questionId: number;
  answer: string;
  type: 'text' | 'choice';
}

// Mirrors the admin dashboard's seeded defaults (src/utils/seedQuestions.ts).
// Used as a last-resort local fallback so a visit is never blocked just
// because this device has no connectivity and has never cached the
// questionnaire before — this list changes rarely enough that a stale
// bundled copy is far better than refusing to let the visit proceed.
const DEFAULT_QUESTIONS = [
  { id: 'question_1', text: 'How are you feeling today?', order: 1 },
  { id: 'question_2', text: 'Why did you miss your previous appointment?', order: 2 },
  { id: 'question_3', text: 'On a scale of 0 to 10, how would you rate your pain level? (0 = no pain, 10 = worst pain)', order: 3 },
  { id: 'question_4', text: 'Have you been taking your medication as prescribed?', order: 4 },
  { id: 'question_5', text: 'Are you experiencing any side effects from your medication?', order: 5 },
  { id: 'question_6', text: 'What symptoms are you currently experiencing?', order: 6 },
  { id: 'question_7', text: 'Have your symptoms improved, stayed the same, or gotten worse?', order: 7 },
  { id: 'question_8', text: 'What challenges are preventing you from attending appointments?', order: 8 },
  { id: 'question_9', text: 'What can we do to help you attend your appointments regularly?', order: 9 },
  { id: 'question_10', text: 'Do you have any questions or concerns about your treatment?', order: 10 },
];

export default function FollowUpQuestionsScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const { name, patientId, assignmentId, checkInLocation, checkInLat, checkInLon } = params;
  
  console.log('FollowUpQuestions params:', { name, patientId, checkInLocation, checkInLat, checkInLon });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [textAnswer, setTextAnswer] = useState('');
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const { isProcessing, debounce } = useDebounce();

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const questionsRef = collection(db, 'questionnaire');
      // Prefer a fresh server read over the local cache: on a device that has
      // never cached this collection, a cache-only response under flaky
      // connectivity comes back empty (not an error), which looks identical
      // to "no questions configured." Fall back to getDocs (cache-aware) only
      // if the server round-trip itself fails, so we still degrade gracefully
      // when genuinely offline.
      const snapshot = await getDocsFromServer(questionsRef).catch(() => getDocs(questionsRef));
      let questionsData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          question: doc.data().text,
          type: 'text' as const,
          placeholder: 'Enter your answer...',
          order: doc.data().order
        }))
        .sort((a, b) => a.order - b.order);

      // Both the server and the cache came back with nothing — most likely
      // this device has no connectivity and has never synced this
      // collection before, rather than the questionnaire genuinely being
      // empty. Fall back to the bundled defaults so the visit can proceed.
      if (questionsData.length === 0) {
        console.warn('Questionnaire came back empty from both server and cache; using bundled defaults.');
        questionsData = DEFAULT_QUESTIONS.map(q => ({
          id: q.id,
          question: q.text,
          type: 'text' as const,
          placeholder: 'Enter your answer...',
          order: q.order,
        }));
      }

      setQuestions(questionsData);
    } catch (error) {
      console.error('Error loading questions:', error);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answer: string) => {
    const newAnswer: Answer = {
      questionId: currentQuestion + 1,
      answer,
      type: 'text'
    };

    const updatedAnswers = answers.filter(a => a.questionId !== currentQuestion + 1);
    setAnswers([...updatedAnswers, newAnswer]);
    setTextAnswer('');

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleTextSubmit = () => {
    if (textAnswer.trim()) {
      handleAnswer(textAnswer.trim());
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      const prevAnswer = answers.find(a => a.questionId === currentQuestion);
      if (prevAnswer) {
        setTextAnswer(prevAnswer.answer);
      }
    }
  };

  const handleSubmit = () => {
    debounce(async () => {
      Alert.alert(
        'Complete Visit',
        'Are you sure you want to complete this visit? The task will be marked as completed.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Complete Visit',
            onPress: async () => {
              setIsCompleting(true);
              try {
              // Get actual patient name from database. This is a nice-to-have
              // enrichment (we already have a name from route params), so a
              // failure here — e.g. no connectivity and this patient was
              // never cached — must not block the actual visit record below.
              let actualPatientName = name as string;
              if (patientId) {
                try {
                  const patient = await withTimeout(
                    PatientService.getPatientById(patientId as string),
                    6000,
                    'patient name lookup'
                  );
                  if (patient) {
                    actualPatientName = patient.name;
                  }
                } catch (patientLookupError) {
                  console.error('Could not refresh patient name, using cached value:', patientLookupError);
                }
              }

              // The logged-in expert's identity is already available from
              // AuthContext — no need to round-trip through the assignment
              // and users collections to re-derive it.
              const expertId = user?.uid || '';
              const expertName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email || 'Unknown Expert';

              const answersObj = answers.reduce((acc, ans) => {
                acc[`q${ans.questionId}`] = ans.answer;
                return acc;
              }, {} as Record<string, string>);

              const visitData = {
                patientId: patientId as string,
                assignmentId: assignmentId as string,
                patientName: actualPatientName,
                expertId,
                expertName,
                checkInLocation: (checkInLocation as string) || 'Location recorded',
                checkInCoordinates: {
                  latitude: checkInLat ? parseFloat(checkInLat as string) : 0,
                  longitude: checkInLon ? parseFloat(checkInLon as string) : 0,
                },
                answers: answersObj,
                questions: questions.map(q => q.question),
                completedAt: Timestamp.now(),
                createdAt: Timestamp.now(),
              };

              console.log('Saving visit data:', visitData);
              // This is the one write that must actually succeed for the visit
              // to count — Firestore's offline queue applies it to the local
              // cache and resolves immediately even with zero connectivity, so
              // this timeout is a safety net, not the expected path.
              await withTimeout(addDoc(collection(db, 'visits'), visitData), 15000, 'saving the visit');

              // Everything below is best-effort follow-up work (activity log,
              // marking the assignment complete, notifying admins). The visit
              // itself is already saved at this point, so none of these
              // should be able to block the success message from showing.
              try {
                await withTimeout(
                  ActivityLogService.logActivity(
                    'Visit Completed',
                    expertId,
                    expertName,
                    'expert',
                    `Completed visit with ${actualPatientName}`
                  ),
                  6000,
                  'activity log'
                );
              } catch (logError) {
                console.error('Could not log activity (visit was still saved):', logError);
              }

              if (assignmentId) {
                try {
                  await withTimeout(
                    AssignmentService.updateAssignmentStatus(
                      assignmentId as string,
                      'completed',
                      new Date().toISOString()
                    ),
                    6000,
                    'marking assignment complete'
                  );
                } catch (statusError) {
                  console.error('Could not update assignment status (visit was still saved):', statusError);
                }
              }

              // Send notification to all admins
              try {
                const usersRef = collection(db, 'users');
                const adminQuery = query(usersRef, where('role', '==', 'admin'));
                const adminSnapshot = await withTimeout(getDocs(adminQuery), 6000, 'admin lookup');
                
                console.log('Found admins:', adminSnapshot.size);
                
                const notificationPromises = adminSnapshot.docs.map(adminDoc => {
                  console.log('Sending notification to admin:', adminDoc.id);
                  return NotificationService.sendNotification(
                    adminDoc.id,
                    'Visit Completed',
                    `${expertName} completed a visit with ${actualPatientName}`,
                    'completion',
                    { patientId: patientId as string, assignmentId: assignmentId as string }
                  );
                });
                await Promise.all(notificationPromises);
                console.log('All notifications sent successfully');
              } catch (notifError) {
                console.error('Error sending notifications:', notifError);
              }

              setIsCompleting(false);
              Alert.alert(
                'Visit Completed',
                'The visit has been completed successfully. The task has been moved to completed.',
                [{ text: 'OK', onPress: () => router.replace('/(tabs)/patients') }]
              );
              } catch (error) {
                console.error('Error completing visit:', error);
                setIsCompleting(false);
                Alert.alert('Error', 'Failed to complete visit. Please try again.');
              }
            }
          }
        ]
      );
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={professionalTheme.colors.primary} />
          <Text style={styles.loadingText}>Loading questions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loadError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="cloud-offline-outline" size={64} color={professionalTheme.colors.text.muted} />
          <Text style={styles.emptyText}>Couldn't load the follow-up questions</Text>
          <Text style={styles.loadingText}>Check your connection and try again.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadQuestions}>
            <Text style={styles.submitButtonText}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (questions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="help-circle-outline" size={64} color={professionalTheme.colors.text.muted} />
          <Text style={styles.emptyText}>No questions available</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={professionalTheme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Follow-up Questions</Text>
        <Text style={styles.patientName}>{name}</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{currentQuestion + 1} of {questions.length}</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.questionCard}>
          <Text style={styles.questionNumber}>Question {currentQuestion + 1}</Text>
          <Text style={styles.questionText}>{currentQ.question}</Text>

          {currentQ.type === 'text' && (
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder={currentQ.placeholder}
                value={textAnswer}
                onChangeText={setTextAnswer}
                multiline
                numberOfLines={4}
              />
              <TouchableOpacity
                style={[styles.submitTextButton, !textAnswer.trim() && styles.disabledButton]}
                onPress={handleTextSubmit}
                disabled={!textAnswer.trim()}
              >
                <Text style={styles.submitTextButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={[styles.navButton, currentQuestion === 0 && styles.disabledButton]}
          onPress={handlePrevious}
          disabled={currentQuestion === 0}
        >
          <Text style={styles.navButtonText}>Previous</Text>
        </TouchableOpacity>

        {currentQuestion === questions.length - 1 && answers.length === questions.length && (
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isProcessing || isCompleting}>
            <Text style={styles.submitButtonText}>{isCompleting ? 'Completing...' : 'Complete Visit'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {isCompleting && (
        <View style={styles.completingOverlay}>
          <View style={styles.completingCard}>
            <ActivityIndicator size="large" color={professionalTheme.colors.primary} />
            <Text style={styles.completingText}>Completing visit...</Text>
            <Text style={styles.completingSubtext}>This can take a bit longer with a weak connection — it will still save.</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: professionalTheme.colors.background.light,
  },
  completingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(12, 30, 61, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: professionalTheme.spacing.xl,
  },
  completingCard: {
    backgroundColor: professionalTheme.colors.background.card,
    borderRadius: professionalTheme.borderRadius.lg,
    padding: professionalTheme.spacing.xl,
    alignItems: 'center',
    gap: professionalTheme.spacing.sm,
    maxWidth: 320,
  },
  completingText: {
    fontSize: professionalTheme.fontSize.md,
    fontWeight: professionalTheme.fontWeight.semibold as '600',
    color: professionalTheme.colors.text.primary,
  },
  completingSubtext: {
    fontSize: professionalTheme.fontSize.sm,
    color: professionalTheme.colors.text.muted,
    textAlign: 'center',
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
  backButtonText: {
    fontSize: professionalTheme.fontSize.md,
    fontWeight: professionalTheme.fontWeight.medium as '500',
    color: professionalTheme.colors.text.secondary,
  },
  retryButton: {
    backgroundColor: professionalTheme.colors.primary,
    borderRadius: professionalTheme.borderRadius.md,
    paddingVertical: professionalTheme.spacing.md,
    paddingHorizontal: professionalTheme.spacing.xl,
    marginBottom: professionalTheme.spacing.md,
  },
  headerTitle: {
    fontSize: professionalTheme.fontSize.lg,
    fontWeight: professionalTheme.fontWeight.semibold,
    color: professionalTheme.colors.text.primary,
  },
  patientName: {
    fontSize: professionalTheme.fontSize.sm,
    color: professionalTheme.colors.text.secondary,
  },
  progressContainer: {
    paddingHorizontal: professionalTheme.spacing.lg,
    paddingVertical: professionalTheme.spacing.md,
  },
  progressBar: {
    height: 4,
    backgroundColor: professionalTheme.colors.border,
    borderRadius: 2,
    marginBottom: professionalTheme.spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: professionalTheme.colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: professionalTheme.fontSize.xs,
    color: professionalTheme.colors.text.muted,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: professionalTheme.spacing.lg,
  },
  questionCard: {
    backgroundColor: professionalTheme.colors.background.card,
    borderRadius: professionalTheme.borderRadius.lg,
    padding: professionalTheme.spacing.xl,
    marginVertical: professionalTheme.spacing.lg,
    borderWidth: 1,
    borderColor: professionalTheme.colors.border,
  },
  questionNumber: {
    fontSize: professionalTheme.fontSize.sm,
    color: professionalTheme.colors.primary,
    fontWeight: professionalTheme.fontWeight.semibold,
    marginBottom: professionalTheme.spacing.sm,
  },
  questionText: {
    fontSize: professionalTheme.fontSize.lg,
    color: professionalTheme.colors.text.primary,
    fontWeight: professionalTheme.fontWeight.medium,
    marginBottom: professionalTheme.spacing.xl,
    lineHeight: 24,
  },
  optionsContainer: {
    gap: professionalTheme.spacing.sm,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: professionalTheme.spacing.lg,
    backgroundColor: professionalTheme.colors.background.light,
    borderRadius: professionalTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: professionalTheme.colors.border,
  },
  optionText: {
    fontSize: professionalTheme.fontSize.md,
    color: professionalTheme.colors.text.primary,
    flex: 1,
  },
  textInputContainer: {
    gap: professionalTheme.spacing.md,
  },
  textInput: {
    borderWidth: 1,
    borderColor: professionalTheme.colors.border,
    borderRadius: professionalTheme.borderRadius.md,
    padding: professionalTheme.spacing.lg,
    fontSize: professionalTheme.fontSize.md,
    color: professionalTheme.colors.text.primary,
    backgroundColor: professionalTheme.colors.background.card,
    textAlignVertical: 'top',
    minHeight: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  submitTextButton: {
    backgroundColor: professionalTheme.colors.primary,
    borderRadius: professionalTheme.borderRadius.md,
    paddingVertical: professionalTheme.spacing.md,
    alignItems: 'center',
  },
  submitTextButtonText: {
    color: professionalTheme.colors.text.white,
    fontSize: professionalTheme.fontSize.md,
    fontWeight: professionalTheme.fontWeight.semibold,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: professionalTheme.spacing.lg,
    paddingVertical: professionalTheme.spacing.lg,
    backgroundColor: professionalTheme.colors.background.main,
    borderTopWidth: 1,
    borderTopColor: professionalTheme.colors.border,
  },
  navButton: {
    paddingHorizontal: professionalTheme.spacing.xl,
    paddingVertical: professionalTheme.spacing.md,
    borderRadius: professionalTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: professionalTheme.colors.border,
  },
  navButtonText: {
    fontSize: professionalTheme.fontSize.md,
    color: professionalTheme.colors.text.primary,
    fontWeight: professionalTheme.fontWeight.medium,
  },
  submitButton: {
    backgroundColor: professionalTheme.colors.primary,
    paddingHorizontal: professionalTheme.spacing.xl,
    paddingVertical: professionalTheme.spacing.md,
    borderRadius: professionalTheme.borderRadius.md,
  },
  submitButtonText: {
    color: professionalTheme.colors.text.white,
    fontSize: professionalTheme.fontSize.md,
    fontWeight: professionalTheme.fontWeight.semibold,
  },
  disabledButton: {
    opacity: 0.5,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: professionalTheme.spacing.xl,
  },
  loadingText: {
    fontSize: professionalTheme.fontSize.md,
    color: professionalTheme.colors.text.secondary,
    marginTop: professionalTheme.spacing.md,
  },
  emptyText: {
    fontSize: professionalTheme.fontSize.md,
    color: professionalTheme.colors.text.muted,
    marginTop: professionalTheme.spacing.md,
    marginBottom: professionalTheme.spacing.xl,
  },
  otherInputContainer: {
    marginTop: professionalTheme.spacing.md,
    padding: professionalTheme.spacing.md,
    backgroundColor: professionalTheme.colors.background.light,
    borderRadius: professionalTheme.borderRadius.md,
    borderWidth: 2,
    borderColor: professionalTheme.colors.primary,
  },
  otherLabel: {
    fontSize: professionalTheme.fontSize.sm,
    color: professionalTheme.colors.text.primary,
    fontWeight: professionalTheme.fontWeight.semibold,
    marginBottom: professionalTheme.spacing.sm,
  },
} as any);