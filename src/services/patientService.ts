import { collection, doc, getDoc, getDocs, orderBy, query, updateDoc, where, deleteDoc } from 'firebase/firestore';
import { db } from './authService';

export interface Patient {
  id: string;
  name: string;
  age: number;
  dateOfBirth?: string;
  gender?: string;
  maritalStatus?: string;
  phone?: string;
  email?: string;
  address?: string;
  emergencyContact?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export class PatientService {
  static async getAllPatients(): Promise<Patient[]> {
    try {
      const patientsRef = collection(db, 'patients');
      const querySnapshot = await getDocs(patientsRef);
      
      const patients = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Patient));
      
      // Sort by createdAt (newest first)
      return patients.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  }



  static async getPatientById(id: string): Promise<Patient | null> {
    try {
      const patientRef = doc(db, 'patients', id);
      const docSnap = await getDoc(patientRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Patient;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching patient:', error);
      throw error;
    }
  }

  static async getHighPriorityPatients(): Promise<Patient[]> {
    try {
      const patientsRef = collection(db, 'patients');
      const querySnapshot = await getDocs(patientsRef);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Patient));
    } catch (error) {
      console.error('Error fetching high priority patients:', error);
      throw error;
    }
  }

  static async updatePatientInfo(patientId: string, data: Partial<Patient>): Promise<void> {
    try {
      const patientRef = doc(db, 'patients', patientId);
      await updateDoc(patientRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating patient info:', error);
      throw error;
    }
  }

  static async deletePatient(patientId: string): Promise<void> {
    try {
      const patientRef = doc(db, 'patients', patientId);
      await deleteDoc(patientRef);
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw error;
    }
  }

  static async addPatient(patient: Omit<Patient, 'id'>): Promise<void> {
    try {
      const { addDoc } = await import('firebase/firestore');
      const patientsRef = collection(db, 'patients');
      await addDoc(patientsRef, {
        ...patient,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error adding patient:', error);
      throw error;
    }
  }
}