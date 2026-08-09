import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { taskService } from '../../services/task.service';
import type { TaskDto } from '../../services/task.service';
import Navbar from '../../components/Navbar';
import './Tasks.css';

const TaskListPage: React.FC = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await taskService.getTasks();
        setTasks(data);
      } catch (err: any) {
        if (err.response?.status === 401) {
          navigate('/login');
        } else {
          setError('Failed to load tasks.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [navigate]);

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status.toString() === filter;
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) return <div className="loading-container">Loading...</div>;

  return (
    <div className="dashboard-container">
      <Navbar title="Tasks" />

      {error && <div className="dashboard-error">{error}</div>}

      <main className="tasks-main">
        <div className="tasks-header">
          <div className="filter-group">
            <label>Filter by Status: </label>
            <select value={filter} onChange={e => setFilter(e.target.value)} className="filter-select">
              <option value="all">All</option>
              <option value="0">Pending</option>
              <option value="1">In Progress</option>
              <option value="2">Completed</option>
            </select>
          </div>
          <Link to="/tasks/new" className="primary-btn">+ New Task</Link>
        </div>

        <div className="tasks-list">
          {filteredTasks.length === 0 ? (
            <p className="no-tasks">No tasks found matching your filter.</p>
          ) : (
            filteredTasks.map(task => (
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
                  </div>
                  <div className="view-detail-hint">View Details &rarr;</div>
                </div>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default TaskListPage;
