import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from './authService';

export class ActivityLogService {
  static async logActivity(
    action: string,
    userId: string,
    userName: string,
    userRole: string,
    details: string
  ): Promise<void> {
    try {
      console.log('Attempting to log activity:', { action, userId, userName, userRole, details });
      const result = await addDoc(collection(db, 'activityLogs'), {
        action,
        userId,
        userName,
        userRole,
        details,
        timestamp: Timestamp.now()
      });
      console.log('Activity logged successfully:', result.id);
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }
}
