import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <h1 className="dashboard-title">About Us</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link to="/dashboard" className="nav-link" style={{ color: 'var(--text-p)', textDecoration: 'none', fontWeight: 600 }}>Dashboard</Link>
          <Link to="/contact" className="nav-link" style={{ color: 'var(--text-p)', textDecoration: 'none', fontWeight: 600 }}>Contact</Link>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <main className="dashboard-main" style={{ backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: '12px', marginTop: '2rem' }}>
        <h2 style={{ color: 'var(--terracotta)', marginBottom: '1rem' }}>Task Management System</h2>
        <p style={{ color: 'var(--text-p)', lineHeight: '1.6' }}>
          Welcome to the Task Management System! This platform is designed to help teams and individuals efficiently track, manage, and complete their tasks.
          Built with a robust .NET backend and a modern React frontend, we ensure high performance, security, and a beautiful user experience.
        </p>
        <p style={{ color: 'var(--text-p)', lineHeight: '1.6', marginTop: '1rem' }}>
          Whether you are an Admin assigning critical projects to team members or a User tracking your personal progress, our system adapts to your workflow.
        </p>
      </main>
    </div>
  );
};

export default AboutPage;
