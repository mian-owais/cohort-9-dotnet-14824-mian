import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { taskService } from '../../services/task.service';
import { userService, type UserProfile } from '../../services/user.service';
import Navbar from '../../components/Navbar';
import './Tasks.css';

const TaskFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 0,
    priority: 0,
    category: 'General',
    dueDate: '',
    assignedToUserId: '',
    projectId: ''
  });
  const [loading, setLoading] = useState(true); // default to true since we fetch user profile
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    const initData = async () => {
      try {
        const profile = await userService.getMe();
        setCurrentUser(profile);

        if (profile.role === 'Admin') {
          const allUsers = await userService.getAllUsers();
          setUsers(allUsers);
        }

        if (isEditing && id) {
          const data = await taskService.getTaskById(Number(id));
          setFormData({
            title: data.title,
            description: data.description,
            status: data.status,
            priority: data.priority,
            category: data.category || 'General',
            dueDate: data.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : '',
            assignedToUserId: data.userId ? data.userId.toString() : '',
            projectId: data.projectId ? data.projectId.toString() : ''
          });
        }
      } catch (err: any) {
        if (err.response?.status === 401) navigate('/login');
        else setError('Failed to load page data.');
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [id, isEditing, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    try {
      if (isEditing && id) {
        await taskService.updateTask(Number(id), {
          title: formData.title,
          description: formData.description,
          status: Number(formData.status),
          priority: Number(formData.priority),
          category: formData.category,
          dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
          assignedToUserId: formData.assignedToUserId ? Number(formData.assignedToUserId) : undefined,
          projectId: formData.projectId ? Number(formData.projectId) : null
        });
        navigate(`/tasks/${id}`);
      } else {
        await taskService.createTask({
          title: formData.title,
          description: formData.description,
          priority: Number(formData.priority),
          category: formData.category,
          dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
          assignedToUserId: formData.assignedToUserId ? Number(formData.assignedToUserId) : undefined,
          projectId: formData.projectId ? Number(formData.projectId) : null
        });
        navigate('/tasks');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to save task.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) return <div className="loading-container">Loading...</div>;

  return (
    <div className="dashboard-container">
      <Navbar title={isEditing ? 'Edit Task' : 'New Task'} />

      {error && <div className="dashboard-error">{error}</div>}

      <main className="tasks-main">
        <div className="form-card">
          <div style={{ display: 'flex', marginBottom: '1rem' }}>
             <button type="button" onClick={() => navigate(-1)} className="back-btn" style={{ padding: '0.5rem 1rem' }}>&larr; Back</button>
          </div>
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
                <label htmlFor="status">Status</label>
                <select
                  id="status"
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
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: Number(e.target.value) })}
              >
                <option value={0}>Low</option>
                <option value={1}>Medium</option>
                <option value={2}>High</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <input
                id="category"
                type="text"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g. Work, Personal"
              />
            </div>

            <div className="form-group">
              <label htmlFor="dueDate">Due Date</label>
              <input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>

            {currentUser?.role === 'Admin' && (
              <div className="form-group">
                <label htmlFor="assignedToUserId">Assign To</label>
                <select
                  id="assignedToUserId"
                  value={formData.assignedToUserId}
                  onChange={e => setFormData({ ...formData, assignedToUserId: e.target.value })}
                >
                  <option value="">-- Select User --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.email})</option>
                  ))}
                </select>
              </div>
            )}

            <div className="modal-actions">
              <button type="button" className="cancel-btn" onClick={() => navigate(-1)} disabled={isSaving}>Cancel</button>
              <button type="submit" className="save-btn" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Task'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default TaskFormPage;
