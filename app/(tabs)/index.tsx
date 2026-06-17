import { Redirect } from 'expo-router';
import { useAuth } from '../../src/hooks/AuthContext';
import AdminHomeScreen from '../../src/screens/AdminHomeScreen';
import ExpertHomeScreen from '../../src/screens/ExpertHomeScreen';

export default function TabOneScreen() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  // Show different home screens based on role
  if (user?.role === 'admin') {
    return <AdminHomeScreen />;
  }

  return <ExpertHomeScreen />;
}
