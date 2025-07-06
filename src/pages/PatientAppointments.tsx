import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getIncidents, getPatients } from '@/utils/localStorage';
import type { Incident, Patient } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, FileText, User, Heart } from 'lucide-react';
import { format } from 'date-fns';

const PatientAppointments = () => {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [patient, setPatient] = useState<Patient | null>(null);

  useEffect(() => {
    if (user?.role === 'Patient' && user.patientId) {
      const allIncidents = getIncidents();
      const patientIncidents = allIncidents.filter(i => i.patientId === user.patientId);
      setIncidents(patientIncidents);
      
      const allPatients = getPatients();
      const currentPatient = allPatients.find(p => p.id === user.patientId);
      setPatient(currentPatient || null);
    }
  }, [user]);

  const upcomingAppointments = incidents
    .filter(i => new Date(i.appointmentDate) > new Date())
    .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());

  const pastAppointments = incidents
    .filter(i => new Date(i.appointmentDate) <= new Date())
    .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime());

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const totalSpent = incidents
    .filter(i => i.status === 'Completed')
    .reduce((sum, i) => sum + (i.cost || 0), 0);

  if (user?.role !== 'Patient') {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600">You don't have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
        <p className="text-gray-600">View your appointment history and upcoming visits</p>
      </div>

      {/* Patient Info & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Patient Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            {patient && (
              <div className="space-y-2">
                <div>
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <p className="text-gray-900">{patient.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                  <p className="text-gray-900">{format(new Date(patient.dob), 'MMMM dd, yyyy')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Contact</label>
                  <p className="text-gray-900">{patient.contact}</p>
                </div>
                {patient.email && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-gray-900">{patient.email}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Total Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{incidents.length}</div>
            <p className="text-sm text-gray-600">All time appointments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">₹{totalSpent}</div>
            <p className="text-sm text-gray-600">Treatment costs</p>
          </CardContent>
        </Card>
      </div>

      {/* Health Information */}
      {patient?.healthInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Health Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{patient.healthInfo}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Upcoming Appointments
            </CardTitle>
            <CardDescription>
              {upcomingAppointments.length === 0 
                ? 'No upcoming appointments' 
                : `${upcomingAppointments.length} upcoming appointment${upcomingAppointments.length > 1 ? 's' : ''}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No upcoming appointments</p>
                </div>
              ) : (
                upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="p-4 border rounded-lg bg-blue-50 border-blue-200 mb-2">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">{appointment.title}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{format(new Date(appointment.appointmentDate), 'MMM dd, yyyy at h:mm aa')}</span>
                      </div>
                      {appointment.cost && (
                        <div className="font-medium text-gray-900">Cost: ₹{appointment.cost}</div>
                      )}
                      {appointment.treatment && (
                        <div className="font-medium text-blue-900">Treatment: {appointment.treatment}</div>
                      )}
                      {appointment.files && appointment.files.length > 0 && (
                        <div className="mt-1">
                          <span className="text-xs font-medium text-gray-800">Attachments: </span>
                          {appointment.files.map((file, idx) => (
                            <a key={idx} href={file.url} target="_blank" rel="noopener noreferrer" className="underline text-blue-600 text-xs mr-2">
                              {file.name}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                    {appointment.description && (
                      <p className="mt-2 text-sm text-gray-700">{appointment.description}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Past Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Appointment History
            </CardTitle>
            <CardDescription>
              {pastAppointments.length === 0 
                ? 'No appointment history' 
                : `${pastAppointments.length} past appointment${pastAppointments.length > 1 ? 's' : ''}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {pastAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No appointment history</p>
                </div>
              ) : (
                pastAppointments.map((appointment) => (
                  <div key={appointment.id} className="p-4 border rounded-lg bg-gray-50 border-gray-200 mb-2">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">{appointment.title}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{format(new Date(appointment.appointmentDate), 'MMM dd, yyyy at h:mm aa')}</span>
                      </div>
                      {appointment.cost && (
                        <div className="font-medium text-gray-900">Cost: ₹{appointment.cost}</div>
                      )}
                      {appointment.treatment && (
                        <div className="font-medium text-blue-900">Treatment: {appointment.treatment}</div>
                      )}
                      {appointment.files && appointment.files.length > 0 && (
                        <div className="mt-1">
                          <span className="text-xs font-medium text-gray-800">Attachments: </span>
                          {appointment.files.map((file, idx) => (
                            <a key={idx} href={file.url} target="_blank" rel="noopener noreferrer" className="underline text-blue-600 text-xs mr-2">
                              {file.name}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                    {appointment.description && (
                      <p className="mt-2 text-sm text-gray-700">{appointment.description}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientAppointments;
