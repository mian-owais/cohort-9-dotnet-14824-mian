import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { taskService } from '../../services/task.service';
import './Tasks.css';

const TaskFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 0,
    dueDate: ''
  });
  const [loading, setLoading] = useState(isEditing);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing && id) {
      const fetchTask = async () => {
        try {
          const data = await taskService.getTaskById(Number(id));
          setFormData({
            title: data.title,
            description: data.description,
            status: data.status,
            dueDate: data.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : ''
          });
        } catch (err: any) {
          if (err.response?.status === 401) navigate('/login');
          else setError('Failed to load task details.');
        } finally {
          setLoading(false);
        }
      };
      fetchTask();
    }
  }, [id, isEditing, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && id) {
        await taskService.updateTask(Number(id), {
          title: formData.title,
          description: formData.description,
          status: Number(formData.status),
          dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null
        });
        navigate(`/tasks/${id}`);
      } else {
        await taskService.createTask({
          title: formData.title,
          description: formData.description,
          dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null
        });
        navigate('/tasks');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to save task.');
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
        <h1 className="dashboard-title">{isEditing ? 'Edit Task' : 'New Task'}</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/tasks" className="nav-link">My Tasks</Link>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      {error && <div className="dashboard-error">{error}</div>}

      <main className="tasks-main">
        <div className="form-card">
          <form onSubmit={handleSubmit} className="task-form">
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                id="title"
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {isEditing && (
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
              <button type="button" className="cancel-btn" onClick={() => navigate(-1)}>Cancel</button>
              <button type="submit" className="save-btn">Save Task</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default TaskFormPage;
