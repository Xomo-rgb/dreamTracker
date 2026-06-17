import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User, sendPasswordResetEmail, Auth } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthResult } from '../types';

const firebaseConfig = {
  apiKey: "AIzaSyB_jhIArbePViKiD46QP_061IW4Qf2bsrk",
  authDomain: "dreamtracker-cb0bb.firebaseapp.com",
  projectId: "dreamtracker-cb0bb",
  storageBucket: "dreamtracker-cb0bb.firebasestorage.app",
  messagingSenderId: "620865246348",
  appId: "1:620865246348:web:d9022c18d330ba6fd217a9",
  measurementId: "G-0DC1E836TC"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);

let auth: Auth;
try {
  auth = getAuth(app);
} catch {
  auth = initializeAuth(app, {
    persistence: AsyncStorage as any
  });
}

export class AuthService {
  static getCurrentUser(): User | null {
    return auth.currentUser;
  }

  static onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  static async signInWithEmailAndPassword(email: string, password: string): Promise<AuthResult> {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Check user profile for deactivation
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Check if admin trying to access mobile app
        if (userData.role === 'admin') {
          await signOut(auth);
          return { success: false, error: 'Admin accounts cannot access the mobile app. Please use the web dashboard.' };
        }
        
        // Check if account is deactivated
        if (userData.isActive === false) {
          await signOut(auth);
          return { success: false, error: 'Your account has been deactivated. Please contact an administrator.' };
        }
      }
      
      return { 
        success: true, 
        user: {
          uid: result.user.uid,
          email: result.user.email!,
          displayName: result.user.displayName || undefined
        }
      };
    } catch (error: any) {
      let message: string;
      switch (error.code) {
        case 'auth/user-not-found':
          message = 'No user found with this email';
          break;
        case 'auth/wrong-password':
          message = 'Incorrect password';
          break;
        case 'auth/invalid-email':
          message = 'Invalid email address';
          break;
        case 'auth/user-disabled':
          message = 'This account has been disabled';
          break;
        case 'auth/too-many-requests':
          message = 'Too many failed attempts. Try again later';
          break;
        case 'auth/network-request-failed':
          message = 'Network error. Check your connection';
          break;
        case 'auth/invalid-credential':
          message = 'Invalid email or password';
          break;
        default:
          // Demo mode fallback
          if (email === 'demo@dreemtrack.com' && password === 'demo123') {
            return { success: true, demo: true };
          }
          message = `Authentication failed: ${error.message}`;
      }
      return { success: false, error: message };
    }
  }

  static async createUserWithEmailAndPassword(email: string, password: string): Promise<AuthResult> {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      return { 
        success: true, 
        user: {
          uid: result.user.uid,
          email: result.user.email!,
          displayName: result.user.displayName || undefined
        }
      };
    } catch (error: any) {
      let message: string;
      switch (error.code) {
        case 'auth/weak-password':
          message = 'Password is too weak';
          break;
        case 'auth/email-already-in-use':
          message = 'Account already exists with this email';
          break;
        case 'auth/invalid-email':
          message = 'Invalid email address';
          break;
        default:
          message = `Account creation failed: ${error.message}`;
      }
      return { success: false, error: message };
    }
  }

  static async createUserByAdmin(email: string, password: string, role: 'admin' | 'expert'): Promise<AuthResult> {
    try {
      const userId = `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await setDoc(doc(db, 'pendingUsers', userId), {
        email,
        tempPassword: password,
        role,
        isActive: true,
        isPending: true,
        createdAt: new Date().toISOString()
      });
      
      return { 
        success: true, 
        user: {
          uid: userId,
          email: email,
          displayName: undefined
        }
      };
    } catch (error: any) {
      return { success: false, error: `Failed to create user: ${error.message}` };
    }
  }

  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

  static async sendPasswordResetEmail(email: string): Promise<AuthResult> {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: any) {
      let message: string;
      switch (error.code) {
        case 'auth/user-not-found':
          message = 'No account found with this email';
          break;
        case 'auth/invalid-email':
          message = 'Invalid email address';
          break;
        default:
          message = `Failed to send reset email: ${error.message}`;
      }
      return { success: false, error: message };
    }
  }
}