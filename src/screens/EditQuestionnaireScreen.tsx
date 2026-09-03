import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { professionalTheme } from '../theme/professional';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/authService';

interface Question {
  id: string;
  text: string;
  order: number;
}

export default function EditQuestionnaireScreen() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [newQuestion, setNewQuestion] = useState('');

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      console.log('Loading questions from Firebase...');
      const questionsRef = collection(db, 'questionnaire');
      const snapshot = await getDocs(questionsRef);
      console.log('Snapshot size:', snapshot.size);
      
      const questionsData = snapshot.docs
        .map(doc => {
          console.log('Question doc:', doc.id, doc.data());
          return {
            id: doc.id,
            ...doc.data()
          } as Question;
        })
        .sort((a, b) => a.order - b.order);
      
      console.log('Loaded questions:', questionsData);
      setQuestions(questionsData);
      
      if (questionsData.length === 0) {
        console.log('No questions found in database');
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      Alert.alert('Error', 'Failed to load questions. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.trim()) {
      Alert.alert('Error', 'Please enter a question');
      return;
    }

    try {
      const newOrder = questions.length > 0 ? Math.max(...questions.map(q => q.order)) + 1 : 1;
      const questionId = `question_${Date.now()}`;
      
      await setDoc(doc(db, 'questionnaire', questionId), {
        text: newQuestion.trim(),
        order: newOrder
      });

      setNewQuestion('');
      Alert.alert('Success', 'Question added successfully');
      loadQuestions();
    } catch (error) {
      console.error('Error adding question:', error);
      Alert.alert('Error', 'Failed to add question');
    }
  };

  const handleEditQuestion = async (questionId: string) => {
    if (!editText.trim()) {
      Alert.alert('Error', 'Question cannot be empty');
      return;
    }

    try {
      const question = questions.find(q => q.id === questionId);
      await setDoc(doc(db, 'questionnaire', questionId), {
        text: editText.trim(),
        order: question?.order || 0
      });

      setEditingId(null);
      setEditText('');
      Alert.alert('Success', 'Question updated successfully');
      loadQuestions();
    } catch (error) {
      console.error('Error updating question:', error);
      Alert.alert('Error', 'Failed to update question');
    }
  };

  const handleDeleteQuestion = (questionId: string) => {
    Alert.alert(
      'Delete Question',
      'Are you sure you want to delete this question?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'questionnaire', questionId));
              Alert.alert('Success', 'Question deleted successfully');
              loadQuestions();
            } catch (error) {
              console.error('Error deleting question:', error);
              Alert.alert('Error', 'Failed to delete question');
            }
          }
        }
      ]
    );
  };

  const startEditing = (question: Question) => {
    setEditingId(question.id);
    setEditText(question.text);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditText('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={professionalTheme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Questionnaire</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Follow-up Questions</Text>
        <Text style={styles.sectionSubtitle}>
          These questions will be asked during patient visits
        </Text>

        {loading ? (
          <View style={styles.loadingState}>
            <Text style={styles.loadingText}>Loading questions...</Text>
          </View>
        ) : (
          <>
            {questions.map((question, index) => (
              <View key={question.id} style={styles.questionCard}>
                <View style={styles.questionNumber}>
                  <Text style={styles.questionNumberText}>{index + 1}</Text>
                </View>
                
                {editingId === question.id ? (
                  <View style={styles.editContainer}>
                    <TextInput
                      style={styles.editInput}
                      value={editText}
                      onChangeText={setEditText}
                      multiline
                      autoFocus
                    />
                    <View style={styles.editActions}>
                      <TouchableOpacity
                        style={styles.saveButton}
                        onPress={() => handleEditQuestion(question.id)}
                      >
                        <Ionicons name="checkmark" size={20} color={professionalTheme.colors.text.white} />
                        <Text style={styles.saveButtonText}>Save</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={cancelEditing}
                      >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <>
                    <Text style={styles.questionText}>{question.text}</Text>
                    <View style={styles.questionActions}>
                      <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => startEditing(question)}
                      >
                        <Ionicons name="pencil" size={20} color={professionalTheme.colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => handleDeleteQuestion(question.id)}
                      >
                        <Ionicons name="trash-outline" size={20} color={professionalTheme.colors.status.error} />
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            ))}

            {questions.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="help-circle-outline" size={64} color={professionalTheme.colors.text.muted} />
                <Text style={styles.emptyText}>No questions yet</Text>
              </View>
            )}
          </>
        )}

        <View style={styles.addSection}>
          <Text style={styles.addTitle}>Add New Question</Text>
          <TextInput
            style={styles.addInput}
            placeholder="Enter your question here..."
            value={newQuestion}
            onChangeText={setNewQuestion}
            multiline
            placeholderTextColor={professionalTheme.colors.text.muted}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddQuestion}>
            <Ionicons name="add-circle" size={24} color={professionalTheme.colors.text.white} />
            <Text style={styles.addButtonText}>Add Question</Text>
          </TouchableOpacity>
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
    borderBottomWidth: 1,
    borderBottomColor: professionalTheme.colors.border,
  },
  backButton: {
    padding: professionalTheme.spacing.xs,
  },
  headerTitle: {
    fontSize: professionalTheme.fontSize.xl,
    fontWeight: professionalTheme.fontWeight.bold,
    color: professionalTheme.colors.text.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: professionalTheme.spacing.lg,
    paddingTop: professionalTheme.spacing.lg,
  },
  sectionTitle: {
    fontSize: professionalTheme.fontSize.lg,
    fontWeight: professionalTheme.fontWeight.semibold,
    color: professionalTheme.colors.text.primary,
    marginBottom: professionalTheme.spacing.xs,
  },
  sectionSubtitle: {
    fontSize: professionalTheme.fontSize.sm,
    color: professionalTheme.colors.text.secondary,
    marginBottom: professionalTheme.spacing.lg,
  },
  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: professionalTheme.spacing.xxl,
  },
  loadingText: {
    fontSize: professionalTheme.fontSize.md,
    color: professionalTheme.colors.text.muted,
  },
  questionCard: {
    flexDirection: 'row',
    backgroundColor: professionalTheme.colors.background.card,
    borderRadius: professionalTheme.borderRadius.lg,
    padding: professionalTheme.spacing.lg,
    marginBottom: professionalTheme.spacing.md,
    borderWidth: 1,
    borderColor: professionalTheme.colors.border,
  },
  questionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${professionalTheme.colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: professionalTheme.spacing.md,
  },
  questionNumberText: {
    fontSize: professionalTheme.fontSize.sm,
    fontWeight: professionalTheme.fontWeight.bold,
    color: professionalTheme.colors.primary,
  },
  questionText: {
    flex: 1,
    fontSize: professionalTheme.fontSize.md,
    color: professionalTheme.colors.text.primary,
    lineHeight: 22,
  },
  questionActions: {
    flexDirection: 'row',
    gap: professionalTheme.spacing.sm,
  },
  iconButton: {
    padding: professionalTheme.spacing.xs,
  },
  editContainer: {
    flex: 1,
  },
  editInput: {
    borderWidth: 1,
    borderColor: professionalTheme.colors.primary,
    borderRadius: professionalTheme.borderRadius.md,
    padding: professionalTheme.spacing.md,
    fontSize: professionalTheme.fontSize.md,
    color: professionalTheme.colors.text.primary,
    backgroundColor: professionalTheme.colors.background.card,
    minHeight: 60,
    marginBottom: professionalTheme.spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  editActions: {
    flexDirection: 'row',
    gap: professionalTheme.spacing.sm,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: professionalTheme.colors.primary,
    paddingHorizontal: professionalTheme.spacing.md,
    paddingVertical: professionalTheme.spacing.sm,
    borderRadius: professionalTheme.borderRadius.md,
    gap: professionalTheme.spacing.xs,
  },
  saveButtonText: {
    fontSize: professionalTheme.fontSize.sm,
    fontWeight: professionalTheme.fontWeight.semibold,
    color: professionalTheme.colors.text.white,
  },
  cancelButton: {
    paddingHorizontal: professionalTheme.spacing.md,
    paddingVertical: professionalTheme.spacing.sm,
    borderRadius: professionalTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: professionalTheme.colors.border,
  },
  cancelButtonText: {
    fontSize: professionalTheme.fontSize.sm,
    color: professionalTheme.colors.text.secondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: professionalTheme.spacing.xxl,
  },
  emptyText: {
    fontSize: professionalTheme.fontSize.md,
    color: professionalTheme.colors.text.muted,
    marginTop: professionalTheme.spacing.md,
  },
  addSection: {
    marginTop: professionalTheme.spacing.xl,
    marginBottom: professionalTheme.spacing.xxl,
    padding: professionalTheme.spacing.lg,
    backgroundColor: professionalTheme.colors.background.card,
    borderRadius: professionalTheme.borderRadius.lg,
    borderWidth: 1,
    borderColor: professionalTheme.colors.border,
  },
  addTitle: {
    fontSize: professionalTheme.fontSize.md,
    fontWeight: professionalTheme.fontWeight.semibold,
    color: professionalTheme.colors.text.primary,
    marginBottom: professionalTheme.spacing.md,
  },
  addInput: {
    borderWidth: 1,
    borderColor: professionalTheme.colors.border,
    borderRadius: professionalTheme.borderRadius.md,
    padding: professionalTheme.spacing.md,
    fontSize: professionalTheme.fontSize.md,
    color: professionalTheme.colors.text.primary,
    backgroundColor: professionalTheme.colors.background.card,
    minHeight: 80,
    marginBottom: professionalTheme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: professionalTheme.colors.primary,
    paddingVertical: professionalTheme.spacing.md,
    borderRadius: professionalTheme.borderRadius.md,
    gap: professionalTheme.spacing.sm,
  },
  addButtonText: {
    fontSize: professionalTheme.fontSize.md,
    fontWeight: professionalTheme.fontWeight.semibold,
    color: professionalTheme.colors.text.white,
  },
} as any);
