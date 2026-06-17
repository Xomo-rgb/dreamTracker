import { Redirect } from 'expo-router';
import { useAuth } from '../src/hooks/AuthContext';
import AssignPatientScreen from '../src/screens/AssignPatientScreen';

export default function AssignPatient() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return <AssignPatientScreen />;
}
