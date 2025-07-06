import { useAuth } from '@/hooks/use-auth';
import Dashboard from './Dashboard';
import Login from './Login';

const Index = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Login />;
  }
  
  return <Dashboard />;
};

export default Index;
