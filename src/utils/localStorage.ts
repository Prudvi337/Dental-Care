import type { User, Patient, Incident } from '@/types';
const STORAGE_KEYS = {
  USERS: 'dental_users',
  PATIENTS: 'dental_patients', 
  INCIDENTS: 'dental_incidents',
  INITIALIZED: 'dental_initialized'
};

const initialData = {
  users: [
    { "id": "1", "role": "Admin", "email": "admin@entnt.in", "password": "admin123" },
    { "id": "2", "role": "Patient", "email": "john@entnt.in", "password": "patient123", "patientId": "p1" }
  ],
  patients: [
    {
      "id": "p1",
      "name": "John Doe",
      "dob": "1990-05-10",
      "contact": "1234567890",
      "healthInfo": "No allergies"
    }
  ],
  incidents: [
    {
      "id": "i1",
      "patientId": "p1",
      "title": "Toothache",
      "description": "Upper molar pain",
      "comments": "Sensitive to cold",
      "appointmentDate": "2025-07-01T10:00:00",
      "cost": 80,
      "status": "Completed",
      "files": [
        { "name": "invoice.pdf", "url": "base64string-or-blob-url" },
        { "name": "xray.png", "url": "base64string-or-blob-url" }
      ]
    }
  ]
};

export const initializeData = () => {
  const isInitialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
  
  if (!isInitialized) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(initialData.users));
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(initialData.patients));
    localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(initialData.incidents));
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  }
};

export const getUsers = (): User[] => {
  const users = localStorage.getItem(STORAGE_KEYS.USERS);
  return users ? JSON.parse(users) : [];
};

export const getPatients = (): Patient[] => {
  const patients = localStorage.getItem(STORAGE_KEYS.PATIENTS);
  return patients ? JSON.parse(patients) : [];
};

export const getIncidents = (): Incident[] => {
  const incidents = localStorage.getItem(STORAGE_KEYS.INCIDENTS);
  return incidents ? JSON.parse(incidents) : [];
};

export const savePatients = (patients: Patient[]) => {
  localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
};

export const saveIncidents = (incidents: Incident[]) => {
  localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(incidents));
};

export const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};
