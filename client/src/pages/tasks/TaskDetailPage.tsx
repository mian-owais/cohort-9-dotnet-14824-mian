import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { taskService } from '../../services/task.service';
import type { TaskDto } from '../../services/task.service';
import Navbar from '../../components/Navbar';
import './Tasks.css';

const TaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<TaskDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const data = await taskService.getTaskById(Number(id));
        setTask(data);
      } catch (err: any) {
        if (err.response?.status === 401) navigate('/login');
        else setError('Failed to load task details.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchTask();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await taskService.deleteTask(Number(id));
      navigate('/tasks');
    } catch (err) {
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
      <Navbar title="Task Details" />

      {error && <div className="dashboard-error">{error}</div>}

      {task && (
        <main className="tasks-main">
          <div className="task-detail-card">
            <div className="task-detail-header">
              <div>
                <h2>{task.title}</h2>
                <span className={`status-badge status-${task.status}`}>
                  {task.status === 0 ? 'Pending' : task.status === 1 ? 'In Progress' : 'Completed'}
                </span>
                {task.dueDate && (
                  <span className="due-date" style={{ marginLeft: '1rem' }}>
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            <div className="task-detail-body">
              {task.description ? <p>{task.description}</p> : <p style={{ fontStyle: 'italic', color: '#888' }}>No description provided.</p>}
            </div>

            <div className="task-detail-actions">
              <Link to={`/tasks/${task.id}/edit`} className="edit-btn" style={{ textDecoration: 'none' }}>Edit Task</Link>
              <button onClick={handleDelete} className="delete-btn">Delete Task</button>
            </div>
          </div>
        </main>
      )}
    </div>
  );
};

export default TaskDetailPage;
