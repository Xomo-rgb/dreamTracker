import { Redirect } from 'expo-router';
import { useAuth } from '../src/hooks/AuthContext';
import ManageUsersScreen from '../src/screens/ManageUsersScreen';

export default function ManageUsers() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return <ManageUsersScreen />;
}
