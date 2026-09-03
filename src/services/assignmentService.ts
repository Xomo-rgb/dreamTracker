import { collection, doc, getDoc, getDocs, getDocsFromServer, query, where, addDoc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from './authService';

export interface Assignment {
  id: string;
  patientId: string;
  patientName: string;
  expertId: string;
  expertName: string;
  visitReason: 'Missed Appointment' | 'Follow-up Required' | 'Routine Check' | 'Initial Visit';
  priority: 'High' | 'Medium' | 'Low';
  assignedDate: string;
  dueDate?: string;
  status: 'pending' | 'completed';
  completedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export class AssignmentService {
  static async createAssignment(assignment: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const assignmentsRef = collection(db, 'assignments');
      const docRef = await addDoc(assignmentsRef, {
        ...assignment,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating assignment:', error);
      throw error;
    }
  }

  static async getAssignmentsByExpert(expertId: string, status: 'pending' | 'completed'): Promise<Assignment[]> {
    try {
      const assignmentsRef = collection(db, 'assignments');
      const q = query(
        assignmentsRef,
        where('expertId', '==', expertId),
        where('status', '==', status)
      );
      // Prefer a fresh server read: right after completing a visit, the
      // freshly-updated status needs to actually show up here instead of a
      // stale cached snapshot from before the update.
      const querySnapshot = await getDocsFromServer(q).catch(() => getDocs(q));

      const assignments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Assignment));

      if (status === 'completed') {
        // Most recently completed first.
        return assignments.sort((a, b) =>
          new Date(b.completedDate || 0).getTime() - new Date(a.completedDate || 0).getTime()
        );
      }

      // Pending: highest priority first, then most recently assigned.
      const priorityOrder: Record<string, number> = { 'High': 1, 'Medium': 2, 'Low': 3 };
      return assignments.sort((a, b) => {
        const priorityDiff = (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4);
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(b.assignedDate).getTime() - new Date(a.assignedDate).getTime();
      });
    } catch (error) {
      console.error('Error fetching assignments by expert:', error);
      throw error;
    }
  }

  static async getAllAssignments(status?: 'pending' | 'completed'): Promise<Assignment[]> {
    try {
      const assignmentsRef = collection(db, 'assignments');
      let q;
      if (status) {
        q = query(assignmentsRef, where('status', '==', status));
      } else {
        q = query(assignmentsRef);
      }
      
      const querySnapshot = await getDocs(q);
      
      const assignments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Assignment));

      // Sort by date (newest first)
      return assignments.sort((a, b) => 
        new Date(b.assignedDate).getTime() - new Date(a.assignedDate).getTime()
      );
    } catch (error) {
      console.error('Error fetching all assignments:', error);
      throw error;
    }
  }

  static async getAssignmentById(id: string): Promise<Assignment | null> {
    try {
      const assignmentRef = doc(db, 'assignments', id);
      const docSnap = await getDoc(assignmentRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Assignment;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching assignment:', error);
      throw error;
    }
  }

  static async updateAssignmentStatus(assignmentId: string, status: 'completed', completedDate: string): Promise<void> {
    try {
      const assignmentRef = doc(db, 'assignments', assignmentId);
      await updateDoc(assignmentRef, {
        status,
        completedDate,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating assignment status:', error);
      throw error;
    }
  }

  static async getAssignmentByPatient(patientId: string): Promise<Assignment | null> {
    try {
      const assignmentsRef = collection(db, 'assignments');
      const q = query(
        assignmentsRef,
        where('patientId', '==', patientId),
        where('status', '==', 'pending')
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return {
          id: doc.id,
          ...doc.data()
        } as Assignment;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching assignment by patient:', error);
      throw error;
    }
  }
}
