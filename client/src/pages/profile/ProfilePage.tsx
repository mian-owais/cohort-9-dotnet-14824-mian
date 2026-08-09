import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { userService, type UserProfile } from '../../services/user.service';
import './Profile.css';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await userService.getMe();
        setProfile(data);
      } catch (err: any) {
        if (err.response?.status === 401) {
          navigate('/login');
        } else {
          setError('Failed to load profile.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) return <div className="loading-container">Loading profile...</div>;

  return (
    <div className="profile-container">
      <nav className="profile-nav">
        <h1 className="profile-title">User Profile</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          <Link to="/tasks" className="nav-link">My Tasks</Link>
        </div>
      </nav>

      {error && <div className="profile-error">{error}</div>}

      <main className="profile-main">
        {profile && (
          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-avatar">
                {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
              </div>
              <h2>{profile.firstName} {profile.lastName}</h2>
              <span className="profile-role">{profile.role}</span>
            </div>
            
            <div className="profile-details">
              <div className="detail-group">
                <label>Email Address</label>
                <p>{profile.email}</p>
              </div>
              <div className="detail-group">
                <label>Member Since</label>
                <p>{new Date(profile.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <button onClick={handleLogout} className="logout-btn-large">
              Log Out
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProfilePage;
