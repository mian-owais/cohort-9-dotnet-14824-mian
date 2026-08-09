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
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
        <h1 style={{ margin: 0, fontSize: '2rem', color: 'var(--terracotta)', fontWeight: 700, whiteSpace: 'nowrap' }}>{title}</h1>
      </div>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '2rem',
        border: '2px solid var(--sage-green)',
        padding: '0.5rem 2rem',
        borderRadius: '30px',
        backgroundColor: 'var(--beige)',
        transform: 'translateY(-8px)'
      }}>
        <Link to="/dashboard" style={{ color: 'var(--text-p)', textDecoration: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}>Dashboard</Link>
        <Link to="/tasks" style={{ color: 'var(--text-p)', textDecoration: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}>My Tasks</Link>
        <Link to="/about" style={{ color: 'var(--text-p)', textDecoration: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}>About</Link>
        <Link to="/contact" style={{ color: 'var(--text-p)', textDecoration: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}>Contact</Link>
      </div>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={handleLogout} className="logout-btn" style={{
          backgroundColor: 'transparent',
          color: 'var(--terracotta)',
          border: '2px solid var(--terracotta)',
          padding: '0.5rem 1.5rem',
          borderRadius: '8px',
          fontWeight: 600,
          cursor: 'pointer',
          whiteSpace: 'nowrap'
        }}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
