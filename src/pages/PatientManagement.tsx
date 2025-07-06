import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getPatients, savePatients, generateId } from '@/utils/localStorage';
import type { Patient } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import { format } from 'date-fns';

const PatientManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    contact: '',
    email: '',
    healthInfo: ''
  });

  useEffect(() => {
    if (user?.role === 'Admin') {
      setPatients(getPatients());
    }
  }, [user]);

  const resetForm = () => {
    setFormData({
      name: '',
      dob: '',
      contact: '',
      email: '',
      healthInfo: ''
    });
    setEditingPatient(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.dob || !formData.contact) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const currentPatients = getPatients();
    
    if (editingPatient) {
      // Update existing patient
      const updatedPatients = currentPatients.map(p => 
        p.id === editingPatient.id 
          ? { ...p, ...formData }
          : p
      );
      savePatients(updatedPatients);
      setPatients(updatedPatients);
      toast({
        title: "Success",
        description: "Patient updated successfully"
      });
    } else {
      // Add new patient
      const newPatient: Patient = {
        id: generateId(),
        ...formData,
        createdAt: new Date().toISOString()
      };
      const updatedPatients = [...currentPatients, newPatient];
      savePatients(updatedPatients);
      setPatients(updatedPatients);
      toast({
        title: "Success",
        description: "Patient added successfully"
      });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setFormData({
      name: patient.name,
      dob: patient.dob,
      contact: patient.contact,
      email: patient.email || '',
      healthInfo: patient.healthInfo
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (patientId: string) => {
    const currentPatients = getPatients();
    const updatedPatients = currentPatients.filter(p => p.id !== patientId);
    savePatients(updatedPatients);
    setPatients(updatedPatients);
    toast({
      title: "Success",
      description: "Patient deleted successfully"
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patient Management</h1>
          <p className="text-gray-600">Manage patient records and information</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingPatient ? 'Edit Patient' : 'Add New Patient'}
              </DialogTitle>
              <DialogDescription>
                {editingPatient ? 'Update patient information' : 'Enter patient details below'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="dob">Date of Birth *</Label>
                <Input
                  id="dob"
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="contact">Contact Number *</Label>
                <Input
                  id="contact"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  placeholder="Enter contact number"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label htmlFor="healthInfo">Health Information</Label>
                <Textarea
                  id="healthInfo"
                  value={formData.healthInfo}
                  onChange={(e) => setFormData({ ...formData, healthInfo: e.target.value })}
                  placeholder="Enter health information, allergies, etc."
                  rows={3}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingPatient ? 'Update' : 'Add'} Patient
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
            <Users className="h-5 w-5" />
            All Patients ({patients.length})
          </CardTitle>
          <CardDescription>
            Manage all patient records and information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {patients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No patients yet</h3>
              <p className="text-gray-600 mb-4">Get started by adding your first patient</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Patient
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Date of Birth</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.name}</TableCell>
                    <TableCell>{format(new Date(patient.dob), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{patient.contact}</TableCell>
                    <TableCell>{patient.email || '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(patient)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(patient.id)}
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

export default PatientManagement;
