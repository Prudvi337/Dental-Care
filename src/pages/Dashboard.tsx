import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getPatients, getIncidents } from '@/utils/localStorage';
import type { DashboardStats } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, Activity, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const calculateStats = () => {
      const patients = getPatients();
      const incidents = getIncidents();

      if (user?.role === 'Patient' && user.patientId) {
        // Patient view - only their data
        const patientIncidents = incidents.filter(i => i.patientId === user.patientId);
        const upcomingAppointments = patientIncidents
          .filter(i => new Date(i.appointmentDate) > new Date())
          .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
          .slice(0, 5);

        setStats({
          totalPatients: 1,
          totalAppointments: patientIncidents.length,
          completedTreatments: patientIncidents.filter(i => i.status === 'Completed').length,
          pendingAppointments: patientIncidents.filter(i => i.status === 'Scheduled').length,
          totalRevenue: patientIncidents.reduce((sum, i) => sum + (i.cost || 0), 0),
          upcomingAppointments,
          topPatients: []
        });
      } else {
        // Admin view - all data
        const now = new Date();
        const upcomingAppointments = incidents
          .filter(i => new Date(i.appointmentDate) > now)
          .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
          .slice(0, 10);

        const patientStats = patients.map(patient => {
          const patientIncidents = incidents.filter(i => i.patientId === patient.id);
          return {
            patient,
            appointmentCount: patientIncidents.length,
            totalSpent: patientIncidents.reduce((sum, i) => sum + (i.cost || 0), 0)
          };
        }).sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);

        setStats({
          totalPatients: patients.length,
          totalAppointments: incidents.length,
          completedTreatments: incidents.filter(i => i.status === 'Completed').length,
          pendingAppointments: incidents.filter(i => i.status === 'Scheduled').length,
          totalRevenue: incidents.reduce((sum, i) => sum + (i.cost || 0), 0),
          upcomingAppointments,
          topPatients: patientStats
        });
      }
    };

    calculateStats();
  }, [user]);

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getPatientName = (patientId: string) => {
    const patients = getPatients();
    const patient = patients.find(p => p.id === patientId);
    return patient?.name || 'Unknown Patient';
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {user?.role === 'Admin' ? 'Dashboard Overview' : 'My Dashboard'}
        </h1>
        <p className="text-gray-600">
          {user?.role === 'Admin' 
            ? 'Welcome back! Here\'s what\'s happening with your practice.' 
            : 'Track your appointments and treatment history.'
          }
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {user?.role === 'Admin' ? 'Total Patients' : 'My Profile'}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPatients}</div>
            <p className="text-xs text-muted-foreground">
              {user?.role === 'Admin' ? 'Active patients' : 'Registered patient'}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAppointments}</div>
            <p className="text-xs text-muted-foreground">
              All time appointments
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Treatments</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedTreatments}</div>
            <p className="text-xs text-muted-foreground">
              Successfully completed
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {user?.role === 'Admin' ? 'Total Revenue' : 'Total Spent'}
            </CardTitle>
            <span className="h-4 w-4 text-muted-foreground font-bold">₹</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalRevenue}</div>
            <p className="text-xs text-muted-foreground">
              {user?.role === 'Admin' ? 'Revenue generated' : 'Treatment costs'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {user?.role === 'Admin' ? 'Next 10 Appointments' : 'My Upcoming Appointments'}
            </CardTitle>
            <CardDescription>
              {stats.upcomingAppointments.length === 0 
                ? 'No upcoming appointments' 
                : 'Scheduled appointments'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.upcomingAppointments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No upcoming appointments scheduled</p>
              ) : (
                stats.upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{appointment.title}</p>
                      <p className="text-sm text-gray-600">
                        {user?.role === 'Admin' && `${getPatientName(appointment.patientId)} • `}
                        {format(new Date(appointment.appointmentDate), 'MMM dd, yyyy at h:mm aa')}
                      </p>
                      {appointment.treatment && (
                        <p className="text-xs text-blue-800 mt-1">Treatment: {appointment.treatment}</p>
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
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${appointment.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                          appointment.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'}`}>
                        {appointment.status}
                      </span>
                      {appointment.cost && (
                        <p className="text-sm text-gray-600 mt-1">₹{appointment.cost}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Patients (Admin only) */}
        {user?.role === 'Admin' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Top Patients
              </CardTitle>
              <CardDescription>
                Patients by total spending
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.topPatients.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No patient data available</p>
                ) : (
                  stats.topPatients.map((item, index) => (
                    <div key={item.patient.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{item.patient.name}</p>
                          <p className="text-sm text-gray-600">{item.appointmentCount} appointments</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{item.totalSpent}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Patient Health Info (Patient only) */}
        {user?.role === 'Patient' && user.patientId && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Health Information
              </CardTitle>
              <CardDescription>
                Your medical history and notes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const patients = getPatients();
                const patient = patients.find(p => p.id === user.patientId);
                return patient ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Contact</label>
                      <p className="text-gray-900">{patient.contact}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                      <p className="text-gray-900">{format(new Date(patient.dob), 'MMMM dd, yyyy')}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Health Information</label>
                      <p className="text-gray-900">{patient.healthInfo}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Patient information not found</p>
                );
              })()}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
