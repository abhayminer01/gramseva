import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Layout from './components/layout/Layout';
import CitizenLogin from './pages/Auth/CitizenLogin';
import AuthorityLogin from './pages/Auth/AuthorityLogin';
import Register from './pages/Auth/Register';
import CitizenDashboard from './pages/Dashboards/CitizenDashboard';
import SecretaryDashboard from './pages/Dashboards/SecretaryDashboard';
import WardDashboard from './pages/Dashboards/WardDashboard';
import HigherAuthorityDashboard from './pages/Dashboards/HigherAuthorityDashboard';
import MyGrievances from './pages/Dashboards/MyGrievances';
import MgnregaCitizen from './pages/Dashboards/MgnregaCitizen';
import MgnregaSecretary from './pages/Dashboards/MgnregaSecretary';
import SecretaryCitizens from './pages/Dashboards/SecretaryCitizens';
import SecretaryGrievances from './pages/Dashboards/SecretaryGrievances';
import Announcements from './pages/Dashboards/Announcements';

import Landing from './pages/Landing';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login/citizen" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const RoleBasedRouter = () => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login/citizen" replace />;
  switch(user.role) {
    case 'citizen': return <CitizenDashboard />;
    case 'secretary': return <SecretaryDashboard />;
    case 'ward_member': return <WardDashboard />;
    case 'higher_authority': return <HigherAuthorityDashboard />;
    default: return <Navigate to="/login/citizen" replace />;
  }
};

const AppRoutes = () => {
  const { user } = useContext(AuthContext);
  
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />
      <Route path="/login" element={<Navigate to="/login/citizen" replace />} />
      <Route path="/login/citizen" element={<CitizenLogin />} />
      <Route path="/login/authority" element={<AuthorityLogin />} />
      <Route path="/register" element={<Register />} />

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout><RoleBasedRouter /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/my-grievances" element={
        <ProtectedRoute allowedRoles={['citizen']}>
          <Layout><MyGrievances /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/mgnrega" element={
        <ProtectedRoute allowedRoles={['citizen']}>
          <Layout><MgnregaCitizen /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/mgnrega-requests" element={
        <ProtectedRoute allowedRoles={['secretary', 'higher_authority']}>
          <Layout><MgnregaSecretary /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/citizens" element={
        <ProtectedRoute allowedRoles={['secretary']}>
          <Layout><SecretaryCitizens /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/grievances" element={
        <ProtectedRoute allowedRoles={['secretary']}>
          <Layout><SecretaryGrievances /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/announcements" element={
        <ProtectedRoute>
          <Layout><Announcements /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
