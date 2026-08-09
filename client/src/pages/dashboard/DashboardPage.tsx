import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { dashboardService } from '../../services/dashboard.service';
import type { DashboardMetrics } from '../../services/dashboard.service';
import { userService, type UserProfile } from '../../services/user.service';
import './Dashboard.css';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricData, userData] = await Promise.all([
          dashboardService.getMetrics(),
          userService.getMe()
        ]);
        setMetrics(metricData);
        setProfile(userData);
      } catch (err: any) {
        if (err.response?.status === 401) {
          navigate('/login');
        } else {
          setError('Failed to load dashboard data.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) return <div className="loading-container">Loading...</div>;

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <h1 className="dashboard-title">Task Dashboard</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link to="/tasks" style={{ color: 'var(--text-p)', textDecoration: 'none', fontWeight: 600 }}>My Tasks</Link>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      {error && <div className="dashboard-error">{error}</div>}

      <main className="dashboard-main">
        {profile?.role === 'Admin' ? (
          <div className="admin-dashboard">
            <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--terracotta)' }}>System Overview (Admin)</h2>
            <div className="metrics-grid">
              <div className="metric-card completed-card">
                <h3>Global Completed</h3>
                <div className="metric-value">{metrics?.completedTaskCount || 0}</div>
              </div>
              
              <div className="metric-card inprogress-card">
                <h3>Global In Progress</h3>
                <div className="metric-value">{metrics?.inProgressTaskCount || 0}</div>
              </div>

              <div className="metric-card pending-card">
                <h3>Global Pending</h3>
                <div className="metric-value">{metrics?.pendingTaskCount || 0}</div>
              </div>
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '4rem' }}>
              <Link to="/tasks" className="logout-btn" style={{ textDecoration: 'none', padding: '1rem 2rem', display: 'inline-block', backgroundColor: 'var(--terracotta)', color: 'white', border: 'none' }}>
                Manage All Tasks &rarr;
              </Link>
            </div>
          </div>
        ) : (
          <div className="user-dashboard">
            <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--sage-green)' }}>My Tasks Overview</h2>
            <div className="metrics-grid">
              <div className="metric-card completed-card">
                <h3>Completed</h3>
                <div className="metric-value">{metrics?.completedTaskCount || 0}</div>
              </div>
              
              <div className="metric-card inprogress-card">
                <h3>In Progress</h3>
                <div className="metric-value">{metrics?.inProgressTaskCount || 0}</div>
              </div>

              <div className="metric-card pending-card">
                <h3>Pending</h3>
                <div className="metric-value">{metrics?.pendingTaskCount || 0}</div>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '4rem' }}>
              <Link to="/tasks" className="logout-btn" style={{ textDecoration: 'none', padding: '1rem 2rem', display: 'inline-block', backgroundColor: 'var(--sage-green)', color: 'white', border: 'none' }}>
                View My Tasks &rarr;
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
