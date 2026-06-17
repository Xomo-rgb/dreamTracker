import { Redirect } from 'expo-router';
import { useAuth } from '../src/hooks/AuthContext';
import EditQuestionnaireScreen from '../src/screens/EditQuestionnaireScreen';

export default function EditQuestionnaire() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return <EditQuestionnaireScreen />;
}
