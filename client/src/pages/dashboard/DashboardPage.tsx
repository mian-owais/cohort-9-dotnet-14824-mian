import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { dashboardService } from '../../services/dashboard.service';
import type { DashboardMetrics } from '../../services/dashboard.service';
import './Dashboard.css';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await dashboardService.getMetrics();
        setMetrics(data);
      } catch (err: any) {
        if (err.response?.status === 401) {
          navigate('/login');
        } else {
          setError('Failed to load dashboard metrics.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
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
            View All Tasks &rarr;
          </Link>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
