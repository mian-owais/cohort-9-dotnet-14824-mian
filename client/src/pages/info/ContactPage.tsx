import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ContactPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <h1 className="dashboard-title">Contact Us</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link to="/dashboard" className="nav-link" style={{ color: 'var(--text-p)', textDecoration: 'none', fontWeight: 600 }}>Dashboard</Link>
          <Link to="/about" className="nav-link" style={{ color: 'var(--text-p)', textDecoration: 'none', fontWeight: 600 }}>About</Link>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <main className="dashboard-main" style={{ backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: '12px', marginTop: '2rem' }}>
        <h2 style={{ color: 'var(--sage-green)', marginBottom: '1rem' }}>Get In Touch</h2>
        <p style={{ color: 'var(--text-p)', lineHeight: '1.6', marginBottom: '2rem' }}>
          Have a question or need support? We'd love to hear from you. Please reach out using the contact details below.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-default)', borderRadius: '8px' }}>
            <h4 style={{ color: 'var(--text-h)', marginBottom: '0.5rem' }}>Email</h4>
            <p style={{ color: 'var(--text-p)' }}>support@taskmanagement.com</p>
          </div>
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-default)', borderRadius: '8px' }}>
            <h4 style={{ color: 'var(--text-h)', marginBottom: '0.5rem' }}>Phone</h4>
            <p style={{ color: 'var(--text-p)' }}>+1 (555) 123-4567</p>
          </div>
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-default)', borderRadius: '8px' }}>
            <h4 style={{ color: 'var(--text-h)', marginBottom: '0.5rem' }}>Address</h4>
            <p style={{ color: 'var(--text-p)' }}>123 Productivity Ave, Tech City, TC 90210</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactPage;
