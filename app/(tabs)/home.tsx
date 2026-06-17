import { Redirect } from 'expo-router';
import { useAuth } from '../../src/hooks/AuthContext';
import ExpertHomeScreen from '../../src/screens/ExpertHomeScreen';

export default function TabOneScreen() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return <ExpertHomeScreen />;
}