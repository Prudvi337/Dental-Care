import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getIncidents, getPatients, saveIncidents, generateId } from '@/utils/localStorage';
import type { Incident, Patient } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

const AppointmentManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
  const [formData, setFormData] = useState({
    patientId: '',
    title: '',
    description: '',
    comments: '',
    appointmentDate: '',
    cost: '',
    treatment: '',
    status: 'Scheduled' as 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled',
    nextDate: ''
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<{ name: string; url: string; type: string; size: number }[]>([]);

  useEffect(() => {
    if (user?.role === 'Admin') {
      setIncidents(getIncidents());
      setPatients(getPatients());
    }
  }, [user]);

  const resetForm = () => {
    setFormData({
      patientId: '',
      title: '',
      description: '',
      comments: '',
      appointmentDate: '',
      cost: '',
      treatment: '',
      status: 'Scheduled',
      nextDate: ''
    });
    setEditingIncident(null);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const fileArr = Array.from(files);
    const filePreviews = await Promise.all(
      fileArr.map(async (file) => {
        // Limit file size to 5MB
        if (file.size > 5 * 1024 * 1024) {
          toast({ title: 'File too large', description: `${file.name} exceeds 5MB.`, variant: 'destructive' });
          return null;
        }
        // Only allow images and pdfs
        if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
          toast({ title: 'Invalid file type', description: `${file.name} is not an image or PDF.`, variant: 'destructive' });
          return null;
        }
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        return { name: file.name, url: base64, type: file.type, size: file.size };
      })
    );
    setSelectedFiles(filePreviews.filter(Boolean) as any);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patientId || !formData.title || !formData.appointmentDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    if (selectedFiles.length > 0 && selectedFiles.some(f => f.size > 5 * 1024 * 1024)) {
      toast({ title: 'File too large', description: 'Each file must be less than 5MB.', variant: 'destructive' });
      return;
    }
    if (selectedFiles.length > 0 && selectedFiles.some(f => !f.type.startsWith('image/') && f.type !== 'application/pdf')) {
      toast({ title: 'Invalid file type', description: 'Only images and PDFs are allowed.', variant: 'destructive' });
      return;
    }

    const currentIncidents = getIncidents();
    
    if (editingIncident) {
      // Update existing incident
      const updatedIncidents = currentIncidents.map(i => 
        i.id === editingIncident.id 
          ? { 
              ...i, 
              ...formData,
              cost: formData.cost ? parseFloat(formData.cost) : undefined,
              files: selectedFiles.length > 0 ? selectedFiles : i.files
            }
          : i
      );
      saveIncidents(updatedIncidents);
      setIncidents(updatedIncidents);
      toast({
        title: "Success",
        description: "Appointment updated successfully"
      });
    } else {
      // Add new incident
      const newIncident: Incident = {
        id: generateId(),
        ...formData,
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        files: selectedFiles,
        createdAt: new Date().toISOString()
      };
      const updatedIncidents = [...currentIncidents, newIncident];
      saveIncidents(updatedIncidents);
      setIncidents(updatedIncidents);
      toast({
        title: "Success",
        description: "Appointment created successfully"
      });
    }

    setIsDialogOpen(false);
    resetForm();
    setSelectedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleEdit = (incident: Incident) => {
    setEditingIncident(incident);
    setFormData({
      patientId: incident.patientId,
      title: incident.title,
      description: incident.description,
      comments: incident.comments,
      appointmentDate: incident.appointmentDate.slice(0, 16),
      cost: incident.cost?.toString() || '',
      treatment: incident.treatment || '',
      status: incident.status,
      nextDate: incident.nextDate?.slice(0, 16) || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (incidentId: string) => {
    const currentIncidents = getIncidents();
    const updatedIncidents = currentIncidents.filter(i => i.id !== incidentId);
    saveIncidents(updatedIncidents);
    setIncidents(updatedIncidents);
    toast({
      title: "Success",
      description: "Appointment deleted successfully"
    });
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient?.name || 'Unknown Patient';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (user?.role !== 'Admin') {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600">You don't have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointment Management</h1>
          <p className="text-gray-600">Schedule and manage patient appointments</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              New Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingIncident ? 'Edit Appointment' : 'Schedule New Appointment'}
              </DialogTitle>
              <DialogDescription>
                {editingIncident ? 'Update appointment details' : 'Fill in the appointment information'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="patientId">Patient *</Label>
                <Select value={formData.patientId} onValueChange={(value) => setFormData({ ...formData, patientId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Routine Cleaning"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Appointment description"
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="appointmentDate">Appointment Date & Time *</Label>
                <Input
                  id="appointmentDate"
                  type="datetime-local"
                  value={formData.appointmentDate}
                  onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled') => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="cost">Cost (₹)</Label>
                <Input
                  id="cost"
                  type="number"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <Label htmlFor="treatment">Treatment</Label>
                <Textarea
                  id="treatment"
                  value={formData.treatment}
                  onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                  placeholder="Treatment details"
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="nextDate">Next Appointment Date</Label>
                <Input
                  id="nextDate"
                  type="datetime-local"
                  value={formData.nextDate}
                  onChange={(e) => setFormData({ ...formData, nextDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="comments">Comments</Label>
                <Textarea
                  id="comments"
                  value={formData.comments}
                  onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                  placeholder="Additional comments"
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="fileUpload">File Attachments (images or PDFs, max 5MB each)</Label>
                <Input
                  id="fileUpload"
                  type="file"
                  multiple
                  ref={fileInputRef}
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                />
                {selectedFiles.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {selectedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <a href={file.url} target="_blank" rel="noopener noreferrer" className="underline text-blue-600">{file.name}</a>
                        <span className="text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                        <span className="text-gray-400">[{file.type}]</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingIncident ? 'Update' : 'Schedule'} Appointment
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            All Appointments ({incidents.length})
          </CardTitle>
          <CardDescription>
            Manage all patient appointments and treatments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {incidents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments yet</h3>
              <p className="text-gray-600 mb-4">Schedule your first appointment</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Appointment
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>File Attachments</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incidents.map((incident) => (
                  <TableRow key={incident.id}>
                    <TableCell className="font-medium">{getPatientName(incident.patientId)}</TableCell>
                    <TableCell>{incident.title}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        {format(new Date(incident.appointmentDate), 'MMM dd, yyyy HH:mm')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}>
                        {incident.status}
                      </span>
                    </TableCell>
                    <TableCell>{incident.cost ? `₹${incident.cost}` : '-'}</TableCell>
                    <TableCell>
                      {incident.files && incident.files.length > 0 ? (
                        <div className="space-y-1">
                          {incident.files.map((file, idx) => (
                            <a key={idx} href={file.url} target="_blank" rel="noopener noreferrer" className="underline text-blue-600 block">
                              {file.name}
                            </a>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">No files</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(incident)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(incident.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentManagement;
