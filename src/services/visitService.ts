import { collection, addDoc, getDocs, doc, updateDoc, query, where, orderBy, Timestamp, getDoc } from 'firebase/firestore';
import { db } from './authService';

export interface Visit {
  id: string;
  patientId: string;
  expertId: string;
  status: 'assigned' | 'checked_in' | 'completed';
  scheduledDate: string;
  checkInTime?: string;
  checkOutTime?: string;
  checkInLocation?: {
    latitude: number;
    longitude: number;
  };
  followUpAnswers?: Record<string, string>;
  notes?: string;
  visitDurationMinutes?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export class VisitService {
  static async createVisit(patientId: string, expertId: string, scheduledDate: string): Promise<string> {
    try {
      const visitData = {
        patientId,
        expertId,
        status: 'assigned' as const,
        scheduledDate,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'visits'), visitData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating visit:', error);
      throw error;
    }
  }

  static async getAssignedVisits(expertId: string): Promise<Visit[]> {
    try {
      const visitsRef = collection(db, 'visits');
      const q = query(
        visitsRef,
        where('expertId', '==', expertId),
        where('status', '==', 'assigned'),
        orderBy('scheduledDate', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Visit));
    } catch (error) {
      console.error('Error fetching assigned visits:', error);
      throw error;
    }
  }

  static async getCompletedVisits(expertId: string): Promise<Visit[]> {
    try {
      const visitsRef = collection(db, 'visits');
      const q = query(
        visitsRef,
        where('expertId', '==', expertId),
        where('status', '==', 'completed'),
        orderBy('checkOutTime', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Visit));
    } catch (error) {
      console.error('Error fetching completed visits:', error);
      throw error;
    }
  }

  static async checkIn(visitId: string, location: { latitude: number; longitude: number }): Promise<void> {
    try {
      const checkInTime = new Date().toISOString();
      const visitRef = doc(db, 'visits', visitId);
      await updateDoc(visitRef, {
        status: 'checked_in',
        checkInTime,
        checkInLocation: location,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error checking in:', error);
      throw error;
    }
  }

  static async checkOut(visitId: string, followUpAnswers: Record<string, string>, notes?: string): Promise<void> {
    try {
      const checkOutTime = new Date().toISOString();
      
      // Get visit to calculate duration
      const visitRef = doc(db, 'visits', visitId);
      const visitDoc = await getDoc(visitRef);
      const visitData = visitDoc.data();
      
      let visitDurationMinutes = 0;
      if (visitData?.checkInTime) {
        const checkIn = new Date(visitData.checkInTime);
        const checkOut = new Date(checkOutTime);
        visitDurationMinutes = Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60));
      }

      await updateDoc(visitRef, {
        status: 'completed',
        checkOutTime,
        followUpAnswers,
        notes,
        visitDurationMinutes,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error checking out:', error);
      throw error;
    }
  }
}