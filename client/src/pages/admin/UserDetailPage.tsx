import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { userService } from '../../services/user.service';
import type { UserProfile } from '../../services/user.service';
import { taskService } from '../../services/task.service';
import type { TaskDto } from '../../services/task.service';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#8A9A5B', '#E2725B', '#a0aec0'];

const UserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = Number(id);
        
        // Fetch all users to find this specific one (since we don't have a GetUserById endpoint for admins)
        const allUsers = await userService.getAllUsers();
        const foundUser = allUsers.find(u => u.id === userId);
        
        if (!foundUser) {
            setError('User not found.');
            setLoading(false);
            return;
        }
        setUser(foundUser);

        // Fetch all tasks and filter by user
        const allTasks = await taskService.getTasks();
        const userTasks = allTasks.filter(t => t.userId === userId);
        setTasks(userTasks);

      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch user details');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  if (loading) return <div className="loading-container">Loading user details...</div>;
  
  if (error || !user) return (
      <div className="dashboard-container">
        <Navbar title="User Details" />
        <main className="dashboard-main"><div className="dashboard-error">{error || 'User not found'}</div></main>
      </div>
  );

  const completed = tasks.filter(t => t.status === 2).length;
  const inProgress = tasks.filter(t => t.status === 1).length;
  const pending = tasks.filter(t => t.status === 0).length;

  const chartData = [
    { name: 'Completed', value: completed },
    { name: 'In Progress', value: inProgress },
    { name: 'Pending', value: pending }
  ];

  return (
    <div className="dashboard-container">
      <Navbar title="User Details" />
      <main className="dashboard-main" style={{ minHeight: 'calc(100vh - 80px)' }}>
        
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', maxWidth: '1200px', margin: '0 auto' }}>
            
            {/* Left Side: Profile & Chart */}
            <div style={{ flex: '1 1 350px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ display: 'flex', marginBottom: '-1rem' }}>
                    <button onClick={() => navigate(-1)} className="back-btn" style={{ padding: '0.5rem 1rem' }}>&larr; Back</button>
                </div>
                <div style={{ background: 'var(--code-bg)', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                    <div style={{ 
                        width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--sage-green)', color: 'white', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', margin: '0 auto 1rem' 
                    }}>
                        {user.firstName[0]}{user.lastName[0]}
                    </div>
                    <h2 style={{ color: 'var(--text-h)', margin: '0 0 0.5rem 0' }}>{user.firstName} {user.lastName}</h2>
                    <p style={{ color: 'var(--text-p)', margin: '0 0 1rem 0' }}>{user.email}</p>
                    <span style={{ 
                        background: user.role === 'Admin' ? 'var(--terracotta)' : 'var(--border)', 
                        color: user.role === 'Admin' ? 'white' : 'var(--text-h)',
                        padding: '0.25rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase'
                    }}>
                        {user.role}
                    </span>
                </div>

                <div style={{ background: 'var(--code-bg)', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ color: 'var(--text-h)', textAlign: 'center', marginTop: 0 }}>Progress Overview</h3>
                    {tasks.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-p)', padding: '2rem 0' }}>No tasks assigned.</p>
                    ) : (
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-h)' }}
                                        itemStyle={{ color: 'var(--text-h)' }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Side: Task List */}
            <div style={{ flex: '2 1 600px', background: 'var(--code-bg)', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <h3 style={{ color: 'var(--terracotta)', marginTop: 0, marginBottom: '2rem' }}>Assigned Tasks ({tasks.length})</h3>
                
                {tasks.length === 0 ? (
                    <p style={{ color: 'var(--text-p)' }}>This user has no tasks assigned to them currently.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {tasks.map(task => (
                            <div key={task.id} style={{ 
                                background: 'var(--bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
                            }}>
                                <div>
                                    <h4 style={{ color: 'var(--text-h)', margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{task.title}</h4>
                                    <p style={{ color: 'var(--text-p)', margin: '0 0 1rem 0', fontSize: '0.9rem' }}>
                                        {task.description ? (task.description.length > 100 ? task.description.substring(0, 100) + '...' : task.description) : 'No description'}
                                    </p>
                                    <span style={{ 
                                        display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600,
                                        background: task.status === 0 ? '#eee' : task.status === 1 ? '#fff3e0' : '#e8f5e9',
                                        color: task.status === 0 ? '#555' : task.status === 1 ? 'var(--terracotta)' : 'var(--sage-green)'
                                    }}>
                                        {task.status === 0 ? 'Pending' : task.status === 1 ? 'In Progress' : 'Completed'}
                                    </span>
                                </div>
                                <Link to={`/tasks/${task.id}`} style={{ 
                                    background: 'var(--sage-green)', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', 
                                    textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap'
                                }}>
                                    View Task
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
      </main>
    </div>
  );
};

export default UserDetailPage;
