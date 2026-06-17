import { Redirect } from 'expo-router';
import { useAuth } from '../../src/hooks/AuthContext';
import SettingsScreen from '../../src/screens/SettingsScreen';

export default function SettingsTab() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return <SettingsScreen />;
}
