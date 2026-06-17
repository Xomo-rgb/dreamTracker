export interface User {
  uid: string;
  email: string;
  displayName?: string;
  role?: 'expert' | 'admin';
  isFirstLogin?: boolean;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
  visitReason: 'Missed Appointment' | 'Follow-up Required' | 'Routine Check' | 'Initial Visit';
  priority: 'High' | 'Medium' | 'Low' | 'Completed';
  assignedExpertId: string;
  assignedDate: string;
  isActive: boolean;
  location?: {
    latitude: number;
    longitude: number;
  };
  createdAt?: any;
  updatedAt?: any;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
  demo?: boolean;
}

export interface StatItem {
  count: string;
  label: string;
  color: string;
}