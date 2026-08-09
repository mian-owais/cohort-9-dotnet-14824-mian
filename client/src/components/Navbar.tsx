import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface NavbarProps {
  title: string;
}

const Navbar: React.FC<NavbarProps> = ({ title }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: '3rem',
      paddingBottom: '1rem',
      borderBottom: '2px solid var(--sage-green)'
    }}>
      <div style={{ flex: 1 }}>
        <h1 style={{ margin: 0, fontSize: '2rem', color: 'var(--terracotta)', fontWeight: 700 }}>{title}</h1>
      </div>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '2rem' }}>
        <Link to="/dashboard" style={{ color: 'var(--text-p)', textDecoration: 'none', fontWeight: 600 }}>Dashboard</Link>
        <Link to="/tasks" style={{ color: 'var(--text-p)', textDecoration: 'none', fontWeight: 600 }}>My Tasks</Link>
        <Link to="/about" style={{ color: 'var(--text-p)', textDecoration: 'none', fontWeight: 600 }}>About</Link>
        <Link to="/contact" style={{ color: 'var(--text-p)', textDecoration: 'none', fontWeight: 600 }}>Contact</Link>
      </div>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={handleLogout} className="logout-btn" style={{
          backgroundColor: 'transparent',
          color: 'var(--terracotta)',
          border: '2px solid var(--terracotta)',
          padding: '0.5rem 1.5rem',
          borderRadius: '8px',
          fontWeight: 600,
          cursor: 'pointer'
        }}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
