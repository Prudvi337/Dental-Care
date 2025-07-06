import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";

// Pages
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import PatientManagement from "@/pages/PatientManagement";
import AppointmentManagement from "@/pages/AppointmentManagement";
import CalendarView from "@/pages/CalendarView";
import PatientAppointments from "@/pages/PatientAppointments";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/patients" element={
              <ProtectedRoute requiredRole="Admin">
                <Layout>
                  <PatientManagement />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/appointments" element={
              <ProtectedRoute requiredRole="Admin">
                <Layout>
                  <AppointmentManagement />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/calendar" element={
              <ProtectedRoute requiredRole="Admin">
                <Layout>
                  <CalendarView />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/my-appointments" element={
              <ProtectedRoute requiredRole="Patient">
                <Layout>
                  <PatientAppointments />
                </Layout>
              </ProtectedRoute>
            } />
            
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
