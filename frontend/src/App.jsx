import { Routes, Route } from 'react-router-dom';
import { MainLayout } from './layout';

import Dashboard from './pages/Dashboard';
import OSINT from './pages/OSINT';
import Persona from './pages/Persona';
import Simulation from './pages/Simulation';
import Risk from './pages/Risk';
import Reports from './pages/Reports';
import Users from './pages/Users';

import { useAuth } from './context/AuthContext';

export default function App() {
  const { user } = useAuth();

  const userId = user?.id 

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard userId={userId} />} />
        <Route path="/osint" element={<OSINT userId={userId} />} />
        <Route path="/persona" element={<Persona userId={userId} />} />
        <Route path="/simulation" element={<Simulation userId={userId} />} />
        <Route path="/risk" element={<Risk userId={userId} />} />
        <Route path="/reports" element={<Reports userId={userId} />} />
        <Route path="/users" element={<Users />} />
      </Route>
    </Routes>
  );
}