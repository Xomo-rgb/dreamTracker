import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthService } from '../services/authService';
import { UserService } from '../services/userService';
import { ActivityLogService } from '../services/activityLogService';

// Extended user type with profile info
interface User {
  uid: string;
  email: string;
  role: 'expert' | 'admin';
  isFirstLogin: boolean;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (profile: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to Firebase auth state changes
    const unsubscribe = AuthService.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, load their profile
        await loadUserProfile(firebaseUser.uid, firebaseUser.email!);
      } else {
        // User is signed out
        setUser(null);
        await AsyncStorage.removeItem('userProfile');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loadUserProfile = async (uid: string, email: string) => {
    try {
      // Try to get profile from Firebase
      let profile = await UserService.getUserProfile(uid);
      
      if (!profile) {
        // First time login - create default profile
        profile = {
          id: uid,
          email,
          role: 'expert',
          isFirstLogin: true,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await UserService.createUserProfile(uid, profile);
      }

      // Block admin users from mobile app
      if (profile.role === 'admin') {
        await AuthService.signOut();
        setUser(null);
        setLoading(false);
        return; // Exit silently, error will be shown by signIn
      }

      // Check if user is deactivated
      if (profile.isActive === false) {
        await AuthService.signOut();
        setUser(null);
        setLoading(false);
        return; // Exit silently, error will be shown by signIn
      }

      const userData: User = {
        uid: profile.id,
        email: profile.email,
        role: profile.role,
        isFirstLogin: profile.isFirstLogin,
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
      };

      // Cache in AsyncStorage for offline access
      await AsyncStorage.setItem('userProfile', JSON.stringify(userData));
      setUser(userData);

      // Navigate based on first login
      if (profile.isFirstLogin) {
        router.replace('/user-profile-setup');
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      await AuthService.signOut();
      setUser(null);
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const result = await AuthService.signInWithEmailAndPassword(email, password);
    
    if (!result.success) {
      setLoading(false);
      throw new Error(result.error || 'Sign in failed');
    }
    
    // Log activity after successful sign in
    if (result.user) {
      try {
        const profile = await UserService.getUserProfile(result.user.uid);
        if (profile) {
          await ActivityLogService.logActivity(
            'Expert Login',
            result.user.uid,
            `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.email,
            profile.role,
            `Expert logged in from mobile app`
          );
        }
      } catch (logError) {
        // Silently ignore logging errors
      }
    }
    // Firebase auth listener will handle the rest
  };

  const signOut = async () => {
    try {
      if (user) {
        try {
          await ActivityLogService.logActivity(
            'Expert Logout',
            user.uid,
            `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
            user.role,
            `Expert logged out from mobile app`
          );
        } catch (logError) {
          // Silently ignore logging errors
        }
      }
      await AuthService.signOut();
      await AsyncStorage.removeItem('userProfile');
      setUser(null);
      router.replace('/login');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const updateUserProfile = async (profile: Partial<User>) => {
    try {
      if (!user) return;
      
      const updatedUser = {
        ...user,
        ...profile,
        isFirstLogin: false,
      };
      
      // Update in Firebase
      await UserService.updateUserProfile(user.uid, {
        ...profile,
        isFirstLogin: false,
      });
      
      // Update local cache
      await AsyncStorage.setItem('userProfile', JSON.stringify(updatedUser));
      setUser(updatedUser);

      // Navigate to home after profile setup
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signOut,
    updateUserProfile,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};