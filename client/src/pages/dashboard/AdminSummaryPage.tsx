import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface UserDashboardMetrics {
  userId: number;
  name: string;
  email: string;
  completedTaskCount: number;
  inProgressTaskCount: number;
  pendingTaskCount: number;
}

const COLORS = ['#8A9A5B', '#E2725B', '#a0aec0']; // Sage, Terracotta, Gray (Pending)

const AdminSummaryPage: React.FC = () => {
  const [usersMetrics, setUsersMetrics] = useState<UserDashboardMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdminMetrics = async () => {
      try {
        const response = await api.get('/dashboard/admin-metrics');
        setUsersMetrics(response.data);
      } catch (err: any) {
        setError(err.response?.data || err.message || 'Failed to fetch admin metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminMetrics();
  }, []);

  if (loading) return <div className="loading-container">Loading admin summary...</div>;

  return (
    <div className="dashboard-container">
      <Navbar title="Admin Summary" />
      <main className="dashboard-main" style={{ minHeight: 'calc(100vh - 80px)' }}>
        <h2 style={{ color: 'var(--terracotta)', textAlign: 'center', marginBottom: '2rem' }}>All Users Task Overview</h2>
        
        {error && <div className="dashboard-error">{error}</div>}

        {!error && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            {usersMetrics.map((user) => {
                const total = user.completedTaskCount + user.inProgressTaskCount + user.pendingTaskCount;
                const chartData = [
                    { name: 'Completed', value: user.completedTaskCount },
                    { name: 'In Progress', value: user.inProgressTaskCount },
                    { name: 'Pending', value: user.pendingTaskCount }
                ];
                
                return (
                    <div key={user.userId} style={{ background: 'var(--code-bg)', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                            <h3 style={{ color: 'var(--text-h)', margin: '0 0 0.5rem 0' }}>{user.name}</h3>
                            <p style={{ color: 'var(--text-p)', margin: 0, fontSize: '0.9rem' }}>{user.email}</p>
                        </div>
                        
                        {total === 0 ? (
                            <p style={{ textAlign: 'center', color: 'var(--text-p)', padding: '2rem 0' }}>No tasks assigned to this user.</p>
                        ) : (
                            <div style={{ width: '100%', height: 250 }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-p)', margin: '0 0 0.25rem 0' }}>Total</p>
                                <p style={{ fontWeight: 'bold', color: 'var(--text-h)', margin: 0 }}>{total}</p>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-p)', margin: '0 0 0.25rem 0' }}>Completed</p>
                                <p style={{ fontWeight: 'bold', color: 'var(--sage-green)', margin: 0 }}>{user.completedTaskCount}</p>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-p)', margin: '0 0 0.25rem 0' }}>In Progress</p>
                                <p style={{ fontWeight: 'bold', color: 'var(--terracotta)', margin: 0 }}>{user.inProgressTaskCount}</p>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-p)', margin: '0 0 0.25rem 0' }}>Pending</p>
                                <p style={{ fontWeight: 'bold', color: 'var(--text-h)', margin: 0 }}>{user.pendingTaskCount}</p>
                            </div>
                        </div>
                    </div>
                );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminSummaryPage;
