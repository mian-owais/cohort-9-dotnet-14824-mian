import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div style={{ padding: '2rem', color: '#fff', background: '#121212', minHeight: '100vh', fontFamily: 'Inter' }}>
      <h1>Dashboard</h1>
      {user ? (
        <p>Welcome back, {user.firstName || user.email}!</p>
      ) : (
        <p>Welcome to the Task Management Tool!</p>
      )}
      <button 
        onClick={handleLogout}
        style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#e11d48', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        Logout
      </button>
    </div>
  );
};

export default DashboardPage;
