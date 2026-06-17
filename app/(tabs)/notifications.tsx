import { Redirect } from 'expo-router';
import { useAuth } from '../../src/hooks/AuthContext';
import NotificationsScreen from '../../src/screens/NotificationsScreen';

export default function Notifications() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return <NotificationsScreen />;
}
