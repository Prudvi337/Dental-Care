import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getIncidents, getPatients } from '@/utils/localStorage';
import type { Incident, Patient } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Clock, User } from 'lucide-react';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } from 'date-fns';

const CalendarView = () => {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>("month");

  useEffect(() => {
    if (user?.role === 'Admin') {
      setIncidents(getIncidents());
      setPatients(getPatients());
    }
  }, [user]);

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient?.name || 'Unknown Patient';
  };

  const getAppointmentsForDate = (date: Date) => {
    return incidents.filter(incident => {
      try {
        const appointmentDate = parseISO(incident.appointmentDate);
        return isSameDay(appointmentDate, date);
      } catch (error) {
        // Fallback for invalid dates
        const appointmentDate = new Date(incident.appointmentDate);
        return isSameDay(appointmentDate, date);
      }
    });
  };

  const getAppointmentsForSelectedDate = () => {
    return getAppointmentsForDate(selectedDate);
  };

  const getDatesWithAppointments = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    return daysInMonth.filter(date => 
      getAppointmentsForDate(date).length > 0
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'border-l-blue-500 bg-blue-50 hover:bg-blue-100';
      case 'In Progress': return 'border-l-yellow-500 bg-yellow-50 hover:bg-yellow-100';
      case 'Completed': return 'border-l-green-500 bg-green-50 hover:bg-green-100';
      case 'Cancelled': return 'border-l-red-500 bg-red-50 hover:bg-red-100';
      default: return 'border-l-gray-500 bg-gray-50 hover:bg-gray-100';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Create modifiers for the calendar
  const modifiers = {
    hasAppointments: getDatesWithAppointments(),
    today: new Date(),
  };

  const modifiersStyles = {
    hasAppointments: {
      backgroundColor: '#dbeafe',
      border: '2px solid #3b82f6',
      borderRadius: '6px',
      fontWeight: '600',
    },
    today: {
      backgroundColor: '#fef3c7',
      border: '2px solid #f59e0b',
      borderRadius: '6px',
      fontWeight: '600',
    },
  };

  // Helper to get week days for the selected date
  const getWeekDays = () => {
    const start = new Date(selectedDate);
    start.setDate(selectedDate.getDate() - selectedDate.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };

  if (user?.role !== 'Admin') {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600">You don't have permission to access this page.</p>
      </div>
    );
  }

  const selectedDateAppointments = getAppointmentsForSelectedDate();

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar View</h1>
          <p className="text-gray-600">View appointments in calendar format</p>
        </div>
        <div className="flex gap-2">
          <button
            className={`px-3 py-1 rounded ${viewMode === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setViewMode('month')}
          >
            Monthly
          </button>
          <button
            className={`px-3 py-1 rounded ${viewMode === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setViewMode('week')}
          >
            Weekly
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <CalendarIcon className="h-5 w-5" />
              Appointment Calendar
            </CardTitle>
            <CardDescription className="text-blue-700">
              Click on a date to view appointments. Dates with appointments are highlighted.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {viewMode === 'month' ? (
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date: Date | undefined) => date && setSelectedDate(date)}
                onMonthChange={setCurrentMonth}
                modifiers={modifiers}
                modifiersStyles={modifiersStyles}
                className="w-full"
                classNames={{
                  months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center",
                  caption_label: "text-sm font-medium text-gray-900",
                  nav: "space-x-1 flex items-center",
                  nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 border border-gray-300 rounded-md hover:bg-gray-100",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell: "text-gray-600 rounded-md w-9 font-medium text-[0.8rem]",
                  row: "flex w-full mt-2",
                  cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                  day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 rounded-md transition-colors",
                  day_selected: "bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-700",
                  day_today: "bg-yellow-100 text-yellow-900 font-semibold",
                  day_outside: "text-gray-400 opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                  day_disabled: "text-gray-400 opacity-50",
                  day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                  day_hidden: "invisible",
                }}
              />
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between mb-2">
                  {getWeekDays().map((date, idx) => (
                    <button
                      key={idx}
                      className={`flex-1 py-2 rounded ${isSameDay(date, selectedDate) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                      onClick={() => setSelectedDate(date)}
                    >
                      {format(date, 'EEE dd')}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-4 h-4 bg-blue-100 border-2 border-blue-500 rounded"></div>
                <span className="text-gray-700">Dates with appointments</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-500 rounded"></div>
                <span className="text-gray-700">Today</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Appointments */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
            <CardTitle className="flex items-center gap-2 text-green-900">
              <Clock className="h-5 w-5" />
              {format(selectedDate, 'MMMM dd, yyyy')}
            </CardTitle>
            <CardDescription className="text-green-700">
              {selectedDateAppointments.length === 0 
                ? 'No appointments scheduled for this date'
                : `${selectedDateAppointments.length} appointment${selectedDateAppointments.length > 1 ? 's' : ''} scheduled`
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {selectedDateAppointments.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">No appointments for this date</p>
                  <p className="text-gray-400 text-sm">Select another date to view appointments</p>
                </div>
              ) : (
                selectedDateAppointments
                  .sort((a, b) => {
                    try {
                      return parseISO(a.appointmentDate).getTime() - parseISO(b.appointmentDate).getTime();
                    } catch {
                      return new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime();
                    }
                  })
                  .map((appointment) => (
                    <div key={appointment.id} className={`p-4 border-l-4 rounded-lg transition-all duration-200 ${getStatusColor(appointment.status)}`}>
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-gray-900 text-lg">{appointment.title}</h3>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{getPatientName(appointment.patientId)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>
                            {(() => {
                              try {
                                return format(parseISO(appointment.appointmentDate), 'h:mm aa');
                              } catch {
                                return format(new Date(appointment.appointmentDate), 'h:mm aa');
                              }
                            })()}
                          </span>
                        </div>
                        {appointment.cost && (
                          <div className="flex items-center gap-2">
                            <span className="h-4 w-4 text-gray-500 font-bold">₹</span>
                            <span className="font-medium text-green-700">{appointment.cost.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                      {appointment.description && (
                        <p className="mt-3 text-sm text-gray-700 bg-white p-3 rounded border">{appointment.description}</p>
                      )}
                      {appointment.treatment && (
                        <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-300">
                          <p className="text-sm font-medium text-blue-900">Treatment Plan:</p>
                          <p className="text-sm text-blue-800 mt-1">{appointment.treatment}</p>
                        </div>
                      )}
                      {appointment.files && appointment.files.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-800 mb-1">Attachments:</p>
                          <div className="space-y-1">
                            {appointment.files.map((file, idx) => (
                              <a key={idx} href={file.url} target="_blank" rel="noopener noreferrer" className="underline text-blue-600 block">
                                {file.name}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Overview */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
          <CardTitle className="text-purple-900">Monthly Overview - {format(currentMonth, 'MMMM yyyy')}</CardTitle>
          <CardDescription className="text-purple-700">
            All appointments for the current month
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { status: 'Scheduled', color: 'blue', icon: '📅' },
              { status: 'In Progress', color: 'yellow', icon: '⏳' },
              { status: 'Completed', color: 'green', icon: '✅' },
              { status: 'Cancelled', color: 'red', icon: '❌' }
            ].map(({ status, color, icon }) => {
              const count = incidents.filter(incident => {
                try {
                  const appointmentDate = parseISO(incident.appointmentDate);
                  return incident.status === status && 
                         appointmentDate.getMonth() === currentMonth.getMonth() &&
                         appointmentDate.getFullYear() === currentMonth.getFullYear();
                } catch {
                  const appointmentDate = new Date(incident.appointmentDate);
                  return incident.status === status && 
                         appointmentDate.getMonth() === currentMonth.getMonth() &&
                         appointmentDate.getFullYear() === currentMonth.getFullYear();
                }
              }).length;

              return (
                <div key={status} className={`text-center p-6 rounded-lg border-2 transition-all duration-200 hover:scale-105
                  ${color === 'blue' ? 'bg-blue-50 border-blue-200' :
                    color === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
                    color === 'green' ? 'bg-green-50 border-green-200' :
                    'bg-red-50 border-red-200'}`}>
                  <div className="text-3xl mb-2">{icon}</div>
                  <div className={`text-3xl font-bold mb-1
                    ${color === 'blue' ? 'text-blue-700' :
                      color === 'yellow' ? 'text-yellow-700' :
                      color === 'green' ? 'text-green-700' :
                      'text-red-700'}`}>
                    {count}
                  </div>
                  <div className={`text-sm font-medium
                    ${color === 'blue' ? 'text-blue-600' :
                      color === 'yellow' ? 'text-yellow-600' :
                      color === 'green' ? 'text-green-600' :
                      'text-red-600'}`}>
                    {status}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarView;
