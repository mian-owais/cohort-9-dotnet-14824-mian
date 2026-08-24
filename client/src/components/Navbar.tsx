import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

interface NavbarProps {
  title: string;
}

const Navbar: React.FC<NavbarProps> = ({ title }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h1 style={{ margin: 0, fontSize: '2rem', color: 'var(--terracotta)', fontWeight: 700, whiteSpace: 'nowrap' }}>{title}</h1>
      </div>

      <div className="navbar-center">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/tasks">Tasks</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
      </div>

      <div className="navbar-right">
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
