export interface User {
  id: string;
  role: 'Admin' | 'Patient';
  email: string;
  password: string;
  patientId?: string;
  name?: string;
}

export interface Patient {
  id: string;
  name: string;
  dob: string;
  contact: string;
  email?: string;
  healthInfo: string;
  createdAt: string;
}

export interface FileAttachment {
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface Incident {
  id: string;
  patientId: string;
  title: string;
  description: string;
  comments: string;
  appointmentDate: string;
  cost?: number;
  treatment?: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  nextDate?: string;
  files: FileAttachment[];
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

export interface DashboardStats {
  totalPatients: number;
  totalAppointments: number;
  completedTreatments: number;
  pendingAppointments: number;
  totalRevenue: number;
  upcomingAppointments: Incident[];
  topPatients: Array<{
    patient: Patient;
    appointmentCount: number;
    totalSpent: number;
  }>;
}
