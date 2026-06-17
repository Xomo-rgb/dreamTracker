import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { professionalTheme } from '../theme/professional';
import { useDebounce } from '../hooks/useDebounce';

interface Answer {
  questionId: number;
  answer: string;
  type: 'text' | 'choice';
}

export default function FollowUpQuestionsScreen() {
  const params = useLocalSearchParams();
  const { name, patientId, assignmentId, checkInLocation, checkInLat, checkInLon } = params;
  
  console.log('FollowUpQuestions params:', { name, patientId, checkInLocation, checkInLat, checkInLon });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [textAnswer, setTextAnswer] = useState('');
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isProcessing, debounce } = useDebounce();

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const { collection, getDocs } = await import('firebase/firestore');
      const { db } = await import('../services/authService');
      
      const questionsRef = collection(db, 'questionnaire');
      const snapshot = await getDocs(questionsRef);
      const questionsData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          question: doc.data().text,
          type: 'text' as const,
          placeholder: 'Enter your answer...',
          order: doc.data().order
        }))
        .sort((a, b) => a.order - b.order);
      
      setQuestions(questionsData);
    } catch (error) {
      console.error('Error loading questions:', error);
      Alert.alert('Error', 'Failed to load questions');
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
              try {
              const { AssignmentService } = await import('../services/assignmentService');
              const { PatientService } = await import('../services/patientService');
              const { collection, addDoc, Timestamp, doc, getDoc } = await import('firebase/firestore');
              const { db } = await import('../services/authService');
              const { useAuth } = await import('../hooks/AuthContext');

              // Get actual patient name from database
              let actualPatientName = name as string;
              if (patientId) {
                const patient = await PatientService.getPatientById(patientId as string);
                if (patient) {
                  actualPatientName = patient.name;
                }
              }

              // Get expert name from users collection
              let expertName = 'Unknown Expert';
              const assignment = await AssignmentService.getAssignmentById(assignmentId as string);
              if (assignment?.expertId) {
                const expertDoc = await getDoc(doc(db, 'users', assignment.expertId));
                if (expertDoc.exists()) {
                  const expertData = expertDoc.data();
                  expertName = `${expertData.firstName || ''} ${expertData.lastName || ''}`.trim() || expertData.email;
                }
              }

              const answersObj = answers.reduce((acc, ans) => {
                acc[`q${ans.questionId}`] = ans.answer;
                return acc;
              }, {} as Record<string, string>);

              const visitData = {
                patientId: patientId as string,
                assignmentId: assignmentId as string,
                patientName: actualPatientName,
                expertId: assignment?.expertId || '',
                expertName: expertName,
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
              await addDoc(collection(db, 'visits'), visitData);

              // Log activity
              const { ActivityLogService } = await import('../services/activityLogService');
              await ActivityLogService.logActivity(
                'Visit Completed',
                assignment?.expertId || '',
                expertName,
                'expert',
                `Completed visit with ${actualPatientName}`
              );

              if (assignmentId) {
                await AssignmentService.updateAssignmentStatus(
                  assignmentId as string,
                  'completed',
                  new Date().toISOString()
                );
              }

              // Send notification to all admins
              try {
                const { NotificationService } = await import('../services/notificationService');
                const { query, where, getDocs } = await import('firebase/firestore');
                const usersRef = collection(db, 'users');
                const adminQuery = query(usersRef, where('role', '==', 'admin'));
                const adminSnapshot = await getDocs(adminQuery);
                
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

              Alert.alert(
                'Visit Completed',
                'The visit has been completed successfully. The task has been moved to completed.',
                [{ text: 'OK', onPress: () => router.replace('/(tabs)/patients') }]
              );
              } catch (error) {
                console.error('Error completing visit:', error);
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
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isProcessing}>
            <Text style={styles.submitButtonText}>{isProcessing ? 'Completing...' : 'Complete Visit'}</Text>
          </TouchableOpacity>
        )}
      </View>
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
    textAlignVertical: 'top',
    minHeight: 100,
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