import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, Calendar, Activity, Heart, Clock } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';

const Landing = () => {
  const { user } = useAuth();

  // If user is logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const features = [
    {
      icon: Users,
      title: "Patient Management",
      description: "Comprehensive patient records and health information management"
    },
    {
      icon: Calendar,
      title: "Appointment Scheduling",
      description: "Easy scheduling and calendar management for all appointments"
    },
    {
      icon: Activity,
      title: "Treatment Tracking",
      description: "Track treatments, costs, and patient progress over time"
    },
    {
      icon: Shield,
      title: "Secure Access",
      description: "Role-based access control for patients and administrators"
    },
    {
      icon: Heart,
      title: "Health Records",
      description: "Digital health records with file attachments and notes"
    },
    {
      icon: Clock,
      title: "Real-time Dashboard",
      description: "Live dashboard with key metrics and upcoming appointments"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="h-10 w-10 flex items-center justify-center mr-3">
                <img src="/logobg.png" alt="DentalCare Logo" />
              </div>
              <h1 className="text-2xl font-bold text-primary">DentalCare</h1>
            </div>
            <Button>
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Floating dental icons and stethoscopes */}
        <div className="absolute left-0 top-0 w-full h-full pointer-events-none z-0">
          <span className="absolute animate-float-slow left-10 top-10 text-blue-200 text-7xl opacity-30">🦷</span>
          <span className="absolute animate-float-fast right-20 top-32 text-blue-100 text-6xl opacity-20">🪥</span>
          <span className="absolute animate-float-medium left-1/2 bottom-10 text-blue-300 text-8xl opacity-20">🦷</span>
          <span className="absolute animate-float-slow left-1/4 top-1/3 text-blue-100 text-5xl opacity-20">🦷</span>
          <span className="absolute animate-float-medium right-1/4 bottom-1/4 text-blue-200 text-6xl opacity-25">🦷</span>
        </div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          
          <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-900 via-blue-600 to-blue-400 bg-clip-text text-transparent mb-6 animate-slide-up">
            Modern Dental Practice
            <span className="block bg-gradient-to-r from-blue-400 via-blue-300 to-blue-200 bg-clip-text text-transparent">Management System</span>
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto animate-fade-in">
            Streamline your dental practice with our comprehensive management dashboard. 
            Manage patients, schedule appointments, track treatments, and grow your practice efficiently.
          </p>
          <div className="flex gap-4 justify-center flex-wrap animate-fade-in">
            <Button size="lg"><Link to="/login">Get Started</Link></Button>
            <Button size="lg" variant="outline" className="!text-blue-700 border-blue-400 hover:!text-blue-900">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools designed specifically for modern dental practices
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Practice?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join dental professionals who trust DentalCare for their practice management needs.
          </p>
          <Button size="lg" variant="secondary"><Link to="/login">Start Free Trial</Link></Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="h-10 w-10 flex items-center justify-center mr-3">
              <img src="/logobg.png" alt="DentalCare Logo" />
            </div>
            <h3 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-blue-900 via-blue-600 to-blue-400 bg-clip-text text-transparent">DentalCare</h3>
          </div>
          <p className="text-gray-400 mb-4">
            Professional dental practice management made simple.
          </p>
          <p className="text-sm text-gray-500">
            © 2024 DentalCare. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
