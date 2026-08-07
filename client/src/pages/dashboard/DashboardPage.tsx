import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../../services/dashboard.service';
import type { DashboardMetrics } from '../../services/dashboard.service';
import { taskService } from '../../services/task.service';
import type { TaskDto } from '../../services/task.service';
import './Dashboard.css';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskDto | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 0,
    dueDate: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsData, tasksData] = await Promise.all([
          dashboardService.getMetrics(),
          taskService.getTasks()
        ]);
        setMetrics(metricsData);
        setTasks(tasksData);
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

  const refreshData = async () => {
    try {
      const [metricsData, tasksData] = await Promise.all([
        dashboardService.getMetrics(),
        taskService.getTasks()
      ]);
      setMetrics(metricsData);
      setTasks(tasksData);
    } catch (err) {
      console.error(err);
    }
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setFormData({ title: '', description: '', status: 0, dueDate: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (task: TaskDto) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      status: task.status,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await taskService.updateTask(editingTask.id, {
          title: formData.title,
          description: formData.description,
          status: Number(formData.status),
          dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null
        });
      } else {
        await taskService.createTask({
          title: formData.title,
          description: formData.description,
          dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null
        });
      }
      closeModal();
      refreshData();
    } catch (err) {
      console.error(err);
      setError('Failed to save task.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await taskService.deleteTask(id);
      refreshData();
    } catch (err) {
      console.error(err);
      setError('Failed to delete task.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) return <div className="loading-container">Loading...</div>;

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <h1 className="dashboard-title">Task Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
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

        <div className="tasks-section">
          <div className="tasks-header">
            <h2>Your Tasks</h2>
            <button className="primary-btn" onClick={openCreateModal}>+ New Task</button>
          </div>

          <div className="tasks-list">
            {tasks.length === 0 ? (
              <p className="no-tasks">No tasks found. Create one to get started!</p>
            ) : (
              tasks.map(task => (
                <div key={task.id} className="task-item">
                  <div className="task-info">
                    <h4>{task.title}</h4>
                    <p>{task.description}</p>
                    <span className={`status-badge status-${task.status}`}>
                      {task.status === 0 ? 'Pending' : task.status === 1 ? 'In Progress' : 'Completed'}
                    </span>
                    {task.dueDate && (
                      <span className="due-date">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div className="task-actions">
                    <button className="edit-btn" onClick={() => openEditModal(task)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(task.id)}>Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editingTask ? 'Edit Task' : 'New Task'}</h2>
            <form onSubmit={handleSubmit} className="task-form">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {editingTask && (
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: Number(e.target.value) })}
                  >
                    <option value={0}>Pending</option>
                    <option value={1}>In Progress</option>
                    <option value={2}>Completed</option>
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={closeModal}>Cancel</button>
                <button type="submit" className="save-btn">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
