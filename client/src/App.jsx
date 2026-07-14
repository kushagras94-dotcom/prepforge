import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Interview from './pages/Interview';
import Scorecard from './pages/Scorecard';
import { useAuth } from './context/AuthContext';
import Resume from './pages/Resume';

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="/resume" element={user ? <Resume /> : <Navigate to="/login" />} />
      <Route path="/interview" element={user ? <Interview /> : <Navigate to="/login" />} />
      <Route path="/scorecard/:transcriptId" element={user ? <Scorecard /> : <Navigate to="/login" />} />
      <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
    </Routes>
  );
}

export default App;