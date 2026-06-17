import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './authService';

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: 'expert' | 'admin';
  isFirstLogin: boolean;
  createdAt: string;
  updatedAt: string;
}

export class UserService {
  static async createUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      const userData = {
        ...profileData,
        id: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await setDoc(userRef, userData);
      console.log('User profile created in Firebase:', userId);
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const userRef = doc(db, 'users', userId);
      const docSnap = await getDoc(userRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  static async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      
      await updateDoc(userRef, updateData);
      console.log('User profile updated in Firebase:', userId);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
}