import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardMetrics {
  completedTaskCount: number;
  inProgressTaskCount: number;
  pendingTaskCount: number;
}

const COLORS = ['#8A9A5B', '#E2725B', '#a0aec0']; // Sage, Terracotta, Gray (Pending)

const SummaryPage: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await api.get('/dashboard/metrics');
        setMetrics(response.data);
      } catch (err: any) {
        setError(err.response?.data || err.message || 'Failed to fetch metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) return <div className="loading-container">Loading summary...</div>;
  
  const chartData = metrics ? [
    { name: 'Completed', value: metrics.completedTaskCount },
    { name: 'In Progress', value: metrics.inProgressTaskCount },
    { name: 'Pending', value: metrics.pendingTaskCount }
  ] : [];

  return (
    <div className="dashboard-container">
      <Navbar title="Summary" />
      <main className="dashboard-main" style={{ minHeight: 'calc(100vh - 80px)' }}>
        <h2 style={{ color: 'var(--terracotta)', textAlign: 'center', marginBottom: '2rem' }}>Your Task Summary</h2>
        
        {error && <div className="dashboard-error">{error}</div>}

        {!error && metrics && (
          <div style={{ background: 'var(--code-bg)', padding: '2rem', borderRadius: '16px', maxWidth: '800px', margin: '0 auto', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h3 style={{ textAlign: 'center', color: 'var(--text-h)', marginBottom: '2rem' }}>Task Distribution</h3>
            
            <div style={{ width: '100%', height: 400 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
            
            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '2rem', textAlign: 'center' }}>
                <div>
                    <h4 style={{ color: 'var(--text-h)', margin: '0 0 0.5rem 0' }}>Total Assigned</h4>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--terracotta)', margin: 0 }}>
                        {metrics.completedTaskCount + metrics.inProgressTaskCount + metrics.pendingTaskCount}
                    </p>
                </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SummaryPage;
