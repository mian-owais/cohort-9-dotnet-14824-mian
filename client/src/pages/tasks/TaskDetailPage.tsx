import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { taskService } from '../../services/task.service';
import type { TaskDto } from '../../services/task.service';
import Navbar from '../../components/Navbar';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import './Tasks.css';

const TaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<TaskDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

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
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleAskChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !task) return;

    const message = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: message }]);
    setIsChatLoading(true);

    try {
      const response = await taskService.askChat(task.id, message);
      setChatMessages(prev => [...prev, { role: 'ai', content: response }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error. Please try again later.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  if (loading) return <div className="loading-container">Loading...</div>;

  return (
    <div className="dashboard-container">
      <Navbar title="Task Details" />

      {error && <div className="dashboard-error">{error}</div>}

      {task && (
        <main className="tasks-main">
          <div className="task-detail-card" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 500px' }}>
              <div className="task-detail-header">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <button onClick={() => navigate(-1)} className="back-btn" style={{ padding: '0.5rem 1rem' }}>&larr; Back</button>
                    <h2 style={{ margin: 0 }}>{task.title}</h2>
                  </div>
                <span className={`status-badge status-${task.status}`}>
                  {task.status === 0 ? 'Pending' : task.status === 1 ? 'In Progress' : 'Completed'}
                </span>
                <span className="status-badge" style={{ marginLeft: '1rem', background: '#4A5568' }}>
                  {task.category || 'General'}
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

            <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', alignItems: 'center', borderLeft: '1px solid var(--border)', paddingLeft: '2rem' }}>
              <h3 style={{ color: 'var(--text-h)', marginBottom: '1rem', marginTop: 0 }}>Progress Graph</h3>
              {task.dueDate ? (() => {
                  const created = new Date(task.createdAt).getTime();
                  const due = new Date(task.dueDate).getTime();
                  const now = Date.now();
                  
                  let chartData = [];
                  let colors = ['#E2725B', '#8A9A5B']; // Elapsed, Remaining
                  
                  if (task.status === 2) {
                      chartData = [{ name: 'Task Completed', value: 1 }];
                      colors = ['#8A9A5B']; // Green
                  } else if (now >= due) {
                      chartData = [{ name: 'Overdue / Time Passed', value: 1 }];
                      colors = ['#c62828']; // Red
                  } else {
                      const elapsed = Math.max(0, now - created);
                      const remaining = Math.max(0, due - now);
                      chartData = [
                          { name: 'Time Elapsed', value: elapsed },
                          { name: 'Time Remaining', value: remaining }
                      ];
                  }

                  return (
                      <div style={{ width: '100%', height: 250 }}>
                          <ResponsiveContainer>
                              <PieChart>
                                  <Pie
                                      data={chartData}
                                      cx="50%"
                                      cy="50%"
                                      innerRadius={60}
                                      outerRadius={90}
                                      paddingAngle={2}
                                      dataKey="value"
                                  >
                                      {chartData.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                      ))}
                                  </Pie>
                                  <Tooltip 
                                    contentStyle={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-h)' }}
                                    itemStyle={{ color: 'var(--text-h)' }}
                                    formatter={(value, name) => {
                                        if (name === 'Overdue / Time Passed') return ['100%', name];
                                        const total = chartData[0].value + chartData[1].value;
                                        const percent = ((Number(value) / total) * 100).toFixed(1);
                                        return [`${percent}%`, name];
                                    }}
                                  />
                              </PieChart>
                          </ResponsiveContainer>
                      </div>
                  );
              })() : (
                  <p style={{ color: 'var(--text-p)', fontStyle: 'italic', textAlign: 'center', marginTop: '2rem' }}>No due date set.<br/>Add a due date to see time progress.</p>
              )}
            </div>
          </div>

          <div className="chat-container" style={{ marginTop: '2rem', backgroundColor: 'var(--bg)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--sage-green)' }}>
            <h3 style={{ color: 'var(--terracotta)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🤖 Task AI Assistant (Mock RAG)
            </h3>
            
            <div className="chat-history" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', maxHeight: '300px', overflowY: 'auto' }}>
              {chatMessages.length === 0 && (
                <p style={{ color: 'var(--text-p)', fontStyle: 'italic', textAlign: 'center' }}>Ask me anything about how to complete this task!</p>
              )}
              {chatMessages.map((msg, index) => (
                <div key={index} style={{ 
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  backgroundColor: msg.role === 'user' ? 'var(--terracotta)' : 'var(--code-bg)',
                  color: msg.role === 'user' ? '#fff' : 'var(--text-h)',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  maxWidth: '80%'
                }}>
                  <div style={{ fontWeight: 600, fontSize: '0.8rem', marginBottom: '0.25rem', opacity: 0.8 }}>
                    {msg.role === 'user' ? 'You' : 'AI Assistant'}
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                </div>
              ))}
              {isChatLoading && (
                <div style={{ alignSelf: 'flex-start', color: 'var(--text)', fontStyle: 'italic' }}>AI is thinking...</div>
              )}
            </div>

            <form onSubmit={handleAskChat} style={{ display: 'flex', gap: '1rem' }}>
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="How do I start this task?" 
                style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--code-bg)', color: 'var(--text-h)', fontSize: '1rem' }}
                disabled={isChatLoading}
              />
              <button 
                type="submit" 
                disabled={isChatLoading || !chatInput.trim()}
                style={{ backgroundColor: 'var(--sage-green)', color: 'white', padding: '0 1.5rem', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: isChatLoading ? 'not-allowed' : 'pointer' }}
              >
                Send
              </button>
            </form>
          </div>
        </main>
      )}
    </div>
  );
};

export default TaskDetailPage;
