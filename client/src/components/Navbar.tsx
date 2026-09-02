import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userService } from '../services/user.service';
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

  const [isAdmin, setIsAdmin] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check theme
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }

    // Fetch user role for admin links
    const checkRole = async () => {
        try {
            const user = await userService.getMe();
            if (user && user.role === 'Admin') {
                setIsAdmin(true);
            }
        } catch (e) {
            // ignore
        }
    };
    checkRole();
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--terracotta)', fontWeight: 700, whiteSpace: 'nowrap' }}>{title}</h1>
      </div>

      <div className={`navbar-center ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
        <Link to="/tasks" onClick={() => setIsMobileMenuOpen(false)}>Tasks</Link>
        <Link to="/summary" onClick={() => setIsMobileMenuOpen(false)}>Summary</Link>
        {isAdmin && (
          <>
            <Link to="/admin-summary" onClick={() => setIsMobileMenuOpen(false)}>Admin Summary</Link>
            <Link to="/admin/users" onClick={() => setIsMobileMenuOpen(false)}>Users</Link>
          </>
        )}
        <Link to="/about" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
        <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
      </div>

      <div className="navbar-right" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button 
          onClick={toggleTheme} 
          style={{ 
            background: 'transparent', 
            border: 'none', 
            fontSize: '1.5rem', 
            cursor: 'pointer',
            padding: '0.2rem'
          }}
          title="Toggle Dark Mode"
        >
          {isDark ? '☀️' : '🌙'}
        </button>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
        <button className="hamburger-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? '✖' : '☰'}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
