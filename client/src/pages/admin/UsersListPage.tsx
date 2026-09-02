import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { userService } from '../../services/user.service';
import type { UserProfile } from '../../services/user.service';

const UsersListPage: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await userService.getAllUsers();
        setUsers(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <div className="loading-container">Loading users...</div>;

  return (
    <div className="dashboard-container">
      <Navbar title="Manage Users" />
      <main className="dashboard-main" style={{ minHeight: 'calc(100vh - 80px)' }}>
        <h2 style={{ color: 'var(--terracotta)', textAlign: 'center', marginBottom: '2rem' }}>All System Users</h2>
        
        {error && <div className="dashboard-error">{error}</div>}

        {!error && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            {users.map(user => (
              <div key={user.id} style={{ background: 'var(--code-bg)', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ 
                    width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--sage-green)', color: 'white', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' 
                }}>
                    {user.firstName[0]}{user.lastName[0]}
                </div>
                <h3 style={{ color: 'var(--text-h)', margin: '0 0 0.5rem 0' }}>{user.firstName} {user.lastName}</h3>
                <p style={{ color: 'var(--text-p)', margin: '0 0 1rem 0', fontSize: '0.9rem' }}>{user.email}</p>
                <span style={{ 
                    background: user.role === 'Admin' ? 'var(--terracotta)' : 'var(--border)', 
                    color: user.role === 'Admin' ? 'white' : 'var(--text-h)',
                    padding: '0.25rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '1.5rem'
                }}>
                    {user.role}
                </span>
                
                <Link to={`/admin/users/${user.id}`} style={{ 
                    marginTop: 'auto', background: 'transparent', border: '2px solid var(--sage-green)', color: 'var(--sage-green)', 
                    padding: '0.5rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, transition: 'all 0.2s'
                }}>
                    View Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default UsersListPage;
