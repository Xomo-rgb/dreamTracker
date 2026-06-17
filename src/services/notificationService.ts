import { collection, addDoc, query, where, getDocs, updateDoc, doc, orderBy, Timestamp } from 'firebase/firestore';
import { db } from './authService';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'assignment' | 'completion' | 'info';
  read: boolean;
  createdAt: any;
  metadata?: {
    assignmentId?: string;
    patientId?: string;
    visitId?: string;
  };
}

export class NotificationService {
  static async sendNotification(userId: string, title: string, message: string, type: 'assignment' | 'completion' | 'info' = 'info', metadata?: { assignmentId?: string; patientId?: string; visitId?: string }): Promise<void> {
    try {
      await addDoc(collection(db, 'notifications'), {
        userId,
        title,
        message,
        type,
        read: false,
        createdAt: Timestamp.now(),
        metadata: metadata || {}
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  static async getNotifications(userId: string): Promise<Notification[]> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Notification));
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('read', '==', false)
      );
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  static async markAsRead(notificationId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  static async markAllAsRead(userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('read', '==', false)
      );
      const snapshot = await getDocs(q);
      const updates = snapshot.docs.map(doc => 
        updateDoc(doc.ref, { read: true })
      );
      await Promise.all(updates);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }
}
