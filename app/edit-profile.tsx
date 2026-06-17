import { Redirect } from 'expo-router';
import { useAuth } from '../src/hooks/AuthContext';
import EditProfileScreen from '../src/screens/EditProfileScreen';

export default function EditProfile() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return <EditProfileScreen />;
}
