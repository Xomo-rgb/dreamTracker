import { Redirect } from 'expo-router';
import { useAuth } from '../../src/hooks/AuthContext';
import PatientsScreen from '../../src/screens/PatientsScreen';

export default function PatientsTab() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return <PatientsScreen />;
}