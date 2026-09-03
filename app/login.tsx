import { Redirect } from 'expo-router';
import { useAuth } from '../src/hooks/AuthContext';
import LoginScreen from '../src/screens/LoginScreen';

export default function LoginRoute() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <LoginScreen />;
}