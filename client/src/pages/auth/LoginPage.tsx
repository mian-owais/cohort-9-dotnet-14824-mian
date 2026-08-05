import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { loginSchema, authService } from '../../services/auth.service';
import type { LoginData } from '../../services/auth.service';
import './Auth.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState('');
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginData) => {
    try {
      setApiError('');
      await authService.login(data);
      // Redirect to dashboard on success
      navigate('/dashboard');
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Welcome Back</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
          {apiError && <div className="form-error" style={{ textAlign: 'center', marginBottom: '1rem' }}>{apiError}</div>}
          
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input 
              id="email"
              type="email" 
              className="form-input" 
              placeholder="name@example.com"
              {...register('email')} 
            />
            {errors.email && <span className="form-error">{errors.email.message}</span>}
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input 
              id="password"
              type="password" 
              className="form-input" 
              placeholder="Enter your password"
              {...register('password')} 
            />
            {errors.password && <span className="form-error">{errors.password.message}</span>}
          </div>
          
          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        
        <div className="auth-link">
          Don't have an account? <Link to="/signup">Sign up here</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
