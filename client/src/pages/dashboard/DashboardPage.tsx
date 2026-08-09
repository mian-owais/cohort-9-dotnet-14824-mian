import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { dashboardService } from '../../services/dashboard.service';
import type { DashboardMetrics } from '../../services/dashboard.service';
import { userService, type UserProfile } from '../../services/user.service';
import { taskService, type TaskDto } from '../../services/task.service';
import Navbar from '../../components/Navbar';
import './Dashboard.css';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricData, userData, taskData] = await Promise.all([
          dashboardService.getMetrics(),
          userService.getMe(),
          taskService.getTasks()
        ]);
        setMetrics(metricData);
        setProfile(userData);
        setTasks(taskData);

        if (userData.role === 'Admin') {
          const allUsers = await userService.getAllUsers();
          setUsers(allUsers);
        }
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
      <Navbar title="Task Dashboard" />

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
            
            <div className="tasks-section" style={{ marginTop: '3rem' }}>
              <h3>All Tasks</h3>
              <div className="tasks-list">
                {tasks.length === 0 ? (
                  <p className="no-tasks">No tasks found.</p>
                ) : (
                  tasks.map(task => {
                    const assignedUser = users.find(u => u.id === task.userId);
                    return (
                      <Link to={`/tasks/${task.id}`} key={task.id} className="task-item-link">
                        <div className="task-item">
                          <div className="task-info">
                            <h4>{task.title}</h4>
                            <span className={`status-badge status-${task.status}`}>
                              {task.status === 0 ? 'Pending' : task.status === 1 ? 'In Progress' : 'Completed'}
                            </span>
                            {task.dueDate && (
                              <span className="due-date">
                                Due: {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            )}
                            <span className="assigned-to" style={{ marginLeft: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                              Assigned To: {assignedUser ? `${assignedUser.firstName} ${assignedUser.lastName}` : 'Unknown'}
                            </span>
                          </div>
                          <div className="view-detail-hint">View Details &rarr;</div>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
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

            <div className="tasks-section" style={{ marginTop: '3rem' }}>
              <h3>My Tasks List</h3>
              <div className="tasks-list">
                {tasks.length === 0 ? (
                  <p className="no-tasks">No tasks found.</p>
                ) : (
                  tasks.map(task => (
                    <Link to={`/tasks/${task.id}`} key={task.id} className="task-item-link">
                      <div className="task-item">
                        <div className="task-info">
                          <h4>{task.title}</h4>
                          <span className={`status-badge status-${task.status}`}>
                            {task.status === 0 ? 'Pending' : task.status === 1 ? 'In Progress' : 'Completed'}
                          </span>
                          <span className="due-date" style={{ marginLeft: '1rem' }}>
                            Assigned: {new Date(task.createdAt).toLocaleDateString()}
                          </span>
                          {task.dueDate && (
                            <span className="due-date" style={{ marginLeft: '1rem' }}>
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <div className="view-detail-hint">View Details &rarr;</div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
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
